import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { STORE_INFO, NJXL_SEARCH_RESULTS, SH_IMG, shPoi } from "../data/shanghaiStores";
import { getList } from "../data/lists";

// 搜索结果页(对齐真实点评样式) — 搜索词「南京西路」
// 清单卡片穿插在商户结果之后:高决策场景下,"一个靠谱的人替你选好"
const TABS = ["全部", "商户", "团购", "外卖", "内容"];

function Stars({ rating, size = 13 }) {
  return (
    <div className="flex items-center gap-px">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(1, Math.max(0, rating - (i - 1)));
        return (
          <div key={i} className="relative" style={{ width: size, height: size }}>
            <svg viewBox="0 0 12 12" className="absolute inset-0">
              <path d="M6 0.5l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8l-3 1.6.6-3.3L1.2 4l3.3-.5z" fill="#e8e8e8" />
            </svg>
            <svg viewBox="0 0 12 12" className="absolute inset-0" style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}>
              <path d="M6 0.5l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8l-3 1.6.6-3.3L1.2 4l3.3-.5z" fill="#FF6F00" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

// 混排内容行的笔记 mock(对齐真实点评"相关内容"卡)
const NOTE_CARDS = [
  { title: "新荣记开茶餐厅 人均80元 新荣记开的港式茶", author: "爱吃的阿越", likes: 355, img: SH_IMG.fengshengli, dist: "651m" },
  { title: "🔥上海粤菜榜单 No.1 正宗肠粉王!! 吃到一家", author: "没有冰拿铁会呆", likes: 128, img: SH_IMG.laoshaoxing, dist: "436m" },
  { title: "早茶的好去处 老牌粤菜聚餐天花板", author: "一只松_", likes: 89, img: SH_IMG.donghai, dist: "1.2km" },
  { title: "南西白领工作日续命指南 抓紧收藏", author: "清風徐來821", likes: 178, img: SH_IMG.bco, dist: "500m" },
];
const noteAvatar = (name) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=ffe0b2`;

export default function Search() {
  const navigate = useNavigate();
  // 混排横滑:清单 → 笔记 → 笔记 循环(清单与笔记混排,不再单独放横滑清单)
  const mixedRow = React.useMemo(() => {
    const lists = [getList("list_f_njxl_richang"), getList("list_r_cantonese")].filter(Boolean);
    const out = [];
    let li = 0, ni = 0;
    while (li < lists.length || ni < NOTE_CARDS.length) {
      if (li < lists.length) out.push({ type: "list", data: lists[li++] });
      for (let k = 0; k < 2 && ni < NOTE_CARDS.length; k++) out.push({ type: "note", data: NOTE_CARDS[ni++] });
      if (li >= lists.length && ni >= NOTE_CARDS.length) break;
    }
    return out;
  }, []);

  const openStore = (name) => {
    const info = STORE_INFO[name];
    navigate("/store", { state: { poi: shPoi(name), photo: info?.photos?.[0] } });
  };

  return (
    <div className="absolute inset-0 bg-[#F5F5F5] flex flex-col">
      {/* ── 搜索头 ── */}
      <div className="bg-white shrink-0 px-3 pt-3 pb-2 flex items-center gap-2.5">
        <button onClick={() => navigate(-1)} className="shrink-0 w-7 h-7 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 h-9 bg-[#F5F5F5] rounded-full flex items-center px-3.5 gap-2">
          <span className="flex-1 text-[14px] text-dpInk">南京西路</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#ccc">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 9l6 6M15 9l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <button className="shrink-0 flex flex-col items-center">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <span className="text-[9px] text-dpInk mt-px">地图</span>
        </button>
      </div>

      {/* ── Tab 行 ── */}
      <div className="bg-white shrink-0 px-4 flex items-center border-b border-[#f0f0f0]">
        <div className="flex gap-6 flex-1">
          {TABS.map((t, i) => (
            <button key={t} className="py-2.5 relative">
              <span className={`text-[14px] ${i === 0 ? "text-dpInk font-bold" : "text-dpText-secondary"}`}>{t}</span>
              {i === 0 && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full bg-dpOrange" />}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1 text-[13px] font-medium" style={{ color: "#5B6AF0" }}>
          🐬 问点仔<span className="text-[10px] font-bold">AI</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        {/* ── 地标卡(南京西路) ── */}
        <div className="mx-2.5 mt-2.5 bg-white rounded-2xl p-3 flex gap-3">
          <div className="w-[92px] h-[76px] rounded-xl overflow-hidden bg-[#f0f0f0] shrink-0">
            <img src={SH_IMG.njxl} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[17px] font-bold text-dpInk">南京西路</span>
              <span className="text-[12px] text-dpText-tertiary">550m</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Stars rating={4.9} />
              <span className="text-[14px] font-bold text-[#FF6F00]">4.9</span>
              <span className="text-[11px] text-dpText-tertiary">804条</span>
            </div>
            <div className="text-[11px] text-dpText-tertiary mt-1">商圈 · 南京西路商圈</div>
            <div className="text-[11px] text-dpText-secondary mt-0.5 truncate">“梧桐树影里的老上海门面，散步逛店两相宜”</div>
          </div>
        </div>

        {/* ── 筛选行 ── */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          {["距离", "分类", "排序", "筛选"].map((f) => (
            <button key={f} className="flex items-center gap-0.5 text-[13px] text-dpInk">
              {f}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>

        {/* ── 商户结果(第 2 个商户后插混排横滑内容行) ── */}
        <div className="bg-white">
          {NJXL_SEARCH_RESULTS.map((name, idx) => {
            const info = STORE_INFO[name];
            return (
              <React.Fragment key={name}>
              <button
                onClick={() => openStore(name)}
                className="w-full px-3 py-3.5 flex gap-3 text-left border-b border-[#f7f7f7]"
              >
                <div className="w-[86px] h-[86px] rounded-xl overflow-hidden bg-[#f0f0f0] shrink-0">
                  <img src={info.photos[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-bold text-dpInk truncate">{name}</div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <Stars rating={info.rating} />
                    <span className="text-[14px] font-bold text-[#FF6F00]">{info.rating}</span>
                    <span className="text-[11px] text-dpText-tertiary">{info.reviews}条</span>
                    {info.price > 0 && <span className="text-[11px] text-dpText-tertiary">¥{info.price}/人</span>}
                    <span className="text-[11px] ml-auto shrink-0" style={{ color: "#FF9500" }}>{info.open}</span>
                  </div>
                  <div className="flex items-center text-[11px] text-dpText-tertiary mt-1">
                    <span className="truncate">{info.category}  {info.biz}</span>
                    <span className="ml-auto shrink-0">{info.dist}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-0.5 text-[10.5px] px-1 py-px rounded" style={{ background: "#FFF0E5", color: "#E65000" }}>
                      <span className="px-0.5 rounded-sm text-white text-[9px] font-bold" style={{ background: "#FF6F00" }}>榜</span>
                      {info.badge}
                    </span>
                    {info.tags.map((t) => (
                      <span key={t} className="text-[10.5px] px-1 py-px rounded text-dpText-secondary" style={{ background: "#F5F5F5" }}>{t}</span>
                    ))}
                  </div>
                  <div className="text-[12px] text-dpText-secondary mt-1.5 truncate">“{info.quote}”</div>
                  {info.deals.slice(0, 2).map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 mt-1.5 text-[11.5px]">
                      <span className="px-1 rounded-sm text-white text-[10px] font-bold shrink-0" style={{ background: d.type === "秒" ? "#FF3B30" : "#FF6F00" }}>{d.type}</span>
                      <span className="font-semibold" style={{ color: "#FF3B30" }}>¥{d.price}</span>
                      {d.off && <span className="text-[10px] px-0.5 rounded-sm" style={{ color: "#FF3B30", border: "1px solid #FF3B30" }}>{d.off}</span>}
                      <span className="text-dpText-secondary truncate">{d.text}</span>
                    </div>
                  ))}
                </div>
              </button>
              {/* 第 2 个商户后:混排横滑内容行(清单→笔记→笔记 循环) */}
              {idx === 1 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-3 border-b border-[#f7f7f7]">
                  <div className="px-3 text-[15px] font-bold text-dpInk mb-2">“南京西路”相关内容</div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar px-3 pb-1">
                    {mixedRow.map((item, i) =>
                      item.type === "list" ? (
                        <MixListCard key={`l${i}`} list={item.data} onClick={() => navigate(`/album/${item.data.id}`, { state: { src: "public" } })} />
                      ) : (
                        <MixNoteCard key={`n${i}`} note={item.data} />
                      )
                    )}
                  </div>
                </motion.div>
              )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── 相关内容 ── */}
        <div className="px-3 pt-4 pb-2">
          <div className="text-[16px] font-bold text-dpInk mb-2.5">“南京西路”相关内容</div>
          <div className="grid grid-cols-3 gap-1.5">
            {[SH_IMG.fengshengli, SH_IMG.bco, SH_IMG.lighthouse].map((src, i) => (
              <div key={i} className="rounded-lg overflow-hidden bg-[#f0f0f0]" style={{ aspectRatio: "3/4" }}>
                <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 混排行:清单卡(四宫格封面 + 人格化头像) ──
function MixListCard({ list, onClick }) {
  const photos = list.items.map((it) => it.photo).slice(0, 4);
  return (
    <button
      onClick={onClick}
      className="shrink-0 w-[150px] rounded-xl overflow-hidden text-left bg-white"
      style={{ border: "1px solid #FFE0C7" }}
    >
      <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px bg-white">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-[#f0f0f0] overflow-hidden">
              {photos[i % photos.length] && (
                <img src={photos[i % photos.length]} alt="" className="w-full h-full object-cover" loading="lazy" />
              )}
            </div>
          ))}
        </div>
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px] text-white font-medium flex items-center gap-0.5" style={{ background: "rgba(255,111,0,0.9)" }}>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinejoin="round" />
          </svg>
          私藏清单
        </div>
        <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px] text-white" style={{ background: "rgba(0,0,0,0.5)" }}>
          {list.items.length} 家店
        </div>
      </div>
      <div className="px-2 py-2">
        <div className="text-[12px] font-medium text-dpInk leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 32 }}>
          {list.title}
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[10px] text-dpText-tertiary">
          <div className="flex items-center gap-1 min-w-0">
            <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 bg-[#f0f0f0]">
              <img src={list.owner.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="truncate">{list.owner.name}</span>
          </div>
          <span className="shrink-0">🔖 {list.saveCount}</span>
        </div>
      </div>
    </button>
  );
}

// ── 混排行:笔记卡 ──
function MixNoteCard({ note }) {
  return (
    <div className="shrink-0 w-[150px] rounded-xl overflow-hidden bg-white" style={{ border: "1px solid #f0f0f0" }}>
      <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
        <img src={note.img} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px] text-white flex items-center gap-0.5" style={{ background: "rgba(0,0,0,0.5)" }}>
          📍 {note.dist}
        </div>
      </div>
      <div className="px-2 py-2">
        <div className="text-[12px] font-medium text-dpInk leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 32 }}>
          {note.title}
        </div>
        <div className="flex items-center justify-between mt-1.5 text-[10px] text-dpText-tertiary">
          <div className="flex items-center gap-1 min-w-0">
            <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 bg-[#f0f0f0]">
              <img src={noteAvatar(note.author)} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="truncate">{note.author}</span>
          </div>
          <span className="shrink-0">♡ {note.likes}</span>
        </div>
      </div>
    </div>
  );
}
