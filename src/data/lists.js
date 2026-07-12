// 私藏清单数据层 — localStorage 持久化 + mock 初始数据
// 由原「专辑」(albums) 升级而来：
//   - 新增 visibility(私密/公开)、每店一句话理由 reason(沿用 caption)、beenThere 去过标
//   - 新增互动(点赞/收藏/订阅)与拔草(checkOff)，存在独立的 meta 存储里
import { MY_CHECKINS } from "./myCheckins";
import { SH_IMG, shPoi } from "./shanghaiStores";
import { REAL_LISTS } from "./realLists";
import nikiAvatar from "../assets/niki-avatar.svg";

const STORAGE_KEY = "dp_lists_v7"; // v7:创作者改名(JoJo/yzhuo/landy_js),升版让旧缓存种子失效
const META_KEY = "dp_list_meta_v1";
const LEGACY_ALBUM_KEY = "dp_albums";
const LEGACY_LIST_KEYS = ["dp_lists_v6", "dp_lists_v5", "dp_lists_v4", "dp_lists_v3", "dp_lists_v2", "dp_lists_v1"];

export const ME = {
  id: "me",
  name: "Niki",
  avatar: nikiAvatar,
  level: "Lv.8",
};

// 判断"我"是否真实去过某店(有打卡记录)
export function iHaveBeenTo(poiName) {
  return MY_CHECKINS.some((c) => c.poi?.name === poiName);
}

// ── 我的初始清单(由原专辑升级；理由沿用 caption) ──
const MY_INITIAL_LISTS = [
  {
    id: "list_bcn_food",
    owner: ME,
    title: "巴塞罗那最好吃的5家",
    description: "在巴塞吃了一周，这 5 家值得专门绕路。",
    cover: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&q=80",
    visibility: "public",
    likeCount: 128,
    saveCount: 46,
    createdAt: "5/5",
    updatedAt: "6/28",
    items: [
      {
        poi: { name: "BODEGA AMPOSTA", city: "巴塞罗那", category: "西班牙菜", emoji: "🍷" },
        photo: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
        reason: "哥特区宝藏小馆，tapas 配本地葡萄酒，性价比极高",
      },
      {
        poi: { name: "Casa Rafols", city: "巴塞罗那", category: "更多美食", emoji: "🍴" },
        photo: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80",
        reason: "午市套餐三道菜加酒水才10欧，当地人都来这",
      },
      {
        poi: { name: "波盖利亚市场", city: "巴塞罗那", category: "集市", emoji: "🛍️" },
        photo: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80",
        reason: "现榨橙汁1欧一杯，新鲜海鲜一定要试试",
      },
      {
        poi: { name: "Jon Cake & Coffee", city: "巴塞罗那", category: "咖啡厅", emoji: "☕" },
        photo: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
        reason: "毕加索博物馆旁边，芝士蛋糕是一绝",
      },
      {
        poi: { name: "Farggi Cafe", city: "巴塞罗那", category: "咖啡厅", emoji: "☕" },
        photo: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
        reason: "哥特区转角咖啡馆，坐露台看人来人往",
      },
    ],
  },
  {
    id: "list_granada_bar",
    owner: ME,
    title: "格拉纳达不能错过的3家",
    description: "",
    cover: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80",
    visibility: "public",
    likeCount: 67,
    saveCount: 21,
    createdAt: "5/1",
    updatedAt: "5/20",
    items: [
      {
        poi: { name: "Bodegas Castañeda", city: "格拉纳达", category: "西班牙菜", emoji: "🍷" },
        photo: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80",
        reason: "1927年老酒馆，点杯雪莉酒配免费tapas，格拉纳达最棒的传统",
      },
      {
        poi: { name: "Restaurante Aixa", city: "格拉纳达", category: "更多美食", emoji: "🍴" },
        photo: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&q=80",
        reason: "炸茄子配蜂蜜，第一次吃到这个搭配，惊艳",
      },
      {
        poi: { name: "La Auténtica Carmela", city: "格拉纳达", category: "更多美食", emoji: "🍴" },
        photo: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
        reason: "当地人爱去的小馆，比游客区便宜一倍",
      },
    ],
  },
  {
    id: "list_spain_museum",
    owner: ME,
    title: "西班牙值得去的博物馆",
    description: "",
    cover: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600&q=80",
    visibility: "private",
    likeCount: 0,
    saveCount: 0,
    createdAt: "4/30",
    updatedAt: "4/30",
    items: [
      {
        poi: { name: "毕加索博物馆", city: "巴塞罗那", category: "展览馆", emoji: "🖼️" },
        photo: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600&q=80",
        reason: "早年作品比晚期更让我震撼，建议留2小时",
      },
      {
        poi: { name: "加泰罗尼亚国家艺术博物馆", city: "巴塞罗那", category: "展览馆", emoji: "🖼️" },
        photo: "https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=600&q=80",
        reason: "建筑本身就值回票价，俯瞰巴塞的视角无敌",
      },
      {
        poi: { name: "古埃尔公园", city: "巴塞罗那", category: "公园景点", emoji: "🌳" },
        photo: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80",
        reason: "高迪的幻想世界，马赛克拼贴广场是全程高光，早上8点进去人最少",
      },
      {
        poi: { name: "圣家族大教堂", city: "巴塞罗那", category: "宗教建筑", emoji: "⛪" },
        photo: "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=600&q=80",
        reason: "140年还没建完，内部光线是最惊艳的部分，一定要买诞生立面的票",
      },
      {
        poi: { name: "巴特罗之家", city: "巴塞罗那", category: "现代建筑", emoji: "🏛️" },
        photo: "https://images.unsplash.com/photo-1564594985645-4427056e22e2?w=600&q=80",
        reason: "高迪的海洋幻想，屋顶像龙脊，夜场灯光秀更震撼",
      },
    ],
  },
];

// ── 好友的公开清单(用于店页收录模块 / 信息流 / TA 的私藏) ──
const friendAvatar = (name, bg) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=${bg}`;

const FRIEND_LISTS = [
  // ── 上海 · 南京西路(核心演示数据:门店在多份清单间刻意重叠) ──
  {
    id: "list_f_njxl_richang",
    owner: { id: "friend-2", name: "landy_js", avatar: friendAvatar("landy_js", "ffdfbf"), level: "Lv.7" },
    title: "南京西路，我只带朋友去这几家",
    description: "在南西上班第四年。游客去丰盛里打卡，我去这几家续命。",
    cover: SH_IMG.lighthouse,
    visibility: "public",
    likeCount: 1562,
    saveCount: 623,
    createdAt: "3/18",
    updatedAt: "7/2",
    allBeenThere: true,
    items: [
      {
        poi: shPoi("贰楼 The Lighthouse-亚洲小馆(丰盛里店)"),
        photo: SH_IMG.lighthouse,
        reason: "新店开业就去了三次，柠檬叶烤鱼是全上海最像曼谷的味道",
        beenThere: true,
      },
      {
        poi: shPoi("Bco豆库(南京西路店)"),
        photo: SH_IMG.bco,
        reason: "靠窗位下午三点的光最好，豆乳盒子配美式，工作日也值得排",
        beenThere: true,
      },
      {
        poi: shPoi("SOSO盐面包"),
        photo: SH_IMG.soso,
        reason: "盐面包 14:30 出炉，掐点去还是热的，一次买三个不后悔",
        beenThere: true,
      },
      {
        poi: shPoi("游牧Bistro小酒馆 by 耶里"),
        photo: SH_IMG.youmu,
        reason: "晚霞时段的玻璃房比西餐厅浪漫，人均还不过百三",
        beenThere: true,
      },
    ],
  },
  {
    id: "list_f_sh_qingke",
    owner: {
      id: "friend-1",
      name: "爱吃能吃的JoJo",
      avatar: friendAvatar("爱吃能吃的JoJo", "b6e3f4"),
      level: "Lv.8",
    },
    title: "上海请客不出错的馆子",
    description: "请客的标准和自己吃不一样：环境撑得住、菜单没有雷、不用赌运气。",
    cover: SH_IMG.donghai,
    visibility: "public",
    likeCount: 2874,
    saveCount: 1105,
    createdAt: "1/20",
    updatedAt: "6/29",
    allBeenThere: true,
    items: [
      {
        poi: shPoi("东海滙舟山海鲜"),
        photo: SH_IMG.donghai,
        reason: "必吃榜连着上了三年，海鲜按只点不宰客，长辈也满意",
        beenThere: true,
      },
      {
        poi: shPoi("神更仔·潮汕魂大排档(汉口路店)"),
        photo: SH_IMG.shengengzai,
        reason: "生腌天花板，带外地朋友来从没失过手",
        beenThere: true,
      },
      {
        poi: shPoi("贰楼 The Lighthouse-亚洲小馆(丰盛里店)"),
        photo: SH_IMG.lighthouse2,
        reason: "丰盛里二楼，环境撑得起正式饭局，人均262但值回",
        beenThere: true,
      },
      {
        poi: shPoi("游牧Bistro小酒馆 by 耶里"),
        photo: SH_IMG.youmu,
        reason: "大盘鸡端上来那一刻全桌都安静了，记得订玻璃房",
        beenThere: true,
      },
    ],
  },
  {
    id: "list_f_shenye",
    owner: {
      id: "friend-8",
      name: "坏蛋bobo",
      avatar: friendAvatar("坏蛋bobo", "ffcfd2"),
      level: "Lv.6",
    },
    title: "加班后的深夜食堂",
    description: "十点后下班的人，值得一顿热的。",
    cover: SH_IMG.shengengzai,
    visibility: "public",
    likeCount: 986,
    saveCount: 412,
    createdAt: "4/2",
    updatedAt: "6/18",
    allBeenThere: true,
    items: [
      {
        poi: shPoi("神更仔·潮汕魂大排档(汉口路店)"),
        photo: SH_IMG.shengengzai,
        reason: "凌晨一点半还在排队，砂锅粥是加班人的救命汤",
        beenThere: true,
      },
      {
        poi: shPoi("老绍兴豆浆油条"),
        photo: SH_IMG.laoshaoxing,
        reason: "凌晨四点开门，夜班人的早餐是别人的宵夜",
        beenThere: true,
      },
      {
        poi: { name: "安福路小酒馆", city: "上海", category: "酒吧", emoji: "🍸" },
        photo: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80",
        reason: "十一点后还放人进去坐的安静酒馆，老板娘不催单",
        beenThere: true,
      },
    ],
  },
  {
    id: "list_f_bcn_coffee",
    owner: { id: "friend-2", name: "landy_js", avatar: friendAvatar("landy_js", "ffdfbf"), level: "Lv.7" },
    title: "巴塞罗那咖啡因地图",
    description: "在巴塞晃了三个月，咖啡因摄入全靠这几家。",
    cover: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
    visibility: "public",
    likeCount: 892,
    saveCount: 341,
    createdAt: "4/12",
    updatedAt: "7/1",
    allBeenThere: true,
    items: [
      {
        poi: { name: "Jon Cake & Coffee", city: "巴塞罗那", category: "咖啡厅", emoji: "☕" },
        photo: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
        reason: "芝士蛋糕配 flat white，我一周来三次的地方",
        beenThere: true,
      },
      {
        poi: { name: "Farggi Cafe", city: "巴塞罗那", category: "咖啡厅", emoji: "☕" },
        photo: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
        reason: "露台位下午四点有阳光，观察哥特区行人的最佳机位",
        beenThere: true,
      },
      {
        poi: { name: "Nomad Coffee Lab", city: "巴塞罗那", category: "咖啡厅", emoji: "☕" },
        photo: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
        reason: "本地烘焙天花板，手冲只用自家豆子，闭眼点",
        beenThere: true,
      },
      {
        poi: { name: "Sandwichez Born", city: "巴塞罗那", category: "咖啡厅", emoji: "🥪" },
        photo: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80",
        reason: "咖啡一般但三明治救命，赶时间的早晨来这",
        beenThere: true,
      },
    ],
  },
  {
    id: "list_f_tapas",
    owner: {
      id: "friend-1",
      name: "爱吃能吃的JoJo",
      avatar: friendAvatar("爱吃能吃的JoJo", "b6e3f4"),
      level: "Lv.8",
    },
    title: "西班牙小酒馆私藏 · 只放去过三次以上的",
    description: "标准只有一个：我自己回头了三次以上。",
    cover: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
    visibility: "public",
    likeCount: 1204,
    saveCount: 578,
    createdAt: "3/2",
    updatedAt: "6/30",
    allBeenThere: true,
    items: [
      {
        poi: { name: "BODEGA AMPOSTA", city: "巴塞罗那", category: "西班牙菜", emoji: "🍷" },
        photo: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
        reason: "站着吃才是对的打开方式，vermut 配腌凤尾鱼",
        beenThere: true,
      },
      {
        poi: { name: "Bodegas Castañeda", city: "格拉纳达", category: "西班牙菜", emoji: "🍷" },
        photo: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80",
        reason: "免费 tapas 的良心还在这里，雪莉酒按木桶现打",
        beenThere: true,
      },
      {
        poi: { name: "Casa Rafols", city: "巴塞罗那", category: "更多美食", emoji: "🍴" },
        photo: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80",
        reason: "百年老店翻新不翻味，午市套餐是全城性价比之王",
        beenThere: true,
      },
      {
        poi: { name: "El Xampanyet", city: "巴塞罗那", category: "西班牙菜", emoji: "🥂" },
        photo: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80",
        reason: "自酿气泡酒 2 欧一杯，开门前十分钟去排队",
        beenThere: true,
      },
    ],
  },
  {
    id: "list_f_shanghai_date",
    owner: {
      id: "friend-17",
      name: "花花花花花",
      avatar: friendAvatar("花花花花花", "e0f2f1"),
      level: "Lv.6",
    },
    title: "梧桐区适合两个人安静吃饭的店",
    description: "不吵、不赶客、灯光好看。约会保命清单。",
    cover: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
    visibility: "public",
    likeCount: 2318,
    saveCount: 967,
    createdAt: "2/14",
    updatedAt: "6/25",
    allBeenThere: true,
    items: [
      {
        poi: { name: "小满手工粉", city: "上海", category: "融合菜", emoji: "🍜" },
        photo: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
        reason: "晚上八点后不放新客，安静到能听见对面说话",
        beenThere: true,
      },
      {
        poi: { name: "安福路小酒馆", city: "上海", category: "酒吧", emoji: "🍸" },
        photo: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80",
        reason: "老板娘记得每个熟客的忌口，灯光是暖的",
        beenThere: true,
      },
      {
        poi: { name: "永康路咖啡角", city: "上海", category: "咖啡厅", emoji: "☕" },
        photo: "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&q=80",
        reason: "下午三点的靠窗位，是我心里梧桐区的最佳座位",
        beenThere: true,
      },
      {
        poi: shPoi("游牧Bistro小酒馆 by 耶里"),
        photo: SH_IMG.youmu,
        reason: "玻璃房要提前两天订，日落时分谁坐谁知道",
        beenThere: true,
      },
    ],
  },
];

// ── 存储 ──
// 历史入库数据里的失效图片 → 可用替代(幂等,读取时统一修复)
const DEAD_IMG_FIXES = [
  ["photo-1577083287686-f3f6efe9c894", "photo-1554907984-15263bfd63bd"],
  ["photo-1565060169187-5284992a47ea", "photo-1580502304784-8985b7eb7260"],
  ["photo-1583779457094-ab6f80d80ba9", "photo-1523531294919-4bcd7c65e216"],
];

function readStore() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      DEAD_IMG_FIXES.forEach(([bad, good]) => {
        raw = raw.split(bad).join(good);
      });
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

function writeStore(lists) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

// 初始化：优先迁移旧专辑数据(caption → reason)，否则用初始 mock
function seed() {
  let myLists = MY_INITIAL_LISTS;
  try {
    const legacy = localStorage.getItem(LEGACY_ALBUM_KEY);
    if (legacy) {
      const albums = JSON.parse(legacy);
      const knownIds = new Set(MY_INITIAL_LISTS.map((l) => l.id.replace("list_", "album_")));
      // 用户在旧版里自建的专辑也迁移进来(私密)
      const extras = albums
        .filter((a) => !knownIds.has(a.id) && !a.id.startsWith("album_bcn") && !a.id.startsWith("album_granada") && !a.id.startsWith("album_spain"))
        .map((a) => ({
          id: a.id.replace("album_", "list_"),
          owner: ME,
          title: a.title,
          description: "",
          cover: a.cover,
          visibility: "private",
          likeCount: 0,
          saveCount: 0,
          createdAt: a.createdAt,
          updatedAt: a.createdAt,
          items: (a.items || []).map((it) => ({ poi: it.poi, photo: it.photo, reason: it.caption || "" })),
        }));
      myLists = [...extras, ...MY_INITIAL_LISTS];
    }
  } catch {}
  // 旧版本迁移:保留用户自建的清单(id 为时间戳后缀)
  for (const key of LEGACY_LIST_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const prev = JSON.parse(raw);
        const userMade = prev.filter(
          (l) => l.owner?.id === "me" && /^list_\d+$/.test(l.id)
        );
        myLists = [...userMade, ...myLists];
        break; // 取最近的一个版本即可
      }
    } catch {}
  }
  const all = [...myLists, ...FRIEND_LISTS, ...REAL_LISTS];
  writeStore(all);
  return all;
}

export function loadLists() {
  return readStore() || seed();
}

export function getList(id) {
  return loadLists().find((l) => l.id === id);
}

export function addList(list) {
  const lists = loadLists();
  lists.unshift(list);
  writeStore(lists);
  return list;
}

export function updateList(list) {
  const now = new Date();
  const updated = { ...list, updatedAt: `${now.getMonth() + 1}/${now.getDate()}` };
  writeStore(loadLists().map((l) => (l.id === list.id ? updated : l)));
  return updated;
}

export function deleteList(id) {
  writeStore(loadLists().filter((l) => l.id !== id));
}

// 我的清单(公开+私密)
export function getMyLists() {
  return loadLists().filter((l) => l.owner?.id === "me");
}

// 某人的公开清单
export function getPublicListsOf(ownerName) {
  return loadLists().filter((l) => l.owner?.name === ownerName && l.visibility === "public");
}

// 收录某门店的公开清单(店页「被收录」模块；按互动排序)
export function getListsContaining(poiName, { excludeOwner } = {}) {
  return loadLists()
    .filter(
      (l) =>
        l.visibility === "public" &&
        (!excludeOwner || l.owner?.id !== excludeOwner) &&
        l.items.some((it) => it.poi?.name === poiName)
    )
    .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
}

// 清单内某店的推荐理由(店页摘录用)
export function getReasonFor(list, poiName) {
  return list.items.find((it) => it.poi?.name === poiName)?.reason || "";
}

// 去过统计:清单内有多少家是创作者真实去过的
export function beenThereStats(list) {
  const isMine = list.owner?.id === "me";
  const been = list.items.filter((it) =>
    isMine ? iHaveBeenTo(it.poi?.name) : it.beenThere || list.allBeenThere
  ).length;
  return { been, total: list.items.length, all: been === list.items.length && list.items.length > 0 };
}

// 公开门槛校验:≥3 店、理由齐全、非默认标题
export function publicEligibility(list) {
  const missing = [];
  if ((list.items?.length || 0) < 3) missing.push("至少收录 3 家店");
  if ((list.items || []).some((it) => !it.reason?.trim())) missing.push("每家店补一句推荐理由");
  if (!list.title?.trim() || list.title === "我的私藏清单") missing.push("起一个自己的标题");
  return { ok: missing.length === 0, missing };
}

// ── 互动 meta(点赞/收藏/订阅/拔草)——"我"的视角,独立存储 ──
function readMeta() {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function writeMeta(meta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function getListMeta(listId) {
  return readMeta()[listId] || { liked: false, saved: false, subscribed: false, checkedOff: [] };
}

export function setListMeta(listId, patch) {
  const meta = readMeta();
  meta[listId] = { ...getListMeta(listId), ...patch };
  writeMeta(meta);
  return meta[listId];
}

export function toggleCheckOff(listId, poiName) {
  const m = getListMeta(listId);
  const set = new Set(m.checkedOff || []);
  if (set.has(poiName)) set.delete(poiName);
  else set.add(poiName);
  return setListMeta(listId, { checkedOff: [...set] });
}

// 我收藏的清单(别人的)
export function getSavedLists() {
  const meta = readMeta();
  return loadLists().filter((l) => l.owner?.id !== "me" && meta[l.id]?.saved);
}

// 我的拔草进度(唯一口径,所有页面共用):手动勾选 ∪ 我的真实打卡
// —— 打卡过的店自动算去过,避免"顶部说全部去过、进度却是 0"的口径混乱
export function effectiveCheckedOff(list) {
  const manual = new Set(getListMeta(list.id).checkedOff || []);
  list.items.forEach((it) => {
    if (iHaveBeenTo(it.poi?.name)) manual.add(it.poi.name);
  });
  return manual;
}

// ── 类目归一(选店筛选 / 同主题匹配共用) ──
export const CATEGORY_BUCKETS = ["美食", "咖啡", "酒店", "景点", "SPA", "购物", "运动", "其他"];
export function categorize(cat = "") {
  if (/咖啡/.test(cat)) return "咖啡";
  if (/酒店|民宿/.test(cat)) return "酒店";
  if (/SPA|按摩|足疗|美容|美发/i.test(cat)) return "SPA";
  if (/博物|展览|景点|教堂|公园|广场|建筑|集市|古迹|宗教|山/.test(cat)) return "景点";
  if (/购物|商场/.test(cat)) return "购物";
  if (/网球|健身|运动|球场|滑雪|游泳/.test(cat)) return "运动";
  if (/菜|餐|食|火锅|烧烤|料理|小吃|烘焙|面包|酒馆|酒吧|海鲜|粥|tapas|bar/i.test(cat)) return "美食";
  return "其他";
}

// ── 同主题的其他作者清单(仅公域流量的清单尾部使用) ──
export function getSameThemeLists(list, limit = 6) {
  const buckets = new Set(list.items.map((it) => categorize(it.poi?.category)));
  const names = new Set(list.items.map((it) => it.poi?.name));
  return loadLists()
    .filter((l) => l.visibility === "public" && l.id !== list.id && l.owner?.id !== list.owner?.id)
    .map((l) => {
      const shareStore = l.items.some((it) => names.has(it.poi?.name));
      const shareTheme = l.items.some((it) => buckets.has(categorize(it.poi?.category)));
      return { l, score: (shareStore ? 2 : 0) + (shareTheme ? 1 : 0) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || (b.l.likeCount || 0) - (a.l.likeCount || 0))
    .slice(0, limit)
    .map((x) => x.l);
}

// ── 存量转化:近期打卡的咖啡店(MY_CHECKINS 为时间倒序,取最近去重的 N 家) ──
export function getRecentCoffeeCheckins(limit = 7) {
  const seen = new Set();
  return MY_CHECKINS.filter((c) => {
    if (!c.poi?.category?.includes("咖啡") || !c.photos?.length) return false;
    if (seen.has(c.poi.name)) return false;
    seen.add(c.poi.name);
    return true;
  }).slice(0, limit);
}

// ── 咖啡草稿曲库:上海 9 家(理由带入用户自己发布过的原文,图片复用 mock 图库) ──
const DRAFT_IMG = {
  coffee1: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
  coffee2: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80",
  coffee3: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&q=80",
  coffee4: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80",
  coffee5: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
  bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
  cafe: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80",
  drink: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80",
  brunch1: "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&q=80",
  brunch2: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80",
};

const cafePoi = (name, district) => ({ name, city: "上海", district, category: "咖啡", emoji: "☕" });

const COFFEE_DRAFT_STORES = [
  {
    poi: cafePoi("禧兴 Liveliness coffee shop", "淮海路"),
    photos: [DRAFT_IMG.coffee2],
    allPhotos: [DRAFT_IMG.coffee2, DRAFT_IMG.bakery, DRAFT_IMG.coffee1],
    text: "四处喝了一年,禧兴仍是最爱也最常向人推荐的店。手冲出品稳定,玻利维亚不酸不苦冲得很平衡,云南萨奇姆豆好喝哭。糖火烧司康、青酱塔塔贝果都超预期。奶白窗帘配木桌椅像理想客厅,上午人不多,安静又快乐。",
  },
  {
    poi: cafePoi("page coffee", "静安"),
    photos: [DRAFT_IMG.coffee1],
    text: "卡布奇诺斗胆提名上海top1:浅烘豆做卡布还能打出绵密均匀的奶泡,味道干净,封神。菜单里的冰玉露是在日本喝过、国内买不到的茶,味道完全准确。出品永远稳定,带第一次来的朋友必点卡布。",
  },
  {
    poi: cafePoi("No.23 U'NI'VER'SE(社区店)", "静安"),
    photos: [DRAFT_IMG.cafe],
    text: "让人连着两周都来的神仙社区店。白玉兰dirty品质非常好,接骨木咖啡气泡水也好喝;奥利奥曲奇和伯爵红茶司康看着平平无奇、入口啧啧称奇。里屋桌子还藏着彩蛋,细节处处有惊喜。",
  },
  {
    poi: cafePoi("coffee slow pour", "黄浦"),
    photos: [DRAFT_IMG.drink],
    text: "温馨小店,主打一个用心。特调pink bubble乌梅味浓郁,配柠檬香气奶盖很舒服,看卡片才发现杯里放的是青梅西柚果冰——这种小心思很难不爱。中午人不多,适合安静喝一杯。",
  },
  {
    poi: cafePoi("Marmalade(奉贤路店)", "静安"),
    photos: [DRAFT_IMG.coffee4],
    text: "日式风格小店,气氛松弛、音乐轻松,还宠物友好。佛手香柚冷萃清爽,\"毒液美食\"选酒香豆风味很浓,做冰拿铁应该也好喝。附近吃完饭顺路来一杯刚好。",
  },
  {
    poi: cafePoi("特写南站", "徐汇"),
    photos: [DRAFT_IMG.coffee3],
    text: "惊艳的一家店。主理人建筑出身,整店品牌感和设计感都很强,从云南豆子到本地陶土烧的\"一方水土杯\"都在还原在地感,每个角落都出片。周末最好提前预约,不然容易没位置。",
  },
  {
    poi: cafePoi("沪水焙煎室(淡水路店)", "黄浦"),
    photos: [DRAFT_IMG.coffee5],
    text: "海苔味Dirty非常有特点,丝丝咸香给dirty加了记忆点;木姜野夏适合木姜子爱好者(个人觉得风味还能再猛一点)。店内老缝纫机等装饰很有心思,值得专程来打一杯特调。",
  },
  {
    poi: cafePoi("Book a Coffee 书洞咖啡(静安店)", "静安"),
    photos: [DRAFT_IMG.brunch1],
    text: "两片联通区域,一片在室外,环境非常不错。菜单丰富,特调偏甜口、糖能放大风味;老板娘友善,会主动提醒有优惠可用。这个位置这个价格,性价比确实高。",
  },
  {
    poi: cafePoi("Coffee Spot", "静安"),
    photos: [DRAFT_IMG.brunch2],
    text: "冬季菜单选了埃塞豆,黑咖平衡好喝,奶咖超浓郁。特调会跟着季节换,热特调加玄米茶很适合冬天(第一口香,后面偏酸,见仁见智)。想认真喝一杯豆子风味的时候来。",
  },
];

export function buildCoffeeDraft() {
  // AI 只做选店筛选,不代写:标题留白由用户自己起,只给一个可一键填入的建议;理由带入用户自己发布过的原文
  return {
    title: "",
    suggestedTitle: "四处喝了一年的咖啡私藏",
    description: "",
    category: "咖啡",
    items: COFFEE_DRAFT_STORES.map((s) => ({
      checkinId: null,
      poi: s.poi,
      allPhotos: s.allPhotos || s.photos,
      photos: s.photos,
      text: s.text,
    })),
  };
}

// ── 草稿箱:把近期打卡按类目自动归置成待整理草稿(Me 页 banner 推荐来源) ──
const DRAFT_TITLE_SUGGESTIONS = {
  美食: "在上海反复回访的馆子",
  运动: "我的上海球场替代方案",
  景点: "散步半径里的好去处",
};

export function buildDraftBox() {
  const drafts = [buildCoffeeDraft()]; // 咖啡:精选草稿(与打卡清单 9 店对齐)
  const buckets = {};
  const seen = new Set();
  MY_CHECKINS.forEach((c) => {
    if (!c.photos?.length || c.poi?.city !== "上海") return;
    const b = categorize(c.poi?.category);
    if (b === "咖啡" || b === "其他") return;
    if (seen.has(b + c.poi.name)) return;
    seen.add(b + c.poi.name);
    (buckets[b] ||= []).push(c);
  });
  Object.entries(buckets)
    .filter(([, arr]) => arr.length >= 3)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([bucket, arr]) => {
      drafts.push({
        title: "",
        suggestedTitle: DRAFT_TITLE_SUGGESTIONS[bucket] || `我常去的上海${bucket}好店`,
        description: "",
        category: bucket,
        items: arr.slice(0, 9).map((c) => ({
          checkinId: c.id,
          poi: c.poi,
          allPhotos: c.photos,
          photos: [c.photos[0]],
          text: (c.text || "").slice(0, 60),
        })),
      });
    });
  return drafts;
}

export function countCoffeeCheckins() {
  const seen = new Set();
  MY_CHECKINS.forEach((c) => {
    if (c.poi?.category?.includes("咖啡")) seen.add(c.poi.name);
  });
  return seen.size;
}
