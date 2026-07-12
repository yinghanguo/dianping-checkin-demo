// Niki 的真实好友关系(基于截图整理)
// 头像用 dicebear notionists,seed = 名字,保证每个人固定头像
// 真实头像 URL 无法从截图直接获取,后续可替换为真实 CDN 地址

const BG_COLORS = [
  "ffd700", "b6e3f4", "ffdfbf", "c0aede", "ffd5dc",
  "d1d4f9", "ffe4c4", "c8e6c9", "ffcfd2", "e1bee7",
  "ffe0b2", "f8bbd0", "dcedc8", "b3e5fc", "f3e5f5",
  "fce4ec", "e8eaf6", "e0f2f1", "fff9c4", "efebe9",
  "cfd8dc", "f0f4c3", "b2ebf2", "d7ccc8", "ffccbc",
  "e6ee9c", "b2dfdb", "c5cae9", "f5f5f5", "bcaaa4",
];

function avatar(name, idx) {
  const bg = BG_COLORS[idx % BG_COLORS.length];
  const seed = encodeURIComponent(name);
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=${bg}`;
}

// 从截图读取的好友列表(按截图顺序,3列从上到下)
const RAW_FRIENDS = [
  // 第 1 行
  "奶粉清蒸西瓜籽", "爱吃能吃的JoJo", "landy_js",
  // 第 2 行
  "JLRu", "chang", "Rouyi",
  // 第 3 行
  "Anecdote", "haishucccc", "坏蛋bobo",
  // 第 4 行
  "艾伦没有派对", "(模糊)", "Purple43",
  // 第 5 行
  "朱较瘦", "yzhuo", "AT",
  // 第 6 行
  "Fitz", "Mori", "花花花花花",
  // 第 7 行
  "無料案内所", "F班袁湘琴", "猜猜我是谁",
  // 第 8 行
  "朱佳佳女士", "penguinking", "夜半",
  // 第 9 行
  "宝地Jerry", "多多如意", "布丁",
  // 第 10 行
  "宝地硬吃妈", "WinWinWendy", "宝地Jennie",
];

export const FRIENDS = RAW_FRIENDS
  .filter((n) => n !== "(模糊)") // 过滤掉截图中模糊的那一位
  .map((name, i) => ({
    id: `friend-${i}`,
    name,
    avatar: avatar(name, i),
    // 基于 i 生成 mock 粉丝/点评数,保持稳定
    fans: [23, 14282, 158, 6, 26, 2, 432, 89, 1023, 5621, 214, 13, 158, 432, 214, 23, 89, 1023, 6, 26, 2, 158, 432, 89, 1023, 214, 13, 23, 6, 26][i % 30],
    reviews: [0, 1524, 146, 77, 16, 10, 285, 67, 412, 894, 48, 92, 146, 285, 48, 0, 67, 412, 77, 16, 10, 146, 285, 67, 412, 48, 92, 0, 77, 16][i % 30],
    verified: [1524, 5621, 1023, 894, 412, 285].includes([23, 14282, 158, 6, 26, 2, 432, 89, 1023, 5621, 214, 13, 158, 432, 214, 23, 89, 1023, 6, 26, 2, 158, 432, 89, 1023, 214, 13, 23, 6, 26][i % 30]),
  }));

export function searchFriends(query) {
  if (!query || !query.trim()) return FRIENDS;
  const q = query.trim().toLowerCase();
  return FRIENDS.filter((f) => f.name.toLowerCase().includes(q));
}

// 按名字快查
export function getFriendByName(name) {
  return FRIENDS.find((f) => f.name === name);
}
