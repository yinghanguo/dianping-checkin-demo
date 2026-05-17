// 自建地点的 mock 后端: 用 localStorage 持久化
// 数据结构:
// {
//   id: 'custom-{timestamp}',
//   name: string,
//   emoji: string,
//   tag: string,           // 自定义标签(替代严格分类)
//   coords: { lat, lng },
//   createdAt: number,
//   isCustom: true,
// }

const STORAGE_KEY = "cc.customPois.v1";

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
  } catch {
    // 容量满 / 隐私模式失败时,静默忽略 —— demo 场景可接受
  }
}

export function listCustomPois() {
  return read();
}

// 简易 Haversine 距离(米)
function distanceMeters(a, b) {
  if (!a || !b) return Infinity;
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function formatDistance(meters) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)}km`;
  return `${Math.round(meters)}m`;
}

// 返回当前坐标附近 radiusMeters 内的自建地点,带 distance 字段
export function findNearbyCustomPois(coords, radiusMeters = 1000) {
  if (!coords) return [];
  return read()
    .map((p) => {
      const d = distanceMeters(coords, p.coords);
      return { ...p, _distanceMeters: d, distance: formatDistance(d) };
    })
    .filter((p) => p._distanceMeters <= radiusMeters)
    .sort((a, b) => a._distanceMeters - b._distanceMeters);
}

// 找当前坐标 50m 内是否已有同名地点(可排除某个 id —— 编辑自身时不要触发)
export function findDuplicateNearby(coords, name, excludeId = null) {
  if (!coords || !name) return null;
  const trimmed = name.trim();
  for (const p of read()) {
    if (p.id === excludeId) continue;
    if (p.name.trim() === trimmed && distanceMeters(coords, p.coords) <= 50) {
      return p;
    }
  }
  return null;
}

export function createCustomPoi({ name, emoji, tag, coords }) {
  const item = {
    id: `custom-${Date.now()}`,
    name: name.trim(),
    emoji: emoji || "🏷️",
    tag: (tag || "").trim(),
    coords: { lat: coords.lat, lng: coords.lng },
    createdAt: Date.now(),
    isCustom: true,
  };
  const list = read();
  list.unshift(item);
  write(list);
  return item;
}

export function updateCustomPoi(id, patch) {
  const list = read();
  const idx = list.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const updated = {
    ...list[idx],
    name: patch.name !== undefined ? patch.name.trim() : list[idx].name,
    emoji: patch.emoji !== undefined ? patch.emoji : list[idx].emoji,
    tag: patch.tag !== undefined ? patch.tag.trim() : list[idx].tag,
    updatedAt: Date.now(),
  };
  list[idx] = updated;
  write(list);
  return updated;
}

export function deleteCustomPoi(id) {
  write(read().filter((p) => p.id !== id));
}
