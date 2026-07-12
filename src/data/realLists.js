// 真实清单种子数据 — 全部来自真实点评评价截图整理
// 理由均摘自/改写自评价原文("理由摘自用户自己写过的话"原则)
// 7 份清单分散在 6 个创作者名下;低分店(米面荟心⭐3/Bean Great⭐3.5/M.MASON⭐3.5)按策展原则排除

const avatar = (name, bg) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=${bg}`;

// ── 创作者 ──
const TOFU = { id: "f-tofu", name: "再来一碗豆腐汤", avatar: avatar("再来一碗豆腐汤", "fff3d6"), level: "Lv.8" };
const ZOE = { id: "friend-1", name: "爱吃能吃的JoJo", avatar: avatar("爱吃能吃的JoJo", "b6e3f4"), level: "Lv.8" };
const RIJIANG = { id: "friend-2", name: "landy_js", avatar: avatar("landy_js", "ffdfbf"), level: "Lv.7" };
const HUAHUA = { id: "friend-17", name: "花花花花花", avatar: avatar("花花花花花", "e0f2f1"), level: "Lv.6" };
const FITZ = { id: "friend-14", name: "Fitz", avatar: avatar("Fitz", "dcedc8"), level: "Lv.6" };
const HARDYGU = { id: "friend-12", name: "yzhuo", avatar: avatar("yzhuo", "b3e5fc"), level: "Lv.7" };
const ATT = { id: "friend-13", name: "AT", avatar: avatar("AT", "ffe0b2"), level: "Lv.5" };
const WENDY = { id: "friend-28", name: "WinWinWendy", avatar: avatar("WinWinWendy", "f8bbd0"), level: "Lv.7" };

// ── 配图(unsplash,均已验证可用) ──
const IMG = {
  coffee1: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
  coffee2: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80",
  coffee3: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&q=80",
  coffee4: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80",
  coffee5: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
  bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
  brunch: "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&q=80",
  cant1: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80",
  dimsum: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&q=80",
  rest1: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80",
  food1: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
  seafood1: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80",
  seafood2: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&q=80",
  congee: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&q=80",
  rest2: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
  food2: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=80",
  jp1: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80",
  jp2: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80",
  jp3: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600&q=80",
  izakaya: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&q=80",
  veg: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
  dish: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
  tennis1: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80",
  tennis2: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80",
  tennis3: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80",
  tennis4: "https://images.unsplash.com/photo-1526307616774-60d0098f7642?w=600&q=80",
  tennis5: "https://images.unsplash.com/photo-1560012057-4372e14c5085?w=600&q=80",
  bali1: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
  bali2: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=600&q=80",
  bar: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80",
};

// ── 门店坐标(近似) ──
export const REAL_COORDS = {
  // A 上海咖啡
  "page coffee": { lat: 31.2255, lng: 121.4452 },
  "Marmalade(奉贤路店)": { lat: 31.2338, lng: 121.462 },
  "禧兴 Liveliness coffee shop": { lat: 31.2178, lng: 121.4756 },
  "特写南站": { lat: 31.1548, lng: 121.4302 },
  "沪水焙煎室(淡水路店)": { lat: 31.2155, lng: 121.4685 },
  "No.23 U'NI'VER'SE(社区店)": { lat: 31.2402, lng: 121.4521 },
  "coffee slow pour": { lat: 31.2213, lng: 121.4723 },
  "Book a Coffee 书洞咖啡(静安店)": { lat: 31.2358, lng: 121.4552 },
  "Coffee Spot": { lat: 31.2291, lng: 121.4498 },
  // B 云南咖啡
  "雷比咖啡(市区店)": { lat: 22.778, lng: 100.978 },
  "野鸭塘河谷咖啡(思茅老街店)": { lat: 22.788, lng: 100.973 },
  "阿莱夫": { lat: 22.19, lng: 99.99 },
  "地平线 All·ttitude1891(金马坊店)": { lat: 25.04, lng: 102.713 },
  // C 粤菜
  "福禄居·匠 Atelier de Fook(兴业太古汇店)": { lat: 31.2262, lng: 121.453 },
  "醉辉皇自然博物馆(博华广场店)": { lat: 31.229, 'lng': 121.443 },
  "新顺记·顺德本味(上海利园店)": { lat: 31.245, lng: 121.444 },
  "Deepcook 顺德小馆·小海鲜": { lat: 31.24, lng: 121.448 },
  "肥仔文澳门猪骨煲(南京西路店)": { lat: 31.233, lng: 121.462 },
  "金玉满堂潮州酒楼(无限极荟店)": { lat: 31.232, lng: 121.468 },
  "吉友粥底火锅(方斜路店)": { lat: 31.211, lng: 121.479 },
  "好好彩啫啫煲(人广来福士店)": { lat: 31.235, lng: 121.475 },
  "匠心小厨·粤菜馆(悠方店)": { lat: 31.305, lng: 121.515 },
  // D 日料
  "廣屋(金虹桥店)": { lat: 31.218, lng: 121.396 },
  "AJIYA 炭火烤肉(静安店)": { lat: 31.233, lng: 121.445 },
  "ATELIER IZAKAYA": { lat: 31.228, lng: 121.447 },
  "眷屋の深夜食堂(现所·创邑MIX店)": { lat: 31.221, lng: 121.424 },
  "白日清澄(愚园路店)": { lat: 31.223, lng: 121.431 },
  // E 上海云南菜
  "云和山·云南边境菜": { lat: 31.23, lng: 121.456 },
  "上汤·云南小馆(南京西路店)": { lat: 31.231, lng: 121.46 },
  "边水恰恰·云南边境菜": { lat: 31.238, lng: 121.45 },
  "一坐一忘云南菜(兴国路店)": { lat: 31.21, lng: 121.433 },
  "EATCHEW 大理": { lat: 31.227, lng: 121.449 },
  // F 网球
  "至臻网球(静安大宁店)": { lat: 31.281, lng: 121.456 },
  "至臻网球(杨浦黄兴店)": { lat: 31.306, lng: 121.539 },
  "WoW Tennis 沃梧网球": { lat: 31.208, lng: 121.462 },
  "至臻网球(长阳路店)": { lat: 31.262, lng: 121.533 },
  "天钥桥路909号顶楼网球场": { lat: 31.183, lng: 121.438 },
  "Tennisline 国际网球学院(静安球场)": { lat: 31.238, lng: 121.447 },
  // G 巴厘岛
  "Shelter Restaurant": { lat: -8.648, lng: 115.138 },
  "Santanera": { lat: -8.66, lng: 115.13 },
  "Bo & Bun": { lat: -8.682, lng: 115.162 },
  "Twist Ubud": { lat: -8.507, lng: 115.262 },
};

const poi = (name, city, district, category, emoji) => ({ name, city, district, category, emoji });

// ── 七份清单 ──
export const REAL_LISTS = [
  // A ────────────────────────────────────────
  {
    id: "list_r_coffee_sh",
    owner: TOFU,
    title: "再来一碗豆腐汤推荐的宝藏咖啡店",
    description: "又四处喝了一年咖啡,这几家仍旧是最爱也最常向人推荐的。",
    cover: IMG.coffee1,
    visibility: "public",
    likeCount: 1843,
    saveCount: 892,
    createdAt: "3/16",
    updatedAt: "7/5",
    allBeenThere: true,
    items: [
      { poi: poi("禧兴 Liveliness coffee shop", "上海", "黄浦", "咖啡厅", "☕"), photo: IMG.coffee2, photos: [IMG.coffee2, IMG.bakery, IMG.coffee1], reason: "四处喝了一年,仍是最常向人推荐的一家;奶白窗帘配木桌椅像理想客厅,二楼安静又快乐", beenThere: true },
      { poi: poi("沪水焙煎室(淡水路店)", "上海", "黄浦", "咖啡厅", "☕"), photo: IMG.coffee5, reason: "海苔味 Dirty 是真的有东西,丝丝咸香很上头,老缝纫机的店面设计也用心", beenThere: true },
      { poi: poi("page coffee", "上海", "静安", "咖啡厅", "☕"), photo: IMG.coffee1, reason: "卡布奇诺必须让第一次来的朋友喝上,这次真的喝出了巧克力味道,出品永远稳定", beenThere: true },
      { poi: poi("特写南站", "上海", "徐汇", "咖啡厅", "☕"), photo: IMG.coffee3, reason: "从豆子到用云南土壤烧的杯子都在还原在地感,每个角落都出片,周末记得预约", beenThere: true },
      { poi: poi("Marmalade(奉贤路店)", "上海", "静安", "咖啡厅", "☕"), photo: IMG.coffee4, reason: "宠物友好的日式小店,佛手香柚冷萃配店里客人带的大狗宝宝,坐一下午", beenThere: true },
    ],
  },
  // B ────────────────────────────────────────
  {
    id: "list_r_coffee_yn",
    owner: TOFU,
    title: "云南咖啡产地巡礼:普洱-景迈山-昆明",
    description: "去云南喝咖啡,像去波尔多喝酒。这条线我替你踩过了。",
    cover: IMG.coffee3,
    visibility: "public",
    likeCount: 976,
    saveCount: 431,
    createdAt: "2/20",
    updatedAt: "2/27",
    allBeenThere: true,
    items: [
      { poi: poi("雷比咖啡(市区店)", "普洱", "", "咖啡厅", "☕"), photo: IMG.coffee2, reason: "「77次日落」柑橘偏酸+木姜子屑,名字都会起;等位四五十分钟也值,记得带豆子走", beenThere: true },
      { poi: poi("野鸭塘河谷咖啡(思茅老街店)", "普洱", "", "咖啡厅", "☕"), photo: IMG.coffee5, reason: "自家咖啡庄园的店,特调「染秋」树番茄风味突出,牛油果拿铁搅匀后很绵密", beenThere: true },
      { poi: poi("阿莱夫", "澜沧", "", "咖啡厅", "☕"), photo: IMG.veg, reason: "徒步完一天来了两次的店,躺着发呆有二哈陪,隐藏菜单和抹茶巴斯克都绝", beenThere: true },
      { poi: poi("地平线 All·ttitude1891(金马坊店)", "昆明", "", "咖啡厅", "☕"), photo: IMG.coffee1, reason: "滇橄榄冰美式是少见的无可挑剔特调,纽约苹果派配着吃,昆明烘焙水平的门面", beenThere: true },
    ],
  },
  // C ────────────────────────────────────────
  {
    id: "list_r_cantonese",
    owner: ZOE,
    title: "你永远可以相信粤菜和啫啫煲",
    description: "请客、家宴、犒劳自己,粤菜从不让人失望。九家全部反复验证过。",
    cover: IMG.cant1,
    visibility: "public",
    likeCount: 3521,
    saveCount: 1687,
    createdAt: "1/12",
    updatedAt: "7/5",
    allBeenThere: true,
    items: [
      { poi: poi("福禄居·匠 Atelier de Fook(兴业太古汇店)", "上海", "静安", "粤菜馆", "🦐"), photo: IMG.cant1, photos: [IMG.cant1, IMG.dimsum, IMG.food2], reason: "头抽红胡椒煎罗氏虾很爱很爱,还有很多道想吃没吃的,下次还来", beenThere: true },
      { poi: poi("金玉满堂潮州酒楼(无限极荟店)", "上海", "黄浦", "潮汕菜", "🦞"), photo: IMG.seafood2, reason: "古法龙趸腩蒸球在我这排名第一,醉花蛤和酥皮牛奶包也名不虚传", beenThere: true },
      { poi: poi("吉友粥底火锅(方斜路店)", "上海", "黄浦", "粥底火锅", "🍲"), photo: IMG.congee, reason: "种草很多年的粥底火锅,米由生煮到烂,没吃到娘子鸡翅所以还得再来一次", beenThere: true },
      { poi: poi("好好彩啫啫煲(人广来福士店)", "上海", "黄浦", "顺德菜", "🥘"), photo: IMG.food1, reason: "清远鸡煲的鸡嫩到犯规,腊味煲仔饭腊肉给的超级多", beenThere: true },
      { poi: poi("醉辉皇自然博物馆(博华广场店)", "上海", "静安", "粤菜馆", "🐟"), photo: IMG.seafood1, reason: "单点贵但套餐性价比高到无法不选,鱼饼蘸醋一绝,两个人绝对吃不完", beenThere: true },
      { poi: poi("新顺记·顺德本味(上海利园店)", "上海", "静安", "顺德菜", "🍚"), photo: IMG.food2, reason: "功夫生炒鱼片蛮惊艳,腊味煲仔饭必点,牛蛙大到感觉可以小一点", beenThere: true },
      { poi: poi("匠心小厨·粤菜馆(悠方店)", "上海", "杨浦", "粤菜馆", "🍤"), photo: IMG.dimsum, reason: "全桌最爱葱油淋笋壳鱼,一桌九个菜只有小炒皇失手,西瓜汁都值得强推", beenThere: true },
      { poi: poi("Deepcook 顺德小馆·小海鲜", "上海", "静安", "顺德菜", "🦐"), photo: IMG.rest2, reason: "花雕熟醉罗氏虾配得上招牌俩字,虾头有膏,3只起点想吃几个点几个", beenThere: true },
      { poi: poi("肥仔文澳门猪骨煲(南京西路店)", "上海", "静安", "澳门菜", "🍖"), photo: IMG.rest1, reason: "二刷三刷的店,招牌八味豆腐必点,上菜快到点完没几分钟就啪啪上桌", beenThere: true },
    ],
  },
  // D ────────────────────────────────────────
  {
    id: "list_r_japanese",
    owner: RIJIANG,
    title: "居酒屋和日料,按这个吃",
    description: "静安到金虹桥,烧鸟、烤肉、茶泡饭各司其职。",
    cover: IMG.jp1,
    visibility: "public",
    likeCount: 2210,
    saveCount: 1043,
    createdAt: "1/8",
    updatedAt: "6/26",
    allBeenThere: true,
    items: [
      { poi: poi("白日清澄(愚园路店)", "上海", "静安", "日本料理", "🍵"), photo: IMG.jp2, reason: "专门吃茶泡饭的地方,不爱吃三文鱼的我都被三文鱼泡茶汤收服了", beenThere: true },
      { poi: poi("ATELIER IZAKAYA", "上海", "静安", "日本料理", "🍶"), photo: IMG.izakaya, reason: "酒渍大虾非常惊艳,芝士罗勒扇贝柱的做法第一次见,餐厅周来性价比很高", beenThere: true },
      { poi: poi("AJIYA 炭火烤肉(静安店)", "上海", "静安", "日式烧烤", "🥩"), photo: IMG.jp3, reason: "牛肋排沾黄油挺有想法,招牌葱拌饭值得 top1,周末记得预定", beenThere: true },
      { poi: poi("廣屋(金虹桥店)", "上海", "长宁", "日本料理", "🍢"), photo: IMG.jp1, reason: "鹅肝寿司完全值得招牌,烧鸟一串没踩雷,金虹桥堵车都拦不住我来", beenThere: true },
      { poi: poi("眷屋の深夜食堂(现所·创邑MIX店)", "上海", "长宁", "日本料理", "🏮"), photo: IMG.bar, reason: "烤牛舌嫩到发光,三文鱼甜虾 taco 和芝士豆腐甜点都超出居酒屋该有的水平", beenThere: true },
    ],
  },
  // E ────────────────────────────────────────
  {
    id: "list_r_yunnan_sh",
    owner: HUAHUA,
    title: "云南菜爱好者的上海自救指南",
    description: "回不去云南的日子,这五家能救命。",
    cover: IMG.veg,
    visibility: "public",
    likeCount: 1892,
    saveCount: 876,
    createdAt: "5/16",
    updatedAt: "6/24",
    allBeenThere: true,
    items: [
      { poi: poi("上汤·云南小馆(南京西路店)", "上海", "静安", "云南菜", "🌶"), photo: IMG.dish, reason: "昭通瘦肉小串和卤烤鸡爪无可挑剔,鲜米线的酸汤过桥只有云南这样吃", beenThere: true },
      { poi: poi("云和山·云南边境菜", "上海", "静安", "云南菜", "🍚"), photo: IMG.food1, reason: "洋芋焖饭是我永远的爱,俩人吃甚至不够;这家用香料炉火纯青", beenThere: true },
      { poi: poi("一坐一忘云南菜(兴国路店)", "上海", "长宁", "云南菜", "🥬"), photo: IMG.veg, reason: "牛肉薄荷叶清汤是完美主菜,蕨菜没在云南吃到的嫩,但还要啥自行车呀", beenThere: true },
      { poi: poi("EATCHEW 大理", "上海", "静安", "云南菜", "🌸"), photo: IMG.brunch, reason: "芸豆火腿猪蹄的蘸水简直封神,乳扇苹果塔记得两三个人分", beenThere: true },
      { poi: poi("边水恰恰·云南边境菜", "上海", "静安", "云南菜", "🐟"), photo: IMG.food2, reason: "不知道是哪里的边境,但挺云南的;油焖鸡到柠檬草花甲一路无踩雷", beenThere: true },
    ],
  },
  // F ──── 网球 ×3(三位创作者,门店刻意重叠,支撑"同主题的其他私藏"推荐) ────
  {
    id: "list_r_tennis",
    owner: FITZ,
    title: "从静安打到徐汇:跟着王教练换场地",
    description: "跟着王教练从正手反手学到截击切削,场地也跟着换了一路,现在开始学发球了。",
    cover: IMG.tennis1,
    visibility: "public",
    likeCount: 687,
    saveCount: 259,
    createdAt: "5/17",
    updatedAt: "6/26",
    allBeenThere: true,
    items: [
      { poi: poi("至臻网球(静安大宁店)", "上海", "静安", "网球场", "🎾"), photo: IMG.tennis1, reason: "纯室内有空调,夏天打球的救命场;8折卡后 256/h,提前几天就约得到", beenThere: true },
      { poi: poi("至臻网球(杨浦黄兴店)", "上海", "杨浦", "网球场", "🎾"), photo: IMG.tennis4, reason: "场地纵深长,深球也接得住;没搭子就打发球机,还能偷看隔壁高手打球", beenThere: true },
      { poi: poi("WoW Tennis 沃梧网球", "上海", "徐汇", "网球场", "🎾"), photo: IMG.tennis2, reason: "王教练看动作看得准,指导几下就有改善,脾气好从不着急;蓝色地胶很出片", beenThere: true },
    ],
  },
  {
    id: "list_r_tennis_zhizhen",
    owner: HARDYGU,
    title: "至臻网球老会员的分店实测",
    description: "充5000打8折,每周都来;三家分店各有各的用法,按需选场。",
    cover: IMG.tennis4,
    visibility: "public",
    likeCount: 512,
    saveCount: 198,
    createdAt: "6/26",
    updatedAt: "12/26",
    allBeenThere: true,
    items: [
      { poi: poi("至臻网球(长阳路店)", "上海", "杨浦", "网球场", "🎾"), photo: IMG.tennis3, reason: "中午时段8折卡超级划算,前台会帮忙把发球机调到超级合适,每次来像回家一样", beenThere: true },
      { poi: poi("至臻网球(杨浦黄兴店)", "上海", "杨浦", "网球场", "🎾"), photo: IMG.tennis4, reason: "顶棚高,下雨也能打且不会打到顶;场地间有隔网互不影响", beenThere: true },
      { poi: poi("至臻网球(静安大宁店)", "上海", "静安", "网球场", "🎾"), photo: IMG.tennis1, reason: "最里面一片双打场提供球,外面四片单打场可以打发球机,门口就是停车场", beenThere: true },
    ],
  },
  {
    id: "list_r_tennis_photo",
    owner: ATT,
    title: "出片的城市球场:天台、日落和紫色地胶",
    description: "打球是次要的,拍出来好看才是正经事(不是)。",
    cover: IMG.tennis5,
    visibility: "public",
    likeCount: 903,
    saveCount: 371,
    createdAt: "4/6",
    updatedAt: "5/17",
    allBeenThere: true,
    items: [
      { poi: poi("天钥桥路909号顶楼网球场", "上海", "徐汇", "网球场", "🎾"), photo: IMG.tennis5, reason: "天钥桥路909号3号楼的顶楼,知道的人不多的天台球场,拍拍子都出片", beenThere: true },
      { poi: poi("Tennisline 国际网球学院(静安球场)", "上海", "静安", "网球场", "🎾"), photo: IMG.tennis3, reason: "紫色地胶配环绕的居民楼,城市球场该有的样子都在这了", beenThere: true },
      { poi: poi("WoW Tennis 沃梧网球", "上海", "徐汇", "网球场", "🎾"), photo: IMG.tennis2, reason: "蓝色地胶很出片,听说傍晚天气好的时候球场可以看到日落", beenThere: true },
    ],
  },
  // G ────────────────────────────────────────
  {
    id: "list_r_bali",
    owner: WENDY,
    title: "巴厘岛:信吃货,不信榜单",
    description: "踩过雷之后总结的——同价位差距能有多大,吃过就知道。",
    cover: IMG.bali1,
    visibility: "public",
    likeCount: 1204,
    saveCount: 566,
    createdAt: "12/26",
    updatedAt: "1/2",
    allBeenThere: true,
    items: [
      { poi: poi("Shelter Restaurant", "巴厘岛", "", "地中海菜", "🫒"), photo: IMG.bali2, reason: "burrata 脑袋爱死了,慢炖羊肩肉裹着 pita 超级好吃,除了饼不脆全程不踩雷", beenThere: true },
      { poi: poi("Santanera", "巴厘岛", "", "南美菜", "🦑"), photo: IMG.rest1, reason: "烤鱿鱼须端上来那刻以为在吃 fine dining,不爱吃鱿鱼的我 kuku 吃了一条腿", beenThere: true },
      { poi: poi("Bo & Bun", "巴厘岛", "", "东南亚菜", "🍜"), photo: IMG.bali1, reason: "每日限量的 12 小时河粉,牛肉软烂到在越南本土都没吃到过,12 点就坐满了", beenThere: true },
      { poi: poi("Twist Ubud", "巴厘岛", "", "亚洲菜", "🥥"), photo: IMG.bar, reason: "caramel pork 什么鬼才创意,超级好吃;乌布雨天里的惊喜", beenThere: true },
    ],
  },
];
