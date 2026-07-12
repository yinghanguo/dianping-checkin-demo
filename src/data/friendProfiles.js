// 好友口味档案 + 月度美食记录 mock 数据
// 参考真实截图:Mori / 花花花花花 / 朱佳佳女士 / 無料案内所 / 宝地Jerry

const FOOD_TYPES = ["偏爱吃辣", "偏爱吃甜", "偏爱吃鲜", "偏爱清淡", "偏爱重口"];
const PERSONALITIES = [
  "热心的美食保守派",
  "冒险的味觉探索者",
  "挑剔的精致饕客",
  "随性的烟火气爱好者",
  "理性的性价比达人",
];

const IMG = {
  coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=120&q=70",
  ramen:  "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=120&q=70",
  steak:  "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=120&q=70",
  food1:  "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=120&q=70",
  food2:  "https://images.unsplash.com/photo-1544025162-d76694265947?w=120&q=70",
  food3:  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&q=70",
  gelato: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=120&q=70",
  dessert:"https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=120&q=70",
  hotpot: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=120&q=70",
  seafood:"https://images.unsplash.com/photo-1559847844-5315695dadae?w=120&q=70",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&q=70",
  pastry: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=120&q=70",
  noodle: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=120&q=70",
  bar:    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=120&q=70",
  sushi:  "https://images.unsplash.com/photo-1553621042-f6e147245754?w=120&q=70",
};

export const FRIEND_PROFILES = {
  "花花花花花": {
    personality: "热心的美食保守派",
    foodType: "偏爱吃甜",
    foodTypeEmoji: "🍩",
    records: [
      { name: "Reinthaler's Beisl", rating: 4.0, reviews: 78, price: 237, city: "维也纳", category: "西餐", image: IMG.food2, times: 0 },
      { name: "Restaurant Panorama", rating: 5.0, reviews: 235, price: 254, city: "杜布罗夫尼克", category: "更多美食", image: IMG.seafood, times: 2 },
      { name: "Kantun Paulina", rating: 4.5, reviews: 42, price: 44, city: "斯普利特", category: "西餐", image: IMG.burger, times: 2 },
      { name: "Peppino's Gelato Factory", rating: 5.0, reviews: 45, price: 43, city: "杜布罗夫尼克", category: "冰淇淋", image: IMG.gelato, times: 0 },
      { name: "Jack's Food&Beer", rating: 0.0, reviews: 1, price: 0, city: "杜布罗夫尼克", category: "小吃快餐", image: IMG.food1, times: 0 },
      { name: "Mediterraneo Dine & Wine", rating: 4.0, reviews: 16, price: 221, city: "克罗地亚", category: "西餐", image: IMG.food2, times: 2 },
      { name: "Cirkusz", rating: 4.5, reviews: 88, price: 156, city: "布达佩斯", category: "西餐", image: IMG.food3, times: 2 },
    ],
  },
  "Mori": {
    personality: "冒险的味觉探索者",
    foodType: "偏爱吃辣",
    foodTypeEmoji: "🌶️",
    records: [
      { name: "余温手冲咖啡屋", rating: 4.5, reviews: 431, price: 47, city: "泉州", category: "咖啡", image: IMG.coffee, times: 2 },
      { name: "思北花生汤", rating: 3.5, reviews: 2718, price: 13, city: "厦门", category: "厦门小吃", image: IMG.food1, times: 0 },
      { name: "阿三大排档 (岳阳西里店)", rating: 4.5, reviews: 2900, price: 100, city: "厦门", category: "福建菜", image: IMG.food2, times: 0 },
      { name: "老思西沙茶烤肉店 (局口街店)", rating: 3.0, reviews: 2621, price: 34, city: "厦门", category: "融合烤肉", image: IMG.food3, times: 0 },
      { name: "思北特香包", rating: 4.0, reviews: 2893, price: 18, city: "厦门", category: "面包蛋糕", image: IMG.pastry, times: 0 },
      { name: "浮屿大同鸭肉粥·始于1983年", rating: 4.0, reviews: 5174, price: 30, city: "厦门", category: "粥店", image: IMG.noodle, times: 0 },
      { name: "老豆腐面 (鸿桥店)", rating: 4.0, reviews: 1240, price: 22, city: "厦门", category: "面条", image: IMG.ramen, times: 0 },
    ],
  },
  "朱佳佳女士": {
    personality: "随性的烟火气爱好者",
    foodType: "偏爱吃辣",
    foodTypeEmoji: "🌶️",
    records: [
      { name: "新凤煲店", rating: 4.0, reviews: 36, price: 50, city: "桐乡市", category: "其他中餐", image: IMG.hotpot, times: 0 },
      { name: "锦泓老字号猪脏粉 (东联大厦店)", rating: 4.0, reviews: 2241, price: 26, city: "温州", category: "小吃快餐", image: IMG.noodle, times: 0 },
      { name: "Paper Ball Coffee(马鞍池店)", rating: 5.0, reviews: 227, price: 34, city: "温州", category: "咖啡", image: IMG.coffee, times: 0 },
      { name: "润丰和牛杂 (飞霞南路店)", rating: 4.0, reviews: 3006, price: 36, city: "温州", category: "小吃面食", image: IMG.ramen, times: 0 },
      { name: "兰兰早点 (上陆门店)", rating: 4.0, reviews: 572, price: 11, city: "温州", category: "小吃面食", image: IMG.food1, times: 0 },
      { name: "花柳塘泡泡", rating: 3.5, reviews: 1007, price: 39, city: "温州", category: "炸鸡炸串", image: IMG.burger, times: 0 },
      { name: "沁联手工汤包", rating: 4.5, reviews: 892, price: 28, city: "温州", category: "点心", image: IMG.pastry, times: 0 },
    ],
  },
  "無料案内所": {
    personality: "挑剔的精致饕客",
    foodType: "偏爱吃甜",
    foodTypeEmoji: "🍩",
    records: [
      { name: "鸟善居酒屋·烧鸟酒场·深夜食堂 (宝龙广场店)", rating: 5.0, reviews: 244, price: 94, city: "诸暨", category: "日本料理", image: IMG.sushi, times: 0 },
      { name: "贵州石锅牛肉火锅烤牛肉 (诸山路店)", rating: 4.0, reviews: 27, price: 85, city: "诸暨", category: "快餐简餐", image: IMG.hotpot, times: 0 },
      { name: "三福林羊肉·江西小炒 (眉山路店)", rating: 4.5, reviews: 1819, price: 59, city: "平凉路/东外滩", category: "江西菜", image: IMG.food3, times: 0 },
      { name: "青年星厨烤鸭店 (联洋广场店)", rating: 4.5, reviews: 6197, price: 135, city: "联洋", category: "烤鸭", image: IMG.food2, times: 0 },
      { name: "汉舍中国菜馆臻选店 (瑞虹天地太阳宫店)", rating: 4.5, reviews: 4769, price: 163, city: "临平路/和平公园", category: "本帮菜", image: IMG.food1, times: 0 },
      { name: "次坞阿生手工打面 (诸暨宝龙广场店)", rating: 4.0, reviews: 221, price: 29, city: "诸暨", category: "快餐简餐", image: IMG.noodle, times: 0 },
      { name: "食怡康·潮汕大排档 (杨浦区双阳支路店)", rating: 4.0, reviews: 558, price: 67, city: "杨浦", category: "潮汕菜", image: IMG.seafood, times: 0 },
    ],
  },
  "宝地Jerry": {
    personality: "理性的性价比达人",
    foodType: "偏爱吃辣",
    foodTypeEmoji: "🌶️",
    records: [
      { name: "鸿姐老火锅·传统炒料 (上海旗舰店)", rating: 4.5, reviews: 32124, price: 120, city: "中山公园/江苏路", category: "重庆火锅", image: IMG.hotpot, distance: "12.8km", times: 0 },
      { name: "popo lee", rating: 3.5, reviews: 13, price: 169, city: "珀斯", category: "韩国料理", image: IMG.food1, times: 0 },
      { name: "Forklore", rating: 4.0, reviews: 11, price: 143, city: "珀斯", category: "咖啡", image: IMG.coffee, times: 0 },
      { name: "Cicerello's Fremantle", rating: 5.0, reviews: 137, price: 208, city: "澳大利亚", category: "鱼鲜海鲜", image: IMG.seafood, times: 0 },
      { name: "SUP SO GOOD", rating: 4.5, reviews: 46, price: 115, city: "珀斯", category: "东南亚菜", image: IMG.food2, times: 0 },
      { name: "Yo-Chi", rating: 4.0, reviews: 7, price: 69, city: "澳大利亚", category: "冰淇淋", image: IMG.gelato, times: 0 },
      { name: "Eggspot Fremantle", rating: 4.5, reviews: 24, price: 98, city: "澳大利亚", category: "早午餐", image: IMG.pastry, times: 0 },
    ],
  },
};

// 为没有 profile 的好友生成默认 mock
export function getProfileForFriend(name) {
  if (FRIEND_PROFILES[name]) return FRIEND_PROFILES[name];
  // 默认生成
  const seed = name.length % 5;
  return {
    personality: PERSONALITIES[seed],
    foodType: FOOD_TYPES[seed],
    foodTypeEmoji: ["🌶️", "🍩", "🍣", "🥗", "🍔"][seed],
    records: [
      { name: "附近口碑咖啡馆", rating: 4.5, reviews: 328, price: 38, city: "上海", category: "咖啡", image: IMG.coffee, times: 0 },
      { name: "人均友好的小餐馆", rating: 4.0, reviews: 892, price: 56, city: "上海", category: "本帮菜", image: IMG.food1, times: 2 },
      { name: "宝藏甜品店", rating: 4.8, reviews: 214, price: 42, city: "上海", category: "甜品", image: IMG.dessert, times: 0 },
      { name: "深夜食堂·串烧", rating: 4.2, reviews: 1560, price: 88, city: "上海", category: "居酒屋", image: IMG.bar, times: 0 },
      { name: "早午餐胜地", rating: 4.6, reviews: 678, price: 65, city: "上海", category: "早午餐", image: IMG.pastry, times: 0 },
    ],
  };
}
