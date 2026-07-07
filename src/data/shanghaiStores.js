// 上海南京西路商圈真实门店数据(按真实点评截图整理)
// 供门店详情页(信息覆盖)、搜索结果页、美食频道页共用

export const SH_IMG = {
  lighthouse: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80",
  lighthouse2: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80",
  bco: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80",
  soso: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
  youmu: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
  shengengzai: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80",
  donghai: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=80",
  fengshengli: "https://images.unsplash.com/photo-1548919973-5cef591cdbc9?w=600&q=80",
  njxl: "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=600&q=80",
  laoshaoxing: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&q=80",
};

// 门店档案:门店详情页命中 name 时用真实信息覆盖 mock 生成
export const STORE_INFO = {
  "贰楼 The Lighthouse-亚洲小馆(丰盛里店)": {
    coords: { lat: 31.2340, lng: 121.4565 },
    rating: 4.1,
    reviews: 60,
    price: 262,
    sub: { taste: 4.2, env: 4.5, svc: 4.0 },
    category: "特色菜",
    biz: "南京西路商圈",
    dist: "714m",
    badge: "静安区特色菜新店榜第1名",
    tags: ["近30天178人打卡", "新店开业"],
    quote: "柠檬叶烤鱼是目前全上海最像曼谷的味道",
    hours: "11:30–14:30  17:00–22:00",
    address: "静安区 茂名北路229弄3号2楼(裕莲茶楼楼上)",
    open: "11:30 营业",
    deals: [
      { type: "惠", price: 191, off: "6.4折", text: "工作日午市双人套餐B", coupon: "神券减8元" },
      { type: "券", price: 80, off: "", text: "100元代金券", coupon: "神券减8元" },
    ],
    photos: [SH_IMG.lighthouse, SH_IMG.lighthouse2],
  },
  "Bco豆库(南京西路店)": {
    coords: { lat: 31.2277, lng: 121.4443 },
    rating: 4.6,
    reviews: 3392,
    price: 126,
    sub: { taste: 4.5, env: 4.7, svc: 4.5 },
    category: "西餐",
    biz: "南京西路商圈",
    dist: "566m",
    badge: "南京西路商圈西餐热门榜第5名",
    tags: ["连锁", "值得排队"],
    quote: "靠窗位采光超棒，随手拍都很出片",
    hours: "10:00–22:00",
    address: "静安区 南京西路1601号",
    open: "22:00 休息",
    deals: [],
    photos: [SH_IMG.bco],
  },
  "游牧Bistro小酒馆 by 耶里": {
    coords: { lat: 31.2330, lng: 121.4614 },
    rating: 4.8,
    reviews: 3118,
    price: 125,
    sub: { taste: 4.8, env: 4.9, svc: 4.7 },
    category: "新疆菜",
    biz: "南京西路商圈",
    dist: "718m",
    badge: "上海新疆菜环境榜第1名",
    tags: ["连锁", "有宝宝椅"],
    quote: "晚霞时段玻璃房超浪漫，记得预约",
    hours: "11:00–22:30",
    address: "静安区 吴江路169号四季坊",
    open: "11:00 营业",
    deals: [
      { type: "惠", price: 198, off: "7.4折", text: "【午市精选】工作日双人餐" },
      { type: "惠", price: 368, off: "7.2折", text: "【游牧风味】公路沙湾大盘鸡2-3人" },
    ],
    photos: [SH_IMG.youmu],
  },
  "神更仔·潮汕魂大排档(汉口路店)": {
    coords: { lat: 31.2358, lng: 121.4795 },
    rating: 4.3,
    reviews: 21307,
    price: 110,
    sub: { taste: 4.4, env: 4.0, svc: 4.1 },
    category: "潮汕菜",
    biz: "人民广场/南京路",
    dist: "2.0km",
    badge: "上海潮汕菜销量榜第1名",
    tags: ["神券"],
    quote: "生腌天花板，凌晨还在排队",
    hours: "11:00–次日02:00",
    address: "黄浦区 汉口路650号",
    open: "营业中",
    deals: [
      { type: "惠", price: 206, off: "", text: "【胶己人】工作日午市双人餐", coupon: "神券减8元" },
      { type: "秒", price: 7.2, off: "4折", text: "[单人餐]【中意你】冻柠茶", coupon: "剩余02:33:24" },
    ],
    photos: [SH_IMG.shengengzai],
  },
  "SOSO盐面包": {
    coords: { lat: 31.2300, lng: 121.4525 },
    rating: 4.5,
    reviews: 1286,
    price: 32,
    sub: { taste: 4.6, env: 4.2, svc: 4.3 },
    category: "面包烘焙",
    biz: "南京西路商圈",
    dist: "499m",
    badge: "静安区面包烘焙热门榜第3名",
    tags: ["排队王"],
    quote: "盐面包出炉即空，掐点去还热着",
    hours: "08:00–20:00",
    address: "静安区 陕西北路66号",
    open: "营业中",
    deals: [],
    photos: [SH_IMG.soso],
  },
  "东海滙舟山海鲜": {
    coords: { lat: 31.2405, lng: 121.4525 },
    rating: 4.7,
    reviews: 8452,
    price: 328,
    sub: { taste: 4.8, env: 4.5, svc: 4.6 },
    category: "海鲜",
    biz: "南京西路商圈",
    dist: "742m",
    badge: "必吃榜 2026年上榜",
    tags: ["宴请"],
    quote: "海鲜按只点不宰客，带外地朋友首选",
    hours: "11:00–21:30",
    address: "静安区 江宁路495号",
    open: "营业中",
    deals: [],
    photos: [SH_IMG.donghai],
  },
  "丰盛里": {
    coords: { lat: 31.2362, lng: 121.4598 },
    rating: 4.9,
    reviews: 4984,
    price: 0,
    sub: { taste: 4.8, env: 4.9, svc: 4.8 },
    category: "商场",
    biz: "南京西路商圈",
    dist: "676m",
    badge: "南京西路商圈购物热门榜第4名",
    tags: [],
    quote: "石库门里的新里弄，晚上灯亮起来最好看",
    hours: "10:00–22:00",
    address: "静安区 茂名北路227弄",
    open: "营业中",
    deals: [],
    photos: [SH_IMG.fengshengli],
  },
  "老绍兴豆浆油条": {
    coords: { lat: 31.2145, lng: 121.4855 },
    rating: 4.4,
    reviews: 5211,
    price: 18,
    sub: { taste: 4.6, env: 3.8, svc: 4.0 },
    category: "小吃快餐",
    biz: "肇周路",
    dist: "3.1km",
    badge: "上海深夜食堂人气榜第2名",
    tags: ["24小时"],
    quote: "凌晨四点的豆浆油条，夜班人的深夜食堂",
    hours: "全天 24 小时",
    address: "黄浦区 肇周路108号",
    open: "营业中",
    deals: [],
    photos: [SH_IMG.laoshaoxing],
  },
};

// 虚构门店的坐标(梧桐区,清单地图用)
export const EXTRA_COORDS = {
  "安福路小酒馆": { lat: 31.2198, lng: 121.4372 },
  "小满手工粉": { lat: 31.2215, lng: 121.441 },
  "永康路咖啡角": { lat: 31.209, lng: 121.453 },
};

// 统一取坐标:真实档案 → 虚构补充
export function getStoreCoords(name) {
  return STORE_INFO[name]?.coords || EXTRA_COORDS[name] || null;
}

// 便捷构造 poi 对象
export function shPoi(name) {
  const info = STORE_INFO[name];
  return {
    name,
    city: "上海",
    district: "静安",
    category: info?.category || "美食",
    emoji: "🍽️",
  };
}

// 搜索结果页「南京西路」的商户结果(按截图顺序)
export const NJXL_SEARCH_RESULTS = ["Bco豆库(南京西路店)", "丰盛里", "游牧Bistro小酒馆 by 耶里"];

// 美食频道页的门店列表
export const FOOD_CHANNEL_STORES = ["贰楼 The Lighthouse-亚洲小馆(丰盛里店)", "神更仔·潮汕魂大排档(汉口路店)", "游牧Bistro小酒馆 by 耶里"];
