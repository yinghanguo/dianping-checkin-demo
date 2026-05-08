// 智能 mock 的 AI 文案优化
// 输入:用户文案 + POI 信息(name + category) + 时间
// 输出:基于场景上下文的"看起来像 AI 写的"优化文案

// 基于品类的语境模板
const CATEGORY_CONTEXTS = {
  咖啡馆: {
    keywords: ["暖光", "豆香", "下午", "拉花", "氤氲"],
    moods: ["治愈", "舒缓", "慢节奏", "适合一个人"],
    sensories: ["杯壁的温度", "杯底剩下的奶泡", "光线斜进来的角度"],
  },
  café: { ref: "咖啡馆" },
  Café: { ref: "咖啡馆" },
  Coffee: { ref: "咖啡馆" },

  餐厅: {
    keywords: ["烟火气", "锅气", "热气", "刚出锅", "一口"],
    moods: ["满足", "踏实", "幸福", "饱腹"],
    sensories: ["碗沿冒出的热气", "筷子下去那一瞬", "落座时的香味"],
  },
  本帮菜: { ref: "餐厅" },
  Restaurant: { ref: "餐厅" },
  Seafood: { ref: "餐厅" },
  日料: { ref: "餐厅" },
  快餐: { ref: "餐厅" },
  Tapas: { ref: "餐厅" },

  酒吧: {
    keywords: ["微醺", "灯影", "夜色", "杯子凝结的水珠"],
    moods: ["放松", "聊到深夜", "失重感"],
    sensories: ["杯口的盐边", "音乐压低的角度", "灯光把人染成琥珀色"],
  },
  Bar: { ref: "酒吧" },

  海滩: {
    keywords: ["海风", "咸湿", "浪声", "贝壳", "脚下的沙"],
    moods: ["放空", "时间慢下来", "什么都不想"],
    sensories: ["海风吹乱头发", "沙子从指缝漏掉", "潮汐推过脚踝"],
  },
  Beach: { ref: "海滩" },
  "Park · Seaside": { ref: "海滩" },

  公园: {
    keywords: ["树荫", "野餐布", "草地", "蝉鸣", "光斑"],
    moods: ["发呆", "什么都不做", "享受闲下来"],
    sensories: ["草地的回弹", "树缝里漏下的光", "风把书页吹翻"],
  },
  Park: { ref: "公园" },
  花园: { ref: "公园" },
  公园·散步: { ref: "公园" },

  景点: {
    keywords: ["驻足", "建筑的线条", "石阶", "走过这条街"],
    moods: ["敬畏", "时间感", "回到几十年前"],
    sensories: ["抬头才看见的飞檐", "门把手被磨亮的角落"],
  },
  博物馆: {
    keywords: ["展柜", "灯光", "驻足", "解说牌"],
    moods: ["安静", "被故事拽住", "出来时世界变了一点"],
    sensories: ["展品旁的反光", "纸质说明的纹理"],
  },
  Museum: { ref: "博物馆" },
  教堂: {
    keywords: ["穹顶", "玻璃花窗", "管风琴", "回响"],
    moods: ["静默", "渺小", "时间停下来"],
    sensories: ["脚步在地上的回声", "光透过彩窗变成颜色"],
  },
  Cathedral: { ref: "教堂" },
  Church: { ref: "教堂" },
  寺庙: {
    keywords: ["檐角", "香火", "石阶", "古树"],
    moods: ["平静", "放下一些东西", "敬"],
    sensories: ["香的味道", "鞋尖踩过青砖"],
  },

  机场: {
    keywords: ["延误", "广播", "登机口", "窗外的跑道"],
    moods: ["等待", "出发前的间隙", "这次旅程要开始/结束了"],
    sensories: ["背包压在脚边的重量", "玻璃外飞机滑行的声音"],
  },
  火车站: { ref: "机场" },
  地铁入口: { ref: "机场" },

  购物中心: {
    keywords: ["人流", "玻璃幕墙", "电梯往返", "招牌的光"],
    moods: ["闲逛", "什么也不打算买", "顺便看看"],
    sensories: ["新店面的木味", "椅子上短暂的歇脚"],
  },
  Mall: { ref: "购物中心" },

  酒店: {
    keywords: ["check-in", "电梯", "床头灯", "窗外的城市"],
    moods: ["落脚", "把背包放下的瞬间"],
    sensories: ["新换的被单", "酒店专属的香味"],
  },
  Hotel: { ref: "酒店" },

  // 兜底
  default: {
    keywords: ["此刻", "光", "空气", "声音"],
    moods: ["停下来", "记住这一刻", "好像很久没这样了"],
    sensories: ["光线的温度", "周围的声音"],
  },
};

function lookupContext(category) {
  const c = CATEGORY_CONTEXTS[category];
  if (!c) return CATEGORY_CONTEXTS.default;
  if (c.ref) return CATEGORY_CONTEXTS[c.ref] || CATEGORY_CONTEXTS.default;
  return c;
}

// 时段感
function timeOfDay(hour) {
  if (hour >= 5 && hour < 11) return { period: "上午", phrase: "早晨的光", season: "刚醒的世界" };
  if (hour >= 11 && hour < 14) return { period: "中午", phrase: "正午的阳光", season: "光线最直的时候" };
  if (hour >= 14 && hour < 18) return { period: "下午", phrase: "斜下来的光", season: "下午慢下来的时刻" };
  if (hour >= 18 && hour < 21) return { period: "傍晚", phrase: "夕阳", season: "天色一点点深下去" };
  return { period: "夜里", phrase: "夜色", season: "城市安静下来" };
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// 主入口:智能优化
// args: { text, poi, photos }
export function optimizeText({ text = "", poi, photos = [] } = {}) {
  const ctx = lookupContext(poi?.category);
  const tod = timeOfDay(new Date().getHours());
  const userText = text.trim();
  const placeName = poi?.name || "这里";
  const photoCount = photos.length;

  // ── 用户没写任何内容 → 完全 AI 生成 ──
  if (!userText) {
    const templates = [
      `${tod.phrase}下的${placeName},${pick(ctx.sensories)}。${pick(ctx.moods)}的一瞬间。`,
      `在${placeName}停下来。${pick(ctx.keywords)},${pick(ctx.keywords)}——${pick(ctx.moods)}。`,
      `${placeName}的${tod.period}。${pick(ctx.sensories)},什么都不用想。`,
    ];
    return pick(templates);
  }

  // ── 用户已有文字 → 围绕原文做扩写/打磨 ──
  // 几种处理策略,随机选一种以保持多样
  const strategies = [
    // A:在原文末尾加上场景细节
    () =>
      `${userText.replace(/[。.!?！?]\s*$/, "")}。${pick(ctx.sensories)},${pick(ctx.moods)}。`,
    // B:在原文前加场景定位,后加情绪
    () =>
      `${tod.phrase}的${placeName}。${userText.replace(/[。.!?！?]\s*$/, "")}——${pick(ctx.moods)}的那种。`,
    // C:扩写一倍,围绕用户的核心情绪
    () =>
      `${userText.replace(/[。.!?！?]\s*$/, "")}。在${placeName},${pick(ctx.keywords)}让${pick(ctx.moods)}变得很具体。`,
    // D:口语化打磨 + 加 photoCount 提示(若 >1)
    () => {
      const photoHint = photoCount > 1 ? `(留了 ${photoCount} 张这里的画面)` : "";
      return `${userText.replace(/[。.!?！?]\s*$/, "")}。${pick(ctx.keywords)},${pick(ctx.keywords)}${photoHint ? " " + photoHint : ""}。`;
    },
    // E:加问句 / 感叹结尾
    () =>
      `${userText.replace(/[。.!?！?]\s*$/, "")}——${tod.season},${pick(ctx.moods)}的一刻,谁不喜欢呢。`,
  ];
  return pick(strategies)();
}

// 生成"AI 帮我写"的 3 条候选(空白文案场景)
export function generateSuggestions({ poi, photos = [] } = {}) {
  const ctx = lookupContext(poi?.category);
  const tod = timeOfDay(new Date().getHours());
  const placeName = poi?.name || "这里";
  const result = new Set();
  // 多生成几次直到去重得到 3 条
  let safety = 20;
  while (result.size < 3 && safety-- > 0) {
    result.add(optimizeText({ text: "", poi, photos }));
  }
  // 再加 1-2 条更具体的兜底,确保多样
  if (result.size < 3) {
    result.add(`${placeName}的${tod.period},${pick(ctx.moods)}。`);
    result.add(`${tod.phrase}里的${placeName}——${pick(ctx.sensories)}。`);
  }
  return Array.from(result).slice(0, 3);
}
