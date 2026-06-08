let authToken = localStorage.getItem("authToken") || null;
let authUsername = localStorage.getItem("authUsername") || null;
let _pulledFromServer = false;

let currentDate = new Date();
let today = new Date();

let currentYear = today.getFullYear();
let currentMonth = today.getMonth();

let selectedDate = null;
let editingIndex = null;

let events = JSON.parse(localStorage.getItem("events")) || [];

const periodTimes = {
  1: { start: "09:00", end: "10:40" },
  2: { start: "10:50", end: "12:30" },
  3: { start: "13:30", end: "15:10" },
  4: { start: "15:20", end: "17:00" },
  5: { start: "17:10", end: "18:50" }
};

const holidays = {
  "2026-01-01": "元日",
  "2026-01-12": "成人の日",
  "2026-02-11": "建国記念の日",
  "2026-02-23": "天皇誕生日",
  "2026-03-20": "春分の日",
  "2026-04-29": "昭和の日",
  "2026-05-03": "憲法記念日",
  "2026-05-04": "みどりの日",
  "2026-05-05": "こどもの日",
  "2026-05-06": "振替休日",
  "2026-07-20": "海の日",
  "2026-08-11": "山の日",
  "2026-09-21": "敬老の日",
  "2026-09-22": "国民の休日",
  "2026-09-23": "秋分の日",
  "2026-10-12": "スポーツの日",
  "2026-11-03": "文化の日",
  "2026-11-23": "勤労感謝の日"
};

const meijiAcademicCalendar = {
  "2026-04-29": { type: "school-day", label: "休日授業実施日" },
  "2026-07-20": { type: "school-day", label: "休日授業実施日" },

  // 秋の休日授業実施日
  "2026-09-21": { type: "school-day", label: "休日授業実施日" },
  "2026-09-22": { type: "school-day", label: "休日授業実施日" },
  "2026-09-23": { type: "school-day", label: "休日授業実施日" },
  "2026-10-12": { type: "school-day", label: "休日授業実施日" },
  

  "2026-05-01": { type: "closed", label: "臨時休業日" },
  "2026-05-02": { type: "closed", label: "臨時休業日" },

  "2026-08-01": { type: "closed", label: "夏季休業開始" },
  "2026-09-19": { type: "closed", label: "夏季休業終了" },

  // 学園祭期間
"2026-10-29": { type: "festival", label: "明大祭期間" },
"2026-10-30": { type: "festival", label: "明大祭期間" },
"2026-10-31": { type: "festival", label: "明大祭期間" },
"2026-11-01": { type: "festival", label: "明大祭期間" },
"2026-11-02": { type: "festival", label: "明大祭期間" },
"2026-11-03": { type: "festival", label: "明大祭期間" },

  // 冬季休業
  "2026-12-26": { type: "closed", label: "冬季休業開始" },
  "2027-01-07": { type: "closed", label: "冬季休業終了" },
//春季休業
  "2027-2-4": { type: "closed", label: "春季休業開始" },
  "2027-3-31": { type: "closed", label: "春季休業終了" },
  // 定期試験
  "2026-07-23": { type: "exam", label: "春学期定期試験開始" },
  "2026-07-31": { type: "exam", label: "春学期定期試験終了" },
  "2027-01-25": { type: "exam", label: "秋学期定期試験開始" },
  "2027-02-3": { type: "exam", label: "秋学期定期試験終了" }
};

const meijiClosedRanges = [
  { start: "2026-08-01", end: "2026-09-19", label: "夏季休業" },
  { start: "2026-12-26", end: "2027-01-07", label: "冬季休業" },
  { start: "2026-10-29", end: "2026-11-03", label: "明大祭期間" },

  // 春学期定期試験
  { start: "2026-07-23", end: "2026-07-31", label: "春学期定期試験" },

  // 秋学期定期試験
  { start: "2027-01-25", end: "2027-02-03", label: "秋学期定期試験" }
];

function isInClosedRange(dateString) {
  return meijiClosedRanges.some(range => {
    return dateString >= range.start && dateString <= range.end;
  });
}

const timetableData = [
  // 総合数理学部 通年
  { faculty: "総合数理学部", title: "ネットワークデザインゼミナール", teacher: "田村 滋", semester: "通年", day: "水", period: 4, campus: "中野", room: "", code: "(MS)IND212J", repeat: "biweekly" },
  { faculty: "総合数理学部", title: "総合数理ゼミナール (ND)", teacher: "田村 滋", semester: "通年", day: "水", period: 4, campus: "中野", room: "", code: "(MS)IND112J", repeat: "biweekly" },

  // 総合数理学部 春
  { faculty: "総合数理学部", title: "English IA (a)", teacher: "柴崎 礼士郎", semester: "春", day: "月", period: 1, campus: "中野", room: "412", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IA (b)", teacher: "及川 一美", semester: "春", day: "月", period: 1, campus: "中野", room: "408", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English IA (e)", teacher: "田中 ちよ子", semester: "春", day: "月", period: 1, campus: "中野", room: "414", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English IC (f)", teacher: "中津川 みゆき", semester: "春", day: "月", period: 1, campus: "中野", room: "510", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IC (k)", teacher: "ロマンコ，リック S", semester: "春", day: "月", period: 1, campus: "中野", room: "411", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IC (m)", teacher: "石田 プリシラA.", semester: "春", day: "月", period: 1, campus: "中野", room: "409", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IC (o)", teacher: "フルトン，スチュワー", semester: "春", day: "月", period: 1, campus: "中野", room: "406", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "情報分析と可視化", teacher: "中村 聡史", semester: "春", day: "月", period: 1, campus: "中野", room: "516", code: "(MS)INF348J" },
  { faculty: "総合数理学部", title: "現象とフーリエ変換", teacher: "三村 与士文", semester: "春", day: "月", period: 1, campus: "中野", room: "304", code: "(MS)MAT251J" },
  { faculty: "総合数理学部", title: "経済学B", teacher: "栗原 剛", semester: "春", day: "月", period: 1, campus: "中野", room: "312", code: "(MS)ECN111J" },

  { faculty: "総合数理学部", title: "English IA (c)", teacher: "及川 一美", semester: "春", day: "月", period: 2, campus: "中野", room: "408", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English IA (d)", teacher: "柴崎 礼士郎", semester: "春", day: "月", period: 2, campus: "中野", room: "412", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IA (o)", teacher: "田中 ちよ子", semester: "春", day: "月", period: 2, campus: "中野", room: "414", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English IC (e)", teacher: "フルトン，スチュワー", semester: "春", day: "月", period: 2, campus: "中野", room: "406", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IC (g)", teacher: "ロマンコ，リック S", semester: "春", day: "月", period: 2, campus: "中野", room: "411", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IC (h)", teacher: "石田 プリシラA.", semester: "春", day: "月", period: 2, campus: "中野", room: "409", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IC (i)", teacher: "中津川 みゆき", semester: "春", day: "月", period: 2, campus: "中野", room: "510", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "並列分散処理", teacher: "吉田 明正", semester: "春", day: "月", period: 2, campus: "中野", room: "515", code: "(MS)INF321J" },
  { faculty: "総合数理学部", title: "最適化の数理 (ND)", teacher: "中田 洋平", semester: "春", day: "月", period: 2, campus: "中野", room: "516", code: "(MS)MAT251J" },
  { faculty: "総合数理学部", title: "機械学習の数理", teacher: "廣瀬 善大", semester: "春", day: "月", period: 2, campus: "中野", room: "310", code: "(MS)STA371J" },

  { faculty: "総合数理学部", title: "パターン認識と機械学習", teacher: "荒川 薫", semester: "春", day: "月", period: 3, campus: "中野", room: "516", code: "(MS)INF331J" },
  { faculty: "総合数理学部", title: "日本国憲法", teacher: "市川 直子", semester: "春", day: "月", period: 3, campus: "中野", room: "311", code: "(MS)LAW121J" },
  { faculty: "総合数理学部", title: "スポーツ実習B", teacher: "酒井 利信", semester: "春", day: "月", period: 4, campus: "中野", room: "多目的室", code: "(MS)HES143J" },
  { faculty: "総合数理学部", title: "映像・アニメーション表現", teacher: "福地 健太郎", semester: "春", day: "月", period: 4, campus: "中野", room: "515", code: "(MS)INF248J" },
  { faculty: "総合数理学部", title: "物理学 I (ND)", teacher: "内古閑 伸之", semester: "春", day: "月", period: 4, campus: "中野", room: "516", code: "(MS)BPH118J" },
  { faculty: "総合数理学部", title: "知能数理概論", teacher: "前野 義晴", semester: "春", day: "月", period: 4, campus: "中野", room: "402", code: "(MS)IND211J" },
  { faculty: "総合数理学部", title: "認知科学", teacher: "小松 孝徳", semester: "春", day: "月", period: 5, campus: "中野", room: "311", code: "(MS)INF231J" },

  { faculty: "総合数理学部", title: "English IIA (A)", teacher: "ゴッドフリー，チャド", semester: "春", day: "火", period: 1, campus: "中野", room: "412", code: "(MS)LAN218E" },
  { faculty: "総合数理学部", title: "English IIA (C)", teacher: "中津川 みゆき", semester: "春", day: "火", period: 1, campus: "中野", room: "405", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "エネルギーネットワーク", teacher: "浦野 昌一", semester: "春", day: "火", period: 1, campus: "中野", room: "413", code: "(MS)ELC321J" },
  { faculty: "総合数理学部", title: "地理学A (1)", teacher: "鳴橋 竜太郎", semester: "春", day: "火", period: 1, campus: "中野", room: "402", code: "(MS)GEO111J" },
  { faculty: "総合数理学部", title: "線形代数 I (MS)", teacher: "三浦 千明", semester: "春", day: "火", period: 1, campus: "中野", room: "304", code: "(MS)MAT111J" },

  { faculty: "総合数理学部", title: "English IIA (D)", teacher: "古賀 友也", semester: "春", day: "火", period: 2, campus: "中野", room: "308", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "English IIA (F)", teacher: "中津川 みゆき", semester: "春", day: "火", period: 2, campus: "中野", room: "405", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "English IIA (H)", teacher: "ゴッドフリー，チャド", semester: "春", day: "火", period: 2, campus: "中野", room: "412", code: "(MS)LAN218E" },
  { faculty: "総合数理学部", title: "English IIA (M)", teacher: "河野 円", semester: "春", day: "火", period: 2, campus: "中野", room: "301", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "地理学A (2)", teacher: "鳴橋 竜太郎", semester: "春", day: "火", period: 2, campus: "中野", room: "ホール", code: "(MS)GEO111J" },
  { faculty: "総合数理学部", title: "応用複素関数", teacher: "桂田 祐史", semester: "春", day: "火", period: 2, campus: "中野", room: "310", code: "(MS)MAT331J" },
  { faculty: "総合数理学部", title: "経営学A", teacher: "近藤 光", semester: "春", day: "火", period: 2, campus: "中野", room: "311", code: "(MS)MAN121J" },
  { faculty: "総合数理学部", title: "音響・音声処理", teacher: "森勢 将雅", semester: "春", day: "火", period: 2, campus: "中野", room: "402", code: "(MS)INF331J" },

  { faculty: "総合数理学部", title: "English IIIA (MS)(1)", teacher: "深澤 英美", semester: "春", day: "火", period: 3, campus: "中野", room: "412", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIA (MS)(2)", teacher: "古賀 友也", semester: "春", day: "火", period: 3, campus: "中野", room: "508", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English Test Preparation I", teacher: "河野 円", semester: "春", day: "火", period: 3, campus: "中野", room: "301", code: "(MS)LAN219M" },
  { faculty: "総合数理学部", title: "微積分 I ベーシックコース", teacher: "小林 徹也", semester: "春", day: "火", period: 3, campus: "中野", room: "202", code: "(MS)MAT131J" },
  { faculty: "総合数理学部", title: "応用測度論", teacher: "高橋 明彦", semester: "春", day: "火", period: 3, campus: "中野", room: "403", code: "(MS)MAT331J" },
  { faculty: "総合数理学部", title: "意思決定の数理", teacher: "中田 洋平", semester: "春", day: "火", period: 3, campus: "中野", room: "515", code: "(MS)INF331J" },
  { faculty: "総合数理学部", title: "生物学入門", teacher: "三浦 千明", semester: "春", day: "火", period: 3, campus: "中野", room: "304", code: "(MS)BBI291J" },
  { faculty: "総合数理学部", title: "English IIIA (MS)(3)", teacher: "エルウッド，ジェーム", semester: "春", day: "火", period: 4, campus: "中野", room: "409", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIA (MS)(4)", teacher: "古賀 友也", semester: "春", day: "火", period: 4, campus: "中野", room: "508", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIA (MS)(5)", teacher: "深澤 英美", semester: "春", day: "火", period: 4, campus: "中野", room: "412", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "ネットワークデザイン特別講義A", teacher: "浦野 昌一", semester: "春", day: "火", period: 4, campus: "中野", room: "304", code: "(MS)ELC322J" },
  { faculty: "総合数理学部", title: "心理学A", teacher: "大谷 智子", semester: "春", day: "火", period: 4, campus: "中野", room: "ホール", code: "(MS)PSY131J" },
  { faculty: "総合数理学部", title: "数理統計学", teacher: "松山 直樹", semester: "春", day: "火", period: 4, campus: "中野", room: "516", code: "(MS)STA231J" },
  { faculty: "総合数理学部", title: "生体ネットワーク理論", teacher: "佐々木 貴規", semester: "春", day: "火", period: 4, campus: "中野", room: "410", code: "(MS)BIO221J" },
  { faculty: "総合数理学部", title: "哲学A", teacher: "美濃部 仁", semester: "春", day: "火", period: 5, campus: "中野", room: "304", code: "(MS)PHL111J" },

  { faculty: "総合数理学部", title: "English IA (g)", teacher: "土肥 妙子", semester: "春", day: "水", period: 1, campus: "中野", room: "510", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IA (h)", teacher: "米田 佐紀子", semester: "春", day: "水", period: 1, campus: "中野", room: "301", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English IA (m)", teacher: "及川 一美", semester: "春", day: "水", period: 1, campus: "中野", room: "412", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English IA (n)", teacher: "河野 円", semester: "春", day: "水", period: 1, campus: "中野", room: "309", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English IC (a)", teacher: "ツビトコビッチ，ロバ", semester: "春", day: "水", period: 1, campus: "中野", room: "406", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IC (c)", teacher: "エルウッド，ジェーム", semester: "春", day: "水", period: 1, campus: "中野", room: "408", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IC (p)", teacher: "パタソン，ロバート", semester: "春", day: "水", period: 1, campus: "中野", room: "414", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "データベース", teacher: "秋岡 明香", semester: "春", day: "水", period: 1, campus: "中野", room: "310", code: "(MS)INF328J" },

  { faculty: "総合数理学部", title: "English IA (f)", teacher: "米田 佐紀子", semester: "春", day: "水", period: 2, campus: "中野", room: "301", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English IA (i)", teacher: "及川 一美", semester: "春", day: "水", period: 2, campus: "中野", room: "412", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English IA (k)", teacher: "土肥 妙子", semester: "春", day: "水", period: 2, campus: "中野", room: "510", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IA (p)", teacher: "深澤 英美", semester: "春", day: "水", period: 2, campus: "中野", room: "309", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English IC (b)", teacher: "パタソン，ロバート", semester: "春", day: "水", period: 2, campus: "中野", room: "414", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IC (d)", teacher: "ツビトコビッチ，ロバ", semester: "春", day: "水", period: 2, campus: "中野", room: "406", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IC (n)", teacher: "エルウッド，ジェーム", semester: "春", day: "水", period: 2, campus: "中野", room: "408", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "システム数理基礎", teacher: "阿原 一志", semester: "春", day: "水", period: 2, campus: "中野", room: "516", code: "(MS)MAT231J" },
  { faculty: "総合数理学部", title: "政治学A", teacher: "松井 陽征", semester: "春", day: "水", period: 2, campus: "中野", room: "ホール", code: "(MS)POL111J" },
  { faculty: "総合数理学部", title: "映像・画像処理", teacher: "鹿喰 善明", semester: "春", day: "水", period: 2, campus: "中野", room: "413", code: "(MS)INF331J" },

  { faculty: "総合数理学部", title: "English IIIA (FMS)(1)", teacher: "柴崎 礼士郎", semester: "春", day: "水", period: 3, campus: "中野", room: "412", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIA (FMS)(2)", teacher: "ツビトコビッチ，ロバ", semester: "春", day: "水", period: 3, campus: "中野", room: "406", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIA (FMS)(3)", teacher: "深澤 英美", semester: "春", day: "水", period: 3, campus: "中野", room: "414", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "物理学 I (MS・FMS)", teacher: "内古閑 伸之", semester: "春", day: "水", period: 3, campus: "中野", room: "311", code: "(MS)BPH111J" },
  { faculty: "総合数理学部", title: "通信理論", teacher: "笠 史郎", semester: "春", day: "水", period: 3, campus: "中野", room: "508", code: "(MS)ELC251J" },

  { faculty: "総合数理学部", title: "English IIIA (FMS)(4)", teacher: "ツビトコビッチ，ロバ", semester: "春", day: "水", period: 4, campus: "中野", room: "406", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIA (FMS)(5)", teacher: "柴崎 礼士郎", semester: "春", day: "水", period: 4, campus: "中野", room: "412", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIA (FMS)(6)", teacher: "エルウッド，ジェーム", semester: "春", day: "水", period: 4, campus: "中野", room: "408", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "スポーツ実習A", teacher: "劉 立凡", semester: "春", day: "水", period: 4, campus: "中野", room: "多目的室", code: "(MS)HES143J" },
  { faculty: "総合数理学部", title: "偏微分方程式と数値解析", teacher: "池田 幸太", semester: "春", day: "水", period: 4, campus: "中野", room: "312", code: "(MS)MAT351J" },

  { faculty: "総合数理学部", title: "代数", teacher: "辻 俊輔", semester: "春", day: "水", period: 5, campus: "中野", room: "515", code: "(MS)MAT211J" },
  { faculty: "総合数理学部", title: "考古学A", teacher: "久米 正吾", semester: "春", day: "水", period: 5, campus: "中野", room: "413", code: "(MS)PAC111J" },

  { faculty: "総合数理学部", title: "データ分析基礎 (5組)", teacher: "野口 怜", semester: "春", day: "木", period: 1, campus: "中野", room: "203", code: "(MS)INF118J" },
  { faculty: "総合数理学部", title: "データ分析基礎 (6組)", teacher: "浦野 昌一", semester: "春", day: "木", period: 1, campus: "中野", room: "205", code: "(MS)INF118J" },
  { faculty: "総合数理学部", title: "ネットワークデザイン実験", teacher: "大野 光平", semester: "春", day: "木", period: 1, campus: "中野", room: "514", code: "(MS)ELC394J" },
  { faculty: "総合数理学部", title: "統計学入門 (1)", teacher: "奥野 拓也", semester: "春", day: "木", period: 1, campus: "中野", room: "515", code: "(MS)STA111J" },
  { faculty: "総合数理学部", title: "線形代数 I (FMS)", teacher: "鈴木 正明", semester: "春", day: "木", period: 1, campus: "中野", room: "311", code: "(MS)MAT111J" },
  { faculty: "総合数理学部", title: "金融経済分析", teacher: "乾 孝治", semester: "春", day: "木", period: 1, campus: "中野", room: "206", code: "(MS)STA278J" },

  { faculty: "総合数理学部", title: "ネットワークデザイン実験", teacher: "大野 光平", semester: "春", day: "木", period: 2, campus: "中野", room: "514", code: "(MS)ELC394J" },
  { faculty: "総合数理学部", title: "ネットワーク理論", teacher: "秋岡 明香", semester: "春", day: "木", period: 2, campus: "中野", room: "206", code: "(MS)INF211J" },
  { faculty: "総合数理学部", title: "バーチャルリアリティ", teacher: "橋本 直", semester: "春", day: "木", period: 2, campus: "中野", room: "413", code: "(MS)INF331J" },
  { faculty: "総合数理学部", title: "情報数理基礎", teacher: "鈴木 正明", semester: "春", day: "木", period: 2, campus: "中野", room: "310", code: "(MS)MAT251J" },
  { faculty: "総合数理学部", title: "情報理論 (FMS)", teacher: "吉田 真紀", semester: "春", day: "木", period: 2, campus: "中野", room: "515", code: "(MS)INF211J" },
  { faculty: "総合数理学部", title: "数学解析", teacher: "柳田 英二", semester: "春", day: "木", period: 2, campus: "中野", room: "304", code: "(MS)MAT231J" },
  { faculty: "総合数理学部", title: "計算数理", teacher: "阿原 一志", semester: "春", day: "木", period: 2, campus: "中野", room: "307", code: "(MS)MAT311J" },

  { faculty: "総合数理学部", title: "制御工学", teacher: "金子 修", semester: "春", day: "木", period: 3, campus: "中野", room: "206", code: "(MS)ELC371J" },
  { faculty: "総合数理学部", title: "線形代数 I (ND)", teacher: "鈴木 将満", semester: "春", day: "木", period: 3, campus: "中野", room: "311", code: "(MS)MAT111J" },

  { faculty: "総合数理学部", title: "トポロジー", teacher: "久保田 肇", semester: "春", day: "木", period: 4, campus: "中野", room: "402", code: "(MS)MAT221J" },
  { faculty: "総合数理学部", title: "メディアアート・デザイン", teacher: "鈴木 英倫子", semester: "春", day: "木", period: 4, campus: "中野", room: "304", code: "(MS)INF348J" },
  { faculty: "総合数理学部", title: "基本情報技術 IV", teacher: "金崎 克己", semester: "春", day: "木", period: 4, campus: "中野", room: "516", code: "(MS)INF321J" },
  { faculty: "総合数理学部", title: "歴史学A", teacher: "宜野座 菜央見", semester: "春", day: "木", period: 4, campus: "中野", room: "301", code: "(MS)HIS111J" },
  { faculty: "総合数理学部", title: "物理学 I ベーシックコース", teacher: "内古閑 伸之", semester: "春", day: "木", period: 4, campus: "中野", room: "403", code: "(MS)BPH118J" },
  { faculty: "総合数理学部", title: "科学哲学A", teacher: "森永 豊", semester: "春", day: "木", period: 4, campus: "中野", room: "307", code: "(MS)PHL191J" },
  { faculty: "総合数理学部", title: "統計学入門 (2)", teacher: "水嶌 友昭", semester: "春", day: "木", period: 4, campus: "中野", room: "310", code: "(MS)STA111J" },
  { faculty: "総合数理学部", title: "社会学A", teacher: "関口 卓也", semester: "春", day: "木", period: 5, campus: "中野", room: "515", code: "(MS)SOC111J" },
  { faculty: "総合数理学部", title: "芸術史A", teacher: "鈴木 英倫子", semester: "春", day: "木", period: 5, campus: "中野", room: "312", code: "(MS)ART111J" },

  { faculty: "総合数理学部", title: "English IIA (B)", teacher: "柴崎 礼士郎", semester: "春", day: "金", period: 1, campus: "中野", room: "405", code: "(MS)LAN218E" },
  { faculty: "総合数理学部", title: "English IIA (I)", teacher: "米田 佐紀子", semester: "春", day: "金", period: 1, campus: "中野", room: "208", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "English IIA (L)", teacher: "石田 プリシラA.", semester: "春", day: "金", period: 1, campus: "中野", room: "408", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "総合数理概論", teacher: "阿原 一志", semester: "春", day: "金", period: 1, campus: "中野", room: "ホール", code: "(MS)IND111J" },

  { faculty: "総合数理学部", title: "English IIA (E)", teacher: "エルウッド，ジェーム", semester: "春", day: "金", period: 2, campus: "中野", room: "405", code: "(MS)LAN218E" },
  { faculty: "総合数理学部", title: "English IIA (G)", teacher: "古賀 友也", semester: "春", day: "金", period: 2, campus: "中野", room: "412", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "English IIA (J)", teacher: "石田 プリシラA.", semester: "春", day: "金", period: 2, campus: "中野", room: "408", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "English IIA (K)", teacher: "米田 佐紀子", semester: "春", day: "金", period: 2, campus: "中野", room: "208", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "エネルギーネットワーク基礎", teacher: "福山 良和", semester: "春", day: "金", period: 2, campus: "中野", room: "413", code: "(MS)ELC111J" },
  { faculty: "総合数理学部", title: "スポーツ実習A", teacher: "今野 亮", semester: "春", day: "金", period: 2, campus: "中野", room: "多目的室", code: "(MS)HES143J" },
  { faculty: "総合数理学部", title: "微積分 I (FMS)", teacher: "阿原 一志", semester: "春", day: "金", period: 2, campus: "中野", room: "311", code: "(MS)MAT131J" },
  { faculty: "総合数理学部", title: "数学史", teacher: "中根 美知代", semester: "春", day: "金", period: 2, campus: "中野", room: "312", code: "(MS)MAT351J" },

  { faculty: "総合数理学部", title: "English IIIA (ND)(1)", teacher: "河野 円", semester: "春", day: "金", period: 3, campus: "中野", room: "414", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIA (ND)(2)", teacher: "古賀 友也", semester: "春", day: "金", period: 3, campus: "中野", room: "412", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "インタラクションデザイン", teacher: "渡邊 恵太", semester: "春", day: "金", period: 3, campus: "中野", room: "ホール", code: "(MS)INF338J" },
  { faculty: "総合数理学部", title: "スポーツ実習A", teacher: "今野 亮", semester: "春", day: "金", period: 3, campus: "中野", room: "多目的室", code: "(MS)HES143J" },
  { faculty: "総合数理学部", title: "多変量解析基礎（FMS・ND）", teacher: "鈴木 香寿恵", semester: "春", day: "金", period: 3, campus: "中野", room: "307", code: "(MS)STA241J" },
  { faculty: "総合数理学部", title: "微積分 I (MS)", teacher: "辻 俊輔", semester: "春", day: "金", period: 3, campus: "中野", room: "402", code: "(MS)MAT131J" },
  { faculty: "総合数理学部", title: "電気回路 I", teacher: "田村 滋", semester: "春", day: "金", period: 3, campus: "中野", room: "304", code: "(MS)ELC211J" },

  { faculty: "総合数理学部", title: "English IIIA (ND)(3)", teacher: "石田 プリシラA.", semester: "春", day: "金", period: 4, campus: "中野", room: "408", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIA (ND)(4)", teacher: "古賀 友也", semester: "春", day: "金", period: 4, campus: "中野", room: "412", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIA (ND)(5)", teacher: "河野 円", semester: "春", day: "金", period: 4, campus: "中野", room: "414", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "アルゴリズム論 (MS・ND)", teacher: "中山 実", semester: "春", day: "金", period: 4, campus: "中野", room: "206", code: "(MS)INF218J" },
  { faculty: "総合数理学部", title: "微積分 I (ND)", teacher: "森 龍之介", semester: "春", day: "金", period: 4, campus: "中野", room: "413", code: "(MS)MAT131J" },
  { faculty: "総合数理学部", title: "創造数理B", teacher: "北山 貴裕", semester: "春", day: "金", period: 5, campus: "中野", room: "413", code: "(MS)MAT391J" },
  { faculty: "総合数理学部", title: "情報技術概論", teacher: "辻野 雄大", semester: "春", day: "金", period: 5, campus: "中野", room: "206", code: "(MS)INF111J" },
  { faculty: "総合数理学部", title: "生体分子基礎", teacher: "佐々木 貴規", semester: "春", day: "金", period: 5, campus: "中野", room: "304", code: "(MS)BIO111J" },

  // 総合数理学部 春前・春後
  { faculty: "総合数理学部", title: "コンピュータリテラシー (5組)", teacher: "櫻井 義尚", semester: "春前", day: "火", period: 1, campus: "中野", room: "203", code: "(MS)INF118J" },
  { faculty: "総合数理学部", title: "コンピュータリテラシー (6組)", teacher: "富永 浩文", semester: "春前", day: "火", period: 1, campus: "中野", room: "206", code: "(MS)INF118J" },
  { faculty: "総合数理学部", title: "コンピュータリテラシー (5組)", teacher: "櫻井 義尚", semester: "春前", day: "火", period: 2, campus: "中野", room: "203", code: "(MS)INF118J" },
  { faculty: "総合数理学部", title: "コンピュータリテラシー (6組)", teacher: "富永 浩文", semester: "春前", day: "火", period: 2, campus: "中野", room: "206", code: "(MS)INF118J" },
  { faculty: "総合数理学部", title: "プログラミング演習 III (5組)", teacher: "鏑木 崇史", semester: "春前", day: "水", period: 1, campus: "中野", room: "203", code: "(MS)INF222J" },
  { faculty: "総合数理学部", title: "プログラミング演習 III (6組)", teacher: "中田 洋平", semester: "春前", day: "水", period: 1, campus: "中野", room: "206", code: "(MS)INF222J" },
  { faculty: "総合数理学部", title: "プログラミング演習 III (5組)", teacher: "鏑木 崇史", semester: "春前", day: "水", period: 2, campus: "中野", room: "203", code: "(MS)INF222J" },
  { faculty: "総合数理学部", title: "プログラミング演習 III (6組)", teacher: "中田 洋平", semester: "春前", day: "水", period: 2, campus: "中野", room: "206", code: "(MS)INF222J" },
  { faculty: "総合数理学部", title: "信号処理", teacher: "大野 光平", semester: "春前", day: "金", period: 1, campus: "中野", room: "203", code: "(MS)ELC311J" },
  { faculty: "総合数理学部", title: "信号処理", teacher: "大野 光平", semester: "春前", day: "金", period: 2, campus: "中野", room: "203", code: "(MS)ELC311J" },
  { faculty: "総合数理学部", title: "プログラミング演習 I (5組)", teacher: "中山 実", semester: "春後", day: "火", period: 1, campus: "中野", room: "203", code: "(MS)INF122J" },
  { faculty: "総合数理学部", title: "プログラミング演習 I (6組)", teacher: "福山 良和", semester: "春後", day: "火", period: 1, campus: "中野", room: "206", code: "(MS)INF122J" },
  { faculty: "総合数理学部", title: "プログラミング演習 I (5組)", teacher: "中山 実", semester: "春後", day: "火", period: 2, campus: "中野", room: "203", code: "(MS)INF122J" },
  { faculty: "総合数理学部", title: "プログラミング演習 I (6組)", teacher: "福山 良和", semester: "春後", day: "火", period: 2, campus: "中野", room: "206", code: "(MS)INF122J" },
  { faculty: "総合数理学部", title: "プログラミング演習 IV (5組)", teacher: "吉田 明正", semester: "春後", day: "水", period: 1, campus: "中野", room: "203", code: "(MS)INF222J" },
  { faculty: "総合数理学部", title: "プログラミング演習 IV (6組)", teacher: "鏑木 崇史", semester: "春後", day: "水", period: 1, campus: "中野", room: "206", code: "(MS)INF222J" },
  { faculty: "総合数理学部", title: "プログラミング演習 IV (5組)", teacher: "吉田 明正", semester: "春後", day: "水", period: 2, campus: "中野", room: "203", code: "(MS)INF222J" },
  { faculty: "総合数理学部", title: "プログラミング演習 IV (6組)", teacher: "鏑木 崇史", semester: "春後", day: "水", period: 2, campus: "中野", room: "206", code: "(MS)INF222J" },
  { faculty: "総合数理学部", title: "ロボット・システムデザイン", teacher: "森岡 一幸", semester: "春後", day: "金", period: 1, campus: "中野", room: "203", code: "(MS)INF331J" },
  { faculty: "総合数理学部", title: "ロボット・システムデザイン", teacher: "森岡 一幸", semester: "春後", day: "金", period: 2, campus: "中野", room: "203", code: "(MS)INF331J" },

  // 総合数理学部 秋
  { faculty: "総合数理学部", title: "English IB (a)", teacher: "柴崎 礼士郎", semester: "秋", day: "月", period: 1, campus: "中野", room: "412", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IB (b)", teacher: "及川 一美", semester: "秋", day: "月", period: 1, campus: "中野", room: "408", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English IB (e)", teacher: "田中 ちよ子", semester: "秋", day: "月", period: 1, campus: "中野", room: "414", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English ID (f)", teacher: "中津川 みゆき", semester: "秋", day: "月", period: 1, campus: "中野", room: "510", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English ID (k)", teacher: "ロマンコ，リック S", semester: "秋", day: "月", period: 1, campus: "中野", room: "411", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English ID (m)", teacher: "石田 プリシラA.", semester: "秋", day: "月", period: 1, campus: "中野", room: "409", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English ID (o)", teacher: "フルトン，スチュワー", semester: "秋", day: "月", period: 1, campus: "中野", room: "406", code: "(MS)LAN118E" },

  { faculty: "総合数理学部", title: "English IB (c)", teacher: "及川 一美", semester: "秋", day: "月", period: 2, campus: "中野", room: "408", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English IB (d)", teacher: "柴崎 礼士郎", semester: "秋", day: "月", period: 2, campus: "中野", room: "412", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IB (o)", teacher: "田中 ちよ子", semester: "秋", day: "月", period: 2, campus: "中野", room: "414", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English ID (e)", teacher: "フルトン，スチュワー", semester: "秋", day: "月", period: 2, campus: "中野", room: "406", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English ID (g)", teacher: "ロマンコ，リック S", semester: "秋", day: "月", period: 2, campus: "中野", room: "411", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English ID (h)", teacher: "石田 プリシラA.", semester: "秋", day: "月", period: 2, campus: "中野", room: "409", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English ID (i)", teacher: "中津川 みゆき", semester: "秋", day: "月", period: 2, campus: "中野", room: "510", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "バイオインフォマティクス", teacher: "杉本 昌弘", semester: "秋", day: "月", period: 2, campus: "中野", room: "310", code: "(MS)CBI361J" },
  { faculty: "総合数理学部", title: "全学共通総合講座（大学博物館）", teacher: "駒見 和夫", semester: "秋", day: "月", period: 2, campus: "駿河台", room: "", code: "(MS)IND111J" },
  { faculty: "総合数理学部", title: "電子回路", teacher: "笠 史郎", semester: "秋", day: "月", period: 2, campus: "中野", room: "304", code: "(MS)ELC241J" },

  { faculty: "総合数理学部", title: "つながりの数理", teacher: "北山 貴裕", semester: "秋", day: "月", period: 3, campus: "中野", room: "304", code: "(MS)MAT221J" },
  { faculty: "総合数理学部", title: "コンピュータビジョン", teacher: "橋本 直", semester: "秋", day: "月", period: 3, campus: "中野", room: "515", code: "(MS)INF331J" },
  { faculty: "総合数理学部", title: "微分方程式", teacher: "池田 幸太", semester: "秋", day: "月", period: 3, campus: "中野", room: "311", code: "(MS)MAT231J" },
  { faculty: "総合数理学部", title: "物理学 III", teacher: "内古閑 伸之", semester: "秋", day: "月", period: 3, campus: "中野", room: "516", code: "(MS)BPH238J" },

  { faculty: "総合数理学部", title: "スポーツ実習D", teacher: "酒井 利信", semester: "秋", day: "月", period: 4, campus: "中野", room: "多目的室", code: "(MS)HES143J" },
  { faculty: "総合数理学部", title: "幾何", teacher: "久保田 肇", semester: "秋", day: "月", period: 4, campus: "中野", room: "516", code: "(MS)MAT221J" },
  { faculty: "総合数理学部", title: "情報ネットワーク", teacher: "成瀬 央", semester: "秋", day: "月", period: 4, campus: "中野", room: "310", code: "(MS)INF321J" },
  { faculty: "総合数理学部", title: "電気回路 II", teacher: "前野 義晴", semester: "秋", day: "月", period: 4, campus: "中野", room: "312", code: "(MS)ELC211J" },
  { faculty: "総合数理学部", title: "現象と代数", teacher: "北山 貴裕", semester: "秋", day: "月", period: 5, campus: "中野", room: "413", code: "(MS)MAT211J" },

  { faculty: "総合数理学部", title: "English IIB (A)", teacher: "ゴッドフリー，チャド", semester: "秋", day: "火", period: 1, campus: "中野", room: "412", code: "(MS)LAN218E" },
  { faculty: "総合数理学部", title: "English IIB (C)", teacher: "中津川 みゆき", semester: "秋", day: "火", period: 1, campus: "中野", room: "405", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "ネットワークデザイン実験基礎 (5組)", teacher: "内古閑 伸之", semester: "秋", day: "火", period: 1, campus: "中野", room: "404", code: "(MS)ELC194J" },
  { faculty: "総合数理学部", title: "予測システム", teacher: "浦野 昌一", semester: "秋", day: "火", period: 1, campus: "中野", room: "413", code: "(MS)INF211J" },
  { faculty: "総合数理学部", title: "地理学B (1)", teacher: "鳴橋 竜太郎", semester: "秋", day: "火", period: 1, campus: "中野", room: "402", code: "(MS)GEO121J" },

  { faculty: "総合数理学部", title: "English IIB (D)", teacher: "古賀 友也", semester: "秋", day: "火", period: 2, campus: "中野", room: "508", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "English IIB (F)", teacher: "中津川 みゆき", semester: "秋", day: "火", period: 2, campus: "中野", room: "405", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "English IIB (H)", teacher: "ゴッドフリー，チャド", semester: "秋", day: "火", period: 2, campus: "中野", room: "412", code: "(MS)LAN218E" },
  { faculty: "総合数理学部", title: "English IIB (M)", teacher: "河野 円", semester: "秋", day: "火", period: 2, campus: "中野", room: "308", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "コンテンツ・エンタテインメント産業論", teacher: "佐藤 匡", semester: "秋", day: "火", period: 2, campus: "中野", room: "413", code: "(MS)INF341J" },
  { faculty: "総合数理学部", title: "スポーツ実習D", teacher: "長尾 進", semester: "秋", day: "火", period: 2, campus: "中野", room: "多目的室", code: "(MS)HES143J" },
  { faculty: "総合数理学部", title: "ネットワークデザイン実験基礎 (5組)", teacher: "内古閑 伸之", semester: "秋", day: "火", period: 2, campus: "中野", room: "403", code: "(MS)ELC194J" },
  { faculty: "総合数理学部", title: "メディアコンピューティング", teacher: "富永 浩文", semester: "秋", day: "火", period: 2, campus: "中野", room: "310", code: "(MS)INF321J" },
  { faculty: "総合数理学部", title: "全学共通総合講座（武器移転の連鎖）", teacher: "佐原 徹哉", semester: "秋", day: "火", period: 2, campus: "駿河台", room: "グローバルホール", code: "(MS)IND111J" },
  { faculty: "総合数理学部", title: "地理学B (2)", teacher: "鳴橋 竜太郎", semester: "秋", day: "火", period: 2, campus: "中野", room: "ホール", code: "(MS)GEO121J" },
  { faculty: "総合数理学部", title: "経営学B", teacher: "近藤 光", semester: "秋", day: "火", period: 2, campus: "中野", room: "402", code: "(MS)MAN111J" },
  { faculty: "総合数理学部", title: "線形代数 II (MS)", teacher: "三浦 千明", semester: "秋", day: "火", period: 2, campus: "中野", room: "304", code: "(MS)MAT111J" },
  { faculty: "総合数理学部", title: "電気・電子回路基礎", teacher: "鹿喰 善明", semester: "秋", day: "火", period: 2, campus: "中野", room: "411", code: "(MS)ELC211J" },

  { faculty: "総合数理学部", title: "English IIIB (MS)(1)", teacher: "深澤 英美", semester: "秋", day: "火", period: 3, campus: "中野", room: "412", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIB (MS)(2)", teacher: "古賀 友也", semester: "秋", day: "火", period: 3, campus: "中野", room: "508", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English Test Preparation II", teacher: "河野 円", semester: "秋", day: "火", period: 3, campus: "中野", room: "308", code: "(MS)LAN219M" },
  { faculty: "総合数理学部", title: "ネットワークデザイン実験基礎 (6組)", teacher: "笠 史郎", semester: "秋", day: "火", period: 3, campus: "中野", room: "404", code: "(MS)ELC194J" },
  { faculty: "総合数理学部", title: "信号解析基礎", teacher: "森勢 将雅", semester: "秋", day: "火", period: 3, campus: "中野", room: "413", code: "(MS)ELC251J" },
  { faculty: "総合数理学部", title: "微分方程式と線形システム", teacher: "森岡 一幸", semester: "秋", day: "火", period: 3, campus: "中野", room: "310", code: "(MS)ELC271J" },
  { faculty: "総合数理学部", title: "応用幾何", teacher: "西本 恵太", semester: "秋", day: "火", period: 3, campus: "中野", room: "301", code: "(MS)MAT321J" },
  { faculty: "総合数理学部", title: "複素関数", teacher: "桂田 祐史", semester: "秋", day: "火", period: 3, campus: "中野", room: "515", code: "(MS)MAT231J" },

  { faculty: "総合数理学部", title: "English IIIB (MS)(3)", teacher: "エルウッド，ジェーム", semester: "秋", day: "火", period: 4, campus: "中野", room: "411", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIB (MS)(4)", teacher: "古賀 友也", semester: "秋", day: "火", period: 4, campus: "中野", room: "508", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIB (MS)(5)", teacher: "深澤 英美", semester: "秋", day: "火", period: 4, campus: "中野", room: "412", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "コンピュータアーキテクチャ", teacher: "吉田 明正", semester: "秋", day: "火", period: 4, campus: "中野", room: "413", code: "(MS)INF221J" },
  { faculty: "総合数理学部", title: "ネットワークデザイン実験基礎 (6組)", teacher: "笠 史郎", semester: "秋", day: "火", period: 4, campus: "中野", room: "403", code: "(MS)ELC194J" },
  { faculty: "総合数理学部", title: "微積分 II (MS)", teacher: "中村 健一", semester: "秋", day: "火", period: 4, campus: "中野", room: "311", code: "(MS)MAT131J" },
  { faculty: "総合数理学部", title: "心理学B", teacher: "大谷 智子", semester: "秋", day: "火", period: 4, campus: "中野", room: "516", code: "(MS)PSY141J" },
  { faculty: "総合数理学部", title: "無線通信", teacher: "大野 光平", semester: "秋", day: "火", period: 4, campus: "中野", room: "308", code: "(MS)ELC351J" },
  { faculty: "総合数理学部", title: "社会と数学", teacher: "久保田 肇", semester: "秋", day: "火", period: 4, campus: "中野", room: "310", code: "(MS)MAT191J" },
  { faculty: "総合数理学部", title: "芸術史B", teacher: "鈴木 英倫子", semester: "秋", day: "火", period: 4, campus: "中野", room: "ホール", code: "(MS)ART111J" },

  { faculty: "総合数理学部", title: "コンテンツ・エンタテインメント概論（CE概論）", teacher: "宮下 芳明", semester: "秋", day: "火", period: 5, campus: "中野", room: "311", code: "(MS)INF131J" },
  { faculty: "総合数理学部", title: "データ解析プログラミング", teacher: "中山 実", semester: "秋", day: "火", period: 5, campus: "中野", room: "203", code: "(MS)INF228J" },
  { faculty: "総合数理学部", title: "化学入門", teacher: "森 義仁", semester: "秋", day: "火", period: 5, campus: "中野", room: "ホール", code: "(MS)BCH111J" },
  { faculty: "総合数理学部", title: "哲学B", teacher: "美濃部 仁", semester: "秋", day: "火", period: 5, campus: "中野", room: "304", code: "(MS)PHL111J" },
  { faculty: "総合数理学部", title: "日本語表現", teacher: "宮嵜 由美", semester: "秋", day: "火", period: 5, campus: "中野", room: "409", code: "(MS)LIN131J" },
  { faculty: "総合数理学部", title: "確率過程", teacher: "高橋 明彦", semester: "秋", day: "火", period: 5, campus: "中野", room: "309", code: "(MS)STA371J" },

  { faculty: "総合数理学部", title: "English IB (g)", teacher: "土肥 妙子", semester: "秋", day: "水", period: 1, campus: "中野", room: "414", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IB (h)", teacher: "米田 佐紀子", semester: "秋", day: "水", period: 1, campus: "中野", room: "301", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English IB (m)", teacher: "及川 一美", semester: "秋", day: "水", period: 1, campus: "中野", room: "412", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English IB (n)", teacher: "河野 円", semester: "秋", day: "水", period: 1, campus: "中野", room: "309", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English ID (a)", teacher: "ツビトコビッチ，ロバ", semester: "秋", day: "水", period: 1, campus: "中野", room: "406", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English ID (c)", teacher: "エルウッド，ジェーム", semester: "秋", day: "水", period: 1, campus: "中野", room: "408", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English ID (p)", teacher: "パタソン，ロバート", semester: "秋", day: "水", period: 1, campus: "中野", room: "411", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "データサイエンス", teacher: "前野 義晴", semester: "秋", day: "水", period: 1, campus: "中野", room: "203", code: "(MS)STA261J" },
  { faculty: "総合数理学部", title: "ネットワークセキュリティ", teacher: "嶋田 丈裕", semester: "秋", day: "水", period: 1, campus: "中野", room: "310", code: "(MS)INF321J" },
  { faculty: "総合数理学部", title: "現象数理A", teacher: "ギンダー，エリオット", semester: "秋", day: "水", period: 1, campus: "中野", room: "304", code: "(MS)MSM391J" },

  { faculty: "総合数理学部", title: "English IB (f)", teacher: "米田 佐紀子", semester: "秋", day: "水", period: 2, campus: "中野", room: "301", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English IB (i)", teacher: "及川 一美", semester: "秋", day: "水", period: 2, campus: "中野", room: "412", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English IB (k)", teacher: "土肥 妙子", semester: "秋", day: "水", period: 2, campus: "中野", room: "414", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English IB (p)", teacher: "深澤 英美", semester: "秋", day: "水", period: 2, campus: "中野", room: "309", code: "(MS)LAN118M" },
  { faculty: "総合数理学部", title: "English ID (b)", teacher: "パタソン，ロバート", semester: "秋", day: "水", period: 2, campus: "中野", room: "411", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English ID (d)", teacher: "ツビトコビッチ，ロバ", semester: "秋", day: "水", period: 2, campus: "中野", room: "406", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "English ID (n)", teacher: "エルウッド，ジェーム", semester: "秋", day: "水", period: 2, campus: "中野", room: "408", code: "(MS)LAN118E" },
  { faculty: "総合数理学部", title: "e-コマース", teacher: "櫻井 義尚", semester: "秋", day: "水", period: 2, campus: "中野", room: "310", code: "(MS)INF341J" },
  { faculty: "総合数理学部", title: "コンピュータグラフィックス基礎", teacher: "三武 裕玄", semester: "秋", day: "水", period: 2, campus: "中野", room: "413", code: "(MS)INF228J" },
  { faculty: "総合数理学部", title: "ネットワークと情報セキュリティ", teacher: "菊池 浩明", semester: "秋", day: "水", period: 2, campus: "中野", room: "516", code: "(MS)INF321J" },
  { faculty: "総合数理学部", title: "政治学B", teacher: "松井 陽征", semester: "秋", day: "水", period: 2, campus: "中野", room: "ホール", code: "(MS)POL131J" },
  { faculty: "総合数理学部", title: "最適化システム", teacher: "福山 良和", semester: "秋", day: "水", period: 2, campus: "中野", room: "311", code: "(MS)INF211J" },
  { faculty: "総合数理学部", title: "複素関数演習", teacher: "桂田 祐史", semester: "秋", day: "水", period: 2, campus: "中野", room: "515", code: "(MS)MAT231J" },

  { faculty: "総合数理学部", title: "English IIIB (FMS)(1)", teacher: "柴崎 礼士郎", semester: "秋", day: "水", period: 3, campus: "中野", room: "412", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIB (FMS)(2)", teacher: "ツビトコビッチ，ロバ", semester: "秋", day: "水", period: 3, campus: "中野", room: "406", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIB (FMS)(3)", teacher: "深澤 英美", semester: "秋", day: "水", period: 3, campus: "中野", room: "414", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "システム開発プログラミング", teacher: "吉田 明正", semester: "秋", day: "水", period: 3, campus: "中野", room: "206", code: "(MS)INF228J" },
  { faculty: "総合数理学部", title: "現象数理B", teacher: "西森 拓", semester: "秋", day: "水", period: 3, campus: "中野", room: "312", code: "(MS)MSM391J" },
  { faculty: "総合数理学部", title: "生物科学", teacher: "佐々木 貴規", semester: "秋", day: "水", period: 3, campus: "中野", room: "304", code: "(MS)BIO311J" },
  { faculty: "総合数理学部", title: "確率・統計", teacher: "松山 直樹", semester: "秋", day: "水", period: 3, campus: "中野", room: "311", code: "(MS)STA111J" },
  { faculty: "総合数理学部", title: "線形代数 II (ND)", teacher: "鈴木 龍正", semester: "秋", day: "水", period: 3, campus: "中野", room: "516", code: "(MS)MAT111J" },
  { faculty: "総合数理学部", title: "言語学", teacher: "赤木 美香", semester: "秋", day: "水", period: 3, campus: "中野", room: "502", code: "(MS)LIN111E" },

  { faculty: "総合数理学部", title: "English IIIB (FMS)(4)", teacher: "ツビトコビッチ，ロバ", semester: "秋", day: "水", period: 4, campus: "中野", room: "406", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIB (FMS)(5)", teacher: "柴崎 礼士郎", semester: "秋", day: "水", period: 4, campus: "中野", room: "412", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIB (FMS)(6)", teacher: "エルウッド，ジェーム", semester: "秋", day: "水", period: 4, campus: "中野", room: "408", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "スポーツ実習B", teacher: "劉 立凡", semester: "秋", day: "水", period: 4, campus: "中野", room: "多目的室", code: "(MS)HES143J" },
  { faculty: "総合数理学部", title: "数理と可視化", teacher: "中野 直人", semester: "秋", day: "水", period: 4, campus: "中野", room: "515", code: "(MS)MAT221J" },
  { faculty: "総合数理学部", title: "考古学B", teacher: "久米 正吾", semester: "秋", day: "水", period: 5, campus: "中野", room: "413", code: "(MS)PAC131J" },

  { faculty: "総合数理学部", title: "線形代数 II (FMS)", teacher: "鈴木 正明", semester: "秋", day: "木", period: 1, campus: "中野", room: "311", code: "(MS)MAT111J" },
  { faculty: "総合数理学部", title: "ロボット・エージェント", teacher: "小松 孝徳", semester: "秋", day: "木", period: 2, campus: "中野", room: "403", code: "(MS)INF331E" },
  { faculty: "総合数理学部", title: "創造数理A", teacher: "嘉藤 桂樹", semester: "秋", day: "木", period: 2, campus: "中野", room: "301", code: "(MS)MAT391J" },
  { faculty: "総合数理学部", title: "技術・情報倫理 (MS)", teacher: "佐々木 康成", semester: "秋", day: "木", period: 2, campus: "中野", room: "516", code: "(MS)INF241J" },
  { faculty: "総合数理学部", title: "計算幾何学", teacher: "鈴木 正明", semester: "秋", day: "木", period: 2, campus: "中野", room: "515", code: "(MS)MAT221E" },
  { faculty: "総合数理学部", title: "計量ファイナンス", teacher: "乾 孝治", semester: "秋", day: "木", period: 2, campus: "中野", room: "304", code: "(MS)STA378J" },
  { faculty: "総合数理学部", title: "物理学 II", teacher: "笹川 清明", semester: "秋", day: "木", period: 3, campus: "中野", room: "311", code: "(MS)BPH128J" },
  { faculty: "総合数理学部", title: "知的財産", teacher: "佐藤 雄哉", semester: "秋", day: "木", period: 3, campus: "中野", room: "ホール", code: "(MS)LAW278J" },
  { faculty: "総合数理学部", title: "経済学A", teacher: "竹内 健蔵", semester: "秋", day: "木", period: 3, campus: "中野", room: "304", code: "(MS)ECN111J" },
  { faculty: "総合数理学部", title: "微積分演習 (1組)", teacher: "久保田 肇", semester: "秋", day: "木", period: 4, campus: "中野", room: "304", code: "(MS)MAT132J" },
  { faculty: "総合数理学部", title: "微積分演習 (2組)", teacher: "鈴木 龍正", semester: "秋", day: "木", period: 4, campus: "中野", room: "307", code: "(MS)MAT132J" },
  { faculty: "総合数理学部", title: "微積分演習 (ND)", teacher: "辻 俊輔", semester: "秋", day: "木", period: 4, campus: "中野", room: "413", code: "(MS)MAT132J" },
  { faculty: "総合数理学部", title: "技術・情報倫理 (FMS)", teacher: "佐々木 康成", semester: "秋", day: "木", period: 4, campus: "中野", room: "516", code: "(MS)INF241J" },
  { faculty: "総合数理学部", title: "歴史学B", teacher: "宜野座 菜央見", semester: "秋", day: "木", period: 4, campus: "中野", room: "301", code: "(MS)HIS111J" },
  { faculty: "総合数理学部", title: "科学哲学B", teacher: "森永 豊", semester: "秋", day: "木", period: 4, campus: "中野", room: "310", code: "(MS)PHL191J" },
  { faculty: "総合数理学部", title: "ベクトル空間", teacher: "久保田 肇", semester: "秋", day: "木", period: 5, campus: "中野", room: "402", code: "(MS)MAT211J" },
  { faculty: "総合数理学部", title: "先端メディアサイエンス特別講義", teacher: "阿原 一志", semester: "秋", day: "木", period: 5, campus: "中野", room: "311", code: "(MS)INF141J" },
  { faculty: "総合数理学部", title: "技術・情報倫理 (ND)", teacher: "佐々木 康成", semester: "秋", day: "木", period: 5, campus: "中野", room: "516", code: "(MS)INF241J" },
  { faculty: "総合数理学部", title: "社会学B", teacher: "関口 卓也", semester: "秋", day: "木", period: 5, campus: "中野", room: "515", code: "(MS)SOC111J" },
  { faculty: "総合数理学部", title: "社会調査法", teacher: "水嶌 友昭", semester: "秋", day: "木", period: 5, campus: "中野", room: "312", code: "(MS)STA111J" },

  { faculty: "総合数理学部", title: "English IIB (B)", teacher: "柴崎 礼士郎", semester: "秋", day: "金", period: 1, campus: "中野", room: "405", code: "(MS)LAN218E" },
  { faculty: "総合数理学部", title: "English IIB (I)", teacher: "米田 佐紀子", semester: "秋", day: "金", period: 1, campus: "中野", room: "308", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "English IIB (L)", teacher: "石田 プリシラA.", semester: "秋", day: "金", period: 1, campus: "中野", room: "408", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "再生可能エネルギー", teacher: "田村 滋", semester: "秋", day: "金", period: 1, campus: "中野", room: "312", code: "(MS)ENV331J" },
  { faculty: "総合数理学部", title: "English IIB (E)", teacher: "エルウッド，ジェーム", semester: "秋", day: "金", period: 2, campus: "中野", room: "509", code: "(MS)LAN218E" },
  { faculty: "総合数理学部", title: "English IIB (G)", teacher: "古賀 友也", semester: "秋", day: "金", period: 2, campus: "中野", room: "405", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "English IIB (J)", teacher: "石田 プリシラA.", semester: "秋", day: "金", period: 2, campus: "中野", room: "408", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "English IIB (K)", teacher: "米田 佐紀子", semester: "秋", day: "金", period: 2, campus: "中野", room: "308", code: "(MS)LAN218M" },
  { faculty: "総合数理学部", title: "スポーツ・健康科学", teacher: "阿部 巧", semester: "秋", day: "金", period: 2, campus: "中野", room: "515", code: "(MS)HES121J" },
  { faculty: "総合数理学部", title: "スポーツ実習C", teacher: "今野 亮", semester: "秋", day: "金", period: 2, campus: "中野", room: "多目的室", code: "(MS)HES143J" },
  { faculty: "総合数理学部", title: "不確定性の数理", teacher: "中田 洋平", semester: "秋", day: "金", period: 2, campus: "中野", room: "312", code: "(MS)STA331J" },
  { faculty: "総合数理学部", title: "微積分 II (FMS)", teacher: "阿原 一志", semester: "秋", day: "金", period: 2, campus: "中野", room: "413", code: "(MS)MAT131J" },
  { faculty: "総合数理学部", title: "情報と職業", teacher: "赤澤 紀子", semester: "秋", day: "金", period: 2, campus: "中野", room: "311", code: "(MS)INF141J" },
  { faculty: "総合数理学部", title: "関数解析", teacher: "柳田 英二", semester: "秋", day: "金", period: 2, campus: "中野", room: "310", code: "(MS)MAT351J" },

  { faculty: "総合数理学部", title: "English IIIB (ND)(1)", teacher: "河野 円", semester: "秋", day: "金", period: 3, campus: "中野", room: "412", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIB (ND)(2)", teacher: "古賀 友也", semester: "秋", day: "金", period: 3, campus: "中野", room: "405", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "スポーツ実習C", teacher: "今野 亮", semester: "秋", day: "金", period: 3, campus: "中野", room: "多目的室", code: "(MS)HES143J" },
  { faculty: "総合数理学部", title: "信号処理演習", teacher: "荒川 薫", semester: "秋", day: "金", period: 3, campus: "中野", room: "206", code: "(MS)ELC252J" },
  { faculty: "総合数理学部", title: "数理生物学", teacher: "若野 友一郎", semester: "秋", day: "金", period: 3, campus: "中野", room: "413", code: "(MS)MSM331J" },
  { faculty: "総合数理学部", title: "環境とエネルギー", teacher: "山根 憲一郎", semester: "秋", day: "金", period: 3, campus: "中野", room: "304", code: "(MS)ELC121J" },
  { faculty: "総合数理学部", title: "生体システムデザイン", teacher: "佐々木 貴規", semester: "秋", day: "金", period: 3, campus: "中野", room: "203", code: "(MS)CBI261J" },
  { faculty: "総合数理学部", title: "総合数理テーマ講座", teacher: "福地 健太郎", semester: "秋", day: "金", period: 3, campus: "中野", room: "307", code: "(MS)IND118J" },
  { faculty: "総合数理学部", title: "論理とディジタル回路 (MS・FMS)", teacher: "荻野 正", semester: "秋", day: "金", period: 3, campus: "中野", room: "516", code: "(MS)INF211J" },

  { faculty: "総合数理学部", title: "English IIIB (ND)(3)", teacher: "石田 プリシラA.", semester: "秋", day: "金", period: 4, campus: "中野", room: "408", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIB (ND)(4)", teacher: "古賀 友也", semester: "秋", day: "金", period: 4, campus: "中野", room: "405", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "English IIIB (ND)(5)", teacher: "河野 円", semester: "秋", day: "金", period: 4, campus: "中野", room: "412", code: "(MS)LAN318E" },
  { faculty: "総合数理学部", title: "微積分 II (ND)", teacher: "森 龍之介", semester: "秋", day: "金", period: 4, campus: "中野", room: "304", code: "(MS)MAT131J" },
  { faculty: "総合数理学部", title: "数学の方法", teacher: "桂田 祐史", semester: "秋", day: "金", period: 4, campus: "中野", room: "516", code: "(MS)MAT151J" },
  { faculty: "総合数理学部", title: "物理数学", teacher: "三村 与士文", semester: "秋", day: "金", period: 4, campus: "中野", room: "312", code: "(MS)BPH361J" },
  { faculty: "総合数理学部", title: "論理とディジタル回路 (ND)", teacher: "加川 敏規", semester: "秋", day: "金", period: 4, campus: "中野", room: "402", code: "(MS)INF211J" },
  { faculty: "総合数理学部", title: "電磁気とベクトル解析", teacher: "岡本 潤", semester: "秋", day: "金", period: 5, campus: "中野", room: "413", code: "(MS)MAT238J" },
  { faculty: "総合数理学部", title: "音響・音楽表現", teacher: "松村 誠一郎", semester: "秋", day: "金", period: 5, campus: "中野", room: "312", code: "(MS)INF338J" },

  // 総合数理学部 秋前・秋後
  { faculty: "総合数理学部", title: "知覚心理学", teacher: "渡邊 恵太", semester: "秋前", day: "月", period: 4, campus: "中野", room: "304", code: "(MS)INF231J" },
  { faculty: "総合数理学部", title: "知覚心理学", teacher: "渡邊 恵太", semester: "秋前", day: "月", period: 5, campus: "中野", room: "304", code: "(MS)INF231J" },
  { faculty: "総合数理学部", title: "情報ネットワーク基礎 (5組)", teacher: "富永 浩文", semester: "秋前", day: "木", period: 1, campus: "中野", room: "203", code: "(MS)INF128J" },
  { faculty: "総合数理学部", title: "情報ネットワーク基礎 (6組)", teacher: "櫻井 義尚", semester: "秋前", day: "木", period: 1, campus: "中野", room: "206", code: "(MS)INF128J" },
  { faculty: "総合数理学部", title: "情報ネットワーク基礎 (5組)", teacher: "富永 浩文", semester: "秋前", day: "木", period: 2, campus: "中野", room: "203", code: "(MS)INF128J" },
  { faculty: "総合数理学部", title: "情報ネットワーク基礎 (6組)", teacher: "櫻井 義尚", semester: "秋前", day: "木", period: 2, campus: "中野", room: "206", code: "(MS)INF128J" },
  { faculty: "総合数理学部", title: "プログラミング演習 II (5組)", teacher: "森岡 一幸", semester: "秋前", day: "金", period: 1, campus: "中野", room: "203", code: "(MS)INF122J" },
  { faculty: "総合数理学部", title: "プログラミング演習 II (6組)", teacher: "中山 実", semester: "秋前", day: "金", period: 1, campus: "中野", room: "206", code: "(MS)INF122J" },
  { faculty: "総合数理学部", title: "プログラミング演習 II (5組)", teacher: "森岡 一幸", semester: "秋前", day: "金", period: 2, campus: "中野", room: "203", code: "(MS)INF122J" },
  { faculty: "総合数理学部", title: "プログラミング演習 II (6組)", teacher: "中山 実", semester: "秋前", day: "金", period: 2, campus: "中野", room: "206", code: "(MS)INF122J" },
  { faculty: "総合数理学部", title: "実験データ解析演習", teacher: "中村 和幸", semester: "秋前", day: "土", period: 1, campus: "中野", room: "311", code: "(MS)INF212J" },
  { faculty: "総合数理学部", title: "実験データ解析演習", teacher: "中村 和幸", semester: "秋前", day: "土", period: 2, campus: "中野", room: "311", code: "(MS)INF212J" },
  { faculty: "総合数理学部", title: "センサネットワーク基礎", teacher: "森岡 一幸", semester: "秋後", day: "金", period: 1, campus: "中野", room: "402", code: "(MS)ELC118J" },
  { faculty: "総合数理学部", title: "センサネットワーク基礎", teacher: "森岡 一幸", semester: "秋後", day: "金", period: 2, campus: "中野", room: "402", code: "(MS)ELC118J" },


  // 国際日本学部 春
  { faculty: "国際日本学部", title: "武道思想史", teacher: "酒井 利信", semester: "春", day: "月", period: 3, campus: "中野", room: "409", code: "(GJ)PHL251J" },
  { faculty: "国際日本学部", title: "海外日本研究事情", teacher: "蝶野 立彦", semester: "春", day: "月", period: 3, campus: "中野", room: "402", code: "(GJ)ARS261J" },
  { faculty: "国際日本学部", title: "東アジア地域研究Ａ", teacher: "近藤 大介", semester: "春", day: "月", period: 5, campus: "中野", room: "ホール", code: "(GJ)ARS211J" },
  { faculty: "国際日本学部", title: "現代都市とデザインＡ", teacher: "森川 嘉一郎", semester: "春", day: "月", period: 5, campus: "中野", room: "402", code: "(GJ)POP211J" },

  { faculty: "国際日本学部", title: "ホスピタリティ・マネジメント論Ａ（Ｅ）", teacher: "クエク，マーリ Ｊ．", semester: "春", day: "火", period: 1, campus: "中野", room: "307", code: "(GJ)TRS221E" },
  { faculty: "国際日本学部", title: "国際日本学部特別講座Ａ", teacher: "馬場 小百合", semester: "春", day: "火", period: 1, campus: "中野", room: "309", code: "(GJ)IND211J" },
  { faculty: "国際日本学部", title: "多文化共生論", teacher: "山脇 啓造", semester: "春", day: "火", period: 1, campus: "中野", room: "515", code: "(GJ)POL121J" },
  { faculty: "国際日本学部", title: "映画史概論Ａ", teacher: "瀬川 裕司", semester: "春", day: "火", period: 1, campus: "中野", room: "516", code: "(GJ)ART211J" },
  { faculty: "国際日本学部", title: "特撮の歴史と技術Ａ", teacher: "三好 寛", semester: "春", day: "火", period: 1, campus: "中野", room: "311", code: "(GJ)POP216J" },
  { faculty: "国際日本学部", title: "組織マネジメントと文化Ａ（Ｅ）", teacher: "小笠原 泰", semester: "春", day: "火", period: 1, campus: "中野", room: "301", code: "(GJ)MAN211E" },
  { faculty: "国際日本学部", title: "アジア太平洋政治経済論Ａ", teacher: "金 ゼンマ", semester: "春", day: "火", period: 2, campus: "中野", room: "309", code: "(GJ)POL231J" },
  { faculty: "国際日本学部", title: "心理と言語Ａ", teacher: "廣森 友人", semester: "春", day: "火", period: 2, campus: "中野", room: "516", code: "(GJ)LIN211J" },
  { faculty: "国際日本学部", title: "日本の哲学Ａ", teacher: "美濃部 仁", semester: "春", day: "火", period: 2, campus: "中野", room: "交流ギャラリー", code: "(GJ)PHL211J" },
  { faculty: "国際日本学部", title: "日本の文化伝統Ａ", teacher: "馬場 小百合", semester: "春", day: "火", period: 2, campus: "中野", room: "515", code: "(GJ)HIS311J" },
  { faculty: "国際日本学部", title: "日本漫画史Ａ", teacher: "宮本 大人", semester: "春", day: "火", period: 2, campus: "中野", room: "307", code: "(GJ)POP211J" },
  { faculty: "国際日本学部", title: "日本語学Ａ", teacher: "田中 牧郎", semester: "春", day: "火", period: 2, campus: "中野", room: "508", code: "(GJ)LIN231J" },
  { faculty: "国際日本学部", title: "東南アジア地域研究Ａ", teacher: "持田 洋平", semester: "春", day: "火", period: 2, campus: "中野", room: "312", code: "(GJ)ARS211J" },
  { faculty: "国際日本学部", title: "アジア太平洋政治経済論Ａ（Ｅ）", teacher: "金 ゼンマ", semester: "春", day: "火", period: 3, campus: "中野", room: "408", code: "(GJ)POL231E" },
  { faculty: "国際日本学部", title: "経済団体研究Ａ", teacher: "井上 洋", semester: "春", day: "火", period: 3, campus: "中野", room: "311", code: "(GJ)ECN381J" },
  { faculty: "国際日本学部", title: "ホスピタリティ・マネジメント論Ａ", teacher: "金 振晩", semester: "春", day: "火", period: 5, campus: "中野", room: "310", code: "(GJ)TRS221J" },
  { faculty: "国際日本学部", title: "人類学Ａ", teacher: "原田 義也", semester: "春", day: "火", period: 5, campus: "中野", room: "515", code: "(GJ)ANT211J" },
  { faculty: "国際日本学部", title: "武道文化論Ａ", teacher: "長尾 進", semester: "春", day: "火", period: 5, campus: "中野", room: "414", code: "(GJ)CUL251J" },
  { faculty: "国際日本学部", title: "異文化間教育学Ａ（Ｅ）", teacher: "平井 達也", semester: "春", day: "火", period: 5, campus: "中野", room: "交流ギャラリー", code: "(GJ)EDU931E" },

  { faculty: "国際日本学部", title: "ツーリズム・マネジメントＡ", teacher: "佐藤 郁", semester: "春", day: "水", period: 1, campus: "中野", room: "413", code: "(GJ)TRS211J" },
  { faculty: "国際日本学部", title: "東アジア文化交流史Ａ（Ｅ）", teacher: "張 佳能", semester: "春", day: "水", period: 1, campus: "中野", room: "交流ギャラリー", code: "(GJ)HIS321E" },
  { faculty: "国際日本学部", title: "ダイバーシティと社会Ａ（Ｅ）", teacher: "近藤 佐知彦", semester: "春", day: "水", period: 2, campus: "中野", room: "508", code: "(GJ)EDU231E" },
  { faculty: "国際日本学部", title: "国際マーケティング論Ａ（Ｅ）", teacher: "川端 庸子", semester: "春", day: "水", period: 2, campus: "中野", room: "411", code: "(GJ)CMM311E" },
  { faculty: "国際日本学部", title: "応用言語学Ａ（Ｅ） 〔M〕", teacher: "青山 拓実", semester: "春", day: "水", period: 2, campus: "中野", room: "302", code: "(GJ)LIN326E" },
  { faculty: "国際日本学部", title: "映像文化論Ａ", teacher: "瀬川 裕司", semester: "春", day: "水", period: 2, campus: "中野", room: "312", code: "(GJ)ART311J" },
  { faculty: "国際日本学部", title: "海外留学入門Ａ", teacher: "ピニロス マツダ", semester: "春", day: "水", period: 2, campus: "中野", room: "403", code: "(GJ)ABR211J" },
  { faculty: "国際日本学部", title: "現代アメリカ論Ｃ（Ｅ）", teacher: "スピグニーシ，フラ", semester: "春", day: "水", period: 2, campus: "中野", room: "505", code: "(GJ)HIS341E" },
  { faculty: "国際日本学部", title: "異文化間教育学Ａ", teacher: "平井 達也", semester: "春", day: "水", period: 2, campus: "中野", room: "交流ギャラリー", code: "(GJ)EDU931J" },
  { faculty: "国際日本学部", title: "知的財産と企業戦略Ａ（Ｅ）", teacher: "小笠原 泰", semester: "春", day: "水", period: 2, campus: "中野", room: "402", code: "(GJ)MAN361M" },
  { faculty: "国際日本学部", title: "東アジア文化交流史Ａ", teacher: "張 佳能", semester: "春", day: "水", period: 3, campus: "中野", room: "ホール", code: "(GJ)HIS321J" },
  { faculty: "国際日本学部", title: "比較文化学Ｃ（Ｅ）", teacher: "ロズネル，クリスティ", semester: "春", day: "水", period: 3, campus: "中野", room: "302", code: "(GJ)CUL221E" },
  { faculty: "国際日本学部", title: "組織マネジメントと文化Ａ", teacher: "小笠原 泰", semester: "春", day: "水", period: 3, campus: "中野", room: "402", code: "(GJ)MAN211J" },
  { faculty: "国際日本学部", title: "都市交通システム論Ａ", teacher: "水谷 淳", semester: "春", day: "水", period: 3, campus: "中野", room: "交流ギャラリー", code: "(GJ)CMM361J" },
  { faculty: "国際日本学部", title: "ダイバーシティと社会Ａ", teacher: "近藤 佐知彦", semester: "春", day: "水", period: 4, campus: "中野", room: "307", code: "(GJ)EDU231J" },
  { faculty: "国際日本学部", title: "ヨーロッパ都市風俗論Ｃ（Ｅ）", teacher: "ロズネル，クリスティ", semester: "春", day: "水", period: 4, campus: "中野", room: "302", code: "(GJ)ARS321E" },
  { faculty: "国際日本学部", title: "日本のジャーナリズムＡ", teacher: "酒井 信", semester: "春", day: "水", period: 4, campus: "中野", room: "311", code: "(GJ)SOC361J" },
  { faculty: "国際日本学部", title: "映像文化論Ｃ（Ｅ）", teacher: "デイビス，ブレット", semester: "春", day: "水", period: 4, campus: "中野", room: "208", code: "(GJ)ART311E" },
  { faculty: "国際日本学部", title: "漫画文化論Ａ（Ｅ）", teacher: "リベラ ルスカ，レナ", semester: "春", day: "水", period: 4, campus: "中野", room: "304", code: "(GJ)POP211E" },
  { faculty: "国際日本学部", title: "アニメーション文化論Ａ（Ｅ）", teacher: "リベラ ルスカ，レナ", semester: "春", day: "水", period: 5, campus: "中野", room: "304", code: "(GJ)POP211E" },
  { faculty: "国際日本学部", title: "国際日本学部特別講座Ａ", teacher: "金 牡蘭", semester: "春", day: "水", period: 5, campus: "中野", room: "314", code: "(GJ)IND211J" },
  { faculty: "国際日本学部", title: "日本語の歴史Ａ", teacher: "田中 牧郎", semester: "春", day: "水", period: 5, campus: "中野", room: "510", code: "(GJ)LIN231J" },

  { faculty: "国際日本学部", title: "アジア史Ａ", teacher: "石黒 ひさ子", semester: "春", day: "木", period: 1, campus: "中野", room: "312", code: "(GJ)HIS221J" },
  { faculty: "国際日本学部", title: "ツーリズム・マネジメントＡ（Ｅ）", teacher: "佐藤 郁", semester: "春", day: "木", period: 1, campus: "中野", room: "510", code: "(GJ)TRS211E" },
  { faculty: "国際日本学部", title: "統計学Ａ", teacher: "奥野 拓也", semester: "春", day: "木", period: 1, campus: "中野", room: "515", code: "(GJ)STA211J" },
  { faculty: "国際日本学部", title: "イスラーム史Ａ", teacher: "奥 美穂子", semester: "春", day: "木", period: 2, campus: "中野", room: "309", code: "(GJ)HIS381J" },
  { faculty: "国際日本学部", title: "インド経済論Ａ", teacher: "山田 剛", semester: "春", day: "木", period: 2, campus: "中野", room: "交流ギャラリー", code: "(GJ)ARS311J" },
  { faculty: "国際日本学部", title: "クリエータービジネス論", teacher: "原田 悦志", semester: "春", day: "木", period: 2, campus: "中野", room: "402", code: "(GJ)SOC291J" },
  { faculty: "国際日本学部", title: "ジェンダーと表象Ａ（Ｅ）", teacher: "ロズネル，クリスティ", semester: "春", day: "木", period: 2, campus: "中野", room: "405", code: "(GJ)GDR211E" },
  { faculty: "国際日本学部", title: "日本人の行動モデルＡ", teacher: "東海 詩帆", semester: "春", day: "木", period: 2, campus: "中野", room: "ホール", code: "(GJ)SOC391J" },
  { faculty: "国際日本学部", title: "比較文化学Ａ", teacher: "張 佳能", semester: "春", day: "木", period: 2, campus: "中野", room: "311", code: "(GJ)CUL221J" },
  { faculty: "国際日本学部", title: "ヨーロッパ都市風俗論Ａ", teacher: "石井 沙和", semester: "春", day: "木", period: 3, campus: "中野", room: "ホール", code: "(GJ)ARS321J" },
  { faculty: "国際日本学部", title: "世界のなかのアフリカＡ（Ｅ）", teacher: "溝辺 泰雄", semester: "春", day: "木", period: 3, campus: "中野", room: "515", code: "(GJ)ARS241M" },
  { faculty: "国際日本学部", title: "共生と学びのデザイン論", teacher: "岸 磨貴子", semester: "春", day: "木", period: 3, campus: "中野", room: "多目的室", code: "(GJ)COM131J" },
  { faculty: "国際日本学部", title: "国際日本学部特別講座Ａ", teacher: "ヤロシュ島田 むつみ", semester: "春", day: "木", period: 3, campus: "中野", room: "413", code: "(GJ)IND211J" },
  { faculty: "国際日本学部", title: "ジェンダーと表象Ａ", teacher: "藤本 由香里", semester: "春", day: "木", period: 4, campus: "中野", room: "ホール", code: "(GJ)GDR211J" },
  { faculty: "国際日本学部", title: "メディア・アートＡ", teacher: "荒木 悠", semester: "春", day: "木", period: 4, campus: "中野", room: "413", code: "(GJ)POP211J" },
  { faculty: "国際日本学部", title: "モードの神話学Ａ", teacher: "細田 和江", semester: "春", day: "木", period: 4, campus: "中野", room: "515", code: "(GJ)ART211J" },
  { faculty: "国際日本学部", title: "国際日本学部特別講座Ａ（Ｅ）", teacher: "溝辺 泰雄", semester: "春", day: "木", period: 4, campus: "中野", room: "309", code: "(GJ)IND211E" },
  { faculty: "国際日本学部", title: "統計学Ａ", teacher: "水嶌 友昭", semester: "春", day: "木", period: 4, campus: "中野", room: "310", code: "(GJ)STA211J" },
  { faculty: "国際日本学部", title: "日本伝統工芸研究", teacher: "外山 徹", semester: "春", day: "木", period: 5, campus: "中野", room: "301", code: "(GJ)ART311J" },
  { faculty: "国際日本学部", title: "西洋史Ａ", teacher: "山崎 信一", semester: "春", day: "木", period: 5, campus: "中野", room: "307", code: "(GJ)HIS231J" },

  { faculty: "国際日本学部", title: "テクノロジーと日本社会Ａ", teacher: "大塚 時雄", semester: "春", day: "金", period: 1, campus: "中野", room: "301", code: "(GJ)STS231J" },
  { faculty: "国際日本学部", title: "日本的流通システム論Ａ", teacher: "戸田 裕美子", semester: "春", day: "金", period: 1, campus: "中野", room: "413", code: "(GJ)ECN381J" },
  { faculty: "国際日本学部", title: "テクノロジーと日本社会Ａ（Ｅ）", teacher: "大塚 時雄", semester: "春", day: "金", period: 2, campus: "中野", room: "301", code: "(GJ)STS231E" },
  { faculty: "国際日本学部", title: "伝統芸能論", teacher: "原 瑠璃彦", semester: "春", day: "金", period: 2, campus: "中野", room: "402", code: "(GJ)ART311J" },
  { faculty: "国際日本学部", title: "国際経済史Ａ", teacher: "竹内 真人", semester: "春", day: "金", period: 2, campus: "中野", room: "304", code: "(GJ)ECN241J" },
  { faculty: "国際日本学部", title: "外国語としての日本語教育法Ａ", teacher: "足立 章子", semester: "春", day: "金", period: 2, campus: "中野", room: "516", code: "(GJ)LIN251J" },
  { faculty: "国際日本学部", title: "東アジア芸術論Ａ", teacher: "加藤 徹", semester: "春", day: "金", period: 2, campus: "中野", room: "ホール", code: "(GJ)ART211J" },
  { faculty: "国際日本学部", title: "メディア・アートＡ（Ｅ）", teacher: "荒木 悠", semester: "春", day: "金", period: 3, campus: "中野", room: "311", code: "(GJ)POP211E" },
  { faculty: "国際日本学部", title: "日本先端文化論Ａ", teacher: "森川 嘉一郎", semester: "春", day: "金", period: 3, campus: "中野", room: "413", code: "(GJ)POP211J" },
  { faculty: "国際日本学部", title: "日本技術移転史Ａ", teacher: "山下 雄司", semester: "春", day: "金", period: 3, campus: "中野", room: "310", code: "(GJ)STS351J" },
  { faculty: "国際日本学部", title: "東南アジア地域研究Ａ（Ｅ）", teacher: "渡邉 暁子", semester: "春", day: "金", period: 3, campus: "中野", room: "411", code: "(GJ)ARS211E" },
  { faculty: "国際日本学部", title: "英語学Ａ（Ｅ）", teacher: "ガーサイド，ポール", semester: "春", day: "金", period: 3, campus: "中野", room: "302", code: "(GJ)LIN341E" },
  { faculty: "国際日本学部", title: "コンテンツ産業論Ａ", teacher: "豊島 昇", semester: "春", day: "金", period: 4, campus: "中野", room: "304", code: "(GJ)INF391J" },
  { faculty: "国際日本学部", title: "日本語と社会Ａ（Ｅ）", teacher: "朝日 祥之", semester: "春", day: "金", period: 4, campus: "中野", room: "312", code: "(GJ)LIN231E" },
  { faculty: "国際日本学部", title: "東南アジア地域研究Ｂ（Ｅ）", teacher: "渡邉 暁子", semester: "春", day: "金", period: 4, campus: "中野", room: "411", code: "(GJ)ARS211E" },
  { faculty: "国際日本学部", title: "舞台芸術論Ａ", teacher: "松尾 ひかり", semester: "春", day: "金", period: 4, campus: "中野", room: "ホール", code: "(GJ)ART331J" },
  { faculty: "国際日本学部", title: "近現代日本文学Ｃ（Ｅ）", teacher: "ベント 勇亮ヘンリー", semester: "春", day: "金", period: 4, campus: "中野", room: "404", code: "(GJ)LIT211E" },
  { faculty: "国際日本学部", title: "テクスト分析Ａ", teacher: "矢口 貢大", semester: "春", day: "金", period: 5, campus: "中野", room: "204", code: "(GJ)LIT151J" },

  // 国際日本学部 春前・春後
  { faculty: "国際日本学部", title: "メディアリテラシーＡ 〔M〕", teacher: "岸 磨貴子", semester: "春前", day: "月", period: 1, campus: "他", room: "", code: "(GJ)INF216J" },
  { faculty: "国際日本学部", title: "メディアリテラシーＡ 〔M〕", teacher: "岸 磨貴子", semester: "春前", day: "月", period: 2, campus: "他", room: "", code: "(GJ)INF216J" },
  { faculty: "国際日本学部", title: "日本とドイツＡ", teacher: "萩原 健", semester: "春前", day: "火", period: 4, campus: "中野", room: "307", code: "(GJ)CUL221J" },
  { faculty: "国際日本学部", title: "日本とドイツＡ", teacher: "萩原 健", semester: "春前", day: "火", period: 5, campus: "中野", room: "307", code: "(GJ)CUL221J" },
  { faculty: "国際日本学部", title: "フランス文化論Ａ", teacher: "鵜戸 聡", semester: "春前", day: "水", period: 2, campus: "中野", room: "515", code: "(GJ)ARS221J" },
  { faculty: "国際日本学部", title: "広告とメディアＡ", teacher: "小野 雅琴", semester: "春前", day: "水", period: 2, campus: "中野", room: "307", code: "(GJ)CMM231J" },
  { faculty: "国際日本学部", title: "東アジア地域研究Ｃ（Ｅ）", teacher: "鵜戸 聡", semester: "春前", day: "木", period: 2, campus: "中野", room: "208", code: "(GJ)ARS211E" },
  { faculty: "国際日本学部", title: "日本とドイツＢ", teacher: "萩原 健", semester: "春後", day: "火", period: 4, campus: "中野", room: "307", code: "(GJ)CUL221J" },
  { faculty: "国際日本学部", title: "日本とドイツＢ", teacher: "萩原 健", semester: "春後", day: "火", period: 5, campus: "中野", room: "307", code: "(GJ)CUL221J" },
  { faculty: "国際日本学部", title: "フランス文化論Ｂ", teacher: "鵜戸 聡", semester: "春後", day: "水", period: 2, campus: "中野", room: "515", code: "(GJ)ARS221J" },
    // 国際日本学部 秋
  { faculty: "国際日本学部", title: "ラテンアメリカの歴史と文化Ｂ", teacher: "ピニロス マツダ", semester: "秋", day: "月", period: 1, campus: "中野", room: "312", code: "(GJ)ARS231J" },
  { faculty: "国際日本学部", title: "ラテンアメリカの歴史と文化Ｂ（Ｅ） type1", teacher: "ピニロス マツダ", semester: "秋", day: "月", period: 2, campus: "中野", room: "312", code: "(GJ)ARS231E" },
  { faculty: "国際日本学部", title: "ファッション文化史Ｂ（Ｅ）", teacher: "高馬 京子", semester: "秋", day: "月", period: 3, campus: "中野", room: "413", code: "(GJ)ART211E" },
  { faculty: "国際日本学部", title: "刀剣文化論", teacher: "酒井 利信", semester: "秋", day: "月", period: 3, campus: "中野", room: "409", code: "(GJ)PHL351J" },
  { faculty: "国際日本学部", title: "東アジア地域研究Ｂ", teacher: "近藤 大介", semester: "秋", day: "月", period: 5, campus: "中野", room: "ホール", code: "(GJ)ARS211J" },
  { faculty: "国際日本学部", title: "現代都市とデザインＢ", teacher: "森川 嘉一郎", semester: "秋", day: "月", period: 5, campus: "中野", room: "402", code: "(GJ)POP211J" },

  { faculty: "国際日本学部", title: "ホスピタリティ・マネジメント論Ｂ（Ｅ）", teacher: "クエク，マーリ Ｊ．", semester: "秋", day: "火", period: 1, campus: "中野", room: "307", code: "(GJ)TRS221E" },
  { faculty: "国際日本学部", title: "国際日本学部特別講座Ｂ", teacher: "馬場 小百合", semester: "秋", day: "火", period: 1, campus: "中野", room: "309", code: "(GJ)IND211J" },
  { faculty: "国際日本学部", title: "映画史概論Ｂ", teacher: "瀬川 裕司", semester: "秋", day: "火", period: 1, campus: "中野", room: "516", code: "(GJ)ART211J" },
  { faculty: "国際日本学部", title: "特撮の歴史と技術Ｂ", teacher: "三好 寛", semester: "秋", day: "火", period: 1, campus: "中野", room: "311", code: "(GJ)POP216J" },
  { faculty: "国際日本学部", title: "移民政策論（Ｅ）", teacher: "山脇 啓造", semester: "秋", day: "火", period: 1, campus: "中野", room: "515", code: "(GJ)POL341M" },
  { faculty: "国際日本学部", title: "組織マネジメントと文化Ｂ（Ｅ）", teacher: "小笠原 泰", semester: "秋", day: "火", period: 1, campus: "中野", room: "301", code: "(GJ)MAN211E" },

  { faculty: "国際日本学部", title: "アジア太平洋政治経済論Ｂ", teacher: "金 ゼンマ", semester: "秋", day: "火", period: 2, campus: "中野", room: "309", code: "(GJ)POL231J" },
  { faculty: "国際日本学部", title: "宗教と哲学Ｄ（Ｅ）", teacher: "早川 英明", semester: "秋", day: "火", period: 2, campus: "中野", room: "505", code: "(GJ)PHL211E" },
  { faculty: "国際日本学部", title: "心理と言語Ｂ", teacher: "廣森 友人", semester: "秋", day: "火", period: 2, campus: "中野", room: "516", code: "(GJ)LIN211J" },
  { faculty: "国際日本学部", title: "日本の哲学Ｂ", teacher: "美濃部 仁", semester: "秋", day: "火", period: 2, campus: "中野", room: "交流ギャラリー", code: "(GJ)PHL211J" },
  { faculty: "国際日本学部", title: "日本の文化伝統Ｂ", teacher: "馬場 小百合", semester: "秋", day: "火", period: 2, campus: "中野", room: "515", code: "(GJ)HIS311J" },
  { faculty: "国際日本学部", title: "日本漫画史Ｂ", teacher: "宮本 大人", semester: "秋", day: "火", period: 2, campus: "中野", room: "307", code: "(GJ)POP211J" },
  { faculty: "国際日本学部", title: "日本語学Ｂ", teacher: "田中 牧郎", semester: "秋", day: "火", period: 2, campus: "中野", room: "301", code: "(GJ)LIN231J" },
  { faculty: "国際日本学部", title: "東南アジア地域研究Ｂ", teacher: "持田 洋平", semester: "秋", day: "火", period: 2, campus: "中野", room: "312", code: "(GJ)ARS211J" },

  { faculty: "国際日本学部", title: "アジア太平洋政治経済論Ｂ（Ｅ）", teacher: "金 ゼンマ", semester: "秋", day: "火", period: 3, campus: "中野", room: "408", code: "(GJ)POL231E" },
  { faculty: "国際日本学部", title: "人類学Ｂ（Ｅ）", teacher: "鈴木 亜矢子", semester: "秋", day: "火", period: 3, campus: "中野", room: "307", code: "(GJ)ANT211E" },
  { faculty: "国際日本学部", title: "経済団体研究Ｂ", teacher: "井上 洋", semester: "秋", day: "火", period: 3, campus: "中野", room: "311", code: "(GJ)ECN381J" },

  { faculty: "国際日本学部", title: "ホスピタリティ・マネジメント論Ｂ", teacher: "金 振晩", semester: "秋", day: "火", period: 5, campus: "中野", room: "310", code: "(GJ)TRS221J" },
  { faculty: "国際日本学部", title: "人類学Ｂ", teacher: "原田 義也", semester: "秋", day: "火", period: 5, campus: "中野", room: "515", code: "(GJ)ANT211J" },
  { faculty: "国際日本学部", title: "武道文化論Ｂ", teacher: "長尾 進", semester: "秋", day: "火", period: 5, campus: "中野", room: "312", code: "(GJ)CUL251J" },
  { faculty: "国際日本学部", title: "異文化間教育学Ｂ", teacher: "平井 達也", semester: "秋", day: "火", period: 5, campus: "中野", room: "交流ギャラリー", code: "(GJ)EDU931J" },

  { faculty: "国際日本学部", title: "ツーリズム・マネジメントＢ", teacher: "佐藤 郁", semester: "秋", day: "水", period: 1, campus: "中野", room: "413", code: "(GJ)TRS211J" },
  { faculty: "国際日本学部", title: "東アジア文化交流史Ｂ（Ｅ）", teacher: "張 佳能", semester: "秋", day: "水", period: 1, campus: "中野", room: "交流ギャラリー", code: "(GJ)HIS321E" },

  { faculty: "国際日本学部", title: "ダイバーシティと社会Ｂ（Ｅ）", teacher: "近藤 佐知彦", semester: "秋", day: "水", period: 2, campus: "中野", room: "508", code: "(GJ)EDU231E" },
  { faculty: "国際日本学部", title: "国際マーケティング論Ｂ（Ｅ）", teacher: "川端 庸子", semester: "秋", day: "水", period: 2, campus: "中野", room: "204", code: "(GJ)CMM311E" },
  { faculty: "国際日本学部", title: "応用言語学Ｂ（Ｅ） 〔M〕", teacher: "青山 拓実", semester: "秋", day: "水", period: 2, campus: "中野", room: "302", code: "(GJ)LIN326E" },
  { faculty: "国際日本学部", title: "映像文化論Ｂ", teacher: "瀬川 裕司", semester: "秋", day: "水", period: 2, campus: "中野", room: "312", code: "(GJ)ART311J" },
  { faculty: "国際日本学部", title: "海外留学入門Ｂ", teacher: "ピニロス マツダ", semester: "秋", day: "水", period: 2, campus: "中野", room: "403", code: "(GJ)ABR211J" },
  { faculty: "国際日本学部", title: "現代アメリカ論Ｄ（Ｅ）", teacher: "スピグニーシ，フラ", semester: "秋", day: "水", period: 2, campus: "中野", room: "505", code: "(GJ)HIS341E" },
  { faculty: "国際日本学部", title: "異文化間教育学Ｂ（Ｅ）", teacher: "平井 達也", semester: "秋", day: "水", period: 2, campus: "中野", room: "交流ギャラリー", code: "(GJ)EDU931E" },
  { faculty: "国際日本学部", title: "知的財産と企業戦略Ｂ（Ｅ）", teacher: "小笠原 泰", semester: "秋", day: "水", period: 2, campus: "中野", room: "402", code: "(GJ)MAN361M" },
  { faculty: "国際日本学部", title: "社会保障論Ａ", teacher: "田中 秀明", semester: "秋", day: "水", period: 2, campus: "中野", room: "304", code: "(GJ)SOC341J" },

  { faculty: "国際日本学部", title: "東アジア文化交流史Ｂ", teacher: "張 佳能", semester: "秋", day: "水", period: 3, campus: "中野", room: "509", code: "(GJ)HIS321J" },
  { faculty: "国際日本学部", title: "比較文化学Ｄ（Ｅ）", teacher: "ロズネル，クリスティ", semester: "秋", day: "水", period: 3, campus: "中野", room: "302", code: "(GJ)CUL221E" },
  { faculty: "国際日本学部", title: "組織マネジメントと文化Ｂ", teacher: "小笠原 泰", semester: "秋", day: "水", period: 3, campus: "中野", room: "402", code: "(GJ)MAN211J" },
  { faculty: "国際日本学部", title: "都市交通システム論Ｂ", teacher: "水谷 淳", semester: "秋", day: "水", period: 3, campus: "中野", room: "交流ギャラリー", code: "(GJ)CMM361J" },

  { faculty: "国際日本学部", title: "ダイバーシティと社会Ｂ", teacher: "近藤 佐知彦", semester: "秋", day: "水", period: 4, campus: "中野", room: "307", code: "(GJ)EDU231J" },
  { faculty: "国際日本学部", title: "ヨーロッパ都市風俗論Ｄ（Ｅ）", teacher: "ロズネル，クリスティ", semester: "秋", day: "水", period: 4, campus: "中野", room: "302", code: "(GJ)ARS321E" },
  { faculty: "国際日本学部", title: "日本のジャーナリズムＢ", teacher: "酒井 信", semester: "秋", day: "水", period: 4, campus: "中野", room: "ホール", code: "(GJ)SOC361J" },
  { faculty: "国際日本学部", title: "映像文化論Ｄ（Ｅ）", teacher: "デイビス，ブレット", semester: "秋", day: "水", period: 4, campus: "中野", room: "交流ギャラリー", code: "(GJ)ART311E" },
  { faculty: "国際日本学部", title: "漫画文化論Ｂ（Ｅ）", teacher: "リベラ ルスカ，レナ", semester: "秋", day: "水", period: 4, campus: "中野", room: "304", code: "(GJ)POP211E" },

  { faculty: "国際日本学部", title: "アニメーション文化論Ｂ（Ｅ）", teacher: "リベラ ルスカ，レナ", semester: "秋", day: "水", period: 5, campus: "中野", room: "304", code: "(GJ)POP211E" },
  { faculty: "国際日本学部", title: "国際日本学部特別講座Ｂ", teacher: "金 牡蘭", semester: "秋", day: "水", period: 5, campus: "中野", room: "310", code: "(GJ)IND211J" },
  { faculty: "国際日本学部", title: "日本語の歴史Ｂ", teacher: "田中 牧郎", semester: "秋", day: "水", period: 5, campus: "中野", room: "510", code: "(GJ)LIN231J" },

  { faculty: "国際日本学部", title: "アジア史Ｂ", teacher: "石黒 ひさ子", semester: "秋", day: "木", period: 1, campus: "中野", room: "312", code: "(GJ)HIS221J" },
  { faculty: "国際日本学部", title: "ツーリズム・マネジメントＢ（Ｅ）", teacher: "佐藤 郁", semester: "秋", day: "木", period: 1, campus: "中野", room: "510", code: "(GJ)TRS211E" },

  { faculty: "国際日本学部", title: "イスラーム史Ｂ", teacher: "奥 美穂子", semester: "秋", day: "木", period: 2, campus: "中野", room: "309", code: "(GJ)HIS381J" },
  { faculty: "国際日本学部", title: "インド経済論Ｂ", teacher: "山田 剛", semester: "秋", day: "木", period: 2, campus: "中野", room: "402", code: "(GJ)ARS311J" },
  { faculty: "国際日本学部", title: "ジェンダーと表象Ｂ（Ｅ）", teacher: "ロズネル，クリスティ", semester: "秋", day: "木", period: 2, campus: "中野", room: "交流ギャラリー", code: "(GJ)GDR211E" },
  { faculty: "国際日本学部", title: "日本人の行動モデルＢ", teacher: "東海 詩帆", semester: "秋", day: "木", period: 2, campus: "中野", room: "ホール", code: "(GJ)SOC391J" },
  { faculty: "国際日本学部", title: "比較文化学Ｂ", teacher: "張 佳能", semester: "秋", day: "木", period: 2, campus: "中野", room: "311", code: "(GJ)CUL221J" },

  { faculty: "国際日本学部", title: "ヨーロッパ都市風俗論Ｂ", teacher: "細田 和江", semester: "秋", day: "木", period: 3, campus: "中野", room: "516", code: "(GJ)ARS321J" },
  { faculty: "国際日本学部", title: "世界のなかのアフリカＢ（Ｅ）", teacher: "溝辺 泰雄", semester: "秋", day: "木", period: 3, campus: "中野", room: "515", code: "(GJ)ARS241M" },
  { faculty: "国際日本学部", title: "国際日本学部特別講座Ｂ", teacher: "ヤロシュ島田 むつみ", semester: "秋", day: "木", period: 3, campus: "中野", room: "413", code: "(GJ)IND211J" },

  { faculty: "国際日本学部", title: "ジェンダーと表象Ｂ", teacher: "藤本 由香里", semester: "秋", day: "木", period: 4, campus: "中野", room: "311", code: "(GJ)GDR211J" },
  { faculty: "国際日本学部", title: "メディア・アートＢ", teacher: "荒木 悠", semester: "秋", day: "木", period: 4, campus: "中野", room: "309", code: "(GJ)POP211J" },
  { faculty: "国際日本学部", title: "モードの神話学Ｂ", teacher: "細田 和江", semester: "秋", day: "木", period: 4, campus: "中野", room: "515", code: "(GJ)ART211J" },
  { faculty: "国際日本学部", title: "国際日本学部特別講座Ｂ（Ｅ）", teacher: "溝辺 泰雄", semester: "秋", day: "木", period: 4, campus: "中野", room: "312", code: "(GJ)IND211E" },
  { faculty: "国際日本学部", title: "社会連携科目Ｄ", teacher: "萩原 健", semester: "秋", day: "木", period: 4, campus: "中野", room: "ホール", code: "(GJ)IND211J" },

  { faculty: "国際日本学部", title: "統計学Ｂ", teacher: "水嶌 友昭", semester: "秋", day: "木", period: 5, campus: "中野", room: "312", code: "(GJ)STA211J" },
  { faculty: "国際日本学部", title: "西洋史Ｂ", teacher: "山崎 信一", semester: "秋", day: "木", period: 5, campus: "中野", room: "307", code: "(GJ)HIS231J" },

  { faculty: "国際日本学部", title: "テクノロジーと日本社会Ｂ", teacher: "大塚 時雄", semester: "秋", day: "金", period: 1, campus: "中野", room: "301", code: "(GJ)STS231J" },
  { faculty: "国際日本学部", title: "日本的流通システム論Ｂ", teacher: "戸田 裕美子", semester: "秋", day: "金", period: 1, campus: "中野", room: "413", code: "(GJ)ECN381J" },

  { faculty: "国際日本学部", title: "テクノロジーと日本社会Ｂ（Ｅ）", teacher: "大塚 時雄", semester: "秋", day: "金", period: 2, campus: "中野", room: "301", code: "(GJ)STS231E" },
  { faculty: "国際日本学部", title: "国際経済史Ｂ", teacher: "竹内 真人", semester: "秋", day: "金", period: 2, campus: "中野", room: "ホール", code: "(GJ)ECN241J" },
  { faculty: "国際日本学部", title: "外国語としての日本語教育法Ｂ", teacher: "足立 章子", semester: "秋", day: "金", period: 2, campus: "中野", room: "516", code: "(GJ)LIN251J" },
  { faculty: "国際日本学部", title: "東アジア芸術論Ｂ", teacher: "加藤 徹", semester: "秋", day: "金", period: 2, campus: "中野", room: "304", code: "(GJ)ART211J" },

  { faculty: "国際日本学部", title: "メディア・アートＢ（Ｅ）", teacher: "荒木 悠", semester: "秋", day: "金", period: 3, campus: "中野", room: "311", code: "(GJ)POP211E" },
  { faculty: "国際日本学部", title: "日本先端文化論Ｂ", teacher: "森川 嘉一郎", semester: "秋", day: "金", period: 3, campus: "中野", room: "312", code: "(GJ)POP211J" },
  { faculty: "国際日本学部", title: "日本技術移転史Ｂ", teacher: "山下 雄司", semester: "秋", day: "金", period: 3, campus: "中野", room: "310", code: "(GJ)STS351J" },
  { faculty: "国際日本学部", title: "英語学Ｂ（Ｅ）", teacher: "ガーサイド，ポール", semester: "秋", day: "金", period: 3, campus: "中野", room: "302", code: "(GJ)LIN341E" },

  { faculty: "国際日本学部", title: "コンテンツ産業論Ｂ", teacher: "玉川 博章", semester: "秋", day: "金", period: 4, campus: "中野", room: "304", code: "(GJ)INF391J" },
  { faculty: "国際日本学部", title: "日本語と社会Ｂ（Ｅ）", teacher: "朝日 祥之", semester: "秋", day: "金", period: 4, campus: "中野", room: "312", code: "(GJ)LIN231E" },
  { faculty: "国際日本学部", title: "現代アメリカ論Ｂ", teacher: "山田 秀頌", semester: "秋", day: "金", period: 4, campus: "中野", room: "310", code: "(GJ)HIS341J" },
  { faculty: "国際日本学部", title: "舞台芸術論Ｂ", teacher: "松尾 ひかり", semester: "秋", day: "金", period: 4, campus: "中野", room: "ホール", code: "(GJ)ART331J" },
  { faculty: "国際日本学部", title: "近現代日本文学Ｄ（Ｅ）", teacher: "ベント 勇亮ヘンリー", semester: "秋", day: "金", period: 4, campus: "中野", room: "404", code: "(GJ)LIT211E" },

  { faculty: "国際日本学部", title: "テクスト分析Ｂ", teacher: "矢口 貢大", semester: "秋", day: "金", period: 5, campus: "中野", room: "204", code: "(GJ)LIT151J" },

  // 国際日本学部 秋前・秋後
  { faculty: "国際日本学部", title: "インターネットと社会 〔M〕", teacher: "岸 磨貴子", semester: "秋前", day: "月", period: 1, campus: "他", room: "", code: "(GJ)INF236J" },
  { faculty: "国際日本学部", title: "インターネットと社会 〔M〕", teacher: "岸 磨貴子", semester: "秋前", day: "月", period: 2, campus: "他", room: "", code: "(GJ)INF236J" },
  { faculty: "国際日本学部", title: "舞台芸術論Ｃ（Ｅ） type1", teacher: "萩原 健", semester: "秋前", day: "火", period: 4, campus: "中野", room: "301", code: "(GJ)ART331E" },
  { faculty: "国際日本学部", title: "舞台芸術論Ｃ（Ｅ） type1", teacher: "萩原 健", semester: "秋前", day: "火", period: 5, campus: "中野", room: "301", code: "(GJ)ART331E" },
  { faculty: "国際日本学部", title: "舞台芸術論Ｄ（Ｅ） type1", teacher: "萩原 健", semester: "秋後", day: "火", period: 4, campus: "中野", room: "301", code: "(GJ)ART331E" },
  { faculty: "国際日本学部", title: "舞台芸術論Ｄ（Ｅ） type1", teacher: "萩原 健", semester: "秋後", day: "火", period: 5, campus: "中野", room: "301", code: "(GJ)ART331E" },
  { faculty: "国際日本学部", title: "広告とメディアＢ", teacher: "小野 雅琴", semester: "秋後", day: "水", period: 2, campus: "中野", room: "307", code: "(GJ)CMM231J" },
];
function setupTimeSelects() {
  const hourIds = ["start-hour", "end-hour"];
  const minuteIds = ["start-minute", "end-minute"];

  hourIds.forEach(id => {
    const select = document.getElementById(id);
    select.innerHTML = "";

    for (let h = 0; h <= 23; h++) {
      const option = document.createElement("option");
      option.value = String(h).padStart(2, "0");
      option.textContent = String(h).padStart(2, "0");
      select.appendChild(option);
    }
  });

  minuteIds.forEach(id => {
    const select = document.getElementById(id);
    select.innerHTML = "";

    for (let m = 0; m < 60; m += 5) {
      const option = document.createElement("option");
      option.value = String(m).padStart(2, "0");
      option.textContent = String(m).padStart(2, "0");
      select.appendChild(option);
    }
  });
}

function showTimetableCandidates() {
  const faculty  = document.getElementById("faculty").value;
  const semester = document.getElementById("semester").value;
  const weekday  = document.getElementById("weekday-filter").value;
  const keyword  = (document.getElementById("timetable-search")?.value || "").trim().toLowerCase();
  const area     = document.getElementById("timetable-candidates");

  area.innerHTML = "";

  if (keyword.length === 0 && !faculty && !semester && !weekday) {
    area.innerHTML = `<p class="timetable-hint">授業名または担当教員名を入力してください</p>`;
    return;
  }

  const candidates = timetableData.filter(item => {
    // キーワードは授業名・教員名のみで絞り込む
    if (keyword) {
      const searchText = [item.title, item.teacher].join(" ").toLowerCase();
      if (!searchText.includes(keyword)) return false;
    }
    if (faculty  && item.faculty !== faculty) return false;
    if (weekday  && item.day    !== weekday)  return false;
    if (semester) {
      const ok = item.semester === semester || item.semester === "通年" ||
        (semester === "春" && (item.semester === "春前" || item.semester === "春後")) ||
        (semester === "秋" && (item.semester === "秋前" || item.semester === "秋後"));
      if (!ok) return false;
    }
    return true;
  });

  if (candidates.length === 0) {
    area.innerHTML = `<p class="timetable-hint">該当する授業が見つかりませんでした</p>`;
    return;
  }

  if (candidates.length > 200) {
    area.innerHTML = `<p class="timetable-hint">候補が多すぎます（${candidates.length}件）。もう少し詳しく入力してください</p>`;
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "tt-suggest-list";

  candidates.forEach(classItem => {
    const realIndex = timetableData.indexOf(classItem);
    const li = document.createElement("li");
    li.className = "tt-suggest-item";
    li.dataset.value = realIndex;
    li.innerHTML = `
      <span class="tt-suggest-name">${classItem.title}</span>
      <span class="tt-suggest-tag">${classItem.day}曜${classItem.period}限</span>
    `;
    li.addEventListener("click", () => {
      li.classList.toggle("tt-selected");
      // 隠しチェックボックスを更新
      let cb = li.querySelector(".class-checkbox");
      if (!cb) {
        cb = document.createElement("input");
        cb.type = "checkbox";
        cb.className = "class-checkbox";
        cb.value = realIndex;
        cb.style.display = "none";
        li.appendChild(cb);
      }
      cb.checked = li.classList.contains("tt-selected");
    });
    ul.appendChild(li);
  });

  area.appendChild(ul);

  if (candidates.length >= 200) {
    const note = document.createElement("p");
    note.className = "timetable-hint";
    note.textContent = "上位200件を表示中。絞り込んで候補を減らしてください。";
    area.appendChild(note);
  }
}

function addSelectedTimetable() {
  const checkboxes = document.querySelectorAll(".class-checkbox:checked");
  const travelMinutes = Number(document.getElementById("class-travel-minutes")?.value || 0);

  if (checkboxes.length === 0) {
    alert("追加する授業を選択してください");
    return;
  }

  checkboxes.forEach(checkbox => {
    const classItem = timetableData[Number(checkbox.value)];
    addClassEvents(classItem, travelMinutes);
  });

  saveToLocalStorage();
  createCalendar();
  closeTimetableModal();

  alert("時間割を追加しました");
}

function addClassEvents(classItem, travelMinutes = 0) {
  const semester = classItem.semester;
  let startDate;
  let endDate;

  if (semester === "秋" || semester === "秋前" || semester === "秋後") {
    startDate = new Date(currentYear, 8, 20);
    endDate = new Date(currentYear + 1, 0, 25);
  } else {
    startDate = new Date(currentYear, 3, 1);
    endDate = new Date(currentYear, 6, 31);
  }

  if (semester === "春前") {
    endDate = new Date(currentYear, 4, 31);
  }

  if (semester === "春後") {
    startDate = new Date(currentYear, 5, 1);
    endDate = new Date(currentYear, 6, 31);
  }

  if (semester === "秋前") {
    endDate = new Date(currentYear, 10, 10);
  }

  if (semester === "秋後") {
    startDate = new Date(currentYear, 10, 11);
    endDate = new Date(currentYear + 1, 0, 25);
  }

  if (semester === "通年") {
    startDate = new Date(currentYear, 3, 1);
    endDate = new Date(currentYear + 1, 0, 25);
  }

  const dayOfWeek = dayToNumber(classItem.day);
  const intervalDays = classItem.repeat === "biweekly" ? 14 : 7;
  const time = periodTimes[classItem.period];
  const isSeminar = /ゼミ|ゼミナール/.test(classItem.title);
  const eventCategory = isSeminar ? "seminar" : "class";
  const shouldAddTravel = travelMinutes > 0 && !isSeminar;

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (currentDate.getDay() === dayOfWeek) {
      const dateString = formatDate(currentDate);

      const holidayName = holidays[dateString];
      const schoolInfo = meijiAcademicCalendar[dateString];

      const isHoliday = Boolean(holidayName);
      const isClosedDay =
  (schoolInfo && schoolInfo.type === "closed") ||
  isInClosedRange(dateString);
      const isSpecialSchoolDay = schoolInfo && schoolInfo.type === "school-day";

if ((!isHoliday || isSpecialSchoolDay) && !isClosedDay) {
  const classGroupId = `class-${classItem.code}-${classItem.day}-${classItem.period}`;

  const alreadyHasSameCampusClass = events.some(event => {
    return (
      event.date === dateString &&
      (event.category === "class" || event.category === "seminar") &&
      event.campus === classItem.campus
    );
  });

  if (shouldAddTravel && !alreadyHasSameCampusClass) {
    const travelStartTime = subtractMinutesFromTime(time.start, travelMinutes);

    events.push({
      date: dateString,
      title: "移動",
      startTime: travelStartTime,
      endTime: time.start,
      detail: `自宅 → 明治大学${classItem.campus}キャンパス`,
      repeat: "none",
      repeatWeeks: 0,
      category: "travel",
      allDay: false,
      groupId: classGroupId
    });
  }

  events.push({
    date: dateString,
    title: classItem.title,
    startTime: time.start,
    endTime: time.end,
    teacher: classItem.teacher,
    campus: classItem.campus,
    room: classItem.room,
    code: classItem.code,
    detail: `${classItem.teacher} / ${classItem.campus}${classItem.room ? " " + classItem.room : ""} / ${classItem.code}`,
    repeat: classItem.repeat || "weekly",
    repeatWeeks: 0,
    allDay: false,
    category: eventCategory,
    needsCommute: !isSeminar,
    groupId: classGroupId
  });
}

      currentDate.setDate(currentDate.getDate() + intervalDays);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
}

function createCalendar() {
  const calendar = document.getElementById("calendar");
  const currentMonthText = document.getElementById("current-month");

  calendar.innerHTML = "";
  currentMonthText.textContent = `${currentYear}年 ${currentMonth + 1}月`;

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.className = "day empty";
    calendar.appendChild(emptyDiv);
  }

  for (let day = 1; day <= lastDate; day++) {
    const dateString = makeDateString(currentYear, currentMonth, day);
    const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
    const holidayName = holidays[dateString];
    const schoolInfo = meijiAcademicCalendar[dateString];

    const dayDiv = document.createElement("div");
    dayDiv.className = "day";

    if (dayOfWeek === 0) dayDiv.classList.add("sunday-bg");
    if (dayOfWeek === 6) dayDiv.classList.add("saturday-bg");
    if (holidayName) dayDiv.classList.add("holiday-bg");
    if (schoolInfo && schoolInfo.type === "school-day") dayDiv.classList.add("school-day-bg");
    if (schoolInfo && schoolInfo.type === "closed") dayDiv.classList.add("closed-bg");

    let dayNumberClass = "";

    if (dayOfWeek === 0 || holidayName) {
      dayNumberClass = "sunday";
    } else if (dayOfWeek === 6) {
      dayNumberClass = "saturday";
    }

    const isToday = dateString === formatDate(today);
    if (isToday) dayDiv.classList.add("today-cell");
    dayDiv.innerHTML = `<strong class="${dayNumberClass}${isToday ? ' today-num' : ''}">${day}</strong>`;

    if (holidayName) {
      const holidayDiv = document.createElement("div");
      holidayDiv.className = "label holiday-label";
      holidayDiv.textContent = holidayName;
      dayDiv.appendChild(holidayDiv);
    }

    if (schoolInfo) {
      const schoolDiv = document.createElement("div");
      schoolDiv.className = "label school-label";
      schoolDiv.textContent = schoolInfo.label;
      dayDiv.appendChild(schoolDiv);
    }

    const dayTodos = todos.filter(todo => !todo.done && (
      todo.executionDate === dateString ||
      (!todo.executionDate && todo.deadline === dateString)
    ));

    const sharedForDay = (sharedEvents || []).filter(e => e.date === dateString);

    const dayEvents = [
      ...events.filter(event => {
        if (event.category === "birthday" && event.repeat === "yearly") {
          const [, eventMonth, eventDay] = event.date.split("-");
          const [, currentMonthText, currentDayText] = dateString.split("-");
          return eventMonth === currentMonthText && eventDay === currentDayText;
        }
        return event.date === dateString;
      }),
      ...sharedForDay.map(e => ({ ...e, _isShared: true })),
    ].sort((a, b) => sortEventsByTimeAndType(a, b));

    const MAX_CHIPS = 5;
    const totalChips = dayTodos.length + dayEvents.length;
    let chipCount = 0;

    dayTodos.forEach(todo => {
      if (chipCount >= MAX_CHIPS) return;
      const todoDiv = document.createElement("div");
      const isExecution = todo.executionDate === dateString;
      const isAssign = todo.category === "assignment";
      let cls = "event-title todo-deadline";
      if (isExecution) cls += " todo-execution";
      if (isAssign) cls += " todo-assign-cal";
      todoDiv.className = cls;
      const icon = isAssign ? "📝" : (isExecution ? "📅" : "📌");
      const label = (isAssign && todo.subject) ? todo.subject.substring(0, 5) : todo.text.substring(0, 6);
      todoDiv.textContent = `${icon} ${label}`;
      dayDiv.appendChild(todoDiv);
      chipCount++;
    });

    const dayDate = new Date(currentYear, currentMonth, day);
    const activeHabitsOnDay = habits.filter(h => !h.archived && isHabitActiveOn(h, dayDate));
    if (activeHabitsOnDay.length > 0 && dateString <= formatDate(today)) {
      const loggedIds = habitLogs[dateString] || [];
      const done  = activeHabitsOnDay.filter(h => loggedIds.includes(h.id)).length;
      const total = activeHabitsOnDay.length;
      const habitBadge = document.createElement("div");
      habitBadge.className = done === total ? "habit-progress habit-all-done" : "habit-progress";
      habitBadge.textContent = `🔄 ${done}/${total}`;
      dayDiv.appendChild(habitBadge);
    }

    dayEvents.forEach(event => {
      if (chipCount >= MAX_CHIPS) return;
      const eventDiv = document.createElement("div");
      eventDiv.className = "event";

      if (event.category === "class" || event.category === "seminar") {
        eventDiv.classList.add("class-event");
      }
      if (event.category === "seminar") {
        eventDiv.classList.add("seminar-event");
      }
      if (event.allDay) {
        eventDiv.classList.add("all-day-event");
      }
      if (event.category === "travel") {
        eventDiv.classList.add("travel-event");
      }

      if (event.category === "test") {
        eventDiv.classList.add("test-event");
      } else if (event._isShared) {
        eventDiv.classList.add("shared-event");
      } else if (event.color) {
        eventDiv.style.background = event.color;
      }

      if (event.category === "birthday") {
        eventDiv.textContent = event.title;
      } else if (event.category === "test") {
        eventDiv.textContent = "📝 " + event.title.substring(0, 5);
      } else {
        eventDiv.textContent = event.title.substring(0, 6);
      }

      dayDiv.appendChild(eventDiv);
      chipCount++;
    });

    if (totalChips > MAX_CHIPS) {
      const overflowDiv = document.createElement("div");
      overflowDiv.className = "cal-overflow";
      overflowDiv.textContent = `+${totalChips - MAX_CHIPS}件`;
      dayDiv.appendChild(overflowDiv);
    }

    dayDiv.onclick = function () {
      openModal(dateString);
    };

    calendar.appendChild(dayDiv);
  }

  renderMonthScroll();
}
function makeDateString(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function syncCurrentDateParts() {
  currentYear = currentDate.getFullYear();
  currentMonth = currentDate.getMonth();
}
function prevMonth() {
  currentDate = new Date(currentYear, currentMonth - 1, 1);
  syncCurrentDateParts();

  createCalendar();
  updateMonthLabel();
}

function nextMonth() {
  currentDate = new Date(currentYear, currentMonth + 1, 1);
  syncCurrentDateParts();

  createCalendar();
  updateMonthLabel();
}
let isMonthAnimating = false;

function changeMonthWithSlide(direction) {
  if (isMonthAnimating) return;

  const calendar = document.getElementById("calendar");
  if (!calendar) return;

  isMonthAnimating = true;

  if (direction === "next") {
    calendar.classList.add("slide-out-left");
  } else {
    calendar.classList.add("slide-out-right");
  }

  setTimeout(() => {
    if (direction === "next") {
      currentDate = new Date(currentYear, currentMonth + 1, 1);
    } else {
      currentDate = new Date(currentYear, currentMonth - 1, 1);
    }

    syncCurrentDateParts();
    createCalendar();
    updateMonthLabel();

    calendar.classList.remove("slide-out-left", "slide-out-right");

    if (direction === "next") {
      calendar.classList.add("slide-in-right");
    } else {
      calendar.classList.add("slide-in-left");
    }

    setTimeout(() => {
      calendar.classList.remove("slide-in-right", "slide-in-left");
      isMonthAnimating = false;
    }, 180);
  }, 180);
}

function selectMonth(monthIndex) {
  currentDate = new Date(pickerYear, monthIndex, 1);
  syncCurrentDateParts();

  createCalendar();
  updateMonthLabel();
  closeMonthPicker();
}
function openModal(dateString) {
  selectedDate = dateString;
  editingIndex = null;

  const holidayName = holidays[dateString];
  const schoolInfo = meijiAcademicCalendar[dateString];

  let titleText = `${selectedDate} の予定`;

  if (holidayName) titleText += `（${holidayName}）`;
  if (schoolInfo) titleText += ` ${schoolInfo.label}`;

  document.getElementById("modal-date").textContent = titleText;
  document.getElementById("modal").classList.remove("hidden");

  showViewArea();
  showEvents();
}

function closeModalByOutside(event) {
  if (event.target.id === "modal") {
    closeModal();
  }
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  showViewArea();
}

function showViewArea() {
  editingIndex = null;

  document.getElementById("view-area").classList.remove("hidden");
  document.getElementById("form-area").classList.add("hidden");

  clearForm();
  showEvents();
  showPopupTodos();
}

function showPopupTodos() {
  const list = document.getElementById("popup-todo-list");
  if (!list || !selectedDate) return;

  const todayStr = formatDate(new Date());
  const dateTodos = todos.filter(t =>
    t.executionDate === selectedDate || t.deadline === selectedDate
  );

  if (dateTodos.length === 0) {
    list.innerHTML = `<p class="popup-todo-empty">この日のToDoはありません</p>`;
    return;
  }

  list.innerHTML = dateTodos.map(t => {
    const idx = todos.indexOf(t);
    const isOverdue = !t.done && t.deadline && t.deadline < todayStr;
    const isExecution = t.executionDate === selectedDate;
    const isDeadline = t.deadline === selectedDate;
    let meta = "";
    if (isExecution && isDeadline) {
      meta = `<span class="popup-todo-meta">実行日・締切</span>`;
    } else if (isExecution) {
      meta = `<span class="popup-todo-meta">実行日（締切：${t.deadline ? t.deadline.slice(5).replace("-", "/") : "未設定"}）</span>`;
    } else {
      meta = `<span class="popup-todo-meta">締切</span>`;
    }
    const isAssign = t.category === "assignment";
    const assignBadge = isAssign ? `<span class="tv-assign-badge" style="font-size:10px">📚 課題</span>` : "";
    const subjectLine = (isAssign && t.subject) ? `<span class="popup-todo-meta">${escapeHtml(t.subject)}</span>` : "";
    return `<div class="popup-todo-item${t.done ? " popup-todo-done" : ""}${isOverdue ? " popup-todo-overdue" : ""}">
      <button class="popup-todo-check" onclick="popupToggleTodo(${idx})" aria-label="完了切替">
        ${t.done ? "✓" : ""}
      </button>
      <div class="popup-todo-info">
        ${assignBadge}
        <span class="popup-todo-text">${escapeHtml(t.text)}</span>
        ${subjectLine}${meta}
      </div>
    </div>`;
  }).join("");
}

function popupToggleTodo(idx) {
  if (!todos[idx]) return;
  todos[idx].done = !todos[idx].done;
  localStorage.setItem("todos", JSON.stringify(todos));
  syncToServer();
  updateTodoBadge();
  renderTodayPanel();
  createCalendar();
  showPopupTodos();
}

function showPopupTodoForm() {
  const form = document.getElementById("popup-todo-form");
  if (!form) return;
  form.classList.remove("hidden");
  const input = document.getElementById("popup-todo-input");
  if (input) { input.value = ""; input.focus(); }
}

function addPopupTodo() {
  const input = document.getElementById("popup-todo-input");
  if (!input) return;
  const text = input.value.trim();
  if (!text || !selectedDate) return;

  todos.push({ text, deadline: selectedDate, executionDate: selectedDate, done: false, createdAt: new Date().toISOString() });
  localStorage.setItem("todos", JSON.stringify(todos));
  syncToServer();
  updateTodoBadge();
  renderTodayPanel();
  createCalendar();

  document.getElementById("popup-todo-form").classList.add("hidden");
  showPopupTodos();
}

function showAddForm() {
  editingIndex = null;

  document.getElementById("form-title").textContent = "予定を追加";
  document.getElementById("view-area").classList.add("hidden");
  document.getElementById("form-area").classList.remove("hidden");

  clearForm();
}

function showEditForm(index) {
  editingIndex = index;

  const event = events[index];

  document.getElementById("form-title").textContent = "予定を編集";
  document.getElementById("view-area").classList.add("hidden");
  document.getElementById("form-area").classList.remove("hidden");

  document.getElementById("title").value = event.title || "";
  document.getElementById("all-day").checked = Boolean(event.allDay);
  toggleAllDayInputs();
  setSelectedTime("start", event.startTime || "09:00");
  setSelectedTime("end", event.endTime || "10:00");
  document.getElementById("detail").value = event.detail || "";
  document.getElementById("repeat").value = event.repeat || "none";
  document.getElementById("repeat-weeks").value = event.repeatWeeks || "0";
  document.getElementById("event-category").value = event.category || "normal";

  const notifyEnabled = document.getElementById("notify-enabled");
  const notifyMinutes = document.getElementById("notify-minutes");
  if (notifyEnabled) notifyEnabled.checked = Boolean(event.notify?.enabled);
  if (notifyMinutes) notifyMinutes.value = String(event.notify?.minutesBefore || 10);
  toggleNotifyInputs();

  const hasTravel = document.getElementById("has-travel");
  if (hasTravel) hasTravel.checked = Boolean(event.needsCommute || event.hasTravel);
  toggleTravelInputs();

  const colorInput = document.getElementById("event-color");
  if (colorInput) {
    colorInput.value = event.color || "#3b82f6";
    updateColorPickerSelection(event.color || "#3b82f6");
  }

  // 複数日イベントの場合は終了日を復元
  const multiDayCheckbox = document.getElementById("multi-day");
  const multiEndDateInput = document.getElementById("multi-end-date");
  if (multiDayCheckbox && event.groupId) {
    const groupEvents = events
      .filter(e => e.groupId === event.groupId)
      .sort((a, b) => a.date.localeCompare(b.date));
    if (groupEvents.length > 1) {
      multiDayCheckbox.checked = true;
      if (multiEndDateInput) multiEndDateInput.value = groupEvents[groupEvents.length - 1].date;
      toggleMultiDayInputs();
    }
  }
}

function saveEvent() {
  const title = document.getElementById("title").value.trim();
  const isAllDay = document.getElementById("all-day")?.checked || false;
  const startTime = isAllDay ? "" : getSelectedTime("start");
  const endTime = isAllDay ? "" : getSelectedTime("end");
  const detail = document.getElementById("detail").value;
  const repeat = document.getElementById("repeat").value;
  const repeatWeeks = Number(document.getElementById("repeat-weeks").value);
  const category = document.getElementById("event-category")?.value || "normal";
  const notifyEnabled = document.getElementById("notify-enabled")?.checked || false;
  const notifyMinutes = Number(document.getElementById("notify-minutes")?.value || 10);
  const multiDay = document.getElementById("multi-day")?.checked || false;
  const multiEndDate = document.getElementById("multi-end-date")?.value || "";

  if (!title) {
    alert("予定タイトルを入力してください");
    return;
  }

  if (!isAllDay && startTime >= endTime) {
    alert("終了時間は開始時間より後にしてください");
    return;
  }

  if (repeat !== "none" && repeatWeeks === 0 && !multiDay) {
    alert("繰り返し期間を選択してください");
    return;
  }

  if (multiDay && (!multiEndDate || multiEndDate < selectedDate)) {
    alert("複数日程の終了日を正しく選択してください");
    return;
  }

  const hasTravel = document.getElementById("has-travel")?.checked || false;
  const travelFrom = document.getElementById("travel-from")?.value.trim() || "";
  const travelTo = document.getElementById("travel-to")?.value.trim() || "";
  const travelMinutes = Number(document.getElementById("travel-minutes")?.value || 0);
  const color = document.getElementById("event-color")?.value || "#3b82f6";

  const eventData = {
    date: selectedDate,
    title: title,
    startTime: startTime,
    endTime: endTime,
    allDay: isAllDay,
    detail: detail,
    repeat: repeat,
    repeatWeeks: repeatWeeks,
    category: category,
    needsCommute: hasTravel,
    color: color,
    notify: {
      enabled: notifyEnabled,
      minutesBefore: notifyMinutes
    }
  };

  if (editingIndex === null) {
    if (multiDay) {
      addMultiDayEvents(eventData, multiEndDate);
    } else if (repeat === "none") {
      events.push(eventData);
    } else {
      addRepeatedEvents(eventData);
    }

    if (hasTravel && travelMinutes > 0 && !isAllDay) {
      addTravelEventForBaseEvent(eventData, travelMinutes, travelFrom, travelTo);
    }
  } else {
    const originalEvent = events[editingIndex];
    const groupId = originalEvent.groupId;
    if (groupId) {
      events = events.filter(e => e.groupId !== groupId);
    } else {
      events.splice(editingIndex, 1);
    }
    editingIndex = null;

    if (multiDay) {
      addMultiDayEvents(eventData, multiEndDate);
    } else if (repeat !== "none") {
      addRepeatedEvents(eventData);
    } else {
      events.push(eventData);
    }
    if (hasTravel && travelMinutes > 0 && !isAllDay) {
      addTravelEventForBaseEvent(eventData, travelMinutes, travelFrom, travelTo);
    }
  }

  saveToLocalStorage();
  createCalendar();
  renderTodayNotice();
  showViewArea();
  document.getElementById("modal").classList.add("hidden");
}

function addRepeatedEvents(eventData) {
  const startDate = new Date(eventData.date);
  const endDate = new Date(startDate);

  endDate.setDate(startDate.getDate() + eventData.repeatWeeks * 7);

  const groupId = "repeat-" + Date.now();

  let intervalDays = 7;

  if (eventData.repeat === "biweekly") {
    intervalDays = 14;
  }

  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    events.push({
      ...eventData,
      date: formatDate(currentDate),
      groupId: groupId
    });

    currentDate.setDate(currentDate.getDate() + intervalDays);
  }
}

function addMultiDayEvents(eventData, endDateString) {
  const startDate = new Date(eventData.date);
  const endDate = new Date(endDateString);
  const groupId = "multi-" + Date.now();
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    events.push({
      ...eventData,
      date: formatDate(currentDate),
      repeat: "none",
      repeatWeeks: 0,
      groupId: groupId
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
}

function addTravelEventForBaseEvent(eventData, travelMinutes, travelFrom, travelTo) {
  if (!eventData.startTime || eventData.allDay) return;

  const groupId = eventData.groupId || "travel-" + Date.now();
  const travelStartTime = subtractMinutesFromTime(eventData.startTime, travelMinutes);

  events.push({
    date: eventData.date,
    title: "移動",
    startTime: travelStartTime,
    endTime: eventData.startTime,
    allDay: false,
    detail: `${travelFrom || "出発地未設定"} → ${travelTo || "目的地未設定"}`,
    repeat: "none",
    repeatWeeks: 0,
    category: "travel",
    groupId: groupId
  });
}

function toggleAllDayInputs() {
  const allDay = document.getElementById("all-day");
  const timeInputArea = document.getElementById("time-input-area");
  const hasTravel = document.getElementById("has-travel");

  if (!allDay || !timeInputArea) return;

  if (allDay.checked) {
    timeInputArea.classList.add("hidden");
    if (hasTravel) hasTravel.checked = false;
    toggleTravelInputs();
  } else {
    timeInputArea.classList.remove("hidden");
  }
}

function toggleNotifyInputs() {
  const notifyEnabled = document.getElementById("notify-enabled");
  const notifyInputs = document.getElementById("notify-inputs");
  if (!notifyEnabled || !notifyInputs) return;
  notifyInputs.classList.toggle("hidden", !notifyEnabled.checked);
}

function toggleMultiDayInputs() {
  const multiDay = document.getElementById("multi-day");
  const multiDayInputs = document.getElementById("multi-day-inputs");
  if (!multiDay || !multiDayInputs) return;
  multiDayInputs.classList.toggle("hidden", !multiDay.checked);
}

function deleteSingleEvent(index) {
  const result = confirm("この予定だけ削除しますか？");

  if (!result) return;

  events.splice(index, 1);

  saveToLocalStorage();
  createCalendar();
  showEvents();
}

function deleteFutureEvents(index) {
  const targetEvent = events[index];

  const result = confirm("この予定以降をすべて削除しますか？");

  if (!result) return;

  if (!targetEvent.groupId) {
    events.splice(index, 1);
  } else {
    events = events.filter(event => {
      const sameGroup = event.groupId === targetEvent.groupId;
      const afterOrSameDate = event.date >= targetEvent.date;

      return !(sameGroup && afterOrSameDate);
    });
  }

  saveToLocalStorage();
  createCalendar();
  showEvents();
  closeModal();
}

function getSelectedTime(type) {
  const hour = document.getElementById(`${type}-hour`).value;
  const minute = document.getElementById(`${type}-minute`).value;

  return `${hour}:${minute}`;
}

function setSelectedTime(type, time) {
  const [hour, minute] = time.split(":");

  document.getElementById(`${type}-hour`).value = hour;
  document.getElementById(`${type}-minute`).value = minute;
}

function clearForm() {
  document.getElementById("title").value = "";
  document.getElementById("start-hour").value = "09";
  document.getElementById("start-minute").value = "00";
  document.getElementById("end-hour").value = "10";
  document.getElementById("end-minute").value = "00";
  document.getElementById("detail").value = "";
  document.getElementById("repeat").value = "none";
  document.getElementById("repeat-weeks").value = "0";
const hasTravel = document.getElementById("has-travel");
const travelInputs = document.getElementById("travel-inputs");
const travelFrom = document.getElementById("travel-from");
const travelTo = document.getElementById("travel-to");
const travelMinutes = document.getElementById("travel-minutes");

if (hasTravel) hasTravel.checked = false;
if (travelInputs) travelInputs.classList.add("hidden");
if (travelFrom) travelFrom.value = "";
if (travelTo) travelTo.value = "";
if (travelMinutes) travelMinutes.value = "30";

const allDay = document.getElementById("all-day");
const eventCategory = document.getElementById("event-category");
const notifyEnabled = document.getElementById("notify-enabled");
const notifyMinutes = document.getElementById("notify-minutes");
const multiDay = document.getElementById("multi-day");
const multiEndDate = document.getElementById("multi-end-date");

if (allDay) allDay.checked = false;
if (eventCategory) eventCategory.value = "normal";
if (notifyEnabled) notifyEnabled.checked = false;
if (notifyMinutes) notifyMinutes.value = "10";
if (multiDay) multiDay.checked = false;
if (multiEndDate) multiEndDate.value = "";
toggleAllDayInputs();
toggleNotifyInputs();
toggleMultiDayInputs();

const colorInput = document.getElementById("event-color");
if (colorInput) {
  colorInput.value = "#3b82f6";
  updateColorPickerSelection("#3b82f6");
}
}
function toggleTravelInputs() {
  const hasTravel = document.getElementById("has-travel");
  const travelInputs = document.getElementById("travel-inputs");

  if (!hasTravel || !travelInputs) return;

  if (hasTravel.checked) {
    travelInputs.classList.remove("hidden");
  } else {
    travelInputs.classList.add("hidden");
  }
}
function saveToLocalStorage() {
  localStorage.setItem("events", JSON.stringify(events));
  syncToServer();
  renderTodayPanel();
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function showEvents() {
  const eventList = document.getElementById("event-list");
  eventList.innerHTML = "";

  const dayShared = (sharedEvents || [])
    .filter(e => e.date === selectedDate)
    .map(e => ({ event: e, index: -1, isShared: true }));

  const dayEvents = [
    ...events
      .map((event, index) => ({ event, index, isShared: false }))
      .filter(item => item.event.date === selectedDate),
    ...dayShared,
  ].sort((a, b) => sortEventsByTimeAndType(a.event, b.event));

  if (dayEvents.length === 0) {
    eventList.innerHTML = `<p>この日の予定はありません。</p>`;
    return;
  }

  dayEvents.forEach(item => {
    const event = item.event;
    const index = item.index;

    const div = document.createElement("div");
    div.className = "event-item";
    div.style.borderLeftColor = getEventColor(event);

    const isShared = item.isShared;

    // 時刻
    let timeStr = "";
    if (event.allDay) {
      timeStr = "終日";
    } else if (event.category !== "birthday" && event.startTime) {
      timeStr = event.endTime ? `${event.startTime}–${event.endTime}` : event.startTime;
    }

    // メタ情報（教室・教員・詳細）
    const metaParts = [];
    if (event.category === "class" || event.category === "seminar") {
      const room = [event.campus, event.room].filter(Boolean).join(" ");
      if (room) metaParts.push(`📍 ${escapeHtml(room)}`);
      if (event.teacher) metaParts.push(`👤 ${escapeHtml(event.teacher)}`);
    } else if (event.detail) {
      metaParts.push(escapeHtml(event.detail));
    }
    if (event.repeat && event.repeat !== "none" && event.repeat !== "yearly") {
      metaParts.push(`🔁 ${getRepeatText(event.repeat)}`);
    }

    // ボタン
    let btns = "";
    if (!isShared) {
      if (event.category === "birthday") {
        btns = `<button class="ei-btn ei-btn-del" onclick="deleteSingleEvent(${index});event.stopPropagation();">削除</button>`;
      } else if (event.category === "class" || event._fromSchedule) {
        btns = "";
      } else if (event.groupId) {
        btns = `<button class="ei-btn" onclick="showEditForm(${index});event.stopPropagation();">編集</button><button class="ei-btn ei-btn-del" onclick="deleteSingleEvent(${index});event.stopPropagation();">この日だけ削除</button><button class="ei-btn ei-btn-del" onclick="deleteFutureEvents(${index});event.stopPropagation();">以降を削除</button>`;
      } else {
        btns = `<button class="ei-btn" onclick="showEditForm(${index});event.stopPropagation();">編集</button><button class="ei-btn ei-btn-del" onclick="deleteSingleEvent(${index});event.stopPropagation();">削除</button>`;
      }
    }

    const sharedLabel = isShared
      ? `<span class="ei-shared">👤 ${escapeHtml(event._sharedBy || "")}</span>`
      : "";

    div.innerHTML = `
      <div class="ei-top">
        ${timeStr ? `<span class="ei-time">${timeStr}</span>` : ""}
        <span class="ei-title" style="color:${getEventColor(event)}">${escapeHtml(event.title)}</span>
        ${sharedLabel}
      </div>
      ${metaParts.length ? `<div class="ei-meta">${metaParts.join('<span class="ei-sep">·</span>')}</div>` : ""}
      ${btns ? `<div class="ei-btns">${btns}</div>` : ""}
    `;

    if (!isShared && event.category !== "birthday") {
      div.onclick = function () {
        showEditForm(index);
      };
    }

    eventList.appendChild(div);
  });
}

function sortEventsByTimeAndType(a, b) {
  if (a.category === "birthday" && b.category !== "birthday") return -1;
  if (a.category !== "birthday" && b.category === "birthday") return 1;
  if (a.allDay && !b.allDay) return -1;
  if (!a.allDay && b.allDay) return 1;

  const timeA = a.startTime || "99:99";
  const timeB = b.startTime || "99:99";
  return timeA.localeCompare(timeB);
}

function getRepeatText(repeat) {
  if (repeat === "weekly") return "毎週";
  if (repeat === "biweekly") return "隔週";
  return "なし";
}

function getCategoryText(category) {
  if (category === "class") return "授業";
  if (category === "seminar") return "ゼミ";
  if (category === "travel") return "移動";
  if (category === "birthday") return "誕生日";
  return "通常予定";
}

function dayToNumber(day) {
  const map = {
    "日": 0,
    "月": 1,
    "火": 2,
    "水": 3,
    "木": 4,
    "金": 5,
    "土": 6
  };

  return map[day];
}
function openTimetableModal() {
  document.getElementById("timetable-modal").classList.remove("hidden");
}

function closeTimetableModal() {
  document.getElementById("timetable-modal").classList.add("hidden");

  document.getElementById("faculty").value = "";
  document.getElementById("semester").value = "";
  document.getElementById("weekday-filter").value = "";
  document.getElementById("timetable-candidates").innerHTML = "";

  const searchInput = document.getElementById("timetable-search");
  if (searchInput) searchInput.value = "";
}

function closeTimetableModalByOutside(event) {
  if (event.target.id === "timetable-modal") {
    closeTimetableModal();
  }
}
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let habits = JSON.parse(localStorage.getItem("habits")) || [];
let habitLogs = JSON.parse(localStorage.getItem("habitLogs")) || {};
let habitTimeLogs = JSON.parse(localStorage.getItem("habitTimeLogs")) || {};
let _habitTimer = { habitId: null, startTime: null, intervalId: null };

function toggleFloatingMenu() {
  const options = document.getElementById("floating-options");
  const plus = document.getElementById("floating-plus");
  const backdrop = document.getElementById("floating-backdrop");

  const isHidden = options.classList.contains("hidden");

  if (isHidden) {
    options.classList.remove("hidden");
    backdrop.classList.remove("hidden");
    plus.classList.add("open");
  } else {
    options.classList.add("hidden");
    backdrop.classList.add("hidden");
    plus.classList.remove("open");
  }
}
function closeFloatingMenu() {
  document.getElementById("floating-options").classList.add("hidden");
  document.getElementById("floating-backdrop").classList.add("hidden");
  document.getElementById("floating-plus").classList.remove("open");
}
function openTimetableModalFromPlus() {
  closeFloatingMenu();
  openTimetableModal();
}

function openTimetableEditor() {
  closeFloatingMenu();
  // 最新の時間割データをロード
  const saved = localStorage.getItem("classSchedule");
  if (saved) {
    try {
      const cs = JSON.parse(saved);
      obClassSchedule = {
        zenki: Array.isArray(cs.zenki) ? cs.zenki : [],
        kouki: Array.isArray(cs.kouki) ? cs.kouki : [],
      };
    } catch { /* 不正データは無視 */ }
  }
  obCurrentSemester = "zenki";
  // step2だけ表示
  ["1", "1b", "2", "3", "4"].forEach(s => {
    document.getElementById(`ob-step-${s}`)?.classList.add("hidden");
  });
  document.getElementById("ob-step-2").classList.remove("hidden");
  // 修正モードのボタンに切り替え
  document.getElementById("ob-step2-onboard-btns").classList.add("hidden");
  document.getElementById("ob-step2-edit-btns").classList.remove("hidden");
  // 前期タブをアクティブに
  document.getElementById("ob-tab-zenki")?.classList.add("active");
  document.getElementById("ob-tab-kouki")?.classList.remove("active");
  // 入力フォームを閉じてグリッドを描画
  document.getElementById("ob-class-form")?.classList.add("hidden");
  obRenderTimetable();
  document.getElementById("onboarding-overlay").classList.remove("hidden");
}

function saveTimetableEdit() {
  localStorage.setItem("classSchedule", JSON.stringify(obClassSchedule));
  obClassesToEvents();
  // 修正モード終了 → ボタンを元に戻す
  document.getElementById("ob-step2-onboard-btns").classList.remove("hidden");
  document.getElementById("ob-step2-edit-btns").classList.add("hidden");
  document.getElementById("onboarding-overlay").classList.add("hidden");
}

function openTodoModal() {
  closeFloatingMenu();
  document.getElementById("todo-modal").classList.remove("hidden");
}

function openAddEventForToday() {
  closeFloatingMenu();
  openModal(formatDate(new Date()));
  showAddForm();
}

function openTodoFromPlus() {
  closeFloatingMenu();
  switchTab("todo");
  openTodoInlineForm();
}

function openHabitFromPlus() {
  closeFloatingMenu();
  switchTab("records");
}
function openBirthdayModal() {
  closeFloatingMenu();
  document.getElementById("birthday-modal").classList.remove("hidden");
  setupBirthdaySelects();
}

function closeBirthdayModal() {
  document.getElementById("birthday-modal").classList.add("hidden");
  document.getElementById("birthday-name").value = "";
}

function closeBirthdayModalByOutside(event) {
  if (event.target.id === "birthday-modal") {
    closeBirthdayModal();
  }
}

function setupBirthdaySelects() {
  const monthSelect = document.getElementById("birthday-month");
  const daySelect = document.getElementById("birthday-day");

  if (monthSelect.options.length > 0) return;

  for (let m = 1; m <= 12; m++) {
    const option = document.createElement("option");
    option.value = String(m).padStart(2, "0");
    option.textContent = m;
    monthSelect.appendChild(option);
  }

  for (let d = 1; d <= 31; d++) {
    const option = document.createElement("option");
    option.value = String(d).padStart(2, "0");
    option.textContent = d;
    daySelect.appendChild(option);
  }
}

function saveBirthday() {
  const name = document.getElementById("birthday-name").value.trim();
  const month = document.getElementById("birthday-month").value;
  const day = document.getElementById("birthday-day").value;

  if (!name) {
    alert("名前を入力してください");
    return;
  }

  const birthdayEvent = {
    date: `${currentYear}-${month}-${day}`,
    title: `${name}さん🎂`,
    startTime: "",
    endTime: "",
    allDay: true,
    detail: `${name}さんのお誕生日`,
    repeat: "yearly",
    category: "birthday"
  };

  events.push(birthdayEvent);

  saveToLocalStorage();
  createCalendar();
  closeBirthdayModal();

  alert(`${name}さんの誕生日を追加しました`);
}

function closeTodoModal() {
  document.getElementById("todo-modal").classList.add("hidden");
}

function closeTodoModalByOutside(event) {
  if (event.target.id === "todo-modal") {
    closeTodoModal();
  }
}

function setTodoCat(cat) {
  document.getElementById("todo-category").value = cat;
  ["todo","assignment","study","event-prep"].forEach(c => {
    document.getElementById(`tcb-${c}`)?.classList.toggle("tcb-active", c === cat);
  });
  document.getElementById("todo-subject-row").classList.toggle("hidden", cat !== "assignment");
  document.getElementById("todo-input").placeholder = cat === "assignment" ? "課題名を入力" : "やることを入力";
  if (cat === "assignment") populateSubjectDatalist();
  const reqEl = document.getElementById("todo-deadline-req");
  if (reqEl) {
    reqEl.className = cat === "assignment" ? "form-required" : "form-optional";
    reqEl.textContent = cat === "assignment" ? "※必須" : "（任意）";
  }
}

function addTodo() {
  const input = document.getElementById("todo-input");
  const deadlineInput = document.getElementById("todo-deadline");
  const executionInput = document.getElementById("todo-execution-date");
  const durationInput = document.getElementById("todo-duration");
  const weightInput = document.getElementById("todo-weight");
  const importanceInput = document.getElementById("todo-importance");
  const categoryInput = document.getElementById("todo-category");
  const subjectInput = document.getElementById("todo-subject");

  const text = input.value.trim();
  const deadline = deadlineInput.value;
  const executionDate = executionInput ? executionInput.value : "";
  const duration = Number(durationInput.value);
  const weight = Number(weightInput.value);
  const importance = Number(importanceInput.value);
  const category = categoryInput ? categoryInput.value : "todo";
  const subject = subjectInput ? subjectInput.value.trim() : "";

  if (!text) {
    alert(category === "assignment" ? "課題名を入力してください" : "ToDoを入力してください");
    return;
  }

  if (!deadline && category === "assignment") {
    alert("課題の締切日を入力してください");
    return;
  }

  const newTodo = {
    id: Date.now(),
    text,
    deadline,
    duration,
    weight,
    importance,
    done: false,
  };
  if (executionDate) newTodo.executionDate = executionDate;
  if (category === "assignment") {
    newTodo.category = "assignment";
    if (subject) newTodo.subject = subject;
  }

  todos.push(newTodo);
  localStorage.setItem("todos", JSON.stringify(todos));
  syncToServer();

  input.value = "";
  deadlineInput.value = "";
  if (executionInput) executionInput.value = "";
  if (subjectInput) subjectInput.value = "";
  durationInput.value = "15";
  weightInput.value = "1";
  importanceInput.value = "1";
  setTodoCat("todo");

  createCalendar();
  closeTodoModal();
  switchTab("todo");
  renderTodoTabView();
  updateTodoBadge();
  updateBnavTodoBadge();
}

function updateTodoBadge() {
  const badge = document.getElementById("todo-badge");
  if (!badge) return;
  const count = todos.filter(t => !t.done).length;
  if (count > 0) {
    badge.textContent = count > 99 ? "99+" : count;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function updateBnavTodoBadge() {
  const badge = document.getElementById("bnav-todo-badge");
  if (!badge) return;
  const today = formatDate(new Date());
  const urgent = todos.filter(t => !t.done && t.deadline && t.deadline <= today).length;
  if (urgent > 0) {
    badge.textContent = urgent > 99 ? "99+" : urgent;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function renderTodoStrip() {
  const strip = document.getElementById("todo-strip");
  if (!strip) return;
  const today = formatDate(new Date());
  const pending = todos
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => !t.done && t.deadline && t.deadline <= today)
    .sort((a, b) => a.t.deadline.localeCompare(b.t.deadline));

  if (pending.length === 0) {
    strip.classList.add("hidden");
    return;
  }
  strip.classList.remove("hidden");
  const items = pending.map(({ t, i }) => {
    const overdue = t.deadline < today;
    return `<div class="todo-strip-item${overdue ? " overdue" : ""}" data-idx="${i}">
      <span>${escapeHtml(t.text)}</span>
      <span class="todo-strip-tag">${overdue ? "期限切れ" : "今日"}</span>
    </div>`;
  }).join("");
  strip.innerHTML = `<div class="todo-strip-label">📌 やること ${pending.length}件</div><div class="todo-strip-items">${items}</div>`;

  // スクロール中の誤タップを防ぐ（8px以上動いたらタップとみなさない）
  strip.querySelectorAll(".todo-strip-item").forEach(el => {
    let sx = 0, sy = 0;
    el.addEventListener("touchstart", e => {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    el.addEventListener("touchend", e => {
      const dx = Math.abs(e.changedTouches[0].clientX - sx);
      const dy = Math.abs(e.changedTouches[0].clientY - sy);
      if (dx < 8 && dy < 8) toggleTodoFromStrip(Number(el.dataset.idx));
    });
  });
}

/* ── タブ制御 ────────────────────────────────────────────── */
let currentTab = "month";

function switchTab(name) {
  currentTab = name;
  ["month", "today", "todo", "records"].forEach(t => {
    document.getElementById(`tab-${t}`)?.classList.toggle("hidden", t !== name);
    document.getElementById(`bnav-${t}`)?.classList.toggle("active", t === name);
  });
  if (name === "today") renderTodayView();
  if (name === "todo") renderTodoTabView();
  if (name === "records") renderRecordsTab();
}

function refreshActiveTabView() {
  if (currentTab === "today") renderTodayView();
  if (currentTab === "todo") renderTodoTabView();
  if (currentTab === "records") renderRecordsTab();
}

/* ── 今日タブ描画 ─────────────────────────────────────────── */
function renderTodayView() {
  const container = document.getElementById("today-view");
  if (!container) return;

  const todayStr = formatDate(new Date());
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  const d = new Date();
  const displayDate = `${d.getMonth() + 1}月${d.getDate()}日（${dayNames[d.getDay()]}）`;

  const todayEvents = [
    ...events.filter(e => e.date === todayStr && e.category !== "birthday"),
    ...(sharedEvents || []).filter(e => e.date === todayStr).map(e => ({ ...e, _isShared: true })),
  ].sort(sortEventsByTimeAndType);

  const todayTodos = todos.filter(t =>
    !t.done && (t.executionDate === todayStr || (!t.executionDate && t.deadline === todayStr))
  );
  const overdueTodos = todos
    .filter(t => !t.done && t.deadline && t.deadline < todayStr)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  let html = `<div class="tv-date-header">${displayDate}</div>`;

  // テストカウントダウン
  const upcomingTests = events
    .filter(e => e.category === "test" && e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
  if (upcomingTests.length > 0) {
    html += `<div class="tv-test-section">`;
    upcomingTests.forEach(e => {
      const days = Math.round((new Date(e.date) - new Date(todayStr)) / (1000 * 60 * 60 * 24));
      const urgency = days === 0 ? "today" : days <= 3 ? "danger" : days <= 7 ? "warning" : "normal";
      const daysLabel = days === 0 ? "今日！" : `${days}日後`;
      html += `<div class="tv-test-card tv-test-${urgency}">
        <div class="tv-test-days">${daysLabel}</div>
        <div class="tv-test-name">${escapeHtml(e.title)}</div>
        <div class="tv-test-date">${e.date.slice(5).replace("-", "/")}</div>
      </div>`;
    });
    html += `</div>`;
  }

  if (overdueTodos.length > 0) {
    html += `<div class="tv-overdue-alert">⚠️ 期限切れToDo ${overdueTodos.length}件</div>`;
    overdueTodos.forEach(t => {
      const idx = todos.indexOf(t);
      html += `<div class="tv-overdue-row" onclick="quickToggleTodo(${idx})">
        <span class="tv-overdue-dot"></span>
        <span class="tv-overdue-text">${escapeHtml(t.text)}</span>
        <span class="tv-overdue-date">${t.deadline.slice(5).replace("-", "/")}</span>
      </div>`;
    });
  }

  html += `<div class="tv-section-label">スケジュール</div>`;
  if (todayEvents.length === 0 && todayTodos.length === 0) {
    html += `<div class="tv-empty">今日の予定はありません</div>`;
  } else {
    todayEvents.forEach(e => {
      const color = getEventColor(e);
      let timeStr = e.allDay ? "終日" : (e.startTime ? (e.endTime ? `${e.startTime}–${e.endTime}` : e.startTime) : "");
      const meta = [];
      if (e.category === "class" || e.category === "seminar") {
        const room = [e.campus, e.room].filter(Boolean).join(" ");
        if (room) meta.push(`📍 ${room}`);
        if (e.teacher) meta.push(`👤 ${e.teacher}`);
      } else if (e.detail) {
        meta.push(e.detail);
      }
      html += `<div class="tv-event" style="border-left-color:${color}">
        <div class="tv-time">${escapeHtml(timeStr)}</div>
        <div class="tv-event-body">
          <div class="tv-title" style="color:${color}">${escapeHtml(e.title)}</div>
          ${meta.length ? `<div class="tv-meta">${escapeHtml(meta.join(" · "))}</div>` : ""}
        </div>
      </div>`;
    });

    if (todayTodos.length > 0) {
      html += `<div class="tv-section-label">やること</div>`;
      todayTodos.forEach(t => {
        const idx = todos.indexOf(t);
        const deadlineNote = t.deadline && t.deadline !== todayStr
          ? `<span class="tv-todo-dl">締切 ${t.deadline.slice(5).replace("-", "/")}</span>` : "";
        const isAssign = t.category === "assignment";
        const subjectNote = (isAssign && t.subject)
          ? `<span class="tv-assign-subject">${escapeHtml(t.subject)}</span>` : "";
        html += `<div class="tv-todo-row${isAssign ? " tv-todo-assign" : ""}" onclick="quickToggleTodo(${idx})">
          <span class="tv-check-circle"></span>
          <div class="tv-todo-body">
            ${isAssign ? `<span class="tv-assign-badge">📚 課題</span>` : ""}
            <span class="tv-todo-text">${escapeHtml(t.text)}</span>
            ${subjectNote}${deadlineNote}
          </div>
        </div>`;
      });
    }
  }

  // 習慣セクション
  const todayHabits = habits.filter(h => !h.archived && isHabitActiveOn(h, d));
  if (todayHabits.length > 0) {
    const loggedIds = habitLogs[todayStr] || [];
    const habitDone = todayHabits.filter(h => loggedIds.includes(h.id)).length;
    html += `<div class="tv-section-label">習慣 <span class="tv-habit-count">${habitDone}/${todayHabits.length}</span></div>`;
    todayHabits.forEach(h => {
      const done = loggedIds.includes(h.id);
      html += `<div class="tv-habit-row${done ? " tv-habit-done" : ""}" onclick="toggleHabitDone(${h.id})">
        <span class="tv-habit-check${done ? " tv-habit-checked" : ""}"></span>
        <div class="tv-habit-body">
          <span class="tv-habit-name${done ? " tv-habit-name-done" : ""}">${escapeHtml(h.text)}</span>
          <span class="tv-habit-dur">${formatDuration(h.duration)}</span>
        </div>
      </div>`;
    });
  }

  container.innerHTML = html;
}

/* ── ToDoタブ描画 ─────────────────────────────────────────── */
/* ── ToDo タブ: ビューモード ─────────────────────────────── */
let todoViewMode = "recommended";

function switchTodoView(mode) {
  todoViewMode = mode;
  document.getElementById("tvt-rec")?.classList.toggle("tvt-active", mode === "recommended");
  document.getElementById("tvt-all")?.classList.toggle("tvt-active", mode === "all");
  document.getElementById("tvt-subject")?.classList.toggle("tvt-active", mode === "subject");
  document.getElementById("tvt-deadline")?.classList.toggle("tvt-active", mode === "deadline");
  renderTodoTabView();
}

function renderTodoTabView() {
  renderTodoSummaryBanner();
  if (todoViewMode === "subject") {
    renderTodoTabSubjectView();
  } else if (todoViewMode === "recommended") {
    renderTodoRecommendedView();
  } else if (todoViewMode === "deadline") {
    renderTodoTabDeadlineView();
  } else {
    renderTodoTabAllView();
  }
}

/* ── サマリーバナー ────────────────────────────────────────── */
function renderTodoSummaryBanner() {
  const banner = document.getElementById("todo-summary-banner");
  if (!banner) return;

  const todayStr = formatDate(new Date());
  const activeTodos = todos.filter(t => !t.done);

  if (activeTodos.length === 0) {
    banner.className = "todo-summary-banner todo-banner-empty";
    banner.innerHTML = `<div class="todo-banner-done">🎉 全て完了！今日もお疲れ様です</div>`;
    return;
  }

  const overdue = activeTodos.filter(t => t.deadline && t.deadline < todayStr);
  const todayDl = activeTodos.filter(t => t.deadline === todayStr);
  const totalMin = activeTodos.reduce((sum, t) => sum + (t.duration || 0), 0);
  const totalH = Math.floor(totalMin / 60);
  const totalM = totalMin % 60;
  const timeStr = totalH > 0 ? `${totalH}時間${totalM > 0 ? totalM + "分" : ""}` : (totalM > 0 ? `${totalM}分` : "");

  const sorted = [...activeTodos].sort((a, b) => calculateTodoPriority(b) - calculateTodoPriority(a));
  const topTodo = sorted[0];

  let chipsHtml = "";
  if (overdue.length > 0) chipsHtml += `<span class="tb-chip tb-chip-over">⚠️ 期限切れ ${overdue.length}件</span>`;
  if (todayDl.length > 0) chipsHtml += `<span class="tb-chip tb-chip-today">📌 今日締切 ${todayDl.length}件</span>`;

  let topItemHtml = "";
  if (topTodo) {
    const deadlineLabel = topTodo.deadline ? topTodo.deadline.slice(5).replace("-", "/") + "まで" : "";
    const durLabel = topTodo.duration ? ` · ${formatDuration(topTodo.duration)}` : "";
    topItemHtml = `
      <div class="tb-top-label">今すぐやること</div>
      <div class="tb-top-item">
        <span class="tb-top-name">${escapeHtml(topTodo.text)}</span>
        <span class="tb-top-meta">${deadlineLabel}${durLabel}</span>
      </div>`;
  }

  banner.className = "todo-summary-banner" + (overdue.length > 0 ? " tb-has-overdue" : "");
  banner.innerHTML = `
    <div class="tb-stats">
      <div class="tb-stat-main">
        <span class="tb-count">${activeTodos.length}<small>件</small></span>
        ${timeStr ? `<span class="tb-time-total">${timeStr}</span>` : ""}
      </div>
      ${chipsHtml ? `<div class="tb-chips">${chipsHtml}</div>` : ""}
    </div>
    ${topItemHtml}
  `;
}

/* ── おすすめ順ビュー ─────────────────────────────────────── */
function renderTodoRecommendedView() {
  const container = document.getElementById("todo-tab-list");
  if (!container) return;
  container.innerHTML = "";

  const activeTodos = todos.filter(t => !t.done);
  const doneTodos   = todos.filter(t => t.done);

  if (activeTodos.length === 0 && doneTodos.length === 0) {
    container.innerHTML = `<div class="tv-empty">ToDoはありません<br><span class="tv-empty-hint">「＋ ToDoを追加」から登録しましょう</span></div>`;
    return;
  }
  if (activeTodos.length === 0) {
    container.innerHTML = `<div class="tv-empty">未完了のToDoはありません 🎉</div>`;
    return;
  }

  const sorted = [...activeTodos]
    .map(t => ({ todo: t, index: todos.indexOf(t), score: calculateTodoPriority(t) }))
    .sort((a, b) => b.score - a.score);

  const recHdr = document.createElement("div");
  recHdr.className = "tg-section-hdr tg-hdr-rec";
  recHdr.innerHTML = `<span class="tg-hdr-icon">⭐</span><span class="tg-hdr-label">やる順番</span><span class="tg-count">${sorted.length}</span>`;
  container.appendChild(recHdr);

  sorted.forEach(({ todo, index }, i) => renderTodoItem(container, todo, index, i + 1));

  if (doneTodos.length > 0) {
    const doneHdr = document.createElement("div");
    doneHdr.className = "tg-section-hdr tg-hdr-done tg-collapsible";
    doneHdr.innerHTML = `<span class="tg-hdr-icon">🎉</span><span class="tg-hdr-label">完了済み</span><span class="tg-count">${doneTodos.length}</span><span class="tg-toggle-arrow" id="tg-done-arrow-tab">▶</span>`;
    doneHdr.onclick = () => {
      const b = document.getElementById("tg-done-body-tab");
      const a = document.getElementById("tg-done-arrow-tab");
      if (b) { const h = b.classList.toggle("hidden"); if (a) a.textContent = h ? "▶" : "▼"; }
    };
    container.appendChild(doneHdr);
    const doneBody = document.createElement("div");
    doneBody.id = "tg-done-body-tab"; doneBody.className = "hidden";
    doneTodos.forEach(todo => renderTodoItem(doneBody, todo, todos.indexOf(todo), null));
    container.appendChild(doneBody);
  }
}

/* ── 全て表示 ─────────────────────────────────────────────── */
function renderTodoTabAllView() {
  const container = document.getElementById("todo-tab-list");
  if (!container) return;
  container.innerHTML = "";

  const activeTodos = todos.filter(t => !t.done);
  const doneTodos   = todos.filter(t => t.done);

  if (todos.length === 0) {
    container.innerHTML = `<div class="tv-empty">ToDoはありません<br><span class="tv-empty-hint">「＋ ToDoを追加」から登録しましょう</span></div>`;
    return;
  }

  const todayStr = formatDate(new Date());
  const today = new Date(); today.setHours(0,0,0,0);
  const nearDate = new Date(today); nearDate.setDate(today.getDate() + 7);
  const nearStr  = formatDate(nearDate);

  const groups = { topPri:[], overdue:[], todayDl:[], todayExec:[], near:[], other:[] };
  activeTodos.forEach((todo) => {
    const index = todos.indexOf(todo);
    const entry = { todo, index };
    const score = calculateTodoPriority(todo);
    if (score >= 90) {
      groups.topPri.push(entry);
    } else if (todo.deadline && todo.deadline < todayStr) {
      groups.overdue.push(entry);
    } else if (todo.deadline === todayStr) {
      groups.todayDl.push(entry);
    } else if (todo.executionDate === todayStr) {
      groups.todayExec.push(entry);
    } else if (todo.deadline && todo.deadline <= nearStr) {
      groups.near.push(entry);
    } else {
      groups.other.push(entry);
    }
  });

  const byPri = arr => arr.sort((a, b) => calculateTodoPriority(b.todo) - calculateTodoPriority(a.todo));
  Object.keys(groups).forEach(k => byPri(groups[k]));

  const defs = [
    { key: "topPri",   icon: "🔥", label: "最優先",      style: "top"     },
    { key: "overdue",  icon: "⚠️", label: "期限切れ",    style: "overdue" },
    { key: "todayDl",  icon: "📌", label: "今日締切",    style: "today"   },
    { key: "todayExec",icon: "✅", label: "今日やること", style: "exec"   },
    { key: "near",     icon: "⏳", label: "期限が近い",  style: "near"    },
    { key: "other",    icon: "📝", label: "未完了",      style: "normal"  },
  ];

  defs.forEach(({ key, icon, label, style }) => {
    const items = groups[key];
    if (items.length === 0) return;
    const hdr = document.createElement("div");
    hdr.className = `tg-section-hdr tg-hdr-${style}`;
    hdr.innerHTML = `<span class="tg-hdr-icon">${icon}</span><span class="tg-hdr-label">${label}</span><span class="tg-count">${items.length}</span>`;
    container.appendChild(hdr);
    items.forEach(({ todo, index }) => renderTodoItem(container, todo, index));
  });

  if (doneTodos.length > 0) {
    const doneHdr = document.createElement("div");
    doneHdr.className = "tg-section-hdr tg-hdr-done tg-collapsible";
    doneHdr.innerHTML = `<span class="tg-hdr-icon">🎉</span><span class="tg-hdr-label">完了済み</span><span class="tg-count">${doneTodos.length}</span><span class="tg-toggle-arrow" id="tg-done-arrow-tab">▶</span>`;
    doneHdr.onclick = () => {
      const b = document.getElementById("tg-done-body-tab");
      const a = document.getElementById("tg-done-arrow-tab");
      if (b) { const h = b.classList.toggle("hidden"); if (a) a.textContent = h ? "▶" : "▼"; }
    };
    container.appendChild(doneHdr);
    const doneBody = document.createElement("div");
    doneBody.id = "tg-done-body-tab"; doneBody.className = "hidden";
    doneTodos.forEach(todo => { const index = todos.indexOf(todo); renderTodoItem(doneBody, todo, index); });
    container.appendChild(doneBody);
  }
}

/* ── 締切順ビュー ─────────────────────────────────────────── */
function renderTodoTabDeadlineView() {
  const container = document.getElementById("todo-tab-list");
  if (!container) return;
  container.innerHTML = "";

  const activeTodos = todos.filter(t => !t.done);
  const doneTodos = todos.filter(t => t.done);

  if (todos.length === 0) {
    container.innerHTML = `<div class="tv-empty">ToDoはありません<br><span class="tv-empty-hint">「＋ ToDoを追加」から登録しましょう</span></div>`;
    return;
  }

  const sorted = [...activeTodos].sort((a, b) => {
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return a.deadline.localeCompare(b.deadline);
  });

  sorted.forEach(todo => {
    const index = todos.indexOf(todo);
    renderTodoItem(container, todo, index);
  });

  if (doneTodos.length > 0) {
    const doneHdr = document.createElement("div");
    doneHdr.className = "tg-section-hdr tg-hdr-done tg-collapsible";
    doneHdr.innerHTML = `<span class="tg-hdr-icon">🎉</span><span class="tg-hdr-label">完了済み</span><span class="tg-count">${doneTodos.length}</span><span class="tg-toggle-arrow" id="tg-done-arrow-dl">▶</span>`;
    doneHdr.onclick = () => {
      const b = document.getElementById("tg-done-body-dl");
      const a = document.getElementById("tg-done-arrow-dl");
      if (b) { const h = b.classList.toggle("hidden"); if (a) a.textContent = h ? "▶" : "▼"; }
    };
    container.appendChild(doneHdr);
    const doneBody = document.createElement("div");
    doneBody.id = "tg-done-body-dl"; doneBody.className = "hidden";
    doneTodos.forEach(todo => { const index = todos.indexOf(todo); renderTodoItem(doneBody, todo, index); });
    container.appendChild(doneBody);
  }
}

/* ── 授業別ビュー ─────────────────────────────────────────── */
function getRegisteredClassNames() {
  const names = new Set();
  ["zenki", "kouki"].forEach(sem => {
    (obClassSchedule[sem] || []).forEach(cls => { if (cls.name) names.add(cls.name); });
  });
  return [...names].sort();
}

function populateSubjectDatalist() {
  const dl = document.getElementById("subject-datalist");
  if (!dl) return;
  const names = getRegisteredClassNames();
  dl.innerHTML = names.map(n => `<option value="${escapeHtml(n)}">`).join("");
}

function renderTodoTabSubjectView() {
  const container = document.getElementById("todo-tab-list");
  if (!container) return;
  container.innerHTML = "";

  const todayStr = formatDate(new Date());
  const assignments = todos
    .filter(t => t.category === "assignment" && !t.done)
    .sort((a, b) => (a.deadline || "9999").localeCompare(b.deadline || "9999"));
  const doneAssignments = todos.filter(t => t.category === "assignment" && t.done);
  const regularTodos = todos.filter(t => t.category !== "assignment" && !t.done);

  if (assignments.length === 0 && doneAssignments.length === 0) {
    container.innerHTML = `<div class="tv-empty">課題はありません<br><span style="font-size:12px;color:#9ca3af">「＋ ToDoを追加」→「課題」を選んで追加してください</span></div>`;
    if (regularTodos.length > 0) {
      const note = document.createElement("div");
      note.className = "subj-othernote";
      note.innerHTML = `通常ToDo ${regularTodos.length}件は「全て」で確認できます`;
      container.appendChild(note);
    }
    return;
  }

  // 授業名でグループ化
  const subjectMap = new Map();
  assignments.forEach(todo => {
    const key = todo.subject || "";
    if (!subjectMap.has(key)) subjectMap.set(key, []);
    subjectMap.get(key).push({ todo, index: todos.indexOf(todo) });
  });

  // 登録済み授業を先に、未登録・授業未設定を後に
  const registered = getRegisteredClassNames();
  const allSubjects = [...subjectMap.keys()].sort((a, b) => {
    if (!a && b) return 1;
    if (a && !b) return -1;
    const ai = registered.indexOf(a), bi = registered.indexOf(b);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.localeCompare(b, "ja");
  });

  allSubjects.forEach(subj => {
    const items = subjectMap.get(subj);
    const isRegistered = subj && registered.includes(subj);

    const hdr = document.createElement("div");
    hdr.className = "tg-section-hdr tg-hdr-subject";
    hdr.innerHTML = `
      <span class="tg-hdr-icon">📚</span>
      <span class="tg-hdr-label">${subj ? escapeHtml(subj) : "授業未設定"}</span>
      ${isRegistered ? '<span class="subj-registered-dot"></span>' : ""}
      <span class="tg-count">${items.length}</span>
    `;
    container.appendChild(hdr);

    items.forEach(({ todo, index }) => {
      renderTodoItem(container, todo, index);
    });
  });

  // 提出済み（折りたたみ）
  if (doneAssignments.length > 0) {
    const doneHdr = document.createElement("div");
    doneHdr.className = "tg-section-hdr tg-hdr-done tg-collapsible";
    doneHdr.innerHTML = `<span class="tg-hdr-icon">🎉</span><span class="tg-hdr-label">提出済み</span><span class="tg-count">${doneAssignments.length}</span><span class="tg-toggle-arrow" id="subj-done-arrow">▶</span>`;
    doneHdr.onclick = () => {
      const b = document.getElementById("subj-done-body");
      const a = document.getElementById("subj-done-arrow");
      if (b) { const h = b.classList.toggle("hidden"); if (a) a.textContent = h ? "▶" : "▼"; }
    };
    container.appendChild(doneHdr);
    const doneBody = document.createElement("div");
    doneBody.id = "subj-done-body"; doneBody.className = "hidden";
    doneAssignments.forEach(todo => {
      const index = todos.indexOf(todo);
      renderTodoItem(doneBody, todo, index);
    });
    container.appendChild(doneBody);
  }

  // 通常ToDoの件数案内
  if (regularTodos.length > 0) {
    const note = document.createElement("div");
    note.className = "subj-othernote";
    note.innerHTML = `通常ToDo ${regularTodos.length}件は「グループ」タブで確認できます`;
    container.appendChild(note);
  }
}

function renderTodayPanel() {
  const panel = document.getElementById("today-panel");
  if (!panel) return;

  const todayStr = formatDate(new Date());

  const todayEvents = events
    .filter(e => e.date === todayStr && e.category !== "birthday")
    .sort(sortEventsByTimeAndType);

  const todayTodos   = todos.filter(t => !t.done && t.deadline === todayStr);
  const overdueTodos = todos
    .filter(t => !t.done && t.deadline && t.deadline < todayStr)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  let html = "";

  // 期限切れ警告
  if (overdueTodos.length > 0) {
    html += `<div class="tdp-alert">⚠️ 期限切れのToDo ${overdueTodos.length}件</div>`;
    overdueTodos.forEach(t => {
      const idx = todos.indexOf(t);
      html += `<div class="tdp-overdue-item" onclick="quickToggleTodo(${idx})">
        <span class="tdp-dot"></span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(t.text)}</span>
        <span class="tdp-overdue-date">${t.deadline}</span>
      </div>`;
    });
  }

  // 今日の予定
  html += `<div class="tdp-section">今日の予定</div>`;
  if (todayEvents.length === 0) {
    html += `<div class="tdp-empty">予定はありません</div>`;
  } else {
    todayEvents.forEach(e => {
      const timeStr = e.allDay ? "終日" : (e.startTime || "");
      const color = getEventColor(e);
      const meta = [e.campus, e.room].filter(Boolean).join(" ");
      html += `<div class="tdp-event" style="border-left-color:${color}">
        ${timeStr ? `<span class="tdp-time">${timeStr}</span>` : ""}
        <div class="tdp-event-body">
          <div class="tdp-title">${escapeHtml(e.title)}</div>
          ${meta ? `<div class="tdp-meta">📍 ${escapeHtml(meta)}</div>` : ""}
        </div>
      </div>`;
    });
  }

  // 今日やるToDo
  html += `<div class="tdp-section">今日やるToDo</div>`;
  if (todayTodos.length === 0) {
    html += `<div class="tdp-empty">今日締切のToDoはありません</div>`;
  } else {
    todayTodos.forEach(t => {
      const idx = todos.indexOf(t);
      html += `<div class="tdp-todo" onclick="quickToggleTodo(${idx})">
        <span class="tdp-check"></span>
        <span class="tdp-todo-text">${escapeHtml(t.text)}</span>
      </div>`;
    });
  }

  panel.innerHTML = html;
}

function quickToggleTodo(idx) {
  if (!todos[idx]) return;
  todos[idx].done = !todos[idx].done;
  localStorage.setItem("todos", JSON.stringify(todos));
  syncToServer();
  updateTodoBadge();
  renderTodayPanel();
  createCalendar();
  refreshActiveTabView();
}

function toggleTodoFromStrip(index) {
  todos[index].done = !todos[index].done;
  localStorage.setItem("todos", JSON.stringify(todos));
  syncToServer();
  updateTodoBadge();
  renderTodoStrip();
  createCalendar();
}

function showTodos() { renderTodoTabView(); }

// ─── Inline ToDo form (tab) ──────────────────────────────────────────────────
let _editingTodoIndex = null;

function openTodoInlineForm(editIndex = null) {
  _editingTodoIndex = editIndex;
  const form = document.getElementById("todo-tab-add-form");
  if (!form) return;
  const titleEl = document.getElementById("ttaf-title");
  const saveBtn = document.getElementById("ttaf-save-btn");

  if (editIndex !== null) {
    const todo = todos[editIndex];
    if (!todo) return;
    titleEl.textContent = "ToDoを編集";
    saveBtn.textContent = "更新";
    document.getElementById("ttaf-text").value = todo.text;
    document.getElementById("ttaf-deadline").value = todo.deadline || "";
    document.getElementById("ttaf-execution-date").value = todo.executionDate || "";
    document.getElementById("ttaf-duration").value = todo.duration || 30;
    document.getElementById("ttaf-weight").value = todo.weight || 1;
    document.getElementById("ttaf-importance").value = todo.importance || 1;
    document.getElementById("ttaf-memo").value = todo.memo || "";
    setInlineFormCat(todo.category || "other");
    if (todo.category === "assignment") document.getElementById("ttaf-subject").value = todo.subject || "";
  } else {
    titleEl.textContent = "ToDoを追加";
    saveBtn.textContent = "追加";
    document.getElementById("ttaf-text").value = "";
    document.getElementById("ttaf-deadline").value = "";
    document.getElementById("ttaf-execution-date").value = "";
    document.getElementById("ttaf-duration").value = "30";
    document.getElementById("ttaf-weight").value = "1";
    document.getElementById("ttaf-importance").value = "1";
    document.getElementById("ttaf-memo").value = "";
    setInlineFormCat("other");
  }

  form.classList.remove("hidden");
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => document.getElementById("ttaf-text")?.focus(), 150);
}

function closeTodoInlineForm() {
  document.getElementById("todo-tab-add-form")?.classList.add("hidden");
  _editingTodoIndex = null;
}

function setInlineFormCat(cat) {
  document.getElementById("ttaf-category").value = cat;
  ["other","assignment","study","event-prep","shopping","contact"].forEach(c => {
    document.getElementById(`ttaf-tcb-${c}`)?.classList.toggle("tcat-active", c === cat);
  });
  document.getElementById("ttaf-subject-row")?.classList.toggle("hidden", cat !== "assignment");
  document.getElementById("ttaf-text").placeholder = cat === "assignment" ? "課題名を入力（必須）" : "やることを入力（必須）";
  if (cat === "assignment") _populateInlineSubjectDatalist();
  const reqEl2 = document.getElementById("ttaf-deadline-req");
  if (reqEl2) {
    reqEl2.className = cat === "assignment" ? "form-required" : "form-optional";
    reqEl2.textContent = cat === "assignment" ? "※必須" : "（任意）";
  }
}

function _populateInlineSubjectDatalist() {
  const dl = document.getElementById("ttaf-subject-datalist");
  if (!dl) return;
  const names = getRegisteredClassNames();
  dl.innerHTML = names.map(n => `<option value="${escapeHtml(n)}">`).join("");
}

function saveFromInlineForm() {
  const text = document.getElementById("ttaf-text").value.trim();
  const deadline = document.getElementById("ttaf-deadline").value;
  const cat = document.getElementById("ttaf-category").value || "other";
  if (!text) { alert(cat === "assignment" ? "課題名を入力してください" : "ToDoを入力してください"); return; }
  if (!deadline && cat === "assignment") { alert("課題の締切日を入力してください"); return; }

  const newData = {
    text,
    deadline,
    executionDate:  document.getElementById("ttaf-execution-date").value || undefined,
    duration:       Number(document.getElementById("ttaf-duration").value),
    weight:         Number(document.getElementById("ttaf-weight").value),
    importance:     Number(document.getElementById("ttaf-importance").value),
    memo:           document.getElementById("ttaf-memo").value.trim() || undefined,
    category:       cat === "assignment" ? "assignment" : (cat === "other" ? undefined : cat),
    subject:        cat === "assignment" ? document.getElementById("ttaf-subject").value.trim() || undefined : undefined,
    done:           false,
  };

  if (_editingTodoIndex !== null) {
    todos[_editingTodoIndex] = { ...todos[_editingTodoIndex], ...newData };
  } else {
    todos.push({ id: Date.now(), ...newData });
  }

  localStorage.setItem("todos", JSON.stringify(todos));
  syncToServer();
  closeTodoInlineForm();
  createCalendar();
  renderTodoTabView();
  updateTodoBadge();
  updateBnavTodoBadge();
}

function editTodo(index) {
  openTodoInlineForm(index);
  const tabEl = document.getElementById("tab-todo");
  if (tabEl?.classList.contains("hidden")) switchTab("todo");
}

// ─── ToDo tab render ──────────────────────────────────────────────────────────

function renderTodoItem(container, todo, index, rank = null) {
  const todayStr = formatDate(new Date());
  const today = new Date(); today.setHours(0,0,0,0);
  const isOverdue = !todo.done && todo.deadline && todo.deadline < todayStr;
  const isAssignment = todo.category === "assignment";
  const priority = calculateTodoPriority(todo);
  const { label: prioLabel, cls: prioCls } = getTodoPriorityLabel(priority, todo.done);

  // Days left label
  let daysHtml = "";
  if (!todo.done && todo.deadline) {
    const dl = new Date(todo.deadline); dl.setHours(0,0,0,0);
    const diff = Math.round((dl - today) / 86400000);
    if (diff < 0)       daysHtml = `<span class="tg-days tg-days-over">期限切れ</span>`;
    else if (diff === 0) daysHtml = `<span class="tg-days tg-days-today">今日まで</span>`;
    else if (diff === 1) daysHtml = `<span class="tg-days tg-days-soon">あと1日</span>`;
    else if (diff <= 3)  daysHtml = `<span class="tg-days tg-days-soon">あと${diff}日</span>`;
    else                 daysHtml = `<span class="tg-days tg-days-normal">あと${diff}日</span>`;
  }

  // Category badge
  const catMap = { assignment:"📚 課題", study:"📖 勉強", "event-prep":"📋 準備", shopping:"🛒 買い物", contact:"📞 連絡" };
  const catBadge = (todo.category && catMap[todo.category])
    ? `<span class="tg-cat-badge tg-cat-${todo.category}">${catMap[todo.category]}</span>` : "";
  const rankBadge = rank !== null && !todo.done ? `<span class="tg-rank-num">${rank}</span>` : "";
  const subjectStr = (isAssignment && todo.subject)
    ? `<span class="tg-subject">${escapeHtml(todo.subject)}</span>` : "";
  const deadlineStr = todo.deadline
    ? `<span class="tg-chip tg-chip-deadline">📅 ${todo.deadline.slice(5).replace("-","/")}${daysHtml ? "" : ""}</span>`
    : "";
  const execStr = todo.executionDate
    ? `<span class="tg-chip tg-chip-exec">▶ ${todo.executionDate.slice(5).replace("-","/")} 実行</span>` : "";
  const durStr = todo.duration ? `<span class="tg-chip">${formatDuration(todo.duration)}</span>` : "";
  const wLabel = todo.weight >= 4 ? "重め" : (todo.weight >= 3 ? "普通" : (todo.weight >= 2 ? "やや軽" : ""));
  const weightStr = wLabel ? `<span class="tg-chip">重さ: ${wLabel}</span>` : "";
  const impLabel = todo.importance >= 4 ? "重要" : "";
  const importStr = impLabel ? `<span class="tg-chip tg-chip-imp">${impLabel}</span>` : "";
  const prioStr = !todo.done ? `<span class="tg-prio-badge ${prioCls}">${prioLabel}</span>` : "";
  const splitBtn = (isAssignment && todo.duration > 0 && todo.deadline && !todo.done)
    ? `<button class="tg-split-btn" onclick="openSplitModal(${index})">✂</button>` : "";
  const memoStr = todo.memo ? `<div class="tg-memo">${escapeHtml(todo.memo)}</div>` : "";

  const div = document.createElement("div");
  div.className = `tg-card${isAssignment ? " tg-card-assign" : ""}${todo.done ? " tg-card-done" : ""}${isOverdue ? " tg-card-overdue" : ""}`;
  div.innerHTML = `
    ${rankBadge}
    <button class="tg-check-btn${todo.done ? " tg-check-done" : ""}" onclick="toggleTodo(${index})" aria-label="完了切り替え">
      ${todo.done ? "✓" : ""}
    </button>
    <div class="tg-card-body">
      <div class="tg-card-top">
        <span class="tg-card-name${todo.done ? " tg-name-done" : ""}">${escapeHtml(todo.text)}</span>
        <div class="tg-card-acts">
          ${splitBtn}
          <button class="tg-edit-btn" onclick="editTodo(${index})" aria-label="編集">✏️</button>
          <button class="tg-del-btn2" onclick="deleteTodo(${index})" aria-label="削除">🗑</button>
        </div>
      </div>
      ${subjectStr ? `<div class="tg-card-subject">${catBadge}${subjectStr}</div>` : (catBadge ? `<div class="tg-card-subject">${catBadge}</div>` : "")}
      <div class="tg-card-chips">
        ${deadlineStr}${daysHtml}${execStr}${durStr}${weightStr}${importStr}${prioStr}
      </div>
      ${memoStr}
    </div>
  `;
  container.appendChild(div);
}

function getTodoPriorityLabel(score, done) {
  if (done) return { label: "", cls: "" };
  if (score >= 90) return { label: "🔥最優先", cls: "tg-prio-top" };
  if (score >= 70) return { label: "急ぎ",     cls: "tg-prio-urgent" };
  if (score >= 45) return { label: "重要",     cls: "tg-prio-important" };
  return             { label: "軽め",     cls: "tg-prio-light" };
}

function getTodoWeightLabel(weight) {
  if (!weight) return "";
  if (weight >= 3) return "重め";
  if (weight === 2) return "普通";
  return "軽め";
}

function toggleCompletedSection() {
  const body = document.getElementById("tg-done-body");
  const arrow = document.getElementById("tg-done-arrow");
  if (!body) return;
  const isHidden = body.classList.toggle("hidden");
  if (arrow) arrow.textContent = isHidden ? "▶" : "▼";
}
function calculateTodoPriority(todo) {
  const today = new Date(); today.setHours(0, 0, 0, 0);

  // 締切スコア (0〜50点): 急ぎほど高い
  let deadlineScore = 0;
  if (todo.deadline) {
    const deadline = new Date(todo.deadline); deadline.setHours(0, 0, 0, 0);
    const daysLeft = Math.round((deadline - today) / 86400000);
    if (daysLeft <= 0)       deadlineScore = 50; // 期限切れ
    else if (daysLeft === 1) deadlineScore = 40; // 明日まで
    else if (daysLeft <= 3)  deadlineScore = 30; // 3日以内
    else if (daysLeft <= 7)  deadlineScore = 20; // 1週間以内
    else if (daysLeft <= 14) deadlineScore = 10; // 2週間以内
    else                     deadlineScore = 2;  // まだ先
  }

  // 重要度スコア (0〜60点): importance 1〜5 × 12
  const importanceScore = (todo.importance || 1) * 12;

  // 重さスコア (0〜30点): weight 1〜3 × 10
  const weightScore = (todo.weight || 1) * 10;

  // 所要時間スコア (0〜12点): 長い作業ほど早めに着手
  const durationScore = Math.min(Math.ceil((todo.duration || 30) / 30) * 3, 12);

  // 実行日ボーナス: 今日実行予定なら +10
  const execBonus = todo.executionDate === formatDate(new Date()) ? 10 : 0;

  return deadlineScore + importanceScore + weightScore + durationScore + execBonus;
}
function deleteTodo(index) {
  if (!confirm("このToDoを削除しますか？")) return;
  todos.splice(index, 1);
  localStorage.setItem("todos", JSON.stringify(todos));
  syncToServer();
  updateTodoBadge();
  updateBnavTodoBadge();
  renderTodoStrip();
  createCalendar();
  refreshActiveTabView();
}

function toggleTodo(index) {
  todos[index].done = !todos[index].done;
  localStorage.setItem("todos", JSON.stringify(todos));
  syncToServer();
  updateTodoBadge();
  updateBnavTodoBadge();
  renderTodoStrip();
  createCalendar();
  refreshActiveTabView();
}
function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getFirstFreeSlot(dateString, durationMinutes) {
  const DAY_START = 9 * 60;
  const DAY_END = 22 * 60;

  const dayEvents = events.filter(e => e.date === dateString && !e.allDay && e.startTime && e.endTime);
  const busySlots = dayEvents
    .map(e => ({ start: timeToMinutes(e.startTime), end: timeToMinutes(e.endTime) }))
    .filter(s => s.start !== null && s.end !== null)
    .sort((a, b) => a.start - b.start);

  let cursor = DAY_START;
  for (const slot of busySlots) {
    if (cursor + durationMinutes <= slot.start) {
      return { start: minutesToTime(cursor), end: minutesToTime(cursor + durationMinutes) };
    }
    if (slot.end > cursor) cursor = slot.end;
  }
  if (cursor + durationMinutes <= DAY_END) {
    return { start: minutesToTime(cursor), end: minutesToTime(cursor + durationMinutes) };
  }
  return null;
}

let _schedulePlan = [];

function autoScheduleTodos() {
  events = events.filter(e => !e._scheduled);
  const noDeadline = todos.filter(t => !t.done && !t.deadline);
  const unfinished = todos.filter(t => !t.done && t.deadline);
  if (unfinished.length === 0) {
    const el = _getScheduleResultEl();
    if (el) {
      el.innerHTML = noDeadline.length > 0
        ? `<div class="schedule-result-inner"><p>締切が設定されたToDoがありません。<br><small style="color:#9ca3af">締切なしのToDo ${noDeadline.length}件は含まれません。</small></p><button class="schedule-close-btn" onclick="_hideScheduleResult()">閉じる</button></div>`
        : `<div class="schedule-result-inner"><p>未完了のToDoがありません。</p><button class="schedule-close-btn" onclick="_hideScheduleResult()">閉じる</button></div>`;
      el.classList.remove("hidden");
    }
    return;
  }

  const sorted = [...unfinished].sort((a, b) => calculateTodoPriority(b) - calculateTodoPriority(a));

  const todayStr = formatDate(new Date());
  _schedulePlan = [];

  for (const todo of sorted) {
    let found = false;
    const deadline = todo.deadline;
    let cur = new Date(todayStr);
    const end = new Date(deadline);

    while (cur <= end) {
      const ds = formatDate(cur);
      const slot = getFirstFreeSlot(ds, todo.duration || 30);
      if (slot) {
        _schedulePlan.push({ todo, date: ds, start: slot.start, end: slot.end });
        events.push({
          id: `sched_${todo.id}_${ds}`,
          title: `📋 ${todo.text}`,
          date: ds,
          startTime: slot.start,
          endTime: slot.end,
          allDay: false,
          category: "todo-scheduled",
          color: "#f59e0b",
          _scheduled: true
        });
        found = true;
        break;
      }
      cur.setDate(cur.getDate() + 1);
    }

    if (!found) {
      _schedulePlan.push({ todo, date: null, start: null, end: null });
    }
  }

  const resultEl = _getScheduleResultEl();
  let html = `<div class="schedule-result-inner"><div class="schedule-result-title">📅 スケジュール案</div>`;
  for (const item of _schedulePlan) {
    if (item.date) {
      html += `<div class="schedule-item">
        <span class="schedule-item-title">${escapeHtml(item.todo.text)}</span>
        <span class="schedule-item-time">${item.date.slice(5).replace("-","/")} ${item.start}〜${item.end}</span>
      </div>`;
    } else {
      html += `<div class="schedule-item schedule-item-failed">
        <span class="schedule-item-title">${escapeHtml(item.todo.text)}</span>
        <span class="schedule-item-time">空き時間なし</span>
      </div>`;
    }
  }
  html += `<div class="schedule-result-btns">
    <button class="schedule-apply-btn" onclick="applySchedule()">カレンダーに追加</button>
    <button class="schedule-close-btn" onclick="_hideScheduleResult()">閉じる</button>
  </div>`;
  if (noDeadline.length > 0) {
    html += `<p class="schedule-note">※締切なしのToDo ${noDeadline.length}件は含まれていません</p>`;
  }
  html += `</div>`;
  resultEl.innerHTML = html;
  resultEl.classList.remove("hidden");
}

function _getScheduleResultEl() {
  return document.getElementById("todo-tab-schedule-result") || document.getElementById("schedule-result");
}
function _hideScheduleResult() {
  _getScheduleResultEl()?.classList.add("hidden");
}

function applySchedule() {
  saveToLocalStorage();
  createCalendar();
  const el = _getScheduleResultEl();
  if (el) el.innerHTML = `<div class="schedule-result-inner"><p class="schedule-done">✅ カレンダーに追加しました！</p><button class="schedule-close-btn" onclick="_hideScheduleResult()">閉じる</button></div>`;
}

// ─── Phase 10: 課題分割配置 ──────────────────────────────────────────────────

let _splitTodoIndex = -1;
let _splitUnit = 60;
let _splitPlan = [];

function openSplitModal(index) {
  _splitTodoIndex = index;
  _splitUnit = 60;
  _splitPlan = [];
  const todo = todos[index];
  if (!todo) return;

  document.getElementById("split-todo-name").textContent = todo.text;
  document.getElementById("split-total-time").textContent = `${todo.duration}分`;
  document.getElementById("split-deadline").textContent = todo.deadline
    ? todo.deadline.slice(5).replace("-", "/")
    : "なし";
  document.getElementById("split-preview-area").innerHTML = "";

  [30, 60, 90].forEach(m =>
    document.getElementById(`su-${m}`)?.classList.remove("split-unit-active")
  );

  // pick the closest valid unit ≤ duration
  const units = [30, 60, 90].filter(u => u <= todo.duration);
  const defaultUnit = units.length > 0 ? units[units.length - 1] : 30;
  setSplitUnit(defaultUnit);

  document.getElementById("split-modal").classList.remove("hidden");
}

function closeSplitModal() {
  document.getElementById("split-modal").classList.add("hidden");
  events = events.filter(e => !e._splitPreview);
  createCalendar();
}

function closeSplitModalByOutside(event) {
  if (event.target === document.getElementById("split-modal")) closeSplitModal();
}

function setSplitUnit(minutes) {
  _splitUnit = minutes;
  [30, 60, 90].forEach(m =>
    document.getElementById(`su-${m}`)?.classList.toggle("split-unit-active", m === minutes)
  );
  previewSplitSchedule();
}

function previewSplitSchedule() {
  events = events.filter(e => !e._splitPreview);

  const todo = todos[_splitTodoIndex];
  const previewEl = document.getElementById("split-preview-area");
  const applyBtn = document.getElementById("split-apply-btn");
  if (!todo || !todo.duration || !todo.deadline) {
    previewEl.innerHTML = "<p class='split-err'>締切日または所要時間がありません</p>";
    applyBtn.disabled = true;
    return;
  }

  const sessions = Math.ceil(todo.duration / _splitUnit);
  const todayStr = formatDate(new Date());
  _splitPlan = [];

  let partNum = 1;
  let cur = new Date(todayStr);
  const endDate = new Date(todo.deadline);

  while (partNum <= sessions && cur <= endDate) {
    const ds = formatDate(cur);
    const slot = getFirstFreeSlot(ds, _splitUnit);
    if (slot) {
      _splitPlan.push({ date: ds, start: slot.start, end: slot.end, part: partNum });
      events.push({
        id: `split_prev_${todo.id}_${partNum}_${ds}`,
        title: `📝 課題作業 ${partNum}/${sessions}：${todo.text}`,
        date: ds,
        startTime: slot.start,
        endTime: slot.end,
        allDay: false,
        category: "assignment-work",
        color: "#eab308",
        _splitPreview: true,
        _splitFromTodoId: todo.id,
        _splitPart: partNum,
        _splitTotal: sessions,
      });
      partNum++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  createCalendar();

  if (_splitPlan.length === 0) {
    previewEl.innerHTML = "<p class='split-err'>締切日までに空き時間が見つかりませんでした</p>";
    applyBtn.disabled = true;
    return;
  }

  const placed = _splitPlan.length;
  const notPlaced = sessions - placed;
  let html = `<div class="split-preview-head">
    <span class="split-preview-stat">${_splitUnit}分 × ${sessions}回</span>
    ${notPlaced > 0 ? `<span class="split-preview-warn">${notPlaced}回分は配置できません</span>` : `<span class="split-preview-ok">全${sessions}回配置可能</span>`}
  </div>
  <div class="split-preview-list">`;
  for (const item of _splitPlan) {
    html += `<div class="split-preview-item">
      <span class="split-preview-part">${item.part}/${sessions}</span>
      <span class="split-preview-date">${item.date.slice(5).replace("-", "/")}</span>
      <span class="split-preview-time">${item.start}〜${item.end}</span>
    </div>`;
  }
  html += `</div>`;
  previewEl.innerHTML = html;
  applyBtn.disabled = false;
}

function applySplitSchedule() {
  const todo = todos[_splitTodoIndex];
  if (!todo || _splitPlan.length === 0) return;

  const sessions = Math.ceil(todo.duration / _splitUnit);
  events = events.filter(e => !e._splitPreview);

  for (const item of _splitPlan) {
    events.push({
      id: `split_${todo.id}_${item.part}_${item.date}`,
      title: `📝 課題作業 ${item.part}/${sessions}：${todo.text}`,
      date: item.date,
      startTime: item.start,
      endTime: item.end,
      allDay: false,
      category: "assignment-work",
      color: "#eab308",
      _splitFromTodoId: todo.id,
      _splitPart: item.part,
      _splitTotal: sessions,
    });
  }

  saveToLocalStorage();
  createCalendar();
  document.getElementById("split-modal").classList.add("hidden");

  const toast = document.createElement("div");
  toast.className = "split-toast";
  toast.textContent = `${_splitPlan.length}件の課題作業をカレンダーに追加しました`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function getLatestTodoDeadline() {
  if (todos.length === 0) return formatDate(new Date());

  const unfinishedTodos = todos.filter(todo => !todo.done && todo.deadline);

  if (unfinishedTodos.length === 0) {
    return formatDate(new Date());
  }

  const latestDeadline = unfinishedTodos.reduce((latest, todo) => {
    return todo.deadline > latest ? todo.deadline : latest;
  }, unfinishedTodos[0].deadline);

  return latestDeadline;
}

function getEventsUntilLatestDeadline() {
  const todayString = formatDate(new Date());
  const latestDeadline = getLatestTodoDeadline();

  return events.filter(event => {
    return event.date >= todayString && event.date <= latestDeadline;
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("\n", "<br>");
}

// ─── Phase 12: 強化検索 ──────────────────────────────────────────────────────

let searchFilter = "all";

function openSearch() {
  document.getElementById("search-overlay").classList.remove("hidden");
  setTimeout(() => document.getElementById("search-input-main")?.focus(), 50);
}

function closeSearch() {
  document.getElementById("search-overlay").classList.add("hidden");
  const input = document.getElementById("search-input-main");
  if (input) input.value = "";
  const panel = document.getElementById("search-results-main");
  if (panel) panel.innerHTML = "";
}

function closeSearchByOutside(event) {
  if (event.target === document.getElementById("search-overlay")) closeSearch();
}

function setSearchFilter(type) {
  searchFilter = type;
  ["all", "event", "class", "todo", "assign", "done"].forEach(t => {
    document.getElementById(`sf-${t}`)?.classList.toggle("sf-active", t === type);
  });
  searchAllItems();
}

function highlightMatch(rawText, keyword) {
  const safe = escapeHtml(rawText || "");
  if (!keyword) return safe;
  const safeKw = escapeHtml(keyword).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return safe.replace(new RegExp(safeKw, "gi"), m => `<mark class="sr-hl">${m}</mark>`);
}

function _eventSearchText(ev) {
  return [ev.title, ev.detail, ev.teacher, ev.campus, ev.room, ev.code].join(" ").toLowerCase();
}
function _todoSearchText(t) {
  return [t.text, t.subject, t.deadline].join(" ").toLowerCase();
}

function searchAllItems() {
  const input   = document.getElementById("search-input-main");
  const panel   = document.getElementById("search-results-main");
  if (!input || !panel) return;

  const keyword = input.value.trim().toLowerCase();
  panel.innerHTML = "";

  if (!keyword) {
    panel.innerHTML = `<p class="sr-empty">キーワードを入力してください</p>`;
    return;
  }

  const kw = keyword;
  const f  = searchFilter;

  // ── events (予定・授業・移動など)
  const evResults = events
    .filter(ev => !ev._splitPreview && !ev._scheduled)
    .map((ev, i) => ({ type: "event", ev, i }))
    .filter(({ ev }) => {
      if (ev.category === "birthday") return false;
      if (f === "event"  && (ev.category === "class" || ev.category === "seminar")) return false;
      if (f === "class"  && ev.category !== "class" && ev.category !== "seminar")   return false;
      if (f === "todo" || f === "assign" || f === "done") return false;
      return _eventSearchText(ev).includes(kw);
    });

  // ── todos (ToDo・課題 / 完了済み)
  const todoResults = todos
    .map((t, i) => ({ type: "todo", t, i }))
    .filter(({ t }) => {
      const isAssign = t.category === "assignment";
      if (f === "event" || f === "class") return false;
      if (f === "todo"   && (isAssign || t.done))  return false;
      if (f === "assign" && (!isAssign || t.done))  return false;
      if (f === "done"   && !t.done)                return false;
      return _todoSearchText(t).includes(kw);
    });

  // ── habits
  const habitResults = habits
    .map((h, i) => ({ type: "habit", h, i }))
    .filter(({ h }) => {
      if (f !== "all") return false;
      return h.text.toLowerCase().includes(kw);
    });

  const combined = [...evResults, ...todoResults, ...habitResults].slice(0, 50);

  if (combined.length === 0) {
    panel.innerHTML = `<p class="sr-empty">「${escapeHtml(keyword)}」の検索結果はありません</p>`;
    return;
  }

  combined.forEach(item => {
    const card = document.createElement("div");

    if (item.type === "event") {
      const ev = item.ev;
      const isClass = ev.category === "class" || ev.category === "seminar";
      const color = isClass ? "#22c55e"
                  : ev.category === "travel" ? "#6366f1"
                  : ev.color || "#3b82f6";
      const icon  = isClass ? "🎓" : ev.allDay ? "📆" : "📅";
      const timeStr = ev.allDay ? "終日"
                    : ev.startTime ? `${ev.startTime}${ev.endTime ? "–" + ev.endTime : ""}` : "";
      const metaParts = [];
      if (isClass) {
        const room = [ev.campus, ev.room].filter(Boolean).join(" ");
        if (room) metaParts.push(room);
        if (ev.teacher) metaParts.push(ev.teacher);
      } else if (ev.detail) {
        metaParts.push(ev.detail.slice(0, 30));
      }
      card.className = "sr-card";
      card.style.borderLeftColor = color;
      card.innerHTML = `
        <span class="sr-icon">${icon}</span>
        <div class="sr-body">
          <div class="sr-title">${highlightMatch(ev.title, keyword)}</div>
          <div class="sr-meta">${escapeHtml(ev.date.slice(5).replace("-","/")+
            (timeStr ? " · " + timeStr : "") +
            (metaParts.length ? " · " + metaParts.join(" · ") : ""))}</div>
        </div>
        <span class="sr-arrow">›</span>`;
      card.onclick = () => _searchGoToDate(ev.date);

    } else if (item.type === "todo") {
      const t = item.t;
      const isAssign = t.category === "assignment";
      const color = t.done ? "#9ca3af"
                  : isAssign ? "#eab308"
                  : t.deadline && t.deadline < formatDate(new Date()) ? "#ef4444"
                  : "#f97316";
      const icon = isAssign ? "📚" : t.done ? "✓" : "📌";
      const meta = [];
      if (isAssign && t.subject) meta.push(t.subject);
      if (t.deadline) meta.push(`締切 ${t.deadline.slice(5).replace("-", "/")}`);
      if (t.done) meta.push("完了済み");
      card.className = "sr-card";
      card.style.borderLeftColor = color;
      card.innerHTML = `
        <span class="sr-icon">${icon}</span>
        <div class="sr-body">
          <div class="sr-title${t.done ? " sr-done-text" : ""}">${highlightMatch(t.text, keyword)}</div>
          <div class="sr-meta">${escapeHtml(meta.join(" · "))}</div>
        </div>
        <span class="sr-arrow">›</span>`;
      card.onclick = () => _searchGoToTodo(isAssign);

    } else {
      const h = item.h;
      card.className = "sr-card";
      card.style.borderLeftColor = "#0369a1";
      card.innerHTML = `
        <span class="sr-icon">🔄</span>
        <div class="sr-body">
          <div class="sr-title">${highlightMatch(h.text, keyword)}</div>
          <div class="sr-meta">習慣 · ${h.duration || 0}分</div>
        </div>
        <span class="sr-arrow">›</span>`;
      card.onclick = () => { closeSearch(); switchTab("todo"); };
    }

    panel.appendChild(card);
  });
}

function _searchGoToDate(dateStr) {
  closeSearch();
  const [yr, mo] = dateStr.split("-").map(Number);
  if (currentYear !== yr || currentMonth !== mo - 1) {
    currentYear = yr;
    currentMonth = mo - 1;
    createCalendar();
  }
  switchTab("month");
  setTimeout(() => openModal(dateStr), 30);
}

function _searchGoToTodo(isAssignment) {
  closeSearch();
  switchTab("todo");
  if (isAssignment) switchTodoView("subject");
  else switchTodoView("all");
}

let notifiedEventKeys = JSON.parse(localStorage.getItem("notifiedEventKeys")) || [];
let notifiedTodoKeys  = JSON.parse(localStorage.getItem("notifiedTodoKeys"))  || [];
let todoNotifSettings = JSON.parse(localStorage.getItem("todoNotifSettings")) || {
  today:     true,
  overdue:   true,
  execution: true,
  assignEve: true,
};
let commuteSettings = JSON.parse(localStorage.getItem("commuteSettings")) || {
  defaultCommuteMinutes: 0,
  delayMinutes: 0
};

function renderTodayNotice() {
  const notice = document.getElementById("today-notice");
  if (!notice) return;

  const todayString = formatDate(new Date());
  const todayEvents = events
    .filter(event => event.date === todayString && event.category !== "birthday")
    .sort(sortEventsByTimeAndType);
  const unfinishedTodos = todos.filter(todo => !todo.done && todo.deadline <= todayString);
  const nextEvent = todayEvents.find(event => !event.allDay && event.startTime);

  let html = "";

  if (nextEvent) {
    const delay = Number(commuteSettings.delayMinutes || 0);
    const commute = nextEvent.needsCommute ? Number(commuteSettings.defaultCommuteMinutes || 0) : 0;
    const buffer = commute + delay;
    const departure = buffer > 0 ? subtractMinutesFromTime(nextEvent.startTime, buffer) : "未設定";
    html += `<div><strong>次の予定：</strong>${nextEvent.startTime} ${escapeHtml(nextEvent.title)}</div>`;
    if (buffer > 0) {
      html += `<div><strong>出発目安：</strong>${departure}（移動${commute}分＋遅延${delay}分）</div>`;
    }
  }

  if (unfinishedTodos.length > 0) {
    html += `<div><strong>締切が近いToDo：</strong>${unfinishedTodos.length}件</div>`;
  }

  notice.innerHTML = html || `<div>今日の予定を確認できます。</div>`;
}

function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("このブラウザは通知に対応していません");
    return;
  }
  if (!authToken) {
    alert("通知を設定するにはログインが必要です。\nアカウントメニューからログインしてください。");
    return;
  }
  Notification.requestPermission().then(async permission => {
    if (permission === "granted") {
      await registerServiceWorker();
      await subscribeToPush();
      alert("通知を有効にしました。授業の30分前に教室・場所を通知します。");
    } else {
      alert("通知が許可されませんでした。スマホの設定から許可してください。");
    }
  });
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("sw.js");
  } catch { /* 登録失敗は無視 */ }
}

async function subscribeToPush() {
  if (!authToken) return;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  try {
    const keyRes = await fetch(`${API_BASE}/push/vapid-public-key`);
    const { publicKey } = await keyRes.json();
    if (!publicKey) return;

    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) await existing.unsubscribe();

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: _urlBase64ToUint8Array(publicKey),
    });

    await fetch(`${API_BASE}/push/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({ subscription: sub.toJSON() }),
    });
  } catch { /* 購読失敗は無視 */ }
}

function _urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

function checkEventNotifications() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const now = new Date();
  const todayString = formatDate(now);
  const NOTIFY_MINUTES_BEFORE = 30;

  events.forEach(event => {
    if (event.allDay || event.date !== todayString || !event.startTime) return;

    const [hour, minute] = event.startTime.split(":").map(Number);
    const start = new Date();
    start.setHours(hour, minute, 0, 0);

    const minutesBefore = NOTIFY_MINUTES_BEFORE;
    const notifyAt = new Date(start.getTime() - minutesBefore * 60000);
    const diff = now - notifyAt;
    const key = `${event.date}-${event.title}-${event.startTime}`;

    if (diff >= 0 && diff < 60000 && !notifiedEventKeys.includes(key)) {
      const lines = [`${event.startTime}〜${event.endTime || ""} から始まります`];
      if (event.room)   lines.push(`教室：${event.room}`);
      if (event.campus) lines.push(`キャンパス：${event.campus}`);
      if (event.teacher) lines.push(`担当：${event.teacher}`);

      const body = lines.join("\n");
      showNotification(event.title, body, key);
      notifiedEventKeys.push(key);
      localStorage.setItem("notifiedEventKeys", JSON.stringify(notifiedEventKeys.slice(-100)));
    }
  });
}

function showNotification(title, body, tag) {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "SHOW_NOTIFICATION", title, body, tag });
  } else {
    new Notification(title, { body });
  }
}

// ─── Phase 11: ToDo・課題通知 ─────────────────────────────────────────────────

function saveTodoNotifSettings() {
  todoNotifSettings = {
    today:     document.getElementById("notif-todo-today")?.checked  ?? true,
    overdue:   document.getElementById("notif-todo-overdue")?.checked ?? true,
    execution: document.getElementById("notif-todo-exec")?.checked   ?? true,
    assignEve: document.getElementById("notif-assign-eve")?.checked  ?? true,
  };
  localStorage.setItem("todoNotifSettings", JSON.stringify(todoNotifSettings));
}

function loadTodoNotifSettingsToUI() {
  const s = todoNotifSettings;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };
  set("notif-todo-today",   s.today);
  set("notif-todo-overdue", s.overdue);
  set("notif-todo-exec",    s.execution);
  set("notif-assign-eve",   s.assignEve);
}

function _saveTodoNotifKeys() {
  localStorage.setItem("notifiedTodoKeys", JSON.stringify(notifiedTodoKeys.slice(-200)));
}

function checkTodoNotifications() {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const now = new Date();
  const h = now.getHours();
  const todayStr = formatDate(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDate(tomorrow);

  // 朝 8:00〜11:59: 今日締切・期限切れ・実行日通知
  if (h >= 8 && h < 12) {
    const morningKey = `morning-${todayStr}`;
    if (!notifiedTodoKeys.includes(morningKey)) {
      _fireMorningTodoNotifs(todayStr, tomorrowStr);
      notifiedTodoKeys.push(morningKey);
      _saveTodoNotifKeys();
    }
  }

  // 夜 21:00〜22:59: 明日締切の課題通知
  if (h >= 21 && h < 23) {
    const eveKey = `evening-${todayStr}`;
    if (!notifiedTodoKeys.includes(eveKey)) {
      _fireEveningAssignNotifs(tomorrowStr);
      notifiedTodoKeys.push(eveKey);
      _saveTodoNotifKeys();
    }
  }
}

function _fireMorningTodoNotifs(todayStr, tomorrowStr) {
  const s = todoNotifSettings;
  const fmt = list => list.slice(0, 3).map(t => `・${t.text}`).join("\n");

  const dueToday = todos.filter(t => !t.done && t.deadline === todayStr);
  const overdue  = todos.filter(t => !t.done && t.deadline && t.deadline < todayStr);
  const execToday = todos.filter(t =>
    !t.done && t.executionDate === todayStr && t.deadline !== todayStr
  );

  if (s.today && dueToday.length > 0) {
    showNotification(
      `📌 今日締切 ${dueToday.length}件`,
      fmt(dueToday),
      `todo-today-${todayStr}`
    );
  }
  if (s.overdue && overdue.length > 0) {
    showNotification(
      `⚠ 期限切れ ${overdue.length}件`,
      fmt(overdue),
      `todo-overdue-${todayStr}`
    );
  }
  if (s.execution && execToday.length > 0) {
    showNotification(
      `📅 今日やること ${execToday.length}件`,
      fmt(execToday),
      `todo-exec-${todayStr}`
    );
  }
}

function _fireEveningAssignNotifs(tomorrowStr) {
  if (!todoNotifSettings.assignEve) return;
  const assigns = todos.filter(t =>
    !t.done && t.deadline === tomorrowStr && t.category === "assignment"
  );
  if (assigns.length === 0) return;
  const fmt = list => list.slice(0, 3).map(t => `・${t.text}`).join("\n");
  showNotification(
    `📚 明日締切の課題 ${assigns.length}件`,
    fmt(assigns),
    `assign-eve-${tomorrowStr}`
  );
}

function openCommuteModal() {
  closeFloatingMenu();
  document.getElementById("commute-modal").classList.remove("hidden");
  document.getElementById("default-commute-minutes").value = String(commuteSettings.defaultCommuteMinutes || 0);
  document.getElementById("delay-minutes").value = String(commuteSettings.delayMinutes || 0);
  loadTodoNotifSettingsToUI();
  renderCommuteAdvice();
  fetchTrainDelays();
}

function closeCommuteModal() {
  document.getElementById("commute-modal").classList.add("hidden");
}

function closeCommuteModalByOutside(event) {
  if (event.target.id === "commute-modal") closeCommuteModal();
}

function saveCommuteSettings() {
  commuteSettings = {
    defaultCommuteMinutes: Number(document.getElementById("default-commute-minutes").value || 0),
    delayMinutes: Number(document.getElementById("delay-minutes").value || 0)
  };
  localStorage.setItem("commuteSettings", JSON.stringify(commuteSettings));
  renderCommuteAdvice();
  renderTodayNotice();
}

function renderCommuteAdvice() {
  const area = document.getElementById("commute-advice");
  if (!area) return;

  const todayString = formatDate(new Date());
  const nextEvent = events
    .filter(event => event.date >= todayString && !event.allDay && event.startTime && event.category !== "travel")
    .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))[0];

  if (!nextEvent) {
    area.innerHTML = `<p>次の予定がありません。</p>`;
    return;
  }

  const total = Number(commuteSettings.defaultCommuteMinutes || 0) + Number(commuteSettings.delayMinutes || 0);
  const departure = total > 0 ? subtractMinutesFromTime(nextEvent.startTime, total) : "未設定";

  area.innerHTML = `
    <h3>次の予定</h3>
    <div>${nextEvent.date} ${nextEvent.startTime} ${escapeHtml(nextEvent.title)}</div>
    <div>出発目安：${departure}</div>
  `;
}

function openShareModal() {
  closeFloatingMenu();
  document.getElementById("share-modal").classList.remove("hidden");
  if (authToken) {
    document.getElementById("account-share-section").classList.remove("hidden");
    loadShareInvites();
    loadShareFriends();
  } else {
    document.getElementById("account-share-section").classList.add("hidden");
  }
}

function closeShareModal() {
  document.getElementById("share-modal").classList.add("hidden");
}

function closeShareModalByOutside(event) {
  if (event.target.id === "share-modal") closeShareModal();
}

function exportShareData() {
  const data = {
    version: 2,
    exportedAt: new Date().toISOString(),
    events,
    todos,
    habits
  };
  document.getElementById("share-text").value = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function importShareData() {
  const text = document.getElementById("share-text").value.trim();
  if (!text) {
    alert("共有データを貼り付けてください");
    return;
  }

  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(text))));
    if (!Array.isArray(data.events) || !Array.isArray(data.todos)) {
      throw new Error("形式が違います");
    }

    // _fromSchedule / sched- イベントは除外してからマージ（重複防止）
    const importedEvents = data.events.filter(e =>
      !e._fromSchedule && !(typeof e.id === "string" && e.id.startsWith("sched-"))
    );
    events = [...events, ...importedEvents];
    todos = [...todos, ...data.todos];
    if (Array.isArray(data.habits)) habits = [...habits, ...data.habits];
    saveToLocalStorage();
    localStorage.setItem("todos", JSON.stringify(todos));
    localStorage.setItem("habits", JSON.stringify(habits));
    refreshScheduleEvents();
    createCalendar();
    renderTodayNotice();
    alert("共有データを取り込みました");
  } catch (error) {
    alert("共有データを読み込めませんでした");
  }
}

let pickerYear;

function updateMonthLabel() {
  const currentMonthElement = document.getElementById("current-month");
  if (!currentMonthElement) return;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  currentMonthElement.textContent = `${year}年${month}月`;
}

function openMonthPicker() {
  const monthPicker = document.getElementById("monthPicker");

  if (!monthPicker) {
    alert("monthPicker が見つかっていません");
    return;
  }

  pickerYear = currentDate.getFullYear();
  updateMonthPicker();

  monthPicker.classList.remove("hidden");
}

function closeMonthPicker() {
  const monthPicker = document.getElementById("monthPicker");
  if (!monthPicker) return;

  monthPicker.classList.add("hidden");
}

function updateMonthPicker() {
  const pickerYearLabel = document.getElementById("pickerYear");
  if (!pickerYearLabel) return;

  pickerYearLabel.textContent = `${pickerYear}年`;

  const monthButtons = document.querySelectorAll(".month-grid button");

  monthButtons.forEach((button) => {
    const onclickText = button.getAttribute("onclick");
    if (!onclickText) return;

    const match = onclickText.match(/selectMonth\((\d+)\)/);
    if (!match) return;

    const monthIndex = Number(match[1]);

    const isActive =
      pickerYear === currentDate.getFullYear() &&
      monthIndex === currentDate.getMonth();

    button.classList.toggle("active", isActive);
  });
}

function changePickerYear(amount) {
  pickerYear += amount;
  updateMonthPicker();
}

document.addEventListener("click", function (event) {
  const monthPicker = document.getElementById("monthPicker");
  const panel = document.querySelector(".month-picker-panel");

  if (!monthPicker || monthPicker.classList.contains("hidden")) return;

  if (event.target === monthPicker && panel && !panel.contains(event.target)) {
    closeMonthPicker();
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    const overlay = document.getElementById("search-overlay");
    if (overlay && !overlay.classList.contains("hidden")) closeSearch();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  if (typeof setupTimeSelects === "function") {
    setupTimeSelects();
  }

  createCalendar();
  updateMonthLabel();
  setupCalendarSwipe();
  renderTodayNotice();
  setInterval(checkEventNotifications, 60000);
  setInterval(checkTodoNotifications, 60000);
  checkTodoNotifications();
  updateAccountMenuBtn();
  registerServiceWorker();
  pullFromServer();
  updateTodoBadge();
  updateBnavTodoBadge();
  renderTodoStrip();
  renderTodayPanel();
  obInit();
});
function renderMonthScroll() {
  const monthScroll = document.getElementById("month-scroll");
  if (!monthScroll) return;

  // 初回だけ月バーを作る
  if (monthScroll.dataset.rendered !== "true") {
    monthScroll.innerHTML = "";

    const baseYear = today.getFullYear();
    const baseMonth = today.getMonth();

    // 今日を中心に前後3年分
    for (let i = -36; i <= 36; i++) {
      const date = new Date(baseYear, baseMonth + i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();

      const prevDate = new Date(baseYear, baseMonth + i - 1, 1);
      const prevYear = prevDate.getFullYear();

      // 一番左、または年が変わるところだけ年ラベルを表示
      const shouldShowYearLabel = i === -36 || year !== prevYear;

      if (shouldShowYearLabel) {
        const yearLabel = document.createElement("span");
        yearLabel.className = "month-year-label";
        yearLabel.textContent = year;
        monthScroll.appendChild(yearLabel);
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "month-chip";
      button.textContent = `${month + 1}月`;

      button.dataset.year = year;
      button.dataset.month = month;

      button.onclick = function () {
        currentYear = year;
        currentMonth = month;
        currentDate = new Date(currentYear, currentMonth, 1);

        createCalendar();
        updateMonthLabel();
      };

      monthScroll.appendChild(button);
    }

    monthScroll.dataset.rendered = "true";
  }

  updateMonthScrollActive();
}
function updateMonthScrollActive() {
  const monthScroll = document.getElementById("month-scroll");
  if (!monthScroll) return;

  const buttons = monthScroll.querySelectorAll(".month-chip");

  buttons.forEach(button => {
    const buttonYear = Number(button.dataset.year);
    const buttonMonth = Number(button.dataset.month);

    const isActive =
      buttonYear === currentYear &&
      buttonMonth === currentMonth;

    button.classList.toggle("active", isActive);
  });

  const activeButton = monthScroll.querySelector(".month-chip.active");
  if (!activeButton) return;

  const containerRect = monthScroll.getBoundingClientRect();
  const activeRect = activeButton.getBoundingClientRect();

  const leftLimit = containerRect.left + 36;
  const rightLimit = containerRect.right - 36;

  // 左端に近づいたら少しだけ左へスクロール
  if (activeRect.left < leftLimit) {
    monthScroll.scrollBy({
      left: activeRect.left - leftLimit,
      behavior: "smooth"
    });
  }

  // 右端に近づいたら少しだけ右へスクロール
  if (activeRect.right > rightLimit) {
    monthScroll.scrollBy({
      left: activeRect.right - rightLimit,
      behavior: "smooth"
    });
  }
}

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function setupCalendarSwipe() {
  const calendar = document.getElementById("calendar");
  if (!calendar) return;

  calendar.addEventListener("touchstart", function (event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
  }, { passive: true });

  calendar.addEventListener("touchend", function (event) {
    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;

    handleCalendarSwipe();
  }, { passive: true });
}

function handleCalendarSwipe() {
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;

  if (Math.abs(diffY) > Math.abs(diffX)) return;
  if (Math.abs(diffX) < 50) return;

  if (diffX < 0) {
    changeMonthWithSlide("next");
  } else {
    changeMonthWithSlide("prev");
  }
}
function subtractMinutesFromTime(time, minutesToSubtract) {
  const [hour, minute] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(0);
  date.setMilliseconds(0);

  date.setMinutes(date.getMinutes() - minutesToSubtract);

  const newHour = String(date.getHours()).padStart(2, "0");
  const newMinute = String(date.getMinutes()).padStart(2, "0");

  return `${newHour}:${newMinute}`;
}

function goToToday() {
  currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
  syncCurrentDateParts();
  createCalendar();
  updateMonthLabel();
  updateMonthScrollActive();
}

function selectEventColor(el) {
  const color = el.dataset.color;
  document.getElementById("event-color").value = color;
  updateColorPickerSelection(color);
}

function updateColorPickerSelection(color) {
  document.querySelectorAll(".color-swatch").forEach(swatch => {
    swatch.classList.toggle("selected", swatch.dataset.color === color);
  });
}

function getEventColor(event) {
  if (event.color) return event.color;
  if (event.category === "class") return "#22c55e";
  if (event.category === "seminar") return "#a855f7";
  if (event.category === "travel") return "#6366f1";
  if (event.category === "birthday") return "#f59e0b";
  return "#3b82f6";
}

function autoSetEndTime() {
  const sh = document.getElementById("start-hour");
  const sm = document.getElementById("start-minute");
  const eh = document.getElementById("end-hour");
  const em = document.getElementById("end-minute");
  if (!sh || !eh) return;
  const h = parseInt(sh.value, 10);
  if (isNaN(h)) return;
  const nextH = h + 1;
  if (nextH <= 23) {
    eh.value = String(nextH).padStart(2, "0");
    if (em && sm) em.value = sm.value;
  }
}

function setupTimeSelects() {
  ["start", "end"].forEach(type => {
    const hourSel = document.getElementById(`${type}-hour`);
    const minSel = document.getElementById(`${type}-minute`);
    if (!hourSel || !minSel) return;

    for (let h = 0; h < 24; h++) {
      const opt = document.createElement("option");
      opt.value = String(h).padStart(2, "0");
      opt.textContent = String(h).padStart(2, "0");
      hourSel.appendChild(opt);
    }

    [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].forEach(m => {
      const opt = document.createElement("option");
      opt.value = String(m).padStart(2, "0");
      opt.textContent = String(m).padStart(2, "0");
      minSel.appendChild(opt);
    });
  });
}

// ─── Account & Sync ──────────────────────────────────────────────────────────
const API_BASE = "https://carendar-app.onrender.com";
let authTab = "login";

function openAccountModal() {
  closeFloatingMenu();
  updateAccountModalUI();
  document.getElementById("account-modal").classList.remove("hidden");
}

function closeAccountModal() {
  document.getElementById("account-modal").classList.add("hidden");
  const errEl = document.getElementById("account-error");
  if (errEl) errEl.textContent = "";
}

function closeAccountModalByOutside(event) {
  if (event.target.id === "account-modal") closeAccountModal();
}

function switchAuthTab(tab) {
  authTab = tab;
  document.getElementById("tab-login").classList.toggle("active", tab === "login");
  document.getElementById("tab-register").classList.toggle("active", tab === "register");
  document.getElementById("account-submit-btn").textContent =
    tab === "login" ? "ログイン" : "新規登録";
  document.getElementById("account-error").textContent = "";
  const confirmEl = document.getElementById("account-password-confirm");
  if (confirmEl) {
    confirmEl.classList.toggle("hidden", tab === "login");
    confirmEl.value = "";
  }
}

function updateAccountModalUI() {
  const loggedin = document.getElementById("account-loggedin");
  const loggedout = document.getElementById("account-loggedout");
  const label = document.getElementById("account-user-label");
  if (!loggedin || !loggedout) return;

  if (authToken && authUsername) {
    loggedin.classList.remove("hidden");
    loggedout.classList.add("hidden");
    if (label) label.textContent = `${authUsername} さんでログイン中`;
  } else {
    loggedin.classList.add("hidden");
    loggedout.classList.remove("hidden");
  }
}

function updateAccountMenuBtn() {
  const btn = document.getElementById("account-menu-btn");
  if (!btn) return;
  btn.textContent = authUsername ? `${authUsername}` : "アカウント";
}

async function submitAuth() {
  if (authTab === "login") {
    await doLogin();
  } else {
    await doRegister();
  }
}

async function doLogin() {
  const username = document.getElementById("account-username").value.trim();
  const password = document.getElementById("account-password").value;
  const errEl = document.getElementById("account-error");

  if (!username || !password) {
    errEl.textContent = "ユーザー名とパスワードを入力してください";
    return;
  }

  errEl.textContent = "";
  document.getElementById("account-submit-btn").disabled = true;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errEl.textContent = data.detail || "ログインに失敗しました";
      return;
    }

    authToken = data.token;
    authUsername = data.username;
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("authUsername", authUsername);

    updateAccountMenuBtn();
    await pullFromServer();
    updateAccountModalUI();
    if (Notification.permission === "granted") subscribeToPush();
  } catch {
    errEl.textContent = "サーバーに接続できませんでした（FastAPIが起動しているか確認してください）";
  } finally {
    document.getElementById("account-submit-btn").disabled = false;
  }
}

async function doRegister() {
  const username = document.getElementById("account-username").value.trim();
  const password = document.getElementById("account-password").value;
  const confirm  = document.getElementById("account-password-confirm").value;
  const errEl = document.getElementById("account-error");

  if (!username || !password) {
    errEl.textContent = "ユーザー名とパスワードを入力してください";
    return;
  }
  if (password !== confirm) {
    errEl.textContent = "パスワードが一致しません";
    return;
  }

  errEl.textContent = "";
  document.getElementById("account-submit-btn").disabled = true;

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errEl.textContent = data.detail || "登録に失敗しました";
      return;
    }

    authToken = data.token;
    authUsername = data.username;
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("authUsername", authUsername);

    updateAccountMenuBtn();
    updateAccountModalUI();
    await syncToServer();
    alert(`${authUsername} さんのアカウントを作成しました`);
  } catch {
    errEl.textContent = "サーバーに接続できませんでした（FastAPIが起動しているか確認してください）";
  } finally {
    document.getElementById("account-submit-btn").disabled = false;
  }
}

async function doLogout() {
  if (!authToken) return;

  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${authToken}` },
    });
  } catch { /* サーバーが落ちていても手元のトークンは消す */ }

  authToken = null;
  authUsername = null;
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUsername");

  updateAccountMenuBtn();
  updateAccountModalUI();
  alert("ログアウトしました");
}

async function deleteAccount() {
  if (!confirm("アカウントを削除しますか？\nすべての予定・ToDoも削除されます。この操作は取り消せません。")) return;
  try {
    const res = await fetch(`${API_BASE}/auth/delete`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${authToken}` },
    });
    if (!res.ok) { alert("削除に失敗しました"); return; }
    authToken = null;
    authUsername = null;
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUsername");
    localStorage.removeItem("onboardingDone");
    localStorage.removeItem("classSchedule");
    localStorage.removeItem("userFaculty");
    updateAccountMenuBtn();
    updateAccountModalUI();
    closeAccountModal();
    alert("アカウントを削除しました。\nページをリロードすると最初からやり直せます。");
  } catch { alert("サーバーに接続できませんでした"); }
}

// ── 同期バナー制御 ────────────────────────────────────────────────────────────
let _syncRetryCount = 0;
const SYNC_MAX_RETRIES = 4;
const SYNC_RETRY_DELAYS = [8000, 15000, 25000, 40000]; // スリープ起動を待つ間隔

function _showSyncBanner(state, msg) {
  const banner  = document.getElementById("sync-banner");
  const icon    = document.getElementById("sync-banner-icon");
  const msgEl   = document.getElementById("sync-banner-msg");
  const retryBtn = document.getElementById("sync-retry-btn");
  if (!banner) return;
  banner.className = "sync-banner" + (state === "error" ? " sync-error" : state === "ok" ? " sync-ok" : "");
  icon.className   = "sync-banner-icon" + (state === "loading" ? " spinning" : "");
  icon.textContent = state === "loading" ? "↻" : state === "ok" ? "✓" : "!";
  msgEl.textContent = msg;
  retryBtn.classList.toggle("hidden", state !== "error");
  document.body.classList.add("sync-visible");
}

function _hideSyncBanner() {
  const banner = document.getElementById("sync-banner");
  if (banner) banner.classList.add("hidden");
  document.body.classList.remove("sync-visible");
}

function retrySyncNow() {
  _syncRetryCount = 0;
  pullFromServer(true);
}

async function _applyServerData(data) {
  if (Array.isArray(data.events)) {
    events = data.events;
    localStorage.setItem("events", JSON.stringify(events));
  }
  if (Array.isArray(data.todos)) {
    todos = data.todos;
    localStorage.setItem("todos", JSON.stringify(todos));
  }
  if (Array.isArray(data.habits)) {
    habits = data.habits;
    localStorage.setItem("habits", JSON.stringify(habits));
  }
  if (data.classSchedule && typeof data.classSchedule === "object") {
    const cs = data.classSchedule;
    obClassSchedule = {
      zenki: Array.isArray(cs.zenki) ? cs.zenki : [],
      kouki: Array.isArray(cs.kouki) ? cs.kouki : [],
    };
    localStorage.setItem("classSchedule", JSON.stringify(obClassSchedule));
  }
  if (data.habitLogs && typeof data.habitLogs === "object") {
    habitLogs = data.habitLogs;
    localStorage.setItem("habitLogs", JSON.stringify(habitLogs));
  }
  _pulledFromServer = true;
  refreshScheduleEvents();
  createCalendar();
  renderTodayNotice();
  renderTodayPanel();
  loadSharedEvents();
}

async function pullFromServer(showBanner = false) {
  if (!authToken) return;

  if (showBanner) {
    _showSyncBanner("loading", "データを同期中...");
  }

  // Renderのスリープ明け対策: 起動に時間がかかるので長めのタイムアウトを設定
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 70000); // 70秒タイムアウト（Renderの起動に最大60秒かかる）

  // 5秒経っても応答がなければバナーを表示してユーザーに知らせる
  let slowTimerId = null;
  if (!showBanner) {
    slowTimerId = setTimeout(() => {
      _showSyncBanner("loading", "サーバー起動中です。しばらくお待ちください...");
    }, 5000);
  }

  try {
    const res = await fetch(`${API_BASE}/data`, {
      headers: { "Authorization": `Bearer ${authToken}` },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    clearTimeout(slowTimerId);

    if (res.status === 401) {
      authToken = null;
      authUsername = null;
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUsername");
      updateAccountMenuBtn();
      _hideSyncBanner();
      return;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    await _applyServerData(data);

    _syncRetryCount = 0;
    _showSyncBanner("ok", "同期完了");
    setTimeout(_hideSyncBanner, 2000);

  } catch (err) {
    clearTimeout(timeoutId);
    clearTimeout(slowTimerId);

    if (_syncRetryCount < SYNC_MAX_RETRIES) {
      const delay = SYNC_RETRY_DELAYS[_syncRetryCount];
      const seconds = Math.round(delay / 1000);
      _showSyncBanner("loading", `サーバー起動中... ${seconds}秒後に再試行 (${_syncRetryCount + 1}/${SYNC_MAX_RETRIES})`);
      _syncRetryCount++;
      setTimeout(() => pullFromServer(true), delay);
    } else {
      _showSyncBanner("error", "接続できませんでした。ローカルデータで表示しています");
    }
  }
}

function refreshScheduleEvents() {
  const saved = localStorage.getItem("classSchedule");
  if (!saved) return;
  try {
    obClassSchedule = JSON.parse(saved);
    obClassesToEvents();
  } catch { /* 不正なデータは無視 */ }
}

async function syncToServer() {
  if (!authToken) return;
  // サーバーデータ未取得かつローカルが空の場合は上書きしない（別端末でのデータ消失を防ぐ）
  if (!_pulledFromServer && events.length === 0 && todos.length === 0 && habits.length === 0) return;

  try {
    await fetch(`${API_BASE}/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        events,
        todos,
        habits,
        classSchedule: obClassSchedule || {},
        habitLogs: habitLogs || {},
      }),
    });
  } catch { /* サーバー未起動の場合はローカル保存のみで続行 */ }
}

// ─── Habit functions ──────────────────────────────────────────────────────────

function saveHabits() {
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("habitLogs", JSON.stringify(habitLogs));
  localStorage.setItem("habitTimeLogs", JSON.stringify(habitTimeLogs));
  syncToServer();
}

function formatDuration(min) {
  min = Number(min) || 0;
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}時間${m}分` : `${h}時間`;
  }
  return `${min}分`;
}

function isHabitActiveOn(habit, date) {
  if (habit.archived) return false;
  const freq = habit.frequencyType || "daily";
  const dow = date.getDay();
  if (freq === "daily")   return true;
  if (freq === "weekday") return dow >= 1 && dow <= 5;
  if (freq === "weekend") return dow === 0 || dow === 6;
  if (freq === "weekly")  return true;
  if (freq === "custom")  return (habit.selectedDays || []).includes(dow);
  return true;
}

function getHabitStreak(habitId) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return 0;
  const today = new Date();
  const todayStr = formatDate(today);
  const todayDone = (habitLogs[todayStr] || []).includes(habitId);
  let streak = 0;
  const startOffset = todayDone ? 0 : 1;
  for (let i = startOffset; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (!isHabitActiveOn(habit, d)) continue;
    if ((habitLogs[formatDate(d)] || []).includes(habitId)) streak++;
    else break;
  }
  return streak;
}

function getHabitWeeklyCount(habitId) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    if (d > today) break;
    if ((habitLogs[formatDate(d)] || []).includes(habitId)) count++;
  }
  return count;
}

function isHabitDoneToday(habitId) {
  return (habitLogs[formatDate(new Date())] || []).includes(habitId);
}

function toggleHabitDone(habitId) {
  const todayStr = formatDate(new Date());
  if (!habitLogs[todayStr]) habitLogs[todayStr] = [];
  const idx = habitLogs[todayStr].indexOf(habitId);
  if (idx === -1) habitLogs[todayStr].push(habitId);
  else habitLogs[todayStr].splice(idx, 1);
  saveHabits();
  createCalendar();
  refreshActiveTabView();
}

function deleteHabit(habitId) {
  if (!confirm("この習慣を削除しますか？")) return;
  habits = habits.filter(h => h.id !== habitId);
  for (const date in habitLogs) {
    habitLogs[date] = habitLogs[date].filter(id => id !== habitId);
  }
  saveHabits();
  createCalendar();
  renderRecordsTab();
}

function renderHabitList() {
  const bodyEl = document.getElementById("habit-modal-body");
  if (!bodyEl) return;

  const today = new Date();
  const todayStr = formatDate(today);
  const loggedIds = habitLogs[todayStr] || [];
  const activeHabits   = habits.filter(h => !h.archived && isHabitActiveOn(h, today));
  const inactiveHabits = habits.filter(h => !h.archived && !isHabitActiveOn(h, today));

  if (habits.filter(h => !h.archived).length === 0) {
    bodyEl.innerHTML = `<p class="habit-empty">まだ習慣がありません。<br>「＋ 追加」から習慣を登録しましょう。</p>`;
    return;
  }

  const makeCard = (h, isActive) => {
    const done   = isActive && loggedIds.includes(h.id);
    const streak = getHabitStreak(h.id);
    const wCount = getHabitWeeklyCount(h.id);
    const dur    = formatDuration(h.duration);
    const freqLabel = { daily:"毎日", weekday:"平日", weekend:"週末", weekly:`週${h.weeklyTarget||3}回`, custom:"カスタム" }[h.frequencyType || "daily"] || "毎日";
    return `
      <div class="habit-card${done ? " habit-card-done" : ""}${!isActive ? " habit-card-inactive" : ""}">
        ${isActive ? `<button class="habit-check-btn${done ? " checked" : ""}" onclick="toggleHabitDone(${h.id})">${done ? "✓" : ""}</button>` : `<div class="habit-check-btn habit-check-placeholder"></div>`}
        <div class="habit-card-info">
          <div class="habit-card-name">${escapeHtml(h.text)}</div>
          <div class="habit-card-meta">
            <span>${dur}</span>
            <span class="habit-freq-tag">${freqLabel}</span>
            ${streak > 0 ? `<span class="habit-streak">🔥 ${streak}日</span>` : ""}
            <span class="habit-week-count">今週 ${wCount}回</span>
          </div>
        </div>
        <div class="habit-card-actions">
          <button class="habit-edit-btn" onclick="openHabitFormModal(${h.id})">✏️</button>
          <button class="habit-delete-icon-btn" onclick="deleteHabit(${h.id})">×</button>
        </div>
      </div>`;
  };

  let html = "";
  if (activeHabits.length > 0) {
    html += `<div class="habit-section-label">今日の習慣</div>`;
    html += activeHabits.map(h => makeCard(h, true)).join("");
  }
  if (inactiveHabits.length > 0) {
    html += `<div class="habit-section-label habit-label-dim">今日はお休み</div>`;
    html += inactiveHabits.map(h => makeCard(h, false)).join("");
  }
  bodyEl.innerHTML = html;
}

// ─── Habit list modal ────────────────────────────────────────────────────────

function openHabitListModal() {
  renderHabitList();
  document.getElementById("habit-list-modal").classList.remove("hidden");
}

function closeHabitListModal() {
  document.getElementById("habit-list-modal").classList.add("hidden");
}

function closeHabitListModalByOutside(event) {
  if (event.target === document.getElementById("habit-list-modal")) closeHabitListModal();
}

// ─── Habit form modal ────────────────────────────────────────────────────────

let _habitFormSelectedDays = [];

function openHabitFormModal(habitId = null) {
  const modal = document.getElementById("habit-form-modal");
  _habitFormSelectedDays = [];

  if (habitId) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    document.getElementById("habit-form-title").textContent = "習慣を編集";
    document.getElementById("habit-edit-id").value = habitId;
    document.getElementById("habit-name-input").value = habit.text;
    document.getElementById("habit-duration-input").value = habit.duration || 30;
    document.getElementById("habit-time-input").value = habit.timeOfDay || "";
    document.getElementById("habit-notify-input").checked = !!habit.notifyEnabled;
    document.getElementById("habit-memo-input").value = habit.memo || "";
    const freq = habit.frequencyType || "daily";
    setHabitFreq(freq);
    if (freq === "weekly") document.getElementById("habit-weekly-target").value = habit.weeklyTarget || 3;
    if (freq === "custom") { _habitFormSelectedDays = [...(habit.selectedDays || [])]; _updateHabitDayButtons(); }
  } else {
    document.getElementById("habit-form-title").textContent = "習慣を追加";
    document.getElementById("habit-edit-id").value = "";
    document.getElementById("habit-name-input").value = "";
    document.getElementById("habit-duration-input").value = "30";
    document.getElementById("habit-time-input").value = "";
    document.getElementById("habit-notify-input").checked = false;
    document.getElementById("habit-memo-input").value = "";
    setHabitFreq("daily");
  }
  modal.classList.remove("hidden");
  setTimeout(() => document.getElementById("habit-name-input")?.focus(), 100);
}

function closeHabitFormModal() {
  document.getElementById("habit-form-modal").classList.add("hidden");
}

function closeHabitFormModalByOutside(event) {
  if (event.target === document.getElementById("habit-form-modal")) closeHabitFormModal();
}

function setHabitFreq(freq) {
  ["daily","weekday","weekend","weekly","custom"].forEach(f => {
    document.getElementById(`hfb-${f}`)?.classList.toggle("hfb-active", f === freq);
  });
  document.getElementById("habit-weekly-input")?.classList.toggle("hidden", freq !== "weekly");
  document.getElementById("habit-custom-days")?.classList.toggle("hidden", freq !== "custom");
  document.getElementById("habit-form-modal")?.setAttribute("data-freq", freq);
}

function toggleHabitDay(day) {
  const idx = _habitFormSelectedDays.indexOf(day);
  if (idx >= 0) _habitFormSelectedDays.splice(idx, 1);
  else _habitFormSelectedDays.push(day);
  _updateHabitDayButtons();
}

function _updateHabitDayButtons() {
  for (let i = 0; i < 7; i++) {
    document.getElementById(`hdb-${i}`)?.classList.toggle("hdb-active", _habitFormSelectedDays.includes(i));
  }
}

function saveHabitFromForm() {
  const name = document.getElementById("habit-name-input").value.trim();
  if (!name) { alert("習慣名を入力してください"); return; }
  const modal = document.getElementById("habit-form-modal");
  const freq  = modal.getAttribute("data-freq") || "daily";
  const editId = document.getElementById("habit-edit-id").value;
  const data = {
    text:          name,
    duration:      Number(document.getElementById("habit-duration-input").value),
    frequencyType: freq,
    selectedDays:  freq === "custom" ? [..._habitFormSelectedDays] : [],
    weeklyTarget:  freq === "weekly" ? Number(document.getElementById("habit-weekly-target").value) : 3,
    timeOfDay:     document.getElementById("habit-time-input").value,
    notifyEnabled: document.getElementById("habit-notify-input").checked,
    memo:          document.getElementById("habit-memo-input").value.trim(),
  };
  if (editId) {
    const idx = habits.findIndex(h => h.id === Number(editId));
    if (idx >= 0) habits[idx] = { ...habits[idx], ...data };
  } else {
    habits.push({ id: Date.now(), createdAt: formatDate(new Date()), archived: false, ...data });
  }
  saveHabits();
  createCalendar();
  closeHabitFormModal();
  renderRecordsTab();
}

function showHabits() { renderRecordsTab(); }

// ─── 電車遅延情報 ─────────────────────────────────────────────────────────────
async function fetchTrainDelays() {
  const el = document.getElementById("delay-result");
  if (!el) return;
  el.innerHTML = `<p style="font-size:13px;color:#6b7280;">取得中...</p>`;
  try {
    const res = await fetch(`${API_BASE}/train/delays`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data.delayed.length === 0) {
      el.innerHTML = `<p class="delay-normal">✅ 現在、遅延情報はありません</p>
        <p class="delay-updated">※ 約10分おきに更新されます</p>`;
    } else {
      const items = data.delayed.map(d =>
        `<div class="delay-item">🚃 <strong>${escapeHtml(d.name)}</strong> 遅延中</div>`
      ).join("");
      el.innerHTML = `<div class="delay-result-inner">${items}
        <p class="delay-updated">※ 約10分おきに更新されます</p></div>`;
    }
  } catch {
    el.innerHTML = `<p style="font-size:13px;color:#ef4444;">取得に失敗しました。サーバーを確認してください。</p>`;
  }
}

// ─── 予定共有 ──────────────────────────────────────────────────────────────────
let sharedEvents = [];

async function inviteShare() {
  const input = document.getElementById("share-invite-username");
  const username = input.value.trim();
  if (!username) { alert("ユーザー名を入力してください"); return; }
  try {
    const res = await fetch(`${API_BASE}/share/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.detail || "招待に失敗しました"); return; }
    input.value = "";
    alert(`${username} さんに招待を送りました`);
  } catch { alert("サーバーに接続できませんでした"); }
}

async function loadShareInvites() {
  const el = document.getElementById("share-invites-list");
  if (!el || !authToken) return;
  try {
    const res = await fetch(`${API_BASE}/share/invites`, {
      headers: { "Authorization": `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (!data.invites?.length) { el.innerHTML = ""; return; }
    el.innerHTML = `<p class="share-section-title" style="color:#d97706;">📩 受け取った招待</p>` +
      data.invites.map(inv => `
        <div class="share-invite-item">
          <span>👤 ${escapeHtml(inv.owner_name)} さんから</span>
          <div>
            <button onclick="acceptShareInvite(${inv.owner_id})">承認</button>
            <button onclick="rejectShareInvite(${inv.owner_id})">拒否</button>
          </div>
        </div>`).join("");
  } catch { el.innerHTML = ""; }
}

async function acceptShareInvite(ownerId) {
  await fetch(`${API_BASE}/share/accept/${ownerId}`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${authToken}` },
  });
  loadShareInvites();
  loadShareFriends();
  loadSharedEvents();
}

async function rejectShareInvite(ownerId) {
  await fetch(`${API_BASE}/share/${ownerId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${authToken}` },
  });
  loadShareInvites();
}

async function loadShareFriends() {
  const el = document.getElementById("share-friends-list");
  if (!el || !authToken) return;
  try {
    const res = await fetch(`${API_BASE}/share/friends`, {
      headers: { "Authorization": `Bearer ${authToken}` },
    });
    const data = await res.json();
    if (!data.friends?.length) { el.innerHTML = ""; return; }
    el.innerHTML = `<p class="share-section-title" style="color:#16a34a;">✅ 共有中の友達</p>` +
      data.friends.map(f => `
        <div class="share-friend-item">
          <span>👤 ${escapeHtml(f.owner_name)}</span>
          <button onclick="removeShare(${f.owner_id})">解除</button>
        </div>`).join("");
  } catch { el.innerHTML = ""; }
}

async function removeShare(ownerId) {
  if (!confirm("この共有を解除しますか？")) return;
  await fetch(`${API_BASE}/share/${ownerId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${authToken}` },
  });
  await loadSharedEvents();
  loadShareFriends();
}

async function loadSharedEvents() {
  if (!authToken) return;
  try {
    const res = await fetch(`${API_BASE}/share/events`, {
      headers: { "Authorization": `Bearer ${authToken}` },
    });
    const data = await res.json();
    sharedEvents = data.events || [];
    createCalendar();
  } catch { sharedEvents = []; }
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
const OB_PERIOD_TIMES = {
  1: { start: "09:00", end: "10:40" },
  2: { start: "10:50", end: "12:30" },
  3: { start: "13:20", end: "15:00" },
  4: { start: "15:10", end: "16:50" },
  5: { start: "17:00", end: "18:40" },
  6: { start: "18:50", end: "20:30" },
};

let obClassSchedule = { zenki: [], kouki: [] };
let obCurrentSemester = "zenki";
let obEditingCell = null;

function obInit() {
  if (localStorage.getItem("onboardingDone")) return;
  if (localStorage.getItem("authToken")) {
    localStorage.setItem("onboardingDone", "1");
    return;
  }
  document.getElementById("onboarding-overlay").classList.remove("hidden");
  obRenderTimetable();
}

function obSetStep(n) {
  ["1", "1b", "2", "3", "4"].forEach(s => {
    const el = document.getElementById(`ob-step-${s}`);
    if (el) el.classList.add("hidden");
  });
  document.getElementById(`ob-step-${n}`).classList.remove("hidden");
  const stepNum = n === "1b" ? 1 : Number(n);
  [1, 2, 3, 4].forEach(i => {
    const dot = document.getElementById(`ob-dot-${i}`);
    if (!dot) return;
    dot.className = "ob-dot" + (i === stepNum ? " active" : i < stepNum ? " done" : "");
  });
}

function obShowLogin(e) {
  e.preventDefault();
  obSetStep("1b");
}
function obShowRegister(e) {
  e.preventDefault();
  obSetStep("1");
}

function obCheckPasswordMatch() {
  const pw  = document.getElementById("ob-password").value;
  const pw2 = document.getElementById("ob-password-confirm").value;
  const el  = document.getElementById("ob-pw-match");
  if (!pw2) { el.textContent = ""; return; }
  if (pw === pw2) {
    el.textContent = "✓ 一致しています";
    el.className = "ob-pw-match ob-pw-ok";
  } else {
    el.textContent = "✗ パスワードが一致しません";
    el.className = "ob-pw-match ob-pw-ng";
  }
}

async function obStep1() {
  const username = document.getElementById("ob-username").value.trim();
  const password = document.getElementById("ob-password").value;
  const confirm  = document.getElementById("ob-password-confirm").value;
  const errEl = document.getElementById("ob-err-1");
  errEl.textContent = "";
  if (username.length < 2) { errEl.textContent = "ユーザー名は2文字以上で入力してください"; return; }
  if (password.length < 4) { errEl.textContent = "パスワードは4文字以上で入力してください"; return; }
  if (password !== confirm) { errEl.textContent = "パスワードが一致しません"; return; }
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.detail || "登録に失敗しました"; return; }
    authToken = data.token;
    authUsername = data.username;
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("authUsername", authUsername);
    updateAccountMenuBtn();
    obSetStep(2);
  } catch {
    errEl.textContent = "サーバーに接続できませんでした";
  }
}

async function obStep1bLogin() {
  const username = document.getElementById("ob-login-username").value.trim();
  const password = document.getElementById("ob-login-password").value;
  const errEl = document.getElementById("ob-err-1b");
  errEl.textContent = "";
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) { errEl.textContent = data.detail || "ログインに失敗しました"; return; }
    authToken = data.token;
    authUsername = data.username;
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("authUsername", authUsername);
    updateAccountMenuBtn();
    await pullFromServer();
    obSetStep(2);
  } catch {
    errEl.textContent = "サーバーに接続できませんでした";
  }
}

function obSetSemester(sem) {
  obCurrentSemester = sem;
  document.getElementById("ob-tab-zenki").classList.toggle("active", sem === "zenki");
  document.getElementById("ob-tab-kouki").classList.toggle("active", sem === "kouki");
  document.getElementById("ob-class-form").classList.add("hidden");
  obRenderTimetable();
}

// ─── Timetable ────────────────────────────────────────────────────────────────
function obRenderTimetable() {
  const days = ["月", "火", "水", "木", "金"];
  const wrap = document.getElementById("ob-timetable-wrap");
  if (!wrap) return;
  const sched = obClassSchedule[obCurrentSemester];
  let html = '<table class="ob-tt"><thead><tr><th></th>';
  days.forEach(d => html += `<th>${d}</th>`);
  html += '</tr></thead><tbody>';
  for (let p = 1; p <= 6; p++) {
    html += `<tr><td class="ob-tt-period">${p}限</td>`;
    for (let d = 0; d < 5; d++) {
      const fullCls   = sched.find(c => c.day === d && c.period === p && c.quarter === "full");
      const firstCls  = sched.find(c => c.day === d && c.period === p && c.quarter === "first");
      const secondCls = sched.find(c => c.day === d && c.period === p && c.quarter === "second");
      let inner;
      const clsBadge = c => (c?.tsuinen ? '<span class="ob-tsuinen-badge">通年</span>' : '') + (c?.biweekly ? '<span class="ob-tsuinen-badge ob-biweekly-badge">隔週</span>' : '');
      if (fullCls) {
        inner = `<div class="ob-cell-inner ob-half-full" onclick="obCellClick(${d},${p},'full')">${clsBadge(fullCls)}<span class="ob-cell-text">${fullCls.name}</span></div>`;
      } else {
        const topTxt  = firstCls  ? `${clsBadge(firstCls)}<span class="ob-cell-text">${firstCls.name}</span>`  : '<span class="ob-cell-add">+</span>';
        const botTxt  = secondCls ? `${clsBadge(secondCls)}<span class="ob-cell-text">${secondCls.name}</span>` : '<span class="ob-cell-add">+</span>';
        inner = `<div class="ob-cell-inner"><div class="ob-half ob-half-top${firstCls ? ' has-half' : ''}" onclick="obCellClick(${d},${p},'first')">${topTxt}</div><div class="ob-half ob-half-bot${secondCls ? ' has-half' : ''}" onclick="obCellClick(${d},${p},'second')">${botTxt}</div></div>`;
      }
      html += `<td class="ob-tt-cell${fullCls ? ' has-class' : ''}">${inner}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  wrap.innerHTML = html;
}

function obUpdateQuarterRadios(selectedQuarter) {
  const labels = obCurrentSemester === "zenki"
    ? { full: "前期（全体）", first: "春前のみ", second: "春後のみ" }
    : { full: "後期（全体）", first: "秋前のみ", second: "秋後のみ" };
  document.getElementById("ob-quarter-radios").innerHTML =
    ["full", "first", "second"].map(q => `
      <label class="ob-quarter-label">
        <input type="radio" name="ob-quarter" value="${q}" ${q === selectedQuarter ? "checked" : ""}>
        ${labels[q]}
      </label>`).join("");
}

const OB_DAY_NAMES = ["月", "火", "水", "木", "金"];

function obCellClick(day, period, half) {
  const sched = obClassSchedule[obCurrentSemester];
  const fullCls = sched.find(c => c.day === day && c.period === period && c.quarter === "full");
  const quarter = fullCls ? "full" : (half || "first");
  const cls = sched.find(c => c.day === day && c.period === period && c.quarter === quarter);
  obEditingCell = { day, period, quarter };
  obUpdateQuarterRadios(quarter);
  document.getElementById("ob-cls-name").value = "";
  document.getElementById("ob-cls-name").value = cls?.name || "";
  document.getElementById("ob-cls-room").value = cls?.room || "";
  document.getElementById("ob-cls-teacher").value = cls?.teacher || "";
  if (obEditingCell) {
    obEditingCell.tsuinen = cls?.tsuinen || false;
    obEditingCell.biweekly = cls?.biweekly || false;
  }
  document.getElementById("ob-delete-btn").classList.toggle("hidden", !cls);
  document.getElementById("ob-class-form").classList.remove("hidden");
  obFilterCandidates();
  document.getElementById("ob-cls-name").focus();
}

function obFilterCandidates() {
  const { day, period } = obEditingCell || {};
  const keyword = (document.getElementById("ob-cls-name")?.value || "").trim().toLowerCase();
  const faculty = document.getElementById("ob-faculty")?.value || "";
  const dayName = OB_DAY_NAMES[day];
  const area = document.getElementById("ob-cls-candidates");
  if (!area) return;

  let matches = timetableData.filter(item => {
    if (item.day !== dayName || item.period !== period) return false;
    if (faculty && item.faculty !== faculty) return false;
    if (keyword) {
      const text = [item.title, item.teacher].join(" ").toLowerCase();
      if (!text.includes(keyword)) return false;
    }
    return true;
  });

  if (matches.length === 0) {
    area.innerHTML = faculty
      ? `<p class="ob-hint">該当する授業が見つかりません。手入力してください。</p>`
      : `<p class="ob-hint">学部を選択すると候補が絞られます</p>`;
    return;
  }

  const semToQuarter = {
    "春": "full", "秋": "full", "通年": "full",
    "春前": "first", "春後": "second",
    "秋前": "first", "秋後": "second",
  };
  const quarterLabel = { "春前": "春前", "春後": "春後", "秋前": "秋前", "秋後": "秋後" };

  const ul = document.createElement("ul");
  ul.className = "ob-cand-list";
  matches.slice(0, 40).forEach(item => {
    const li = document.createElement("li");
    li.className = "ob-cand-item";
    const qLabel = quarterLabel[item.semester]
      ? `<span class="ob-cand-quarter">${quarterLabel[item.semester]}</span>` : "";
    li.innerHTML = `<span class="ob-cand-name">${item.title}${qLabel}</span><span class="ob-cand-tag">${item.teacher || ""}</span>`;
    li.addEventListener("click", () => {
      document.getElementById("ob-cls-name").value = item.title;
      document.getElementById("ob-cls-room").value = item.room || "";
      document.getElementById("ob-cls-teacher").value = item.teacher || "";
      area.innerHTML = "";
      const quarter = semToQuarter[item.semester] || "full";
      if (obEditingCell) {
        obEditingCell.quarter = quarter;
        obEditingCell.tsuinen = item.semester === "通年";
        obEditingCell.biweekly = item.repeat === "biweekly";
      }
      obUpdateQuarterRadios(quarter);
    });
    ul.appendChild(li);
  });
  area.innerHTML = "";
  area.appendChild(ul);
}

function obSaveClass() {
  const name = document.getElementById("ob-cls-name").value.trim();
  if (!name) { document.getElementById("ob-cls-name").focus(); return; }
  const { day, period } = obEditingCell;
  const quarter = document.querySelector('input[name="ob-quarter"]:checked')?.value || obEditingCell.quarter || "full";
  const sem = obCurrentSemester;
  const otherSem = sem === "zenki" ? "kouki" : "zenki";
  const tsuinen = obEditingCell.tsuinen || false;
  const biweekly = obEditingCell.biweekly || false;
  const cls = {
    day, period, quarter, name, tsuinen, biweekly,
    room: document.getElementById("ob-cls-room").value.trim(),
    teacher: document.getElementById("ob-cls-teacher").value.trim(),
  };
  obClassSchedule[sem] = obClassSchedule[sem].filter(
    c => !(c.day === day && c.period === period && c.quarter === quarter)
  );
  obClassSchedule[sem].push(cls);
  if (tsuinen) {
    obClassSchedule[otherSem] = obClassSchedule[otherSem].filter(
      c => !(c.day === day && c.period === period && c.quarter === quarter)
    );
    obClassSchedule[otherSem].push({ ...cls });
  }
  document.getElementById("ob-class-form").classList.add("hidden");
  obRenderTimetable();
}

function obDeleteClass() {
  const { day, period } = obEditingCell;
  const quarter = document.querySelector('input[name="ob-quarter"]:checked')?.value || obEditingCell.quarter || "full";
  const sem = obCurrentSemester;
  const existing = obClassSchedule[sem].find(c => c.day === day && c.period === period && c.quarter === quarter);
  if (existing?.tsuinen) {
    const otherSem = sem === "zenki" ? "kouki" : "zenki";
    obClassSchedule[otherSem] = obClassSchedule[otherSem].filter(
      c => !(c.day === day && c.period === period && c.quarter === quarter)
    );
  }
  obClassSchedule[sem] = obClassSchedule[sem].filter(
    c => !(c.day === day && c.period === period && c.quarter === quarter)
  );
  document.getElementById("ob-class-form").classList.add("hidden");
  obRenderTimetable();
}

function obCancelClass() {
  document.getElementById("ob-class-form").classList.add("hidden");
}

async function obStep2Next() {
  const faculty = document.getElementById("ob-faculty").value;
  if (faculty) localStorage.setItem("userFaculty", faculty);
  localStorage.setItem("classSchedule", JSON.stringify(obClassSchedule));
  const hasClasses = obClassSchedule.zenki.length > 0 || obClassSchedule.kouki.length > 0;
  if (hasClasses) {
    try { obClassesToEvents(); } catch(e) { console.error("obClassesToEvents error", e); }
  }
  obSetStep(3);
}

function obSkipStep2() { obSetStep(3); }

function getMeijiHolidays(ay) {
  const skip = new Set();
  const add = (y, m, d) => skip.add(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
  if (ay === 2025) {
    // 春学期 臨時休業・祝日（授業なし）
    add(2025,5,1); add(2025,5,2);   // 臨時休業
    add(2025,5,5);                   // こどもの日（休日授業実施日に含まれないため休講）
    // 秋学期 大学祭週間（10/29〜11/4 全日休講）
    [29,30,31].forEach(d => add(2025,10,d));
    [1,2,3,4].forEach(d => add(2025,11,d));
    // 秋学期 臨時休業
    add(2025,12,23); add(2025,12,24);
    // 冬季休業（12/25〜1/7）
    for (let d=25;d<=31;d++) add(2025,12,d);
    for (let d=1;d<=7;d++)  add(2026,1,d);
    // 成人の日（1/13）
    add(2026,1,13);
  }
  return skip;
}

function obClassesToEvents() {
  const today = new Date();
  const ay = today.getMonth() + 1 >= 4 ? today.getFullYear() : today.getFullYear() - 1;
  const skipDates = getMeijiHolidays(ay);
  // 学年暦に基づく正確な授業期間
  const rangeMap = {
    zenki: {
      full:   { start: new Date(ay, 3, 10), end: new Date(ay, 6, 22) },  // 4/10〜7/22
      first:  { start: new Date(ay, 3, 10), end: new Date(ay, 5, 3)  },  // 4/10〜6/3
      second: { start: new Date(ay, 5, 4),  end: new Date(ay, 6, 22) },  // 6/4〜7/22
    },
    kouki: {
      full:   { start: new Date(ay, 8, 20), end: new Date(ay+1, 0, 23) }, // 9/20〜1/23
      first:  { start: new Date(ay, 8, 20), end: new Date(ay, 10, 14) },  // 9/20〜11/14
      second: { start: new Date(ay, 10, 15),end: new Date(ay+1, 0, 23) }, // 11/15〜1/23
    },
  };
  const newEvents = [];
  ["zenki", "kouki"].forEach(sem => {
    obClassSchedule[sem].forEach(cls => {
      const quarter = cls.quarter || "full";
      const { start, end } = rangeMap[sem][quarter];
      const jsDay = cls.day + 1;
      const d = new Date(start);
      let weekCount = 0;
      while (d <= end) {
        if (d.getDay() === jsDay) {
          const dateStr = formatDate(d);
          if (!skipDates.has(dateStr)) {
            if (!cls.biweekly || weekCount % 2 === 0) {
              const times = OB_PERIOD_TIMES[cls.period];
              newEvents.push({
                id: `sched-${sem}-${quarter}-${cls.day}-${cls.period}-${dateStr}`,
                title: cls.name,
                date: dateStr,
                startTime: times.start,
                endTime: times.end,
                category: "class",
                room: cls.room || "",
                teacher: cls.teacher || "",
                allDay: false,
                _fromSchedule: true,
              });
            }
            weekCount++;
          }
        }
        d.setDate(d.getDate() + 1);
      }
    });
  });
  // _fromScheduleフラグがなくても id が "sched-" で始まるものも除去（旧データ対応）
  events = events.filter(e =>
    !e._fromSchedule &&
    !(typeof e.id === "string" && e.id.startsWith("sched-"))
  );
  events.push(...newEvents);
  saveToLocalStorage();
  createCalendar();
}

// ─── Notification step ────────────────────────────────────────────────────────
async function obEnableNotif() {
  if ("Notification" in window) {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await registerServiceWorker();
      await subscribeToPush();
    }
  }
  obSetStep(4);
}

function obSkipNotif() { obSetStep(4); }

// ─── Finish ───────────────────────────────────────────────────────────────────
function obFinish() {
  localStorage.setItem("onboardingDone", "1");
  document.getElementById("onboarding-overlay").classList.add("hidden");
  updateAccountModalUI();
}

// ─── 週の目標 & 達成度 ─────────────────────────────────────────────────────────

function getWeekStartStr(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0=日
  const diff = dow === 0 ? -6 : 1 - dow; // 月曜に合わせる
  d.setDate(d.getDate() + diff);
  return formatDate(d);
}

function loadWeeklyGoals() {
  const raw = localStorage.getItem("weeklyGoals");
  const currentWeek = getWeekStartStr();
  if (!raw) return { weekStart: currentWeek, goals: [] };
  const data = JSON.parse(raw);
  if (data.weekStart !== currentWeek) {
    return { weekStart: currentWeek, goals: [] };
  }
  return data;
}

function saveWeeklyGoals(data) {
  localStorage.setItem("weeklyGoals", JSON.stringify(data));
}

let _weeklyGoalsExpanded = true;

function toggleWeeklyGoalsSection() {
  _weeklyGoalsExpanded = !_weeklyGoalsExpanded;
  const body = document.getElementById("weekly-goals-body");
  const arrow = document.getElementById("wg-toggle-arrow");
  if (body) body.classList.toggle("hidden", !_weeklyGoalsExpanded);
  if (arrow) arrow.textContent = _weeklyGoalsExpanded ? "▼" : "▶";
}

function renderWeeklyGoalsSection() {
  const section = document.getElementById("weekly-goals-section");
  const body = document.getElementById("weekly-goals-body");
  const badge = document.getElementById("wg-progress-badge");
  if (!section || !body) return;

  const data = loadWeeklyGoals();
  const done = data.goals.filter(g => g.done).length;
  const total = data.goals.length;

  if (badge) {
    badge.textContent = total > 0 ? `${done}/${total}` : "";
    badge.className = "wg-progress-badge" + (total > 0 && done === total ? " wg-badge-all-done" : "");
  }

  let html = "";

  // 達成度バー
  if (total > 0) {
    const pct = Math.round((done / total) * 100);
    html += `<div class="wg-achieve-wrap">
      <div class="wg-achieve-bar"><div class="wg-achieve-fill" style="width:${pct}%"></div></div>
      <span class="wg-achieve-pct">${pct}%</span>
    </div>`;
  }

  // 目標リスト
  if (data.goals.length === 0) {
    html += `<div class="wg-empty">今週の目標を追加しましょう</div>`;
  } else {
    data.goals.forEach((g, i) => {
      html += `<div class="wg-goal-row${g.done ? " wg-goal-done" : ""}">
        <button class="wg-check${g.done ? " wg-check-done" : ""}" onclick="toggleWeeklyGoal(${i})">${g.done ? "✓" : ""}</button>
        <span class="wg-goal-text${g.done ? " wg-text-done" : ""}">${escapeHtml(g.text)}</span>
        <button class="wg-del" onclick="deleteWeeklyGoal(${i})">×</button>
      </div>`;
    });
  }

  // 習慣達成
  const activeHabits = habits.filter(h => !h.archived);
  if (activeHabits.length > 0) {
    const totalHabitDone = activeHabits.reduce((sum, h) => sum + getHabitWeeklyCount(h.id), 0);
    html += `<div class="wg-habit-stats">🔄 習慣 今週の達成: ${totalHabitDone}回</div>`;
  }

  // 追加フォーム
  if (data.goals.length < 7) {
    html += `<div class="wg-add-row">
      <input class="wg-add-input" id="wg-add-input" type="text" placeholder="目標を追加..." maxlength="50"
             onkeydown="if(event.key==='Enter')addWeeklyGoal()">
      <button class="wg-add-btn" onclick="addWeeklyGoal()">追加</button>
    </div>`;
  }

  body.innerHTML = html;
  if (!_weeklyGoalsExpanded) body.classList.add("hidden");
}

function addWeeklyGoal() {
  const input = document.getElementById("wg-add-input");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  const data = loadWeeklyGoals();
  data.goals.push({ text, done: false });
  saveWeeklyGoals(data);
  renderRecordsTab();
}

function toggleWeeklyGoal(index) {
  const data = loadWeeklyGoals();
  if (!data.goals[index]) return;
  data.goals[index].done = !data.goals[index].done;
  saveWeeklyGoals(data);
  renderRecordsTab();
}

function deleteWeeklyGoal(index) {
  const data = loadWeeklyGoals();
  data.goals.splice(index, 1);
  saveWeeklyGoals(data);
  renderRecordsTab();
}

// ─── 記録タブ ──────────────────────────────────────────────────────────────────

function renderRecordsTab() {
  const container = document.getElementById("records-view");
  if (!container) return;

  const today = new Date();
  const todayStr = formatDate(today);
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  // 週の始め（日曜）
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  // 今週の習慣達成状況を集計
  const activeHabits = habits.filter(h => !h.archived);
  let totalInstances = 0, doneInstances = 0;
  for (let i = 0; i <= today.getDay(); i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dStr = formatDate(d);
    activeHabits.forEach(h => {
      if (isHabitActiveOn(h, d)) {
        totalInstances++;
        if ((habitLogs[dStr] || []).includes(h.id)) doneInstances++;
      }
    });
  }
  const habitPct = totalInstances > 0 ? Math.round(doneInstances / totalInstances * 100) : 0;

  // 週の目標達成状況
  const wgData = loadWeeklyGoals();
  const wgTotal = wgData.goals.length;
  const wgDone  = wgData.goals.filter(g => g.done).length;
  const goalPct = wgTotal > 0 ? Math.round(wgDone / wgTotal * 100) : 0;

  let html = "";

  // ── 今週のまとめ ──
  html += `<div class="rc-page-title">記録</div>`;
  html += `<div class="rc-card rc-summary-card">
    <div class="rc-card-title">今週のまとめ</div>`;

  if (totalInstances > 0) {
    html += `<div class="rc-summary-row">
      <span class="rc-summary-label">習慣</span>
      <div class="rc-bar-wrap"><div class="rc-bar rc-bar-habit" style="width:${habitPct}%"></div></div>
      <span class="rc-summary-num">${doneInstances}/${totalInstances}回</span>
    </div>`;
  } else {
    html += `<div class="rc-summary-empty">習慣を追加すると達成率が表示されます</div>`;
  }

  if (wgTotal > 0) {
    html += `<div class="rc-summary-row">
      <span class="rc-summary-label">目標</span>
      <div class="rc-bar-wrap"><div class="rc-bar rc-bar-goal" style="width:${goalPct}%"></div></div>
      <span class="rc-summary-num">${wgDone}/${wgTotal}個</span>
    </div>`;
  }

  html += `</div>`;

  // ── 習慣一覧 ──
  html += `<div class="rc-section-header">
    <span class="rc-section-title">習慣</span>
    <button class="rc-add-btn" onclick="openHabitFormModal()">＋ 追加</button>
  </div>`;

  if (activeHabits.length === 0) {
    html += `<div class="rc-card rc-empty-card">
      <div class="rc-empty-icon">🌱</div>
      <div class="rc-empty-text">習慣を追加して毎日のルーティンを作りましょう</div>
      <button class="rc-empty-add-btn" onclick="openHabitFormModal()">＋ 最初の習慣を追加</button>
    </div>`;
  } else {
    activeHabits.forEach(h => {
      const streak    = getHabitStreak(h.id);
      const weekCnt   = getHabitWeeklyCount(h.id);
      const isWeekly  = h.frequencyType === "weekly";
      const wTarget   = isWeekly ? (h.weeklyTarget || 3) : null;
      const isDoneToday = isHabitActiveOn(h, today) && (habitLogs[todayStr] || []).includes(h.id);
      const cleared   = isWeekly && weekCnt >= wTarget;
      const freqLabel = { daily:"毎日", weekday:"平日", weekend:"週末", weekly:`週${h.weeklyTarget||3}回`, custom:"カスタム" }[h.frequencyType || "daily"];

      // タイマー・時間ログ
      const todayMin    = _getHabitTodayMinutes(h.id);
      const goalMin     = h.duration || 30;
      const timePct     = Math.min(100, Math.round(todayMin / goalMin * 100));
      const timeDone    = timePct >= 100;
      const isRunning   = _habitTimer.habitId === h.id;
      const todayMemo   = (habitTimeLogs[todayStr]?.[h.id]?.memo) || "";
      const weekMin     = _getHabitWeekMinutes(h.id);
      const monthMin    = _getHabitMonthMinutes(h.id);
      const totalMin    = _getHabitTotalMinutes(h.id);

      const achieved = isDoneToday || timeDone || cleared;
      const cardClass = achieved ? " rc-habit-done-today"
        : (isWeekly && weekCnt > 0) || todayMin > 0 ? " rc-habit-in-progress" : "";

      html += `<div class="rc-habit-card${cardClass}">
        <div class="rc-habit-top">
          <div class="rc-habit-name-row">
            ${achieved ? `<span class="rc-done-badge">✓</span>` : ""}
            <span class="rc-habit-name">${escapeHtml(h.text)}</span>
          </div>
          <div class="rc-habit-btns">
            <button class="rc-edit-btn" onclick="openHabitFormModal(${h.id})">編集</button>
            <button class="rc-del-btn"  onclick="deleteHabit(${h.id})">削除</button>
          </div>
        </div>
        <div class="rc-habit-meta">
          <span class="rc-meta-tag">${freqLabel}</span>
          <span class="rc-meta-tag">${formatDuration(goalMin)}</span>
          ${streak > 1 ? `<span class="rc-meta-streak">🔥 ${streak}日連続</span>` : ""}
        </div>

        <!-- 今日の時間進捗 -->
        <div class="rc-today-section">
          <div class="rc-today-bar-row">
            <span class="rc-today-label">今日</span>
            <div class="rc-today-bar-wrap">
              <div class="rc-today-bar${timeDone ? " rc-today-bar-done" : ""}" style="width:${timePct}%"></div>
            </div>
            <span class="rc-today-time">${todayMin}/${goalMin}分</span>
          </div>
          <div class="rc-timer-controls">
            ${isRunning
              ? `<button class="rc-timer-stop" onclick="stopHabitTimer()">■ 停止</button>
                 <span class="rc-timer-display" id="ht-display-${h.id}">0:00</span>`
              : `<button class="rc-timer-start" onclick="startHabitTimer(${h.id})">▶ 開始</button>
                 ${todayMin > 0 ? `<span class="rc-timer-logged">${_formatMin(todayMin)} 記録済み</span>` : ""}`
            }
          </div>
          <input class="rc-memo-input" id="ht-memo-${h.id}" type="text"
            placeholder="一言メモ（任意）" value="${escapeHtml(todayMemo)}"
            onblur="saveHabitMemo(${h.id})">
        </div>

        <!-- 週N回 or 7日間ドット -->
        ${isWeekly ? (() => {
          const wpct = Math.min(100, Math.round(weekCnt / wTarget * 100));
          return `<div class="rc-weekly-progress">
            <div class="rc-weekly-bar-wrap">
              <div class="rc-weekly-bar${cleared ? " rc-weekly-bar-done" : ""}" style="width:${wpct}%"></div>
            </div>
            <div class="rc-weekly-status">
              ${cleared
                ? `<span class="rc-weekly-clear">今週クリア！🎉</span>`
                : `<span class="rc-weekly-remain">あと ${wTarget - weekCnt}回</span>`}
              <span class="rc-weekly-count">${weekCnt}/${wTarget}回</span>
            </div>
          </div>
          <div class="rc-weekly-circles">
            ${Array.from({length: wTarget}, (_, i) =>
              `<div class="rc-wc${i < weekCnt ? " rc-wc-done" : ""}"></div>`
            ).join("")}
          </div>`;
        })() : `<div class="rc-week-dots-row">
          ${_buildHabitWeekDots(h, today, weekStart, dayNames)}
        </div>`}

        <!-- 累積時間 -->
        <div class="rc-cumulative">
          <div class="rc-cum-item">
            <span class="rc-cum-val">${_formatMin(weekMin)}</span>
            <span class="rc-cum-label">今週</span>
          </div>
          <div class="rc-cum-item">
            <span class="rc-cum-val">${_formatMin(monthMin)}</span>
            <span class="rc-cum-label">今月</span>
          </div>
          <div class="rc-cum-item">
            <span class="rc-cum-val">${_formatMin(totalMin)}</span>
            <span class="rc-cum-label">合計</span>
          </div>
        </div>
      </div>`;
    });
  }

  // ── 今月の達成カレンダー ──
  if (activeHabits.length > 0) {
    html += _buildMonthCalendar(today, activeHabits);
  }

  // ── 週の目標（フル管理） ──
  const goalPctBadge = wgTotal > 0
    ? `<span class="rc-goal-pct-badge${wgDone === wgTotal ? " rc-badge-all" : ""}">${wgDone}/${wgTotal}</span>`
    : "";
  html += `<div class="rc-section-header" style="margin-top:16px">
    <span class="rc-section-title">週の目標</span>
    ${goalPctBadge}
  </div>`;

  html += `<div class="rc-card rc-goals-card">`;
  if (wgData.goals.length === 0) {
    html += `<div class="rc-goals-empty">今週の目標を追加しましょう</div>`;
  } else {
    wgData.goals.forEach((g, i) => {
      html += `<div class="rc-goal-row${g.done ? " rc-goal-done" : ""}">
        <span class="rc-goal-check${g.done ? " rc-goal-checked" : ""}" onclick="toggleWeeklyGoal(${i})">${g.done ? "✓" : ""}</span>
        <span class="rc-goal-text" onclick="toggleWeeklyGoal(${i})">${escapeHtml(g.text)}</span>
        <button class="rc-goal-del" onclick="deleteWeeklyGoal(${i})">×</button>
      </div>`;
    });
  }
  html += `<div class="rc-goals-add-row">
    <input class="rc-goals-add-input" id="wg-add-input" type="text"
      placeholder="目標を追加..." maxlength="50"
      onkeydown="if(event.key==='Enter')addWeeklyGoal()">
    <button class="rc-goals-add-btn" onclick="addWeeklyGoal()">追加</button>
  </div>`;
  html += `</div>`;

  container.innerHTML = html;
}

function _buildHabitWeekDots(habit, today, weekStart, dayNames) {
  const todayStr = formatDate(today);
  let html = "";
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dStr   = formatDate(d);
    const future = d > today;
    const active = isHabitActiveOn(habit, d);
    const done   = (habitLogs[dStr] || []).includes(habit.id);
    const isToday = dStr === todayStr;

    let cls = "rc-dot";
    if (!active)       cls += " rc-dot-off";
    else if (future)   cls += " rc-dot-future";
    else if (done)     cls += " rc-dot-done";
    else               cls += " rc-dot-miss";
    if (isToday)       cls += " rc-dot-today";

    const action = active && !future
      ? `onclick="toggleHabitDone(${habit.id})"` : "";
    html += `<div class="rc-dot-cell" ${action}>
      <div class="${cls}"></div>
      <span class="rc-dot-day">${dayNames[d.getDay()]}</span>
    </div>`;
  }
  return html;
}

function _buildMonthCalendar(today, activeHabits) {
  const year  = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const todayStr = formatDate(today);
  const dayLabels = ["日","月","火","水","木","金","土"];

  let html = `<div class="rc-section-header" style="margin-top:16px">
    <span class="rc-section-title">${month + 1}月の達成</span>
  </div>
  <div class="rc-month-card">
    <div class="rc-month-dow-row">
      ${dayLabels.map(l => `<div class="rc-month-dow">${l}</div>`).join("")}
    </div>
    <div class="rc-month-grid">`;

  // 空白セル
  for (let i = 0; i < firstDow; i++) {
    html += `<div class="rc-mc-cell rc-mc-empty"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d    = new Date(year, month, day);
    const dStr = formatDate(d);
    const future = d > today;
    const isToday = dStr === todayStr;

    let level = 0;
    if (!future) {
      let active = 0, done = 0;
      activeHabits.forEach(h => {
        if (isHabitActiveOn(h, d)) {
          active++;
          if ((habitLogs[dStr] || []).includes(h.id)) done++;
        }
      });
      if (active > 0) {
        const ratio = done / active;
        if (ratio === 1)       level = 3;
        else if (ratio >= 0.5) level = 2;
        else if (ratio > 0)    level = 1;
      }
    }

    html += `<div class="rc-mc-cell rc-mc-lv${level}${future ? " rc-mc-future" : ""}${isToday ? " rc-mc-today" : ""}">
      <span class="rc-mc-num">${day}</span>
    </div>`;
  }

  html += `</div>
    <div class="rc-month-legend">
      <div class="rc-mc-cell rc-mc-lv0 rc-ml-cell"></div><span>なし</span>
      <div class="rc-mc-cell rc-mc-lv1 rc-ml-cell"></div><span>一部</span>
      <div class="rc-mc-cell rc-mc-lv2 rc-ml-cell"></div><span>半分+</span>
      <div class="rc-mc-cell rc-mc-lv3 rc-ml-cell"></div><span>全達成</span>
    </div>
  </div>`;

  return html;
}

function toggleWeeklyGoalFromRecords(index) {
  const data = loadWeeklyGoals();
  if (!data.goals[index]) return;
  data.goals[index].done = !data.goals[index].done;
  saveWeeklyGoals(data);
  renderWeeklyGoalsSection();
  renderRecordsTab();
}

// ─── 習慣タイマー・時間ログ ───────────────────────────────────────────────────

function _getHabitTodayMinutes(habitId) {
  return (habitTimeLogs[formatDate(new Date())]?.[habitId]?.minutes) || 0;
}

function _getHabitWeekMinutes(habitId) {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  let total = 0;
  for (let i = 0; i <= today.getDay(); i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    total += (habitTimeLogs[formatDate(d)]?.[habitId]?.minutes) || 0;
  }
  return total;
}

function _getHabitMonthMinutes(habitId) {
  const today = new Date();
  const y = today.getFullYear(), m = today.getMonth();
  let total = 0;
  for (const dStr in habitTimeLogs) {
    const d = new Date(dStr);
    if (d.getFullYear() === y && d.getMonth() === m)
      total += (habitTimeLogs[dStr]?.[habitId]?.minutes) || 0;
  }
  return total;
}

function _getHabitTotalMinutes(habitId) {
  let total = 0;
  for (const dStr in habitTimeLogs)
    total += (habitTimeLogs[dStr]?.[habitId]?.minutes) || 0;
  return total;
}

function _formatMin(min) {
  if (!min) return "0分";
  if (min < 60) return `${min}分`;
  const h = Math.floor(min / 60), m = min % 60;
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}

function startHabitTimer(habitId) {
  if (_habitTimer.intervalId) {
    clearInterval(_habitTimer.intervalId);
    _habitTimer = { habitId: null, startTime: null, intervalId: null };
  }
  _habitTimer.habitId = habitId;
  _habitTimer.startTime = Date.now();
  _habitTimer.intervalId = setInterval(() => _tickHabitTimer(habitId), 1000);
  renderRecordsTab();
}

function stopHabitTimer() {
  if (!_habitTimer.intervalId) return;
  clearInterval(_habitTimer.intervalId);

  const elapsed = Math.floor((Date.now() - _habitTimer.startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const habitId = _habitTimer.habitId;
  _habitTimer = { habitId: null, startTime: null, intervalId: null };

  if (minutes > 0) {
    const todayStr = formatDate(new Date());
    if (!habitTimeLogs[todayStr]) habitTimeLogs[todayStr] = {};
    if (!habitTimeLogs[todayStr][habitId]) habitTimeLogs[todayStr][habitId] = { minutes: 0, memo: "" };
    habitTimeLogs[todayStr][habitId].minutes += minutes;

    // 目標時間に到達したら自動チェック
    const habit = habits.find(h => h.id === habitId);
    if (habit && habitTimeLogs[todayStr][habitId].minutes >= (habit.duration || 30)) {
      if (!habitLogs[todayStr]) habitLogs[todayStr] = [];
      if (!habitLogs[todayStr].includes(habitId)) habitLogs[todayStr].push(habitId);
    }
    saveHabits();
    createCalendar();
  }
  renderRecordsTab();
}

function _tickHabitTimer(habitId) {
  const el = document.getElementById(`ht-display-${habitId}`);
  if (!el) {
    clearInterval(_habitTimer.intervalId);
    _habitTimer.intervalId = null;
    return;
  }
  const elapsed = Math.floor((Date.now() - _habitTimer.startTime) / 1000);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  el.textContent = `${m}:${String(s).padStart(2, "0")}`;
}

function saveHabitMemo(habitId) {
  const input = document.getElementById(`ht-memo-${habitId}`);
  if (!input) return;
  const todayStr = formatDate(new Date());
  if (!habitTimeLogs[todayStr]) habitTimeLogs[todayStr] = {};
  if (!habitTimeLogs[todayStr][habitId]) habitTimeLogs[todayStr][habitId] = { minutes: 0, memo: "" };
  habitTimeLogs[todayStr][habitId].memo = input.value.trim();
  localStorage.setItem("habitTimeLogs", JSON.stringify(habitTimeLogs));
}
