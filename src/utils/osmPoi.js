// 调用 OSM 服务真实查询 POI
// - searchPOIs:基于 Nominatim 关键词搜索
// - fetchNearbyPOIs:基于 Overpass API 拉取附近真实 POI

// OSM 标签 → 中文品类 + emoji 的映射表
const TAG_MAP = {
  // amenity
  cafe: { cat: "咖啡馆", emoji: "☕" },
  restaurant: { cat: "餐厅", emoji: "🍴" },
  fast_food: { cat: "快餐", emoji: "🍔" },
  bar: { cat: "酒吧", emoji: "🍺" },
  pub: { cat: "酒吧", emoji: "🍺" },
  biergarten: { cat: "啤酒花园", emoji: "🍺" },
  ice_cream: { cat: "冰淇淋", emoji: "🍦" },
  food_court: { cat: "美食广场", emoji: "🍴" },
  bank: { cat: "银行", emoji: "🏦" },
  atm: { cat: "ATM", emoji: "💰" },
  pharmacy: { cat: "药店", emoji: "💊" },
  hospital: { cat: "医院", emoji: "🏥" },
  clinic: { cat: "诊所", emoji: "🏥" },
  dentist: { cat: "牙科", emoji: "🦷" },
  veterinary: { cat: "宠物医院", emoji: "🐾" },
  school: { cat: "学校", emoji: "🎓" },
  university: { cat: "大学", emoji: "🎓" },
  college: { cat: "学院", emoji: "🎓" },
  kindergarten: { cat: "幼儿园", emoji: "🧸" },
  library: { cat: "图书馆", emoji: "📚" },
  museum: { cat: "博物馆", emoji: "🖼️" },
  theatre: { cat: "剧院", emoji: "🎭" },
  cinema: { cat: "电影院", emoji: "🎬" },
  arts_centre: { cat: "艺术中心", emoji: "🎨" },
  nightclub: { cat: "夜店", emoji: "💃" },
  place_of_worship: { cat: "宗教场所", emoji: "⛪" },
  community_centre: { cat: "社区中心", emoji: "🏘️" },
  marketplace: { cat: "市集", emoji: "🛍️" },
  fuel: { cat: "加油站", emoji: "⛽" },
  parking: { cat: "停车场", emoji: "🅿️" },
  charging_station: { cat: "充电站", emoji: "🔌" },
  bicycle_rental: { cat: "共享单车", emoji: "🚴" },
  car_rental: { cat: "租车", emoji: "🚗" },
  taxi: { cat: "出租车", emoji: "🚕" },
  bus_station: { cat: "汽车站", emoji: "🚌" },
  ferry_terminal: { cat: "渡轮码头", emoji: "⛴️" },
  post_office: { cat: "邮局", emoji: "📮" },
  police: { cat: "警察局", emoji: "👮" },
  fire_station: { cat: "消防局", emoji: "🚒" },
  fountain: { cat: "喷泉", emoji: "⛲" },
  // tourism
  hotel: { cat: "酒店", emoji: "🏨" },
  hostel: { cat: "青旅", emoji: "🛏️" },
  guest_house: { cat: "民宿", emoji: "🏠" },
  motel: { cat: "汽车旅馆", emoji: "🏨" },
  apartment: { cat: "公寓", emoji: "🏢" },
  attraction: { cat: "景点", emoji: "🌆" },
  viewpoint: { cat: "观景点", emoji: "🌅" },
  artwork: { cat: "艺术作品", emoji: "🗿" },
  gallery: { cat: "美术馆", emoji: "🎨" },
  zoo: { cat: "动物园", emoji: "🦁" },
  aquarium: { cat: "水族馆", emoji: "🐠" },
  theme_park: { cat: "主题乐园", emoji: "🎡" },
  picnic_site: { cat: "野餐地", emoji: "🧺" },
  camp_site: { cat: "营地", emoji: "🏕️" },
  // shop
  supermarket: { cat: "超市", emoji: "🛒" },
  convenience: { cat: "便利店", emoji: "🏪" },
  mall: { cat: "购物中心", emoji: "🛍️" },
  department_store: { cat: "百货", emoji: "🛍️" },
  bakery: { cat: "面包店", emoji: "🥐" },
  butcher: { cat: "肉铺", emoji: "🥩" },
  cheese: { cat: "奶酪店", emoji: "🧀" },
  chocolate: { cat: "巧克力店", emoji: "🍫" },
  coffee: { cat: "咖啡豆", emoji: "☕" },
  confectionery: { cat: "糖果店", emoji: "🍬" },
  deli: { cat: "熟食店", emoji: "🥖" },
  greengrocer: { cat: "果蔬店", emoji: "🥬" },
  pastry: { cat: "甜点店", emoji: "🧁" },
  seafood: { cat: "海鲜店", emoji: "🦐" },
  tea: { cat: "茶店", emoji: "🍵" },
  wine: { cat: "酒类店", emoji: "🍷" },
  alcohol: { cat: "酒类店", emoji: "🍷" },
  florist: { cat: "花店", emoji: "💐" },
  books: { cat: "书店", emoji: "📚" },
  jewelry: { cat: "珠宝店", emoji: "💎" },
  clothes: { cat: "服装店", emoji: "👕" },
  shoes: { cat: "鞋店", emoji: "👟" },
  cosmetics: { cat: "美妆", emoji: "💄" },
  hairdresser: { cat: "美发", emoji: "💇" },
  beauty: { cat: "美容", emoji: "💆" },
  optician: { cat: "眼镜店", emoji: "👓" },
  electronics: { cat: "电器", emoji: "📱" },
  computer: { cat: "电脑店", emoji: "💻" },
  mobile_phone: { cat: "手机店", emoji: "📱" },
  bicycle: { cat: "自行车店", emoji: "🚲" },
  pet: { cat: "宠物店", emoji: "🐶" },
  toys: { cat: "玩具店", emoji: "🧸" },
  sports: { cat: "运动用品", emoji: "⚽" },
  car: { cat: "汽车店", emoji: "🚗" },
  furniture: { cat: "家具店", emoji: "🪑" },
  hardware: { cat: "五金店", emoji: "🔧" },
  // leisure
  park: { cat: "公园", emoji: "🌳" },
  garden: { cat: "花园", emoji: "🌷" },
  playground: { cat: "游乐场", emoji: "🛝" },
  beach_resort: { cat: "海滨度假区", emoji: "🏖️" },
  fitness_centre: { cat: "健身房", emoji: "💪" },
  sports_centre: { cat: "运动中心", emoji: "🏟️" },
  swimming_pool: { cat: "游泳池", emoji: "🏊" },
  stadium: { cat: "体育场", emoji: "🏟️" },
  bowling_alley: { cat: "保龄球馆", emoji: "🎳" },
  golf_course: { cat: "高尔夫", emoji: "⛳" },
  marina: { cat: "码头", emoji: "⚓" },
  // aeroway
  aerodrome: { cat: "机场", emoji: "✈️" },
  // railway
  station: { cat: "火车站", emoji: "🚉" },
  subway_entrance: { cat: "地铁入口", emoji: "🚇" },
  // historic
  monument: { cat: "纪念碑", emoji: "🗿" },
  memorial: { cat: "纪念地", emoji: "🕊️" },
  castle: { cat: "城堡", emoji: "🏰" },
  ruins: { cat: "遗迹", emoji: "🏛️" },
  archaeological_site: { cat: "考古遗址", emoji: "⛏️" },
  // natural
  beach: { cat: "海滩", emoji: "🏖️" },
  peak: { cat: "山峰", emoji: "⛰️" },
  // building
  cathedral: { cat: "大教堂", emoji: "⛪" },
  church: { cat: "教堂", emoji: "⛪" },
  temple: { cat: "寺庙", emoji: "🛕" },
  mosque: { cat: "清真寺", emoji: "🕌" },
  synagogue: { cat: "犹太教堂", emoji: "✡️" },
};

// 根据 OSM tags 提取品类信息
function classifyOsmTags(tags) {
  if (!tags) return { cat: "地点", emoji: "📍" };
  // 优先级:tourism > amenity > shop > leisure > historic > aeroway > railway > natural > building
  const keys = [
    "tourism",
    "amenity",
    "shop",
    "leisure",
    "historic",
    "aeroway",
    "railway",
    "natural",
    "building",
  ];
  for (const k of keys) {
    const v = tags[k];
    if (v && TAG_MAP[v]) return TAG_MAP[v];
    if (v) return { cat: v, emoji: "📍" };
  }
  return { cat: "地点", emoji: "📍" };
}

// 计算两点距离(米)
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 格式化距离
export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

// ─────────────────────────────────────────────────────
// 关键词搜索:Nominatim
// ─────────────────────────────────────────────────────
export async function searchPOIs(query, coords, opts = {}) {
  console.log("[osmPoi] searchPOIs called with:", query, coords);
  if (!query || query.trim().length < 1) return [];
  const lat = coords?.lat;
  const lng = coords?.lng;
  const limit = opts.limit || 15;

  // viewbox 限定在用户附近 ~10km(经验值)
  let viewbox = "";
  let bounded = "";
  if (lat != null && lng != null) {
    const dLat = 0.1; // ~11km
    const dLng = 0.13; // 上海纬度约 11km
    const left = lng - dLng;
    const right = lng + dLng;
    const top = lat + dLat;
    const bottom = lat - dLat;
    viewbox = `&viewbox=${left},${top},${right},${bottom}`;
    bounded = "&bounded=0"; // 用 0 让 viewbox 是"偏好"而非硬限制,搜不到时仍返回更远的
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
    query
  )}&limit=${limit}&accept-language=zh-CN,zh,en&addressdetails=1&extratags=1${viewbox}${bounded}`;

  console.log("[osmPoi] fetching:", url);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("[osmPoi] non-200:", res.status);
      return [];
    }
    const data = await res.json();
    console.log("[osmPoi] got", data.length, "results");
    return data.map((item, i) => {
      const itemLat = parseFloat(item.lat);
      const itemLng = parseFloat(item.lon);
      const tags = item.extratags || {};
      // 优先用 type 作为分类参考
      let info;
      if (TAG_MAP[item.type]) {
        info = TAG_MAP[item.type];
      } else if (TAG_MAP[item.category]) {
        info = TAG_MAP[item.category];
      } else if (TAG_MAP[item.class]) {
        info = TAG_MAP[item.class];
      } else {
        info = classifyOsmTags({
          [item.category || item.class || "amenity"]: item.type,
          ...tags,
        });
      }
      const dist =
        lat != null && lng != null
          ? haversine(lat, lng, itemLat, itemLng)
          : null;
      return {
        id: `osm-${item.osm_id || i}`,
        name: item.name || item.display_name?.split(",")[0] || "未知地点",
        category: info.cat,
        emoji: info.emoji,
        rating: 4.5 + Math.random() * 0.4, // 评分 mock
        distance: dist != null ? formatDistance(dist) : "",
        distanceMeters: dist,
        address: item.display_name,
        lat: itemLat,
        lng: itemLng,
      };
    });
  } catch (err) {
    console.error("[osmPoi] search EXCEPTION:", err.message, err);
    return [];
  }
}

// ─────────────────────────────────────────────────────
// 附近 POI:Overpass API
// ─────────────────────────────────────────────────────
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

export async function fetchNearbyPOIs(coords, opts = {}) {
  if (!coords?.lat || !coords?.lng) return [];
  const radius = opts.radius || 800; // 800m 半径
  const limit = opts.limit || 30;
  const { lat, lng } = coords;

  // Overpass QL:拉所有带 name 的 amenity/tourism/shop/leisure/historic/aeroway/railway 类节点
  const query = `
[out:json][timeout:15];
(
  node(around:${radius},${lat},${lng})["name"]["amenity"];
  node(around:${radius},${lat},${lng})["name"]["tourism"];
  node(around:${radius},${lat},${lng})["name"]["shop"];
  node(around:${radius},${lat},${lng})["name"]["leisure"];
  node(around:${radius},${lat},${lng})["name"]["historic"];
  node(around:${radius},${lat},${lng})["name"]["aeroway"];
  node(around:${radius},${lat},${lng})["name"]["railway"];
);
out body ${limit * 3};
`.trim();

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      // Overpass 只接受 GET (POST 会 406)。data 参数携带 query
      const url = `${endpoint}?data=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn("[osmPoi] overpass non-200:", res.status, endpoint);
        continue;
      }
      const data = await res.json();
      if (!data?.elements) continue;
      // 排序 + 转换
      const items = data.elements
        .filter((e) => e.tags?.name)
        .map((e) => {
          const info = classifyOsmTags(e.tags);
          const dist = haversine(lat, lng, e.lat, e.lon);
          // 优先用 name:zh / name:en
          const name =
            e.tags["name:zh"] ||
            e.tags["name:zh-Hans"] ||
            e.tags.name ||
            e.tags["name:en"];
          return {
            id: `osm-${e.id}`,
            name,
            category: info.cat,
            emoji: info.emoji,
            rating: 4.4 + Math.random() * 0.5,
            distance: formatDistance(dist),
            distanceMeters: dist,
            lat: e.lat,
            lng: e.lon,
          };
        })
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, limit);
      return items;
    } catch (err) {
      console.warn("[osmPoi] overpass failed at", endpoint, err);
    }
  }
  return [];
}
