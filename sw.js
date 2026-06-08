const CACHE_NAME = "calendar-v43";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(clients.claim()));

// メインアプリからのメッセージを受け取って通知を表示
self.addEventListener("message", event => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    const { title, body, tag } = event.data;
    self.registration.showNotification(title, {
      body,
      tag: tag || "calendar-notify",
      requireInteraction: false,
    });
  }
});

// サーバーからの Web Push を受け取って通知を表示
self.addEventListener("push", event => {
  let data = {};
  try { data = event.data?.json() || {}; } catch { data = { title: "授業通知", body: event.data?.text() || "" }; }
  event.waitUntil(
    self.registration.showNotification(data.title || "授業通知", {
      body: data.body || "",
      tag: data.tag || "calendar-push",
      requireInteraction: false,
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow("/");
    })
  );
});
