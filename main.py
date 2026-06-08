import os
import base64
import sqlite3
import secrets
import json
import urllib.request
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import bcrypt
import pytz
from apscheduler.schedulers.background import BackgroundScheduler
from pywebpush import webpush, WebPushException

# ─── Config ──────────────────────────────────────────────────────────────────
DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(__file__), "calendar.db"))
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://127.0.0.1:5500,http://localhost:5500"
).split(",")
SESSION_DAYS = 365
JST = pytz.timezone("Asia/Tokyo")

VAPID_PUBLIC_KEY    = os.getenv("VAPID_PUBLIC_KEY", "")
VAPID_PRIVATE_KEY_B64 = os.getenv("VAPID_PRIVATE_KEY_B64", "")
VAPID_EMAIL         = os.getenv("VAPID_EMAIL", "mailto:admin@example.com")


def _vapid_private_key() -> str:
    if not VAPID_PRIVATE_KEY_B64:
        return ""
    return base64.b64decode(VAPID_PRIVATE_KEY_B64).decode()


# ─── Database ─────────────────────────────────────────────────────────────────
def _get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _init_db():
    if os.path.dirname(DB_PATH):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = _get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            username      TEXT    UNIQUE NOT NULL,
            password_hash TEXT    NOT NULL,
            created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS sessions (
            token      TEXT    PRIMARY KEY,
            user_id    INTEGER NOT NULL,
            expires_at TEXT    NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS user_data (
            user_id INTEGER PRIMARY KEY,
            events  TEXT NOT NULL DEFAULT '[]',
            todos   TEXT NOT NULL DEFAULT '[]',
            habits  TEXT NOT NULL DEFAULT '[]',
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS shares (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_id   INTEGER NOT NULL,
            viewer_id  INTEGER NOT NULL,
            status     TEXT    NOT NULL DEFAULT 'pending',
            created_at TEXT    NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (owner_id)  REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(owner_id, viewer_id)
        );
        CREATE TABLE IF NOT EXISTS push_subscriptions (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL,
            endpoint   TEXT    NOT NULL,
            subscription TEXT  NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(endpoint)
        );
    """)
    conn.commit()
    for col in [
        "ALTER TABLE user_data ADD COLUMN habits TEXT NOT NULL DEFAULT '[]'",
        "ALTER TABLE user_data ADD COLUMN class_schedule TEXT NOT NULL DEFAULT '{}'",
        "ALTER TABLE user_data ADD COLUMN habit_logs TEXT NOT NULL DEFAULT '{}'",
    ]:
        try:
            conn.execute(col)
            conn.commit()
        except sqlite3.OperationalError:
            pass
    conn.close()


_init_db()


# ─── Auth helpers ─────────────────────────────────────────────────────────────
def _hash_pw(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()


def _verify_pw(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def _require_user(authorization: Optional[str]) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="ログインが必要です")
    token = authorization[7:]
    conn = _get_db()
    row = conn.execute(
        "SELECT user_id, expires_at FROM sessions WHERE token = ?", (token,)
    ).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="セッションが切れました。再ログインしてください")
    if datetime.fromisoformat(row["expires_at"]) < datetime.utcnow():
        conn = _get_db()
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
        conn.close()
        raise HTTPException(status_code=401, detail="セッションが切れました。再ログインしてください")
    # セッションを使うたびに有効期限を延長する
    new_expiry = (datetime.utcnow() + timedelta(days=SESSION_DAYS)).isoformat()
    conn = _get_db()
    conn.execute("UPDATE sessions SET expires_at = ? WHERE token = ?", (new_expiry, token))
    conn.commit()
    conn.close()
    return row["user_id"]


def _create_session(user_id: int) -> str:
    token = secrets.token_hex(32)
    expires_at = (datetime.utcnow() + timedelta(days=SESSION_DAYS)).isoformat()
    conn = _get_db()
    conn.execute(
        "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
        (token, user_id, expires_at),
    )
    conn.commit()
    conn.close()
    return token


# ─── Push notification scheduler ─────────────────────────────────────────────
def _send_push_notifications():
    if not VAPID_PUBLIC_KEY or not VAPID_PRIVATE_KEY_B64:
        return

    now_jst = datetime.now(JST)
    notify_time = now_jst + timedelta(minutes=30)
    notify_time_str = notify_time.strftime("%H:%M")
    today_str = now_jst.strftime("%Y-%m-%d")

    conn = _get_db()
    try:
        rows = conn.execute(
            """SELECT ps.user_id, ps.endpoint, ps.subscription, ud.events
               FROM push_subscriptions ps
               JOIN user_data ud ON ps.user_id = ud.user_id"""
        ).fetchall()
    finally:
        conn.close()

    private_key = _vapid_private_key()
    expired_endpoints = []

    for row in rows:
        user_events = json.loads(row["events"] or "[]")
        for event in user_events:
            if event.get("allDay") or event.get("date") != today_str:
                continue
            if event.get("startTime") != notify_time_str:
                continue
            lines = [f"{event['startTime']}〜{event.get('endTime', '')} から始まります"]
            if event.get("room"):
                lines.append(f"教室：{event['room']}")
            if event.get("campus"):
                lines.append(f"キャンパス：{event['campus']}")
            if event.get("teacher"):
                lines.append(f"担当：{event['teacher']}")

            payload = json.dumps({
                "title": event["title"],
                "body": "\n".join(lines),
                "tag": f"{today_str}-{event['title']}-{event['startTime']}",
            }, ensure_ascii=False)

            try:
                webpush(
                    subscription_info=json.loads(row["subscription"]),
                    data=payload,
                    vapid_private_key=private_key,
                    vapid_claims={"sub": VAPID_EMAIL},
                )
            except WebPushException as exc:
                if exc.response and exc.response.status_code in (404, 410):
                    expired_endpoints.append(row["endpoint"])
            except Exception:
                pass

    if expired_endpoints:
        conn = _get_db()
        for ep in expired_endpoints:
            conn.execute("DELETE FROM push_subscriptions WHERE endpoint = ?", (ep,))
        conn.commit()
        conn.close()


def _push_to_user(sub_json: str, payload: str, expired_list: list):
    """ユーザー1人に Web Push を送る。失敗した endpoint を expired_list に追記する。"""
    try:
        webpush(
            subscription_info=json.loads(sub_json),
            data=payload,
            vapid_private_key=_vapid_private_key(),
            vapid_claims={"sub": VAPID_EMAIL},
        )
    except WebPushException as exc:
        if exc.response and exc.response.status_code in (404, 410):
            sub = json.loads(sub_json)
            expired_list.append(sub.get("endpoint", ""))
    except Exception:
        pass


def _cleanup_expired_endpoints(expired: list):
    if not expired:
        return
    conn = _get_db()
    for ep in expired:
        if ep:
            conn.execute("DELETE FROM push_subscriptions WHERE endpoint = ?", (ep,))
    conn.commit()
    conn.close()


def _send_morning_todo_digest():
    """朝8時：今日締切・期限切れ・今日が実行日の ToDo をまとめて通知"""
    if not VAPID_PUBLIC_KEY or not VAPID_PRIVATE_KEY_B64:
        return
    today_str = datetime.now(JST).strftime("%Y-%m-%d")
    conn = _get_db()
    try:
        rows = conn.execute(
            """SELECT ps.endpoint, ps.subscription, ud.todos
               FROM push_subscriptions ps
               JOIN user_data ud ON ps.user_id = ud.user_id"""
        ).fetchall()
    finally:
        conn.close()

    expired = []
    for row in rows:
        user_todos = json.loads(row["todos"] or "[]")

        due_today  = [t for t in user_todos
                      if not t.get("done") and t.get("deadline") == today_str]
        overdue    = [t for t in user_todos
                      if not t.get("done") and t.get("deadline") and t["deadline"] < today_str]
        exec_today = [t for t in user_todos
                      if not t.get("done")
                      and t.get("executionDate") == today_str
                      and t.get("deadline") != today_str]

        notifications = []
        if due_today:
            notifications.append({
                "title": f"📌 今日締切 {len(due_today)}件",
                "body":  "\n".join(f"・{t['text']}" for t in due_today[:3]),
                "tag":   f"todo-today-{today_str}",
            })
        if overdue:
            notifications.append({
                "title": f"⚠ 期限切れ {len(overdue)}件",
                "body":  "\n".join(f"・{t['text']}" for t in overdue[:3]),
                "tag":   f"todo-overdue-{today_str}",
            })
        if exec_today:
            notifications.append({
                "title": f"📅 今日やること {len(exec_today)}件",
                "body":  "\n".join(f"・{t['text']}" for t in exec_today[:3]),
                "tag":   f"todo-exec-{today_str}",
            })

        for notif in notifications:
            _push_to_user(
                row["subscription"],
                json.dumps(notif, ensure_ascii=False),
                expired,
            )

    _cleanup_expired_endpoints(expired)


def _send_evening_assignment_reminder():
    """夜21時：明日締切の課題を通知"""
    if not VAPID_PUBLIC_KEY or not VAPID_PRIVATE_KEY_B64:
        return
    tomorrow_str = (datetime.now(JST) + timedelta(days=1)).strftime("%Y-%m-%d")
    conn = _get_db()
    try:
        rows = conn.execute(
            """SELECT ps.endpoint, ps.subscription, ud.todos
               FROM push_subscriptions ps
               JOIN user_data ud ON ps.user_id = ud.user_id"""
        ).fetchall()
    finally:
        conn.close()

    expired = []
    for row in rows:
        user_todos = json.loads(row["todos"] or "[]")
        assigns = [t for t in user_todos
                   if not t.get("done")
                   and t.get("deadline") == tomorrow_str
                   and t.get("category") == "assignment"]
        if not assigns:
            continue
        payload = json.dumps({
            "title": f"📚 明日締切の課題 {len(assigns)}件",
            "body":  "\n".join(f"・{t['text']}" for t in assigns[:3]),
            "tag":   f"assign-eve-{tomorrow_str}",
        }, ensure_ascii=False)
        _push_to_user(row["subscription"], payload, expired)

    _cleanup_expired_endpoints(expired)


scheduler = BackgroundScheduler(timezone="Asia/Tokyo")
scheduler.add_job(_send_push_notifications,          "interval", minutes=1)
scheduler.add_job(_send_morning_todo_digest,          "cron", hour=8,  minute=0)
scheduler.add_job(_send_evening_assignment_reminder,  "cron", hour=21, minute=0)
scheduler.start()


# ─── App & CORS ───────────────────────────────────────────────────────────────
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ───────────────────────────────────────────────────────────────────
class AuthRequest(BaseModel):
    username: str
    password: str


class SyncData(BaseModel):
    events: list
    todos: list
    habits: list = []
    classSchedule: dict = {}
    habitLogs: dict = {}


class ShareInviteRequest(BaseModel):
    username: str


class PushSubscriptionData(BaseModel):
    subscription: dict


# ─── Auth endpoints ───────────────────────────────────────────────────────────
@app.post("/auth/register")
def register(data: AuthRequest):
    username = data.username.strip()
    if len(username) < 2:
        raise HTTPException(status_code=400, detail="ユーザー名は2文字以上で入力してください")
    if len(data.password) < 4:
        raise HTTPException(status_code=400, detail="パスワードは4文字以上で入力してください")
    pw_hash = _hash_pw(data.password)
    conn = _get_db()
    try:
        conn.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (username, pw_hash),
        )
        conn.commit()
        user_id = conn.execute(
            "SELECT id FROM users WHERE username = ?", (username,)
        ).fetchone()["id"]
        conn.execute("INSERT INTO user_data (user_id) VALUES (?)", (user_id,))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=409, detail="このユーザー名はすでに使われています")
    conn.close()
    token = _create_session(user_id)
    return {"token": token, "username": username}


@app.post("/auth/login")
def login(data: AuthRequest):
    username = data.username.strip()
    conn = _get_db()
    row = conn.execute(
        "SELECT id, password_hash FROM users WHERE username = ?", (username,)
    ).fetchone()
    conn.close()
    if not row or not _verify_pw(data.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="ユーザー名またはパスワードが違います")
    token = _create_session(row["id"])
    return {"token": token, "username": username}


@app.post("/auth/logout")
def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
        conn = _get_db()
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
        conn.close()
    return {"ok": True}


@app.delete("/auth/delete")
def delete_account(authorization: Optional[str] = Header(None)):
    user_id = _require_user(authorization)
    conn = _get_db()
    conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()
    return {"ok": True}


@app.get("/auth/me")
def get_me(authorization: Optional[str] = Header(None)):
    user_id = _require_user(authorization)
    conn = _get_db()
    row = conn.execute("SELECT username FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return {"username": row["username"]}


# ─── Data sync ────────────────────────────────────────────────────────────────
@app.get("/data")
def get_data(authorization: Optional[str] = Header(None)):
    user_id = _require_user(authorization)
    conn = _get_db()
    row = conn.execute(
        "SELECT events, todos, habits, class_schedule, habit_logs FROM user_data WHERE user_id = ?", (user_id,)
    ).fetchone()
    conn.close()
    if not row:
        return {"events": [], "todos": [], "habits": [], "classSchedule": {}, "habitLogs": {}}
    return {
        "events":        json.loads(row["events"]),
        "todos":         json.loads(row["todos"]),
        "habits":        json.loads(row["habits"] or "[]"),
        "classSchedule": json.loads(row["class_schedule"] or "{}"),
        "habitLogs":     json.loads(row["habit_logs"] or "{}"),
    }


@app.post("/data")
def save_data(data: SyncData, authorization: Optional[str] = Header(None)):
    user_id = _require_user(authorization)
    conn = _get_db()
    conn.execute(
        "INSERT OR REPLACE INTO user_data (user_id, events, todos, habits, class_schedule, habit_logs) VALUES (?, ?, ?, ?, ?, ?)",
        (
            user_id,
            json.dumps(data.events,        ensure_ascii=False),
            json.dumps(data.todos,         ensure_ascii=False),
            json.dumps(data.habits,        ensure_ascii=False),
            json.dumps(data.classSchedule, ensure_ascii=False),
            json.dumps(data.habitLogs,     ensure_ascii=False),
        ),
    )
    conn.commit()
    conn.close()
    return {"ok": True}


# ─── Train delay ──────────────────────────────────────────────────────────────
@app.get("/train/delays")
def get_train_delays():
    try:
        req = urllib.request.Request(
            "https://rti-giken.jp/fhc/api/train_tetsudo/",
            headers={"User-Agent": "CalendarApp/1.0"},
        )
        with urllib.request.urlopen(req, timeout=6) as res:
            data = json.loads(res.read().decode())
        delayed = [d for d in data if d.get("status", 0) != 0]
        return {"delayed": delayed, "updatedAt": datetime.utcnow().isoformat()}
    except Exception:
        raise HTTPException(status_code=503, detail="遅延情報の取得に失敗しました")


# ─── Push notifications ───────────────────────────────────────────────────────
@app.get("/push/vapid-public-key")
def get_vapid_public_key():
    return {"publicKey": VAPID_PUBLIC_KEY}


@app.post("/push/subscribe")
def push_subscribe(data: PushSubscriptionData, authorization: Optional[str] = Header(None)):
    user_id = _require_user(authorization)
    sub = data.subscription
    endpoint = sub.get("endpoint", "")
    if not endpoint:
        raise HTTPException(status_code=400, detail="endpoint が必要です")
    sub_json = json.dumps(sub)
    conn = _get_db()
    conn.execute(
        "INSERT OR REPLACE INTO push_subscriptions (user_id, endpoint, subscription) VALUES (?, ?, ?)",
        (user_id, endpoint, sub_json),
    )
    conn.commit()
    conn.close()
    return {"ok": True}


# ─── Share endpoints ──────────────────────────────────────────────────────────
@app.post("/share/invite")
def share_invite(data: ShareInviteRequest, authorization: Optional[str] = Header(None)):
    owner_id = _require_user(authorization)
    conn = _get_db()
    target = conn.execute(
        "SELECT id FROM users WHERE username = ?", (data.username.strip(),)
    ).fetchone()
    if not target:
        conn.close()
        raise HTTPException(status_code=404, detail="そのユーザーは存在しません")
    viewer_id = target["id"]
    if viewer_id == owner_id:
        conn.close()
        raise HTTPException(status_code=400, detail="自分自身には送れません")
    try:
        conn.execute(
            "INSERT INTO shares (owner_id, viewer_id, status) VALUES (?, ?, 'pending')",
            (owner_id, viewer_id),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=409, detail="すでに招待済みです")
    conn.close()
    return {"ok": True}


@app.get("/share/invites")
def get_invites(authorization: Optional[str] = Header(None)):
    viewer_id = _require_user(authorization)
    conn = _get_db()
    rows = conn.execute(
        """SELECT s.id, s.owner_id, u.username AS owner_name, s.created_at
           FROM shares s JOIN users u ON s.owner_id = u.id
           WHERE s.viewer_id = ? AND s.status = 'pending'""",
        (viewer_id,),
    ).fetchall()
    conn.close()
    return {"invites": [dict(r) for r in rows]}


@app.post("/share/accept/{owner_id}")
def accept_invite(owner_id: int, authorization: Optional[str] = Header(None)):
    viewer_id = _require_user(authorization)
    conn = _get_db()
    conn.execute(
        "UPDATE shares SET status = 'accepted' WHERE owner_id = ? AND viewer_id = ?",
        (owner_id, viewer_id),
    )
    conn.commit()
    conn.close()
    return {"ok": True}


@app.delete("/share/{owner_id}")
def remove_share(owner_id: int, authorization: Optional[str] = Header(None)):
    viewer_id = _require_user(authorization)
    conn = _get_db()
    conn.execute(
        "DELETE FROM shares WHERE owner_id = ? AND viewer_id = ?",
        (owner_id, viewer_id),
    )
    conn.commit()
    conn.close()
    return {"ok": True}


@app.get("/share/friends")
def get_friends(authorization: Optional[str] = Header(None)):
    viewer_id = _require_user(authorization)
    conn = _get_db()
    rows = conn.execute(
        """SELECT s.owner_id, u.username AS owner_name
           FROM shares s JOIN users u ON s.owner_id = u.id
           WHERE s.viewer_id = ? AND s.status = 'accepted'""",
        (viewer_id,),
    ).fetchall()
    conn.close()
    return {"friends": [dict(r) for r in rows]}


@app.get("/share/events")
def get_shared_events(authorization: Optional[str] = Header(None)):
    viewer_id = _require_user(authorization)
    conn = _get_db()
    rows = conn.execute(
        """SELECT ud.events, u.username AS owner_name
           FROM shares s
           JOIN user_data ud ON s.owner_id = ud.user_id
           JOIN users u ON s.owner_id = u.id
           WHERE s.viewer_id = ? AND s.status = 'accepted'""",
        (viewer_id,),
    ).fetchall()
    conn.close()
    result = []
    for row in rows:
        evs = json.loads(row["events"] or "[]")
        for e in evs:
            e["_sharedBy"] = row["owner_name"]
        result.extend(evs)
    return {"events": result}
