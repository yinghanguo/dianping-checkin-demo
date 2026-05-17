// 用户打卡记录 mock 后端 - localStorage 持久化
// 数据形状与 src/data/myCheckins.js MY_CHECKINS 数组兼容,
// 这样 deriveStats / Footprint 等消费方可以直接合并使用。
//
// 一条记录:
// {
//   id: 'user-{ts}-{nameSlice}',
//   user: 'niki',
//   date: 'M/D',       // 真实日期
//   weekday: '周X',
//   time: 'HH:MM',
//   timestamp: number,
//   poi: { name, city, district, category, emoji },
//   coords: { lat, lng } | null,
//   achievement: null,
//   photos: [string],   // dataURL
//   visibility: 'public' | 'friends' | 'private',
//   taggedFriends: [string],
//   likes: 0,
//   comments: 0,
//   text: '',
//   isUserCreated: true,
// }

const STORAGE_KEY = "cc.userCheckins.v1";
// 覆盖层:为任意 checkin (含 baseline MY_CHECKINS) 存可见性 / 隐藏状态
// 形状: { [id]: { visibility?: 'public'|'friends'|'private', hidden?: boolean } }
const OVERRIDE_KEY = "cc.checkinOverrides.v1";

const WEEKDAY_CN = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    // 可能 quota 超限 - 移除最旧记录里的 photos 再重试
    try {
      const trimmed = list.map((c, idx) =>
        idx < list.length - 5 ? { ...c, photos: [] } : c
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      console.warn("[userCheckins] localStorage quota exceeded", err);
    }
  }
}

// 根据 category 文本挑 emoji - 与 myCheckins.js 同源逻辑的简化版
function emojiFor(category = "") {
  const c = category;
  if (c.includes("酒店")) return "🏨";
  if (c.includes("咖啡")) return "☕";
  if (c.includes("茶")) return "🍵";
  if (c.includes("酒吧") || c.includes("Bar") || c.includes("酒馆")) return "🍺";
  if (c.includes("机场")) return "✈️";
  if (c.includes("教堂") || c.includes("大教堂")) return "⛪";
  if (c.includes("市场")) return "🛒";
  if (c.includes("超市") || c.includes("便利店")) return "🏪";
  if (c.includes("化妆品") || c.includes("美妆")) return "💄";
  if (c.includes("公园") || c.includes("Park")) return "🌳";
  if (c.includes("海滩") || c.includes("beach")) return "🏖️";
  if (c.includes("山") || c.includes("Mountain")) return "⛰️";
  if (c.includes("家") || c.includes("住所") || c.includes("Home")) return "🏠";
  if (c.includes("学校") || c.includes("大学")) return "🏫";
  if (c.includes("医院")) return "🏥";
  if (c.includes("健身") || c.includes("gym")) return "💪";
  if (c.includes("电影")) return "🎬";
  if (c.includes("书店")) return "📚";
  if (c.includes("面包") || c.includes("甜点")) return "🥐";
  if (c.includes("餐厅") || c.includes("菜") || c.includes("美食")) return "🍽️";
  if (c.includes("景点") || c.includes("观光")) return "🌆";
  if (c.includes("地点")) return "📍";
  return "📍";
}

// 从原始 POI 对象(可能来自 OSM 或 customPois)构造规范化的 poi 字段
function normalizePoi(rawPoi, shortAddress) {
  if (!rawPoi) {
    return {
      name: shortAddress || "未选择地点",
      city: shortAddress?.split("·")[0]?.trim() || "—",
      district: shortAddress?.split("·").slice(1).join(" ").trim() || "",
      category: "随手打卡",
      emoji: "📍",
    };
  }
  return {
    name: rawPoi.name || "未命名地点",
    city: rawPoi.city || shortAddress?.split("·")[0]?.trim() || "",
    district: rawPoi.district || rawPoi.address || "",
    category: rawPoi.tag || rawPoi.category || "地点",
    emoji: rawPoi.emoji || emojiFor(rawPoi.tag || rawPoi.category || ""),
  };
}

// 构造一条新的打卡记录
export function addUserCheckin({
  poi,
  coords,
  shortAddress,
  photos = [],
  visibility = "public",
  taggedFriends = [],
  text = "",
}) {
  const now = new Date();
  const normalized = normalizePoi(poi, shortAddress);
  const record = {
    id: `user-${now.getTime()}-${(normalized.name || "loc").slice(0, 4)}`,
    user: "niki",
    date: `${now.getMonth() + 1}/${now.getDate()}`,
    weekday: WEEKDAY_CN[now.getDay()],
    time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    timestamp: now.getTime(),
    poi: normalized,
    coords: coords ? { lat: coords.lat, lng: coords.lng } : null,
    achievement: null,
    photos: photos.slice(0, 6),
    visibility,
    taggedFriends: Array.isArray(taggedFriends) ? [...taggedFriends] : [],
    likes: 0,
    comments: 0,
    text: text || "",
    isUserCreated: true,
  };
  const list = read();
  list.push(record);
  write(list);
  return record;
}

// 全部记录 - 默认按 timestamp 倒序
export function getUserCheckins() {
  return read().sort((a, b) => b.timestamp - a.timestamp);
}

// 给定年份的全部记录数(用于"今年已打卡 XX")
export function getYearCount(year = new Date().getFullYear()) {
  return read().filter((c) => new Date(c.timestamp).getFullYear() === year).length;
}

// 给定年月的记录数(用于"本月已打卡 XX")
export function getMonthCount(year = new Date().getFullYear(), month = new Date().getMonth() + 1) {
  return read().filter((c) => {
    const d = new Date(c.timestamp);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  }).length;
}

// 删除一条 user-created
export function deleteUserCheckin(id) {
  write(read().filter((c) => c.id !== id));
}

// 更新一条 user-created (仅 patch visibility 等可编辑字段)
export function updateUserCheckin(id, patch) {
  const list = read();
  const idx = list.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], ...patch };
  write(list);
  return list[idx];
}

// ── 覆盖层 (for baseline MY_CHECKINS 修改) ────────────────────
function readOverrides() {
  try {
    const raw = localStorage.getItem(OVERRIDE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeOverrides(obj) {
  try {
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(obj));
  } catch (err) {
    console.warn("[checkinOverrides] write failed", err);
  }
}

export function setCheckinOverride(id, patch) {
  const map = readOverrides();
  map[id] = { ...(map[id] || {}), ...patch };
  writeOverrides(map);
  return map[id];
}

export function getCheckinOverrides() {
  return readOverrides();
}

// 统一访问入口:合并 user + baseline,应用覆盖,过滤隐藏
// 调用方传入 baseline 数组(MY_CHECKINS),避免循环依赖
export function getMergedCheckins(baseline = []) {
  const overrides = readOverrides();
  const userList = read();
  const merged = [...userList, ...baseline]
    .map((c) => {
      const ov = overrides[c.id];
      if (!ov) return c;
      if (ov.hidden) return null;
      return { ...c, ...(ov.visibility ? { visibility: ov.visibility } : {}) };
    })
    .filter(Boolean)
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  return merged;
}

// 统一删除入口:user-created 真删,baseline 标记 hidden
export function removeCheckin(id, { isUserCreated } = {}) {
  if (isUserCreated) {
    deleteUserCheckin(id);
  } else {
    setCheckinOverride(id, { hidden: true });
  }
}

// 统一改可见性入口:user-created 改原对象,baseline 写覆盖层
export function setCheckinVisibility(id, visibility, { isUserCreated } = {}) {
  if (isUserCreated) {
    updateUserCheckin(id, { visibility });
  } else {
    setCheckinOverride(id, { visibility });
  }
}

// 在开发时清空(调试用)
export function _resetUserCheckins() {
  write([]);
}
