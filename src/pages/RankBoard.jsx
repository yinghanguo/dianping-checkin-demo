import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { shPoi } from "../data/shanghaiStores";

// 大众点评榜单(指数榜样式)—— 首页「点评榜单」入口(对齐图1)
// 左侧榜单导轨 + 顶部品类 Tab + 子品类 + 右侧热门榜列表
const IMG = {
  lianglou: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&q=70",
  shacha: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=300&q=70",
  simiantai: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=300&q=70",
  taiqiong: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=300&q=70",
  jijishan: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=70",
};

const INDEX_BOARDS = ["热门榜", "好评榜", "口味榜", "环境榜", "服务榜", "销量榜", "回头客榜", "打卡\n人气榜"];
const THEME_BOARDS = ["市井\n烟火榜", "老店榜", "新店榜", "主题\n餐厅榜", "遛娃\n好去处榜", "城趣\n漫游榜"];
const CATE_TABS = ["美食", "休闲娱乐", "景点", "酒店", "丽人"];
const SUB_TABS = ["全部", "火锅", "面包蛋糕甜品", "西餐", "东南亚"];

const HOTPOT = [
  { rank: 1, name: "两楼·潮汕热炒·火锅(静安寺店)", img: IMG.lianglou, rating: 4.7, price: 313, biz: "静安寺商圈", cat: "打边炉/港式…", dist: "2.0km", index: "96.02", quote: "93人说“潮汕手熬鱼汤锅”,88人说“食材处理精致”" },
  { rank: 2, name: "燃计沙茶皇·香港沙茶火锅", img: IMG.shacha, rating: 4.2, price: 126, biz: "静安寺商圈", cat: "火锅", dist: "1.6km", index: "96.00", quote: "289人说“沙爹火锅汤底浓郁”,116人说“食材新鲜度…" },
  { rank: 3, name: "四面泰(静安嘉里中心店)", img: IMG.simiantai, rating: 4.8, price: 146, biz: "静安寺商圈", cat: "泰式火锅", dist: "1.5km", index: "95.86", season: true, quote: "1345人说“椰香锅底双拼”,770人说“冬阴功汤底酸辣”" },
  { rank: 4, name: "太琼糟粕醋·海南酸汤", img: IMG.taiqiong, rating: 4.4, price: 130, biz: "苏河湾", cat: "火锅", dist: "1.8km", index: "95.76", season: true, been: true, quote: "3664人说“经典糟粕醋锅底”,3367人说“汤底微酸…" },
  { rank: 5, name: "季季山·云南野生菌火锅(久光店)", img: IMG.jijishan, rating: 4.8, price: 123, biz: "大宁地区", cat: "菌菇火锅", dist: "4.8km", index: "95.55", season: true, quote: "2324人说“汤底菌菇香气”,1434人说“可吃到野生…" },
];

function HalfStars({ rating }) {
  return (
    <div className="flex items-center gap-px">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(1, Math.max(0, rating - (i - 1)));
        return (
          <div key={i} className="relative" style={{ width: 13, height: 13 }}>
            <svg viewBox="0 0 12 12" className="absolute inset-0"><path d="M6 0.5l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8l-3 1.6.6-3.3L1.2 4l3.3-.5z" fill="#e8e8e8" /></svg>
            <svg viewBox="0 0 12 12" className="absolute inset-0" style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}><path d="M6 0.5l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8l-3 1.6.6-3.3L1.2 4l3.3-.5z" fill="#FF6F00" /></svg>
          </div>
        );
      })}
    </div>
  );
}

export default function RankBoard() {
  const navigate = useNavigate();
  const [board, setBoard] = useState("热门榜");
  const [cate, setCate] = useState("美食");
  const [sub, setSub] = useState("火锅");

  return (
    <div className="absolute inset-0 bg-[#F5F5F5] flex flex-col">
      {/* 顶部栏 */}
      <div className="bg-white shrink-0 px-3 pt-3 pb-2 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="shrink-0 w-6 h-6 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button className="shrink-0 flex items-center gap-0.5 text-[14px] font-medium text-dpInk">上海<span className="text-[9px]">▾</span></button>
        <span className="flex-1 text-center text-[17px] font-bold text-dpInk">大众点评榜单</span>
        <div className="shrink-0 flex items-center gap-3">
          <div className="flex flex-col items-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20L17 17" strokeLinecap="round" /></svg>
            <span className="text-[8px] text-dpInk">搜索</span>
          </div>
          <div className="flex flex-col items-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg>
            <span className="text-[8px] text-dpInk">地图</span>
          </div>
          <span className="text-[18px] text-dpInk leading-none">···</span>
        </div>
      </div>

      {/* 品类 Tab */}
      <div className="bg-white shrink-0 px-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
        {CATE_TABS.map((c) => (
          <button
            key={c}
            onClick={() => setCate(c)}
            className="shrink-0 px-4 h-8 rounded-full text-[13px] font-medium"
            style={cate === c ? { background: "#FFF0E5", color: "#E65000" } : { background: "#F5F5F5", color: "#666" }}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧榜单导轨 */}
        <div className="w-[86px] shrink-0 bg-[#F5F5F5] overflow-y-auto no-scrollbar pb-8">
          <button className="w-full pt-3 pb-2 flex items-center justify-center gap-0.5 text-[12px] font-medium text-[#E65000]">
            静安区<span className="text-[8px]">▾</span>
          </button>
          <BoardGroup label="指数榜" items={INDEX_BOARDS} active={board} onPick={setBoard} />
          <BoardGroup label="主题榜" items={THEME_BOARDS} active={board} onPick={setBoard} />
        </div>

        {/* 右侧内容 */}
        <div className="flex-1 bg-white overflow-y-auto no-scrollbar pb-8">
          {/* 子品类 */}
          <div className="px-3 pt-3 pb-1 flex gap-3 items-center overflow-x-auto no-scrollbar border-b border-[#f7f7f7]">
            {SUB_TABS.map((s) => (
              <button key={s} onClick={() => setSub(s)} className="shrink-0 relative pb-2">
                <span className={`text-[13px] ${sub === s ? "text-dpInk font-bold" : "text-dpText-secondary"}`}>{s}</span>
                {sub === s && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] rounded-full bg-dpOrange" />}
              </button>
            ))}
            <span className="shrink-0 text-[13px] text-dpText-tertiary ml-auto">☰</span>
          </div>

          {/* 榜单标题 */}
          <div className="px-3 pt-3 pb-1 flex items-center justify-between">
            <span className="text-[15px] font-black text-dpInk">静安区{sub}{board}</span>
            <button className="text-[11px] text-dpText-tertiary flex items-center gap-0.5">价格<span className="text-[8px]">▾</span></button>
          </div>

          {/* 列表 */}
          {HOTPOT.map((s) => (
            <button
              key={s.rank}
              onClick={() => navigate("/store", { state: { poi: shPoi(s.name), photo: s.img } })}
              className="w-full px-3 py-3 text-left border-b border-[#f7f7f7]"
            >
              <div className="flex gap-2.5">
                <div className="relative w-[76px] h-[76px] rounded-lg overflow-hidden bg-[#f0f0f0] shrink-0">
                  <img src={s.img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute top-0 left-0 px-1.5 py-0.5 rounded-br-lg text-[10px] font-black text-white" style={{ background: s.rank <= 3 ? "linear-gradient(135deg,#FFB300,#FF8F00)" : "rgba(0,0,0,0.45)" }}>
                    TOP{String(s.rank).padStart(2, "0")}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-1">
                    <span className="text-[15px] font-bold text-dpInk leading-tight flex-1" style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.name}</span>
                    {s.been && <span className="shrink-0 text-[10px] px-1 py-px rounded" style={{ background: "#FFF0E5", color: "#E65000" }}>已去过</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <HalfStars rating={s.rating} />
                    <span className="text-[14px] font-bold text-[#FF6F00]">{s.rating}</span>
                    <span className="text-[12px] text-dpText-tertiary">¥{s.price}/人</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-dpText-tertiary">
                    <span>{s.biz}</span><span>{s.cat}</span><span className="ml-auto">{s.dist}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[11px] px-1.5 py-px rounded" style={{ background: "#FFF3E8", color: "#C8541A" }}>热门指数 {s.index}</span>
                    {s.season && <span className="text-[11px] px-1.5 py-px rounded" style={{ background: "#FFF8E8", color: "#C8951A" }}>第二季度热门榜</span>}
                  </div>
                </div>
              </div>
              <div className="text-[12px] text-dpText-secondary mt-2 leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.quote}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BoardGroup({ label, items, active, onPick }) {
  return (
    <div className="mt-1">
      <div className="flex items-center justify-center gap-1 py-2">
        <span className="w-3 h-px bg-[#ccc]" />
        <span className="text-[12px] font-bold text-dpInk">{label}</span>
        <span className="w-3 h-px bg-[#ccc]" />
      </div>
      {items.map((it) => {
        const name = it.replace("\n", "");
        const on = active === name;
        return (
          <button
            key={it}
            onClick={() => onPick(name)}
            className="w-full py-2.5 flex items-center justify-center relative"
          >
            {on && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-dpOrange" />}
            <span
              className="text-[12px] text-center leading-tight whitespace-pre-line"
              style={on ? { color: "#E65000", fontWeight: 700 } : { color: "#666" }}
            >
              {it}
            </span>
          </button>
        );
      })}
    </div>
  );
}
