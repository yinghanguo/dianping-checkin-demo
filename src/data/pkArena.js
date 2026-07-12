// 「私藏杯 · 上海站」活动数据层
// 赛制:种草—拔草结算制(详见 docs/私藏好店-清单PK活动策划.md V1.2)
// - 参赛清单复用清单库(realLists / lists),这里只挂赛道与比赛数据
// - 冠军按「有效拔草打卡」结算;投票只进人气榜,不进冠军计分
import { getList, getMyLists, categorize } from "./lists";

const VOTE_KEY = "dp_pk_votes_v1";

export const PK_EVENT = {
  name: "私藏杯 · 上海站",
  slogan: "敢不敢，把私藏拿出来比一比？",
  subSlogan: "收藏是心动，打卡才是真爱",
  awardLine: 100, // 拔草王授奖线
  // 两阶段:提报期主会场面向创作者(Me 页 banner 引流),开赛期面向投票用户(首页 banner 引流)
  phases: {
    submit: {
      statusLine: "提报期 · 8/14 23:59 截止",
      schedule: [
        { label: "提报", date: "8/3–8/14", active: true },
        { label: "开赛", date: "8/15–9/6" },
        { label: "结算", date: "9/7–9/9" },
        { label: "颁奖", date: "9/10" },
      ],
    },
    live: {
      statusLine: "开赛第 2 周 · 距结算还有 12 天",
      schedule: [
        { label: "提报", date: "8/3–8/14", done: true },
        { label: "开赛", date: "8/15–9/6", active: true },
        { label: "结算", date: "9/7–9/9" },
        { label: "颁奖", date: "9/10" },
      ],
    },
  },
  rules: [
    "打卡王 = 有效打卡数第一(收藏者在收藏后、开赛期内的真实到店打卡,人×店去重)",
    "每人对每份清单最多贡献 3 家计分;单店贡献占清单总分上限 40%",
    "投票只算人气,不进打卡榜;投中打卡王即获伯乐奖资格",
    "打卡王授奖线 100 次有效打卡;无效打卡剔除比例结算期公示",
  ],
};

// ── 奖品(头部大奖展示;全部平台采购,不接受商户赞助) ──
export const CREATOR_PRIZES = [
  { emoji: "✈️", name: "人气王", prize: "亚洲50最佳餐厅香港双人美食之旅", note: "全场总票数第一" },
  { emoji: "🖤", name: "黑马奖", prize: "黑珍珠三钻餐厅双人晚餐", note: "低粉高质冲进前三" },
  { emoji: "🏆", name: "打卡王", prize: "冠军徽章 + 2 周分发加权 + 官方共创", note: "有效打卡数第一" },
  { emoji: "🍽️", name: "转化神", prize: "全年 12 次霸王餐体验卡", note: "收藏→打卡转化率第一" },
];

export const VOTER_PRIZES = [
  { emoji: "🎯", name: "伯乐奖", prize: "100 元到店无门槛券 × 100 名", note: "投中打卡王·眼光即品味" },
  { emoji: "🎁", name: "打卡抽奖", prize: "累计打卡 3/6/10 次可抽奖", note: "投票零奖励,打卡才有" },
];

// ── 灵感激发库(不作为固定赛道,只作参赛者的选题灵感与清单标签) ──
export const PK_THEMES = [
  "家边500米", "一人食安全区", "深夜食堂", "咖啡续命站", "Citywalk路线库",
  "雨天备用方案", "带爸妈去哪吃", "面包脑袋巡礼", "菜市场及周边", "旧书店/独立书店",
  "朋友来了怎么带", "人均50吃到扶墙", "小众博物馆展览", "公园长椅测评",
  "早餐摊图鉴", "二手/古着淘货点", "健身替代方案", "一个人过周末",
];

export const PK_DISTRICT_SAMPLES = [
  "南京西路", "淮海路", "衡山路/复兴西路", "五角场/大学路", "新天地/马当路",
  "静安寺", "北外滩/外白渡桥", "徐家汇", "中山公园/江苏路", "前滩",
];
export const PK_DISTRICT_TOTAL = 55;

export const ENTRY_REQUIREMENTS = [
  "公开状态的单人清单,门店 ≥5 家",
  "每店一句话推荐理由(无理由不予入围)",
  "封面及首图为本人照片,商家营销图淘汰",
  "勾选《无商业合作声明》,接受核查与公示",
  "报名时完成一次清单更新",
];

// ── 赛道与参赛清单(mock 比赛数据;checkins=有效拔草打卡) ──
const TRACKS = [
  {
    id: "t_fitness",
    group: "主题",
    name: "健身替代方案",
    note: "爬山、游泳、羽毛球场地清单",
    hot: true,
    entries: [
      { listId: "list_r_tennis", stats: { votes: 2841, saves: 866, checkins: 214 } },
      { listId: "list_r_tennis_zhizhen", stats: { votes: 3102, saves: 741, checkins: 208 } },
      { listId: "list_r_tennis_photo", stats: { votes: 3577, saves: 918, checkins: 156 } },
    ],
  },
  {
    id: "t_njxl",
    group: "商圈",
    name: "南京西路",
    note: "静安区 · 商圈组",
    entries: [
      { listId: "list_f_njxl_richang", stats: { votes: 3421, saves: 1103, checkins: 187 } },
      { listId: "list_r_cantonese", stats: { votes: 2988, saves: 964, checkins: 179 } },
    ],
  },
  {
    id: "t_coffee",
    group: "主题",
    name: "咖啡续命站",
    note: "按场景分:办公、聊天、纯喝豆子",
    entries: [
      { listId: "list_r_coffee_sh", stats: { votes: 4210, saves: 1522, checkins: 328 } },
    ],
    acceptsMyCoffee: true, // 「我」发布的咖啡清单自动参赛
  },
  {
    id: "t_latenight",
    group: "主题",
    name: "深夜食堂",
    note: "晚上10点后的觅食地图",
    entries: [
      { listId: "list_f_shenye", stats: { votes: 1877, saves: 655, checkins: 143 } },
      { listId: "list_r_japanese", stats: { votes: 1642, saves: 587, checkins: 121 } },
    ],
  },
  {
    id: "t_parents",
    group: "主题",
    name: "带爸妈去哪吃",
    note: "长辈来了不踩雷的店",
    entries: [
      { listId: "list_f_sh_qingke", stats: { votes: 1450, saves: 512, checkins: 96 } },
      { listId: "list_r_yunnan_sh", stats: { votes: 1213, saves: 466, checkins: 88 } },
    ],
  },
  {
    id: "t_hengfu",
    group: "商圈",
    name: "衡山路/复兴西路",
    note: "徐汇区 · 商圈组",
    entries: [
      { listId: "list_f_shanghai_date", stats: { votes: 986, saves: 423, checkins: 62 } },
    ],
  },
];

// ── 投票(localStorage;投出不可改) ──
function readVotes() {
  try {
    return JSON.parse(localStorage.getItem(VOTE_KEY)) || {};
  } catch {
    return {};
  }
}

export function getVotes() {
  return readVotes();
}

export function hasVoted(trackId, listId) {
  return (readVotes()[trackId] || []).includes(listId);
}

export function voteCount(trackId) {
  return (readVotes()[trackId] || []).length;
}

// 每赛道最多 3 票;成功返回 true
export function castVote(trackId, listId) {
  const votes = readVotes();
  const arr = votes[trackId] || [];
  if (arr.includes(listId) || arr.length >= 3) return false;
  votes[trackId] = [...arr, listId];
  localStorage.setItem(VOTE_KEY, JSON.stringify(votes));
  return true;
}

// ── 「我」发布的咖啡清单自动参赛(公开 + ≥5 店 + 咖啡为主) ──
function findMyCoffeeList() {
  return getMyLists().find(
    (l) =>
      l.visibility === "public" &&
      l.items.length >= 5 &&
      l.items.filter((it) => categorize(it.poi?.category) === "咖啡").length >= l.items.length / 2
  );
}

// ── 赛道数据组装:解析清单对象、叠加本地票、按榜排序 ──
export function getPkTracks(board = "checkins") {
  const votes = readVotes();
  return TRACKS.map((t) => {
    let entries = t.entries
      .map((e) => {
        const list = getList(e.listId);
        if (!list) return null;
        const voted = (votes[t.id] || []).includes(e.listId);
        return {
          ...e,
          list,
          voted,
          displayVotes: e.stats.votes + (voted ? 1 : 0),
        };
      })
      .filter(Boolean);

    if (t.acceptsMyCoffee) {
      const mine = findMyCoffeeList();
      if (mine && !entries.some((e) => e.listId === mine.id)) {
        const voted = (votes[t.id] || []).includes(mine.id);
        entries.push({
          listId: mine.id,
          isMine: true,
          list: mine,
          voted,
          stats: { votes: 12, saves: 3, checkins: 0 },
          displayVotes: 12 + (voted ? 1 : 0),
        });
      }
    }

    entries.sort((a, b) =>
      board === "votes" ? b.displayVotes - a.displayVotes : b.stats.checkins - a.stats.checkins
    );
    return { ...t, entries };
  });
}

// ── 参赛标签推荐:从"比赛"入口进清单编辑时,按清单内容推荐商圈/主题灵感标签 ──
export function recommendPkTags(items = []) {
  // 主题灵感:按主导类目给几个方向
  const cats = items.map((i) => categorize(i.poi?.category));
  const coffee = cats.filter((c) => c === "咖啡").length;
  const sport = cats.filter((c) => c === "运动").length;
  let themes;
  if (coffee >= Math.max(2, items.length / 2)) themes = ["咖啡续命站", "家边500米"];
  else if (sport >= Math.max(2, items.length / 2)) themes = ["健身替代方案", "一个人过周末"];
  else themes = ["朋友来了怎么带", "人均50吃到扶墙"];

  // 商圈灵感:取最常见 district,命中标准商圈样本则推荐
  const counts = {};
  items.forEach((i) => {
    const d = i.poi?.district;
    if (d) counts[d] = (counts[d] || 0) + 1;
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([d]) => d);
  const districts = top.filter((d) => PK_DISTRICT_SAMPLES.includes(d)).slice(0, 2);
  if (districts.length === 0) districts.push(PK_DISTRICT_SAMPLES[0]);

  return { themes, districts };
}

// ── 混排榜单:同组(主题/商圈)所有参赛清单拉平排名,标签挂在清单上 ──
export function getPkEntriesFlat(group, board = "checkins") {
  const tracks = getPkTracks("checkins"); // 组内先按拔草算出各赛道内名次
  const flat = [];
  tracks
    .filter((t) => t.group === group)
    .forEach((t) => {
      t.entries.forEach((e, idx) => {
        flat.push({
          ...e,
          trackId: t.id,
          trackName: t.name,
          trackGroup: t.group,
          inTrackRank: idx + 1,
          gapToTrackLeader: idx > 0 ? t.entries[0].stats.checkins - e.stats.checkins : 0,
          soloUnderLine: t.entries.length === 1 && e.stats.checkins < 100,
        });
      });
    });
  flat.sort((a, b) =>
    board === "votes" ? b.displayVotes - a.displayVotes : b.stats.checkins - a.stats.checkins
  );
  return flat;
}

// ── 门店 → 参赛清单(店页「打卡即助攻」角标) ──
export function getPkInfoForStore(poiName) {
  const hits = [];
  TRACKS.forEach((t) => {
    t.entries.forEach((e) => {
      const list = getList(e.listId);
      if (list?.items.some((it) => it.poi?.name === poiName)) {
        hits.push({ trackName: t.name, listId: e.listId });
      }
    });
  });
  return hits.length ? { count: hits.length, trackName: hits[0].trackName } : null;
}

// ── 清单 → 参赛状态(清单详情页参赛徽章) ──
export function getPkInfoForList(listId) {
  for (const t of TRACKS) {
    const idx = t.entries.findIndex((e) => e.listId === listId);
    if (idx >= 0) {
      const sorted = [...t.entries].sort((a, b) => b.stats.checkins - a.stats.checkins);
      const rank = sorted.findIndex((e) => e.listId === listId) + 1;
      const entry = t.entries[idx];
      return { trackName: t.name, group: t.group, rank, checkins: entry.stats.checkins };
    }
  }
  return null;
}

// ── 我的助攻战绩(demo mock:拔草阶梯 3/6/10) ──
export const MY_PK_STATS = {
  assists: 4, // 已完成的有效拔草
  ladder: [3, 6, 10],
  recent: [
    { store: "至臻网球(静安大宁店)", listTitle: "至臻网球老会员的分店实测", date: "8/23" },
    { store: "page coffee", listTitle: "再来一碗豆腐汤推荐的宝藏咖啡店", date: "8/22" },
  ],
};
