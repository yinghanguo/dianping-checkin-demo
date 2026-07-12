// Niki 的历史打卡数据(基于真实截图整理 ≈45 条)
// 范围:4/19 上海日常 → 4/24 出发 → 4/25-4/30 巴塞罗那+塞维利亚+格拉纳达 → 5/1-5/4 帕尔马
// 时间倒序

// 配图:用 unsplash 主题图代替真实拍摄
const IMG = {
  // 酒店
  hotel_lobby: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  hotel_room: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
  hotel_pool: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80",
  // 餐厅美食
  tapas: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&q=80",
  paella: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&q=80",
  brunch: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80",
  spanish_food: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
  noodle: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
  hotpot: "https://images.unsplash.com/photo-1620462320005-3962cf3a0fdf?w=600&q=80",
  fish: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80",
  cocktail: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80",
  // 咖啡
  coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
  latte_art: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
  cappuccino: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
  brunch_kiwi: "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&q=80",
  pastry: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
  orange_juice: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80",
  // 景点
  sagrada: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=600&q=80",
  alhambra: "https://images.unsplash.com/photo-1556707752-481d500a2c58?w=600&q=80",
  alhambra_court: "https://images.unsplash.com/photo-1591015234706-7c4c69d8b25c?w=600&q=80",
  cathedral: "https://images.unsplash.com/photo-1583338566133-fa2eddb2f0c5?w=600&q=80",
  monastery: "https://images.unsplash.com/photo-1568849676085-51415703900f?w=600&q=80",
  museum: "https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=600&q=80",
  picasso: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600&q=80",
  park_guell: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80",
  casa_batllo: "https://images.unsplash.com/photo-1564594985645-4427056e22e2?w=600&q=80",
  plaza_espana: "https://images.unsplash.com/photo-1592402015384-8f6e7e0e1fb1?w=600&q=80",
  market: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80",
  theatre: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&q=80",
  monument: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80",
  mountain: "https://images.unsplash.com/photo-1568849676085-51415703900f?w=600&q=80",
  cathedral_palma: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80",
  // 机场
  airport: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&q=80",
  airport_terminal: "https://images.unsplash.com/photo-1540339832862-474599807836?w=600&q=80",
  // 其他
  perfume: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80",
  salon: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80",
  // 房间
  blue_chairs: "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=600&q=80",
  lamp: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80",
  trees: "https://images.unsplash.com/photo-1444930694458-01babe71870e?w=600&q=80",
};

// ── 真实 GPS 坐标(Nominatim + 手动修正) ──
const REAL_COORDS = {
  "塞勒斯西乌塔德尔宝勒巷酒店": { lat: 39.569600, lng: 2.650200 },
  "Monument a Frédéric Chopin": { lat: 39.710300, lng: 2.618800 },
  "法德摩萨": { lat: 39.710300, lng: 2.621000 },
  "Es Taller (Valldemossa)": { lat: 39.710300, lng: 2.618800 },
  "HM 巴兰圭拉酒店": { lat: 39.568500, lng: 2.647500 },
  "Arquinesia Perfumes": { lat: 39.570800, lng: 2.646100 },
  "Tapas y más l Restaurant Santa Ponsa": { lat: 39.507200, lng: 2.468600 },
  "加拉佐马略卡希尔顿酒店": { lat: 39.756900, lng: 2.790800 },
  "Restaurante El Pasaje Tapas": { lat: 37.384700, lng: -5.993000 },
  "Billy Brunch": { lat: 37.391900, lng: -6.000600 },
  "Orange Tree Sevilla": { lat: 37.386200, lng: -5.989000 },
  "San Marco": { lat: 37.386200, lng: -5.989900 },
  "JESTER Specialty Coffee & Juice": { lat: 37.387000, lng: -5.991000 },
  "Mercado Puerta de la Carne": { lat: 37.385700, lng: -5.984900 },
  "Restaurante Aixa": { lat: 37.176200, lng: -3.588800 },
  "La Auténtica Carmela": { lat: 37.176600, lng: -3.596000 },
  "圣胡安-德迪奥斯大教堂": { lat: 37.178200, lng: -3.598400 },
  "Bodegas Castañeda": { lat: 37.176800, lng: -3.597000 },
  "纳斯瑞德宫": { lat: 37.176100, lng: -3.589600 },
  "狮子庭院": { lat: 37.176000, lng: -3.588800 },
  "桃金娘庭院": { lat: 37.176300, lng: -3.589200 },
  "Gran Via 9": { lat: 37.177000, lng: -3.598400 },
  "La Place": { lat: 41.297400, lng: 2.083300 },
  "巴塞罗那主教座堂": { lat: 41.384000, lng: 2.176300 },
  "波盖利亚市场": { lat: 41.381700, lng: 2.171600 },
  "里西奥大剧院": { lat: 41.380500, lng: 2.173500 },
  "圣家族大教堂": { lat: 41.403500, lng: 2.174400 },
  "365 Sagrada Família": { lat: 41.404400, lng: 2.174900 },
  "古埃尔公园": { lat: 41.414200, lng: 2.152500 },
  "巴特罗之家": { lat: 41.391500, lng: 2.164700 },
  "蒙塞拉特山": { lat: 41.595500, lng: 1.838000 },
  "蒙塞拉特修道院": { lat: 41.593000, lng: 1.836500 },
  "BODEGA AMPOSTA": { lat: 41.371900, lng: 2.147600 },
  "西班牙广场": { lat: 41.375400, lng: 2.149000 },
  "加泰罗尼亚国家艺术博物馆": { lat: 41.368400, lng: 2.153400 },
  "Farggi Cafe": { lat: 41.383700, lng: 2.177800 },
  "Casa Rafols": { lat: 41.380000, lng: 2.175500 },
  "毕加索博物馆": { lat: 41.385100, lng: 2.180800 },
  "Jon Cake & Coffee": { lat: 41.383800, lng: 2.179500 },
  "上海浦东国际机场": { lat: 31.144300, lng: 121.808300 },
  "上海浦东国际机场-T2 航站楼": { lat: 31.145000, lng: 121.805000 },
  "甬悦柒鲜·新浙菜·东海大带鱼(长阳路店)": { lat: 31.264000, lng: 121.528000 },
  "港得丽餐厅打边炉(黄兴路店)": { lat: 31.276000, lng: 121.522000 },
  "人民公社铁锅炖·东北菜(长阳创谷店)": { lat: 31.265000, lng: 121.526500 },
  "SUNNY CASA 桑妮形象造型(上海商城店)": { lat: 31.228600, lng: 121.449800 },
  "禄银肠粉 (淮海中路店)": { lat: 31.2210, lng: 121.4695 },
  "Gaucho Richmond": { lat: 51.456387, lng: -0.304486 },
  "Aotea Gifts Queenstown": { lat: -45.032860, lng: 168.657682 },
  "Akin cafe Queenstown": { lat: -44.849905, lng: 168.383148 },
  "Flame Bar Grill Queenstown": { lat: -45.032452, lng: 168.658688 },
  "Scroggin Coffee and Eatery": { lat: -44.694237, lng: 169.137382 },
  "WanaFusion Queenstown": { lat: -44.693751, lng: 169.137536 },
  "Edgewater Hotel Wanaka": { lat: -44.695024, lng: 169.112488 },
  "C1 Espresso Christchurch": { lat: -43.535138, lng: 172.640482 },
  "Riverside Market Christchurch": { lat: -43.533915, lng: 172.634002 },
  "Jimmy's Smokehouse Christchurch": { lat: -43.533954, lng: 172.633016 },
  "Fern House Christchurch": { lat: -43.529453, lng: 172.621147 },
  "Child Sister cafe Christchurch": { lat: -43.529177, lng: 172.639482 },
  "supreme supreme cafe Christchurch": { lat: -43.537065, lng: 172.637358 },
  "Hilton Doubletree Christchurch": { lat: -43.526412, lng: 172.611865 },
  "Két Szerecsen Budapest": { lat: 47.502841, lng: 19.060849 },
  "塞切尼链桥": { lat: 47.498979, lng: 19.043649 },
  "Belgian Brasserie Henri Budapest": { lat: 47.501672, lng: 19.039756 },
  "Ildikó Konyhája Budapest": { lat: 47.499628, lng: 19.039867 },
  "火药塔 Prague": { lat: 50.087243, lng: 14.427756 },
  "卡夫卡博物馆": { lat: 50.087984, lng: 14.410511 },
  "Porks restaurant Prague": { lat: 50.080533, lng: 14.422868 },
  "Quan Bui Original Ho Chi Minh": { lat: 10.781482, lng: 106.705911 },
  "颐和园": { lat: 39.990098, lng: 116.264740 },
  "禧兴 Liveliness coffee shop": { lat: 31.224800, lng: 121.471000 },
  "多伦路文化名人街": { lat: 31.262500, lng: 121.484800 },
  "捡角台湾食堂 苏河湾万象天地店": { lat: 31.245500, lng: 121.452000 },
  "内啡肽网球俱乐部 七浦路店": { lat: 31.246800, lng: 121.460100 },
  "沪水焙煎室(淡水路店)": { lat: 31.219800, lng: 121.468200 },
  "page coffee": { lat: 31.225500, lng: 121.445200 },
  "No.23 U'NI'VER'SE(社区店)": { lat: 31.240200, lng: 121.452100 },
  "coffee slow pour": { lat: 31.221300, lng: 121.472300 },
  "Marmalade(奉贤路店)": { lat: 31.233800, lng: 121.462000 },
  "特写南站": { lat: 31.154800, lng: 121.430200 },
  "Book a Coffee 书洞咖啡(静安店)": { lat: 31.235800, lng: 121.455200 },
  "Coffee Spot": { lat: 31.229100, lng: 121.449800 },
  "gluglu": { lat: 31.224000, lng: 121.469500 },
  "苍山古滇云贵本帮融合 太阳宫店": { lat: 31.258000, lng: 121.504200 },
  "小厨面 洋泾总店": { lat: 31.236000, lng: 121.528000 },
  "港季茶餐厅 南京西路店": { lat: 31.228600, lng: 121.449800 },
  "金叶子西北菜·滩羊手抓": { lat: 37.504800, lng: 105.188400 },
  "沙坡头旅游度假区": { lat: 37.466300, lng: 104.958800 },
  "中卫沙漠星星酒店": { lat: 37.478000, lng: 104.965000 },
  "悟空日式火锅": { lat: -45.032000, lng: 168.659000 },
  "Wakatipu Grill(皇后镇店)": { lat: -45.021000, lng: 168.673000 },
  "Eatery by Frank's": { lat: -45.020800, lng: 168.672500 },
  "Lone Star Riccarton": { lat: -43.533700, lng: 172.594000 },
  "Espresso Studio by Fushoken": { lat: -43.530500, lng: 172.636800 },
  "Rusutsu Sakaba": { lat: 42.744300, lng: 140.905600 },
  "留寿都谷酒店式公寓": { lat: 42.744000, lng: 140.906000 },
  "日本料理 風花": { lat: 42.802200, lng: 140.688500 },
  "雪花亭": { lat: 42.801000, lng: 140.687000 },
  "備長炭炭火焼鳥 鶏出汁おでん影 kage": { lat: 42.805000, lng: 140.690000 },
  "Boutique Hungaricum": { lat: 47.498600, lng: 19.044400 },
  "Zërgë Coffeeshop": { lat: 47.501000, lng: 19.040500 },
  "Royal Guard Cafe": { lat: 47.501200, lng: 19.042000 },
  "布拉格天文钟": { lat: 50.087000, lng: 14.420800 },
  "Noir. Dining in the Dark": { lat: 10.795500, lng: 106.702400 },
  "六棉酒家": { lat: 22.163100, lng: 113.559600 },
  "旺记咖啡(官也街店)": { lat: 22.160800, lng: 113.558000 },
  "新武二广福潮美食(機場禁區店)": { lat: 22.149700, lng: 113.592000 },
  "义顺牛奶公司(新马路老店)": { lat: 22.188800, lng: 113.539900 },
  "杨枝金捞甜品(氹仔泉澧店)": { lat: 22.162000, lng: 113.558800 },
  "CABO Coffee": { lat: 39.882300, lng: 116.415800 },
  "大碗居·烤鸭·鱼头泡饼(天坛东门店)": { lat: 39.882000, lng: 116.418000 },
  "汤城小厨(五道口购物中心店)": { lat: 40.002200, lng: 116.341800 },
  "滇大池云南菜·蒸汽石锅鱼(望京诚盈店)": { lat: 39.987900, lng: 116.482500 },
  "悦阁咖啡厅·昆泰嘉晟酒店": { lat: 39.987000, lng: 116.483000 },
  "蓝天大洋游泳培训中心(昆泰嘉晟酒店)": { lat: 39.986800, lng: 116.482800 },
  "95号酱骨·一块豆腐(展春园西路店)": { lat: 39.998500, lng: 116.342000 },
  "潮粥人·非遗潮汕菜(五道口购物中心店)": { lat: 40.001800, lng: 116.341500 },
  "铁手咖啡&烘焙(知春路店)": { lat: 40.001000, lng: 116.338800 },
  "欧也 Wiggly Jiggly's(魏公芳华里店)": { lat: 39.979200, lng: 116.315800 },
};

// 城市经纬度(用于地图视图)
const CITIES = {
  中卫: { lat: 37.5002, lng: 105.1960 },
  伦敦: { lat: 51.5074, lng: -0.1278 },
  皇后镇: { lat: -45.0312, lng: 168.6626 },
  基督城: { lat: -43.5321, lng: 172.6362 },
  北海道: { lat: 43.0646, lng: 141.3468 },
  布达佩斯: { lat: 47.4979, lng: 19.0402 },
  布拉格: { lat: 50.0755, lng: 14.4378 },
  胡志明市: { lat: 10.8231, lng: 106.6297 },
  澳门: { lat: 22.1987, lng: 113.5439 },
  北京: { lat: 39.9042, lng: 116.4074 },
  上海: { lat: 31.2304, lng: 121.4737 },
  浦东机场: { lat: 31.1443, lng: 121.8083 },
  巴塞罗那机场: { lat: 41.2974, lng: 2.0833 },
  巴塞罗那: { lat: 41.3851, lng: 2.1734 },
  蒙塞拉特: { lat: 41.5921, lng: 1.8378 },
  格拉纳达: { lat: 37.1773, lng: -3.5986 },
  塞维利亚: { lat: 37.3891, lng: -5.9845 },
  马略卡: { lat: 39.5696, lng: 2.6502 },
};

// 品类 → emoji
function emoji(cat) {
  if (!cat) return "📍";
  const c = cat;
  if (c.includes("咖啡")) return "☕";
  if (c.includes("机场")) return "✈️";
  if (c.includes("酒店")) return "🏨";
  if (c.includes("古迹") || c.includes("人文")) return "🏛️";
  if (c.includes("宗教") || c.includes("教堂")) return "⛪";
  if (c.includes("展览") || c.includes("博物")) return "🖼️";
  if (c.includes("公园") || c.includes("广场")) return "🌳";
  if (c.includes("集市")) return "🛍️";
  if (c.includes("演出")) return "🎭";
  if (c.includes("化妆")) return "💄";
  if (c.includes("美发")) return "💇";
  if (c.includes("茶餐厅") || c.includes("东北") || c.includes("浙菜")) return "🍴";
  if (c.includes("西班牙") || c.includes("西餐")) return "🍷";
  if (c.includes("更多美食") || c.includes("美食")) return "🍴";
  if (c.includes("面包") || c.includes("甜点")) return "🥐";
  if (c.includes("现代建筑") || c.includes("观光")) return "🏛️";
  if (c.includes("更多景点") || c.includes("景点")) return "🌆";
  return "📍";
}

// 帮助函数:构造打卡条目
function ck({
  date,
  weekday,
  time,
  name,
  city,
  district,
  category,
  achievement,
  photos,
  visibility = "public",
  likes = 0,
  comments = 0,
  text = "",
  year = 2026,
}) {
  // 优先用真实 GPS 坐标,fallback 到城市中心+微偏移
  const realCoord = REAL_COORDS[name];
  const cityInfo = CITIES[city] || CITIES["上海"];
  const seed = (name.length + date.length) % 100;
  const offsetLat = realCoord ? 0 : (seed - 50) * 0.002;
  const offsetLng = realCoord ? 0 : (seed - 50) * 0.003;
  return {
    id: `niki-${date.replace("/", "-")}-${time.replace(":", "")}-${name.slice(0, 4)}`,
    user: "niki",
    date, // "5/4"
    weekday, // "周一"
    time, // "07:02"
    timestamp: parseDate(date, time, year),
    poi: {
      name,
      city,
      district: district || "",
      category,
      emoji: emoji(category),
    },
    coords: { lat: (realCoord?.lat || cityInfo.lat) + offsetLat, lng: (realCoord?.lng || cityInfo.lng) + offsetLng },
    achievement: achievement || null,
    photos: photos || [],
    visibility,
    likes,
    comments,
    text,
  };
}

// 解析 "5/4" + "07:02" + year → JS Date
function parseDate(d, t, year = 2026) {
  const [m, day] = d.split("/").map(Number);
  const [hh, mm] = t.split(":").map(Number);
  return new Date(year, m - 1, day, hh, mm).getTime();
}

export const MY_CHECKINS = [
  // ───── 5/4 周一 帕尔马 ─────
  ck({
    date: "5/4", weekday: "周一", time: "07:02",
    name: "塞勒斯西乌塔德尔宝勒巷酒店",
    city:"马略卡", district: "加泰罗尼亚", category: "酒店 · 高档型",
    photos: [IMG.blue_chairs],
    text: "帕尔马老城区内，中世纪贵族宅邸改建，推开木门是露台泳池，安静得像一个秘密",
  }),

  // ───── 5/3 周日 帕尔马 / 法德摩萨 ─────
  ck({
    date: "5/3", weekday: "周日", time: "22:58",
    name: "Monument a Frédéric Chopin",
    city: "马略卡", district: "马略卡岛", category: "更多景点",
    achievement: "今年第 37 次打卡景点,给精神充电",
    photos: [IMG.monument],
    text: "肖邦在这里度过了人生最后几个冬天，小镇安静得像首夜曲",
  }),
  ck({
    date: "5/3", weekday: "周日", time: "22:58",
    name: "法德摩萨",
    city: "马略卡", district: "马略卡岛", category: "观光街区",
    achievement: "今年第 36 次打卡景点,给精神充电",
    photos: [IMG.cathedral_palma],
    text: "马略卡岛最迷人的山间小镇，石头房子铺满爬山虎，停下来发呆一下午",
  }),
  ck({
    date: "5/3", weekday: "周日", time: "22:22",
    name: "Es Taller (Valldemossa)",
    city: "马略卡", district: "马略卡岛", category: "更多美食",
    photos: [IMG.spanish_food],
    text: "法德摩萨村里的家庭小馆，本地猪肉香肠配烤面包，简单又满足",
  }),
  ck({
    date: "5/3", weekday: "周日", time: "03:47",
    name: "HM 巴兰圭拉酒店",
    city: "马略卡", district: "马略卡岛", category: "酒店 · 高档型",
    photos: [IMG.lamp],
    text: "紧邻帕尔马海滨大道，性价比很高的连锁，房间不大但位置完美，步行五分钟到老城",
  }),
  ck({
    date: "5/3", weekday: "周日", time: "00:15",
    name: "Arquinesia Perfumes",
    city: "马略卡", district: "马略卡岛", category: "化妆品",
    photos: [IMG.perfume],
  }),

  // ───── 5/2 周六 帕尔马 ─────
  ck({
    date: "5/2", weekday: "周六", time: "21:01",
    name: "Tapas y más l Restaurant Santa Ponsa",
    city: "马略卡", district: "马略卡岛", category: "西班牙菜",
    photos: [IMG.cocktail],
    text: "面朝大海的露天餐厅，sangria 配海鲜tapas，夕阳打在海面上那一刻真的值回一切",
  }),
  ck({
    date: "5/2", weekday: "周六", time: "18:30",
    name: "加拉佐马略卡希尔顿酒店",
    city: "马略卡", district: "马略卡岛", category: "酒店 · 豪华型",
    photos: [IMG.hotel_pool],
    text: "岛东北海岸的度假酒店，无边泳池直面地中海，看日出是这里最对的事",
  }),

  // ───── 5/1 劳动节 塞维利亚 ─────
  ck({
    date: "5/1", weekday: "劳动节", time: "22:44",
    name: "Restaurante El Pasaje Tapas",
    city: "塞维利亚", district: "老城区/圣十字区", category: "西班牙菜",
    photos: [IMG.tapas],
    text: "老城区窄巷里的tapas小馆，炸乌贼和血肠是招牌，价格亲切，当地人很多",
  }),
  ck({
    date: "5/1", weekday: "劳动节", time: "16:00",
    name: "Billy Brunch",
    city: "塞维利亚", district: "塞维利亚火车站", category: "更多美食",
    photos: [IMG.latte_art],
    text: "环境很好的全天早午餐，牛油果吐司加一杯flat white，塞维利亚慵懒午后的标配",
  }),
  ck({
    date: "5/1", weekday: "劳动节", time: "02:27",
    name: "Orange Tree Sevilla",
    city: "塞维利亚", district: "老城区/圣十字区", category: "超市/便利店",
    achievement: "五一打卡!假期模式启动",
    photos: [IMG.market],
  }),

  // ───── 4/30 周四 塞维利亚 ─────
  ck({
    date: "4/30", weekday: "周四", time: "21:34",
    name: "San Marco",
    city: "塞维利亚", district: "老城区/圣十字区", category: "西餐",
    photos: [IMG.spanish_food],
    text: "意式披萨在塞维利亚意外地好吃，老城区里性价比很高的晚餐选择",
  }),
  ck({
    date: "4/30", weekday: "周四", time: "16:42",
    name: "JESTER Specialty Coffee & Juice",
    city: "塞维利亚", district: "老城区/圣十字区", category: "咖啡",
    achievement: "今年第 32 次打卡咖啡!清醒不掉线",
    photos: [IMG.brunch_kiwi],
    text: "塞维利亚最好的精品咖啡之一，V60单品很稳，绿意盎然的室内空间让人不想走",
  }),
  ck({
    date: "4/30", weekday: "周四", time: "15:58",
    name: "Mercado Puerta de la Carne",
    city: "塞维利亚", district: "塞维利亚火车站", category: "特色集市",
    photos: [IMG.market],
    text: "当地菜市场改造的美食广场，西班牙火腿、奶酪、生蚝都有，可以坐下来边喝边吃",
  }),
  ck({
    date: "4/30", weekday: "周四", time: "03:01",
    name: "Restaurante El Pasaje Tapas",
    city: "塞维利亚", district: "老城区/圣十字区", category: "西班牙菜",
    achievement: "今年第 4 次用美食拥抱清晨",
    photos: [IMG.orange_juice],
  }),

  // ───── 4/29 周三 格拉纳达 ─────
  ck({
    date: "4/29", weekday: "周三", time: "19:23",
    name: "Restaurante Aixa",
    city: "格拉纳达", district: "纳塞瑞斯皇宫", category: "更多美食",
    photos: [IMG.spanish_food],
    text: "阿尔罕布拉宫脚下的小餐厅，炸茄子淋蜂蜜是格拉纳达最有名的吃法，在这里第一次试到",
  }),
  ck({
    date: "4/29", weekday: "周三", time: "04:18",
    name: "La Auténtica Carmela",
    city: "格拉纳达", district: "纳塞瑞斯皇宫", category: "西班牙菜",
    achievement: "今年第 3 次用美食拥抱清晨",
    photos: [IMG.tapas],
    text: "当地人爱去的家常馆子，离游客区走几步路，价格直接打对折，肉丸子和炸鱼极好",
  }),

  // ───── 4/28 周二 格拉纳达 → 巴塞罗那 ─────
  ck({
    date: "4/28", weekday: "周二", time: "22:46",
    name: "圣胡安-德迪奥斯大教堂",
    city: "格拉纳达", district: "圣尼古拉斯眺望台", category: "人文古迹",
    achievement: "当天第 1 位古迹见证者",
    photos: [IMG.cathedral],
  }),
  ck({
    date: "4/28", weekday: "周二", time: "20:48",
    name: "Bodegas Castañeda",
    city: "格拉纳达", district: "纳塞瑞斯皇宫", category: "西餐",
    photos: [IMG.spanish_food],
    text: "1927年的百年老酒馆，点杯雪莉酒会附赠免费tapas，这是格拉纳达独有的传统，一定要来",
  }),
  ck({
    date: "4/28", weekday: "周二", time: "18:20",
    name: "纳斯瑞德宫",
    city: "格拉纳达", district: "纳塞瑞斯皇宫", category: "人文古迹",
    achievement: "当天第 1 位古迹见证者",
    photos: [IMG.alhambra],
  }),
  ck({
    date: "4/28", weekday: "周二", time: "17:33",
    name: "狮子庭院",
    city: "格拉纳达", district: "纳塞瑞斯皇宫", category: "宗教",
    achievement: "今年第 33 次打卡景点,给精神充电",
    photos: [IMG.alhambra_court],
  }),
  ck({
    date: "4/28", weekday: "周二", time: "17:27",
    name: "桃金娘庭院",
    city: "格拉纳达", district: "纳塞瑞斯皇宫", category: "更多景点",
    achievement: "今年第 32 次打卡景点,给精神充电",
    photos: [IMG.alhambra_court],
  }),
  ck({
    date: "4/28", weekday: "周二", time: "15:30",
    name: "Gran Via 9",
    city: "格拉纳达", district: "纳塞瑞斯皇宫", category: "咖啡",
    achievement: "今年第 31 次打卡咖啡!清醒不掉线",
    photos: [IMG.cappuccino],
    text: "大街上随便走进去的一家，咖啡出乎意料地好，露天座位能看见阿尔罕布拉宫的山，坐了很久",
  }),
  ck({
    date: "4/28", weekday: "周二", time: "02:09",
    name: "La Place",
    city: "巴塞罗那机场", district: "巴塞罗那机场", category: "更多美食",
    achievement: "今年第 2 次用美食拥抱清晨",
    photos: [IMG.noodle],
  }),
  ck({
    date: "4/28", weekday: "周二", time: "00:17",
    name: "巴塞罗那主教座堂",
    city: "巴塞罗那", district: "哥特区/老城区", category: "宗教",
    achievement: "今年第 31 次打卡景点,给精神充电",
    photos: [IMG.cathedral],
  }),
  ck({
    date: "4/28", weekday: "周二", time: "00:02",
    name: "波盖利亚市场",
    city: "巴塞罗那", district: "哥特区/老城区", category: "特色集市",
    achievement: "做个人生玩家!打卡第 17 个必玩榜",
    photos: [IMG.market],
    text: "兰布拉大道上的著名市场，现榨果汁1欧一杯，海鲜新鲜到直接站着吃，但中午人很多",
  }),

  // ───── 4/27 周一 巴塞罗那 ─────
  ck({
    date: "4/27", weekday: "周一", time: "23:59",
    name: "里西奥大剧院",
    city: "巴塞罗那", district: "哥特区/老城区", category: "演出场馆",
    achievement: "今年第 30 次打卡景点,给精神充电",
    photos: [IMG.theatre],
    visibility: "private",
  }),
  ck({
    date: "4/27", weekday: "周一", time: "20:53",
    name: "圣家族大教堂",
    city: "巴塞罗那", district: "扩展区", category: "人文古迹",
    achievement: "做个人生玩家!打卡第 16 个必玩榜",
    photos: [IMG.sagrada, IMG.cathedral, IMG.monument],
    text: "建了140年还没建完，但内部彩窗的光线是我见过最美的，建议买内部门票+塔楼",
    likes: 1,
  }),
  ck({
    date: "4/27", weekday: "周一", time: "20:18",
    name: "365 Sagrada Família",
    city: "巴塞罗那", district: "扩展区", category: "咖啡",
    achievement: "今年第 30 次打卡咖啡!清醒不掉线",
    photos: [IMG.pastry],
  }),
  ck({
    date: "4/27", weekday: "周一", time: "17:36",
    name: "古埃尔公园",
    city: "巴塞罗那", district: "恩典区", category: "公园/广场",
    achievement: "做个人生玩家!打卡第 15 个必玩榜",
    photos: [IMG.park_guell, IMG.trees, IMG.mountain],
    text: "高迪的幻想世界，马赛克拼贴的长椅俯瞰全城，傍晚光线最好，提前网上预约门票",
  }),
  ck({
    date: "4/27", weekday: "周一", time: "16:59",
    name: "巴特罗之家",
    city: "巴塞罗那", district: "扩展区", category: "人文古迹",
    achievement: "做个人生玩家!打卡第 14 个必玩榜",
    photos: [IMG.casa_batllo, IMG.theatre, IMG.picasso],
    text: "高迪最迷幻的建筑，贝壳和龙骨的灵感随处可见，配套的AR导览做得非常好",
  }),

  // ───── 4/26 周日 蒙塞拉特 → 巴塞罗那 ─────
  ck({
    date: "4/26", weekday: "周日", time: "23:18",
    name: "蒙塞拉特山",
    city: "蒙塞拉特", district: "加泰罗尼亚", category: "更多景点",
    achievement: "今年第 26 次打卡景点,给精神充电",
    photos: [IMG.mountain],
  }),
  ck({
    date: "4/26", weekday: "周日", time: "23:03",
    name: "蒙塞拉特修道院",
    city: "蒙塞拉特", district: "加泰罗尼亚", category: "宗教",
    achievement: "今年第 25 次打卡景点,给精神充电",
    photos: [IMG.monastery, IMG.cathedral],
  }),
  ck({
    date: "4/26", weekday: "周日", time: "19:39",
    name: "BODEGA AMPOSTA",
    city: "巴塞罗那", district: "蒙特惠奇区", category: "西班牙菜",
    photos: [IMG.tapas],
    text: "哥特区宝藏小馆，简单的桌布木椅，但patatas bravas和小牛肉卷是真的好吃，配本地酒刚刚好",
  }),
  ck({
    date: "4/26", weekday: "周日", time: "19:13",
    name: "西班牙广场",
    city: "巴塞罗那", district: "扩展区", category: "现代建筑",
    achievement: "今年第 24 次打卡景点,给精神充电",
    photos: [IMG.plaza_espana],
  }),
  ck({
    date: "4/26", weekday: "周日", time: "16:41",
    name: "加泰罗尼亚国家艺术博物馆",
    city: "巴塞罗那", district: "蒙特惠奇区", category: "展览馆",
    achievement: "今年第 23 次打卡景点,给精神充电",
    photos: [IMG.museum, IMG.plaza_espana, IMG.picasso],
    text: "建筑本身就值回票价，阶梯广场俯瞰巴塞全景是绝佳视角，罗马艺术展厅比想象中震撼",
  }),
  ck({
    date: "4/26", weekday: "周日", time: "15:22",
    name: "Farggi Cafe",
    city: "巴塞罗那", district: "哥特区/老城区", category: "咖啡",
    achievement: "今年第 28 次打卡咖啡!清醒不掉线",
    photos: [IMG.pastry],
    text: "哥特区转角的小咖啡馆，坐在露台喝杯cortado看人来人往，ensaimada酥皮点心很好",
  }),

  // ───── 4/25 周六 巴塞罗那 ─────
  ck({
    date: "4/25", weekday: "周六", time: "21:12",
    name: "Casa Rafols",
    city: "巴塞罗那", district: "哥特区/老城区", category: "西班牙菜",
    photos: [IMG.fish],
    comments: 5,
    text: "哥特区的家庭小馆，午市套餐三道菜加酒水才十几欧，新鲜鱼和炖肉都很稳，当地人很多",
  }),
  ck({
    date: "4/25", weekday: "周六", time: "18:12",
    name: "毕加索博物馆",
    city: "巴塞罗那", district: "哥特区/老城区", category: "展览馆",
    achievement: "做个人生玩家!打卡第 13 个必玩榜",
    photos: [IMG.picasso, IMG.museum, IMG.picasso],
    text: "早年习作比晚期更打动我，能看到他从传统走向抽象的完整轨迹，建议留两小时",
  }),
  ck({
    date: "4/25", weekday: "周六", time: "17:32",
    name: "Jon Cake & Coffee",
    city: "巴塞罗那", district: "哥特区/老城区", category: "面包甜点",
    photos: [IMG.pastry],
    text: "毕加索博物馆旁边的小甜品店，芝士蛋糕质地绵密是招牌，配手冲咖啡下午茶组合",
  }),
  ck({
    date: "4/25", weekday: "周六", time: "00:06",
    name: "上海浦东国际机场",
    city: "浦东机场", district: "机场镇/机场相关", category: "机场",
    achievement: "今年第 4 次打卡机场",
    photos: [IMG.airport_terminal, IMG.airport],
    likes: 1, comments: 4,
  }),

  // ───── 4/24 周五 上海 ─────
  ck({
    date: "4/24", weekday: "周五", time: "22:30",
    name: "上海浦东国际机场-T2 航站楼",
    city: "浦东机场", district: "机场镇/机场相关", category: "机场",
    achievement: "今年第 3 次打卡机场",
    photos: [IMG.airport],
  }),
  ck({
    date: "4/24", weekday: "周五", time: "12:30",
    name: "甬悦柒鲜·新浙菜·东海大带鱼(长阳路店)",
    city: "上海", district: "平凉路/东外滩", category: "浙菜",
    photos: [IMG.fish],
  }),

  // ───── 4/22 周三 上海日常 ─────
  ck({
    date: "4/22", weekday: "周三", time: "19:11",
    name: "港得丽餐厅打边炉(黄兴路店)",
    city: "上海", district: "平凉路/东外滩", category: "茶餐厅",
    photos: [IMG.fish],
  }),
  ck({
    date: "4/22", weekday: "周三", time: "12:45",
    name: "人民公社铁锅炖·东北菜(长阳创谷店)",
    city: "上海", district: "平凉路/东外滩", category: "东北菜",
    photos: [IMG.hotpot],
  }),

  // ───── 4/19 周日 上海 ─────
  ck({
    date: "4/19", weekday: "周日", time: "14:11",
    name: "SUNNY CASA 桑妮形象造型(上海商城店)",
    city: "上海", district: "南京西路商圈", category: "美发",
    photos: [IMG.salon],
  }),

  // ═══ 新增打卡数据 ═══
  ck({ date:"3/15", weekday:"周日", time:"13:45",
    name:"禄银肠粉 (淮海中路店)", city:"上海", district:"音乐学院/五官科医院", category:"粤式茶点",
    photos:["https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80"] }),
  ck({ date:"3/15", weekday:"周日", time:"11:13",
    name:"禧兴 Liveliness coffee shop", city:"上海", district:"淮海路", category:"咖啡",
    achievement:"我今年第20次打卡咖啡，吨吨万事OK",
    text:"四处喝了一年,禧兴仍是最爱也最常向人推荐的店。奶白窗帘配木桌椅像理想客厅,安静又快乐",
    photos:["https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80","https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80"] }),
  ck({ date:"3/11", weekday:"周三", time:"20:00",
    name:"沃伦网球学练馆 (北外滩店)", city:"上海", district:"北外滩/外白渡桥", category:"网球场",
    achievement:"我今年第4次健身，感受暴汗的快乐",
    photos:["https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=600&q=80"] }),
  ck({ date:"4/5", weekday:"周日", time:"15:40",
    name:"多伦路文化名人街", city:"上海", district:"四川北路/海伦路", category:"休闲街区",
    photos:["https://images.unsplash.com/photo-1467377791767-c929b5dc9a23?w=600&q=80"] }),
  ck({ date:"4/5", weekday:"周日", time:"12:36",
    name:"捡角台湾食堂 苏河湾万象天地店", city:"上海", district:"苏河湾", category:"台湾菜",
    photos:["https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80"] }),
  ck({ date:"4/5", weekday:"周日", time:"11:01",
    name:"内啡肽网球俱乐部 七浦路店", city:"上海", district:"苏河湾", category:"网球场",
    achievement:"我今年第6次健身，感受暴汗的快乐",
    photos:["https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=600&q=80"] }),
  ck({ date:"4/19", weekday:"周日", time:"12:58",
    name:"沪水焙煎室(淡水路店)", city:"上海", district:"淮海路", category:"咖啡",
    achievement:"今年第27次打卡咖啡！清醒不掉线",
    text:"海苔味Dirty非常有特点,丝丝咸香给dirty加了记忆点;店内老缝纫机等装饰很有心思",
    photos:["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80"] }),
  // ═══ 打卡清单同步:上海咖啡店(与私藏清单草稿 9 店对齐) ═══
  ck({ date:"7/5", weekday:"周日", time:"14:20",
    name:"page coffee", city:"上海", district:"静安", category:"咖啡",
    achievement:"今年第41次打卡咖啡！清醒不掉线",
    text:"卡布奇诺斗胆提名上海top1:浅烘豆做卡布还能打出绵密均匀的奶泡,味道干净,封神",
    photos:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"] }),
  ck({ date:"6/28", weekday:"周日", time:"15:05",
    name:"No.23 U'NI'VER'SE(社区店)", city:"上海", district:"静安", category:"咖啡",
    text:"让人连着两周都来的神仙社区店。白玉兰dirty品质非常好,里屋桌子还藏着彩蛋",
    photos:["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80"] }),
  ck({ date:"6/21", weekday:"周六", time:"13:40",
    name:"coffee slow pour", city:"上海", district:"黄浦", category:"咖啡",
    text:"特调pink bubble乌梅味浓郁,看卡片才发现杯里放的是青梅西柚果冰,小心思很难不爱",
    photos:["https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80"] }),
  ck({ date:"6/14", weekday:"周六", time:"16:10",
    name:"Marmalade(奉贤路店)", city:"上海", district:"静安", category:"咖啡",
    text:"日式风格小店,气氛松弛还宠物友好。佛手香柚冷萃清爽,附近吃完饭顺路来一杯刚好",
    photos:["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80"] }),
  ck({ date:"6/7", weekday:"周日", time:"11:30",
    name:"特写南站", city:"上海", district:"徐汇", category:"咖啡",
    achievement:"我今年第38次打卡咖啡，吨吨万事OK",
    text:"主理人建筑出身,从云南豆子到本地陶土烧的一方水土杯都在还原在地感,每个角落都出片",
    photos:["https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&q=80"] }),
  ck({ date:"5/31", weekday:"周日", time:"15:50",
    name:"Book a Coffee 书洞咖啡(静安店)", city:"上海", district:"静安", category:"咖啡",
    text:"两片联通区域一片在室外,环境非常不错;老板娘友善,这个位置这个价格性价比确实高",
    photos:["https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&q=80"] }),
  ck({ date:"5/24", weekday:"周六", time:"10:15",
    name:"Coffee Spot", city:"上海", district:"静安", category:"咖啡",
    text:"冬季菜单选了埃塞豆,黑咖平衡好喝,奶咖超浓郁。想认真喝一杯豆子风味的时候来",
    photos:["https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80"] }),
  ck({ date:"4/19", weekday:"周日", time:"12:23",
    name:"gluglu", city:"上海", district:"淮海路", category:"甜品",
    photos:["https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80"] }),
  ck({ date:"5/7", weekday:"周四", time:"18:44",
    name:"苍山古滇·云贵·本帮融合 (太阳宫店)", city:"上海", district:"临平路/和平公园", category:"特色菜",
    achievement:"来到了收藏430天的地点",
    comments:2,
    photos:["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80"] }),
  ck({ date:"5/7", weekday:"周四", time:"12:38",
    name:"小厨面 (洋泾总店)", city:"上海", district:"洋泾商圈", category:"面馆",
    photos:["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80"] }),
  ck({ date:"5/5", weekday:"周二", time:"14:39",
    name:"港季茶餐厅 (南京西路店)", city:"上海", district:"南京西路商圈", category:"茶餐厅",
    photos:["https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80"] }),
  ck({ date:"3/22", weekday:"周六", time:"15:19",
    name:"金叶子西北菜·滩羊手抓", city:"中卫", district:"沙坡头区", category:"西北民间菜",
    achievement:"我2025年已打卡了77个点评榜单地点",
    photos:["https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80"] }),
  ck({ date:"3/22", weekday:"周六", time:"12:59",
    name:"沙坡头旅游度假区", city:"中卫", district:"沙坡头景区", category:"自然景观",
    achievement:"我2025年已打卡了76个点评榜单地点",
    photos:["https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80"] }),
  ck({ date:"3/21", weekday:"周五", time:"16:42",
    name:"中卫沙漠星星酒店", city:"中卫", district:"沙坡头区", category:"酒店·豪华型",
    achievement:"我2025年打卡的第1个中卫的地点",
    photos:["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80"],
    text: "睡在沙漠里，帐篷式客房面朝沙丘，晚上没有光污染，星星多到不像真的" }),
  ck({ date:"10/6", weekday:"周日", time:"20:29",
    name:"Gaucho Richmond", city:"伦敦", year:2024, district:"伦敦", category:"牛排",
    achievement:"2024年打卡的第1个伦敦的地点",
    photos:["https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=600&q=80"] }),
  ck({ date:"9/29", weekday:"周一", time:"16:07",
    name:"Aotea Gifts(Queenstown)", city:"皇后镇", year:2025, district:"镇中心", category:"特产手信",
    achievement:"我今年已经打卡了365个地点",
    photos:["https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80"] }),
  ck({ date:"9/29", weekday:"周一", time:"14:32",
    name:"悟空日式火锅", city:"皇后镇", year:2025, district:"镇中心", category:"日本料理",
    achievement:"我今年已经打卡了364个地点",
    photos:["https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80"] }),
  ck({ date:"9/29", weekday:"周一", time:"08:19",
    name:"Akin", city:"皇后镇", year:2025, district:"镇中心", category:"咖啡",
    achievement:"我今年第55次打卡咖啡，吨吨万事OK",
    photos:["https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=600&q=80"] }),
  ck({ date:"10/1", weekday:"周三", time:"04:10",
    name:"Wakatipu Grill(皇后镇店)", city:"皇后镇", year:2025, district:"皇后镇机场", category:"西餐",
    achievement:"我今年第4次在清晨打卡美食餐厅",
    photos:["https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80"] }),
  ck({ date:"9/30", weekday:"周二", time:"11:45",
    name:"Flame Bar & Grill(皇后镇店)", city:"皇后镇", year:2025, district:"镇中心", category:"西餐",
    achievement:"我今年第218次打卡点评榜单地点",
    photos:["https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80"] }),
  ck({ date:"9/30", weekday:"周二", time:"06:11",
    name:"Eatery by Frank's", city:"皇后镇", year:2025, district:"皇后镇机场", category:"更多美食",
    achievement:"我今年第56次打卡咖啡，吨吨万事OK",
    photos:["https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&q=80"] }),
  ck({ date:"10/2", weekday:"周四", time:"06:47",
    name:"Scroggin Coffee and Eatery", city:"皇后镇", year:2025, district:"New World超市", category:"咖啡",
    achievement:"我今年第57次打卡咖啡，吨吨万事OK",
    photos:["https://images.unsplash.com/photo-1554797589-7241bb691973?w=600&q=80"] }),
  ck({ date:"10/1", weekday:"周三", time:"15:40",
    name:"WanaFusion", city:"皇后镇", year:2025, district:"New World超市", category:"亚洲菜",
    achievement:"我今年第220次打卡点评榜单地点",
    photos:["https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80"] }),
  ck({ date:"10/1", weekday:"周三", time:"14:43",
    name:"Edgewater Hotel - Lake Wānaka", city:"皇后镇", year:2025, district:"瓦纳卡", category:"酒店·豪华型",
    achievement:"我今年已经打卡了369个地点",
    photos:["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80"],
    text: "直接建在瓦纳卡湖边，早晨推开窗是湖面和雪山，小镇安静到只剩鸟叫声" }),
  ck({ date:"10/4", weekday:"周六", time:"06:14",
    name:"C1 Espresso", city:"基督城", year:2025, district:"市中心", category:"咖啡",
    achievement:"我今年第58次打卡咖啡，吨吨万事OK",
    photos:["https://images.unsplash.com/photo-1524350876685-274059332603?w=600&q=80"] }),
  ck({ date:"10/3", weekday:"周五", time:"17:55",
    name:"基督城希尔顿逸林公园酒庄酒店", city:"基督城", year:2025, district:"基督城", category:"酒店·高档型",
    achievement:"我今年已经打卡了376个地点",
    photos:["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80"],
    text: "基督城最好的位置之一，紧邻雅芳河和植物园，震后重建的城市从这里走出去正好" }),
  ck({ date:"10/3", weekday:"周五", time:"16:04",
    name:"Lone Star Riccarton", city:"基督城", year:2025, district:"里卡顿区", category:"西餐",
    achievement:"我今年已经打卡了375个地点",
    photos:["https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80"] }),
  ck({ date:"10/5", weekday:"周日", time:"15:28",
    name:"Jimmy's Smokehouse", city:"基督城", year:2025, district:"市中心", category:"更多美食",
    achievement:"我今年已经打卡了381个地点",
    photos:["https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=600&q=80"] }),
  ck({ date:"10/4", weekday:"周六", time:"09:23",
    name:"Riverside Market", city:"基督城", year:2025, district:"市中心", category:"特色集市",
    achievement:"我今年已经打卡了379个地点",
    photos:["https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80"] }),
  ck({ date:"10/4", weekday:"周六", time:"09:17",
    name:"Espresso Studio by Fushoken", city:"基督城", year:2025, district:"市中心", category:"咖啡",
    achievement:"我今年第59次打卡咖啡，吨吨万事OK",
    photos:["https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?w=600&q=80"] }),
  ck({ date:"10/6", weekday:"中秋节", time:"06:30",
    name:"Fern House", city:"基督城", year:2025, district:"市中心", category:"更多景点",
    achievement:"我今年第31次打卡景点，美好在路上",
    photos:["https://images.unsplash.com/photo-1444930694458-01babe71870e?w=600&q=80"] }),
  ck({ date:"10/6", weekday:"中秋节", time:"05:47",
    name:"Child Sister", city:"基督城", year:2025, district:"市中心", category:"咖啡",
    achievement:"我今年第61次打卡咖啡，吨吨万事OK",
    photos:["https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80"] }),
  ck({ date:"10/6", weekday:"中秋节", time:"05:12",
    name:"supreme supreme", city:"基督城", year:2025, district:"市中心", category:"咖啡",
    achievement:"我今年第60次打卡咖啡，吨吨万事OK",
    photos:["https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=600&q=80"] }),
  ck({ date:"2/26", weekday:"周三", time:"22:48",
    name:"留寿都谷酒店式公寓", city:"北海道", year:2025, district:"留寿都", category:"酒店·高档型",
    achievement:"我是2025年来自上海的第1位打卡者",
    photos:["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80"],
    text: "滑雪场内的公寓式酒店，换上雪具直接出门上缆车，下坡到家泡温泉，完美的雪地闭环" }),
  ck({ date:"2/26", weekday:"周三", time:"17:39",
    name:"日本料理 風花", city:"北海道", year:2025, district:"二世古", category:"日本料理",
    achievement:"我是2025年来自上海的第3位打卡者",
    photos:["https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80"] }),
  ck({ date:"2/26", weekday:"周三", time:"07:25",
    name:"雪花亭", city:"北海道", year:2025, district:"二世古", category:"日本料理",
    achievement:"我是2025年来自上海的第2位打卡者",
    photos:["https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80"] }),
  ck({ date:"2/25", weekday:"周二", time:"18:31",
    name:"Rusutsu Sakaba", city:"北海道", year:2025, district:"留寿都", category:"居酒屋",
    achievement:"我是2025年来自上海的第2位打卡者",
    photos:["https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80"] }),
  ck({ date:"2/24", weekday:"周一", time:"18:05",
    name:"備長炭炭火焼鳥 鶏出汁おでん影 kage", city:"北海道", district:"二世古", category:"居酒屋",
    achievement:"我2025年打卡的第1个北海道的地点",
    photos:["https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80"] }),
  ck({ date:"9/29", weekday:"周日", time:"15:04",
    name:"Boutique Hungaricum", city:"布达佩斯", year:2024, district:"市中心/链子桥", category:"更多美食",
    achievement:"2024年来自上海的第1位打卡者",
    photos:["https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=600&q=80"] }),
  ck({ date:"9/29", weekday:"周日", time:"02:18",
    name:"Két Szerecsen", city:"布达佩斯", year:2024, district:"市中心/链子桥", category:"小吃快餐",
    achievement:"2024年来自上海的第4位打卡者",
    photos:["https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=600&q=80"] }),
  ck({ date:"9/28", weekday:"周六", time:"14:53",
    name:"塞切尼链桥", city:"布达佩斯", year:2024, district:"城堡山", category:"人文古迹",
    achievement:"2024年打卡的第418个地点",
    photos:["https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=600&q=80"] }),
  ck({ date:"9/28", weekday:"周六", time:"14:48",
    name:"Zërgë Coffeeshop", city:"布达佩斯", year:2024, district:"城堡山", category:"咖啡",
    achievement:"2024年来自上海的第4位打卡者",
    photos:["https://images.unsplash.com/photo-1498804103079-a6351b050096?w=600&q=80"] }),
  ck({ date:"9/28", weekday:"周六", time:"01:49",
    name:"Belgian Brasserie Henri", city:"布达佩斯", year:2024, district:"城堡山", category:"更多美食",
    achievement:"2024年来自上海的第2位打卡者",
    photos:["https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=600&q=80"] }),
  ck({ date:"9/27", weekday:"周五", time:"22:14",
    name:"Ildikó Konyhája", city:"布达佩斯", year:2024, district:"城堡山", category:"西餐",
    achievement:"2024年来自上海的第3位打卡者",
    photos:["https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=600&q=80"] }),
  ck({ date:"9/27", weekday:"周五", time:"18:26",
    name:"Royal Guard Cafe", city:"布达佩斯", year:2024, district:"城堡山", category:"更多美食",
    achievement:"2024年打卡的第1个布达佩斯的地点",
    photos:["https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=600&q=80"] }),
  ck({ date:"10/3", weekday:"周四", time:"17:13",
    name:"布拉格天文钟", city:"布拉格", year:2024, district:"老城区", category:"人文古迹",
    achievement:"2024年打卡的第203个点评榜单地点",
    photos:["https://images.unsplash.com/photo-1592906209472-a36b1f3782ef?w=600&q=80"] }),
  ck({ date:"10/3", weekday:"周四", time:"17:13",
    name:"火药塔", city:"布拉格", year:2024, district:"老城区", category:"人文古迹",
    achievement:"2024年打卡的第426个地点",
    photos:["https://images.unsplash.com/photo-1592906209472-a36b1f3782ef?w=600&q=80"] }),
  ck({ date:"10/3", weekday:"周四", time:"03:32",
    name:"卡夫卡博物馆", city:"布拉格", year:2024, district:"城堡区/小城区", category:"展览馆",
    achievement:"2024年来自上海的第4位打卡者",
    photos:["https://images.unsplash.com/photo-1592906209472-a36b1f3782ef?w=600&q=80"] }),
  ck({ date:"10/3", weekday:"周四", time:"03:11",
    name:"Pork's", city:"布拉格", year:2024, district:"城堡区/小城区", category:"更多美食",
    achievement:"2024年打卡的第1个布拉格的地点",
    photos:["https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80"] }),
  ck({ date:"4/29", weekday:"周六", time:"20:26",
    name:"Noir. Dining in the Dark", city:"胡志明市", year:2023, district:"领事馆区", category:"越南菜",
    achievement:"2023年已打卡了48个点评榜单地点",
    photos:["https://images.unsplash.com/photo-1597314285800-9b23ddc04a05?w=600&q=80"] }),
  ck({ date:"4/29", weekday:"周六", time:"13:23",
    name:"Quan Bui - Original", city:"胡志明市", year:2023, district:"滨城市场", category:"越南河粉",
    achievement:"2023年已打卡第1个胡志明市的地点",
    photos:["https://images.unsplash.com/photo-1597314285800-9b23ddc04a05?w=600&q=80"] }),
  ck({ date:"4/2", weekday:"周日", time:"19:04",
    name:"新武二广福潮美食(機場禁區店)", city:"澳门", year:2023, district:"氹仔", category:"面条",
    photos:["https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80"] }),
  ck({ date:"4/2", weekday:"周日", time:"15:15",
    name:"义顺牛奶公司(新马路老店)", city:"澳门", year:2023, district:"澳门半岛", category:"甜点",
    photos:["https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80"] }),
  ck({ date:"4/1", weekday:"周六", time:"20:26",
    name:"杨枝金捞甜品(氹仔泉澧店)", city:"澳门", year:2023, district:"氹仔", category:"甜点",
    photos:["https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80"] }),
  ck({ date:"4/1", weekday:"周六", time:"18:32",
    name:"六棉酒家", city:"澳门", year:2023, district:"氹仔", category:"粤菜",
    photos:["https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80"] }),
  ck({ date:"4/1", weekday:"周六", time:"13:01",
    name:"旺记咖啡(官也街店)", city:"澳门", district:"氹仔", category:"茶餐厅",
    photos:["https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80"] }),
  ck({ date:"2/17", weekday:"周六", time:"13:55",
    name:"CABO Coffee", city:"北京", year:2024, district:"天坛", category:"咖啡",
    achievement:"2024年打卡的第28个点评榜单地点",
    likes:1,
    photos:["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80"] }),
  ck({ date:"2/17", weekday:"周六", time:"13:11",
    name:"大碗居·烤鸭·鱼头泡饼(天坛东门店)", city:"北京", year:2024, district:"天坛", category:"京菜",
    achievement:"2024年打卡的第27个点评榜单地点",
    likes:1,
    photos:["https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&q=80"] }),
  ck({ date:"2/16", weekday:"周五", time:"20:04",
    name:"汤城小厨(五道口购物中心店)", city:"北京", year:2024, district:"五道口", category:"粤菜",
    photos:["https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80"] }),
  ck({ date:"9/5", weekday:"周五", time:"12:46",
    name:"滇大池云南菜·蒸汽石锅鱼(望京诚盈店)", city:"北京", year:2025, district:"望京", category:"云南菜|滇菜",
    achievement:"我打卡的第60家必吃榜餐厅",
    comments:3,
    photos:["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80"] }),
  ck({ date:"9/3", weekday:"周三", time:"09:33",
    name:"悦阁咖啡厅·昆泰嘉晟酒店", city:"北京", year:2025, district:"望京", category:"西餐",
    achievement:"我2025年打卡的第10个北京的地点",
    photos:["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80"] }),
  ck({ date:"9/3", weekday:"周三", time:"09:32",
    name:"蓝天大洋游泳培训中心(昆泰嘉晟酒店)", city:"北京", year:2025, district:"望京", category:"游泳培训",
    visibility:"private",
    photos:["https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=600&q=80"] }),
  ck({ date:"4/10", weekday:"周五", time:"14:44",
    name:"颐和园", city:"北京", year:2025, district:"颐和园", category:"人文古迹",
    achievement:"做个人生玩家！打卡第12个必玩榜",
    photos:["https://images.unsplash.com/photo-1444930694458-01babe71870e?w=600&q=80"] }),
  ck({ date:"4/10", weekday:"周五", time:"12:27",
    name:"95号酱骨·一块豆腐(展春园西路店)", city:"北京", year:2025, district:"五道口", category:"东北菜",
    photos:["https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80"] }),
  ck({ date:"4/12", weekday:"周日", time:"12:11",
    name:"潮粥人·非遗潮汕菜(五道口购物中心店)", city:"北京", year:2025, district:"五道口", category:"潮汕菜",
    photos:["https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80"] }),
  ck({ date:"4/11", weekday:"周六", time:"14:39",
    name:"铁手咖啡&烘焙(知春路店)", city:"北京", year:2025, district:"双榆树", category:"咖啡",
    achievement:"今年第25次打卡咖啡！清醒不掉线",
    likes:1,
    photos:["https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=600&q=80"] }),
  ck({ date:"4/11", weekday:"周六", time:"13:50",
    name:"欧也 Wiggly Jiggly's(魏公芳华里店)", city:"北京", year:2025, district:"魏公村", category:"西餐",
    photos:["https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80"] }),
];

// 派生统计
export function deriveStats(checkins = MY_CHECKINS) {
  const cities = new Set();
  const countries = new Set();
  let totalCheckins = checkins.length;
  let withPhoto = 0;
  const byCategory = {};
  const byCity = {};

  // 简化:中国 vs 西班牙映射(基于截图里的城市)
  const CN_CITIES = new Set(["上海", "浦东机场"]);
  const ES_CITIES = new Set(["巴塞罗那", "巴塞罗那机场", "蒙塞拉特", "格拉纳达", "塞维利亚", "帕尔马", "马略卡"]);

  for (const c of checkins) {
    const city = c.poi.city;
    cities.add(city);
    if (CN_CITIES.has(city)) countries.add("中国");
    if (ES_CITIES.has(city)) countries.add("西班牙");
    if (c.photos?.length) withPhoto++;
    const cat = c.poi.category?.split(" ")[0] || "其他";
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    byCity[city] = (byCity[city] || 0) + 1;
  }

  return {
    totalCheckins,
    cityCount: cities.size,
    countryCount: countries.size,
    cities: Array.from(cities),
    countries: Array.from(countries),
    withPhoto,
    byCategory,
    byCity,
  };
}

// 路线封面修正 — 这几个城市原始 photos URL 已失效,用城市级备用图替代
const TRIP_COVER_OVERRIDE = {
  格拉纳达: "https://images.unsplash.com/photo-1559682468-a6a29e7d9517?w=600&q=80",
  北海道: "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=600&q=80",
  胡志明市: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&q=80",
};

// 路线天数修正 — 因数据 year 字段不一致导致跨度异常,这里手动覆盖
const TRIP_DAYS_OVERRIDE = {
  澳门: 1,
};

// 派生路线 — 每个城市一段路线,过滤掉浦东机场和上海
const TRIP_EXCLUDE_CITIES = new Set(["浦东机场", "上海"]);

export function deriveTrips(checkins = MY_CHECKINS) {
  const filtered = checkins.filter((c) => !TRIP_EXCLUDE_CITIES.has(c.poi.city));
  const byCity = new Map();
  for (const c of filtered) {
    const city = c.poi.city;
    if (!byCity.has(city)) byCity.set(city, []);
    byCity.get(city).push(c);
  }
  const trips = [];
  for (const [city, items] of byCity) {
    items.sort((a, b) => a.timestamp - b.timestamp);
    trips.push(
      finalizeTrip({
        items,
        start: items[0].timestamp,
        end: items[items.length - 1].timestamp,
        cities: new Set([city]),
      })
    );
  }
  // 最新行程在前
  return trips.sort((a, b) => b.start - a.start);
}

function finalizeTrip(t) {
  const cities = Array.from(t.cities);
  const days =
    TRIP_DAYS_OVERRIDE[cities[0]] ??
    Math.max(1, Math.ceil((t.end - t.start) / (24 * 3600 * 1000)) + 1);
  // 标题
  let title;
  if (cities.length === 1) {
    title = `${cities[0]} · ${days} 天`;
  } else if (cities.every(ci => ["巴塞罗那", "巴塞罗那机场", "蒙塞拉特", "格拉纳达", "塞维利亚", "帕尔马", "马略卡"].includes(ci))) {
    title = `西班牙 · ${days} 天 · ${cities.length} 城`;
  } else {
    title = cities.join(" · ") + ` · ${days} 天`;
  }
  return {
    id: `trip-${t.start}`,
    title,
    cities,
    days,
    count: t.items.length,
    items: t.items,
    start: t.start,
    end: t.end,
    coverPhoto:
      TRIP_COVER_OVERRIDE[cities[0]] ??
      t.items.find((i) => i.photos?.length)?.photos[0],
  };
}
