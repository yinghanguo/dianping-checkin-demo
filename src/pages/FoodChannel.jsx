import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { STORE_INFO, FOOD_CHANNEL_STORES, SH_IMG, shPoi } from "../data/shanghaiStores";
import { getListsContaining, loadLists } from "../data/lists";

// 美食频道页(对齐真实点评样式)
// 清单植入两处:①「好友私藏」横滑模块 ②结果卡上的"N 位好友私藏"标识
const CATE_TABS = ["美食餐厅", "奶茶咖啡", "西餐", "日式料理", "火锅", "小"];
const CHIPS = ["附近 500m", "营业中", "必吃榜", "好友私藏过", "漂亮饭"];

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

export default function FoodChannel() {
  const navigate = useNavigate();
  const [chipActive, setChipActive] = useState(null);

  // 上海的公开好友清单(好友私藏模块)
  const friendLists = useMemo(
    () =>
      loadLists().filter(
        (l) =>
          l.visibility === "public" &&
          l.owner?.id !== "me" &&
          l.items.some((it) => it.poi?.city === "上海")
      ),
    []
  );

  const stores = useMemo(() => {
    const all = FOOD_CHANNEL_STORES;
    if (chipActive !== "好友私藏过") return all;
    return all.filter((name) => getListsContaining(name).length > 0);
  }, [chipActive]);

  const openStore = (name) => {
    const info = STORE_INFO[name];
    navigate("/store", { state: { poi: shPoi(name), photo: info?.photos?.[0] } });
  };

  return (
    <div className="absolute inset-0 bg-[#F7F7F7] flex flex-col">
      {/* ── 头部 ── */}
      <div className="bg-white shrink-0 px-3 pt-3 pb-1 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="shrink-0 w-7 h-7 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-[22px] font-black text-dpInk">美食</span>
        <span className="flex items-center gap-0.5 text-[13px] text-dpInk">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          新福康里 ▾
        </span>
        <button className="ml-auto shrink-0 flex flex-col items-center">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <span className="text-[9px] text-dpInk mt-px">地图</span>
        </button>
      </div>

      {/* ── 搜索条 ── */}
      <div className="bg-white shrink-0 px-3 py-2">
        <button
          onClick={() => navigate("/search")}
          className="w-full h-10 rounded-full flex items-center pl-4 pr-1.5 gap-2"
          style={{ border: "1.5px solid #FF6F00" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20L17 17" strokeLinecap="round" />
          </svg>
          <span className="flex-1 text-left text-[13px] text-dpText-tertiary">南京西路地铁站</span>
          <span className="h-7 px-4 rounded-full text-white text-[13px] font-medium flex items-center" style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}>
            搜索
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        {/* ── 图标行 ── */}
        <div className="bg-white px-3 pb-3 flex items-start justify-between">
          {[
            { icon: "🏆", label: "美食排行" },
            { icon: "🐰", label: "美团外卖" },
            { icon: "🥇", label: "必吃榜" },
            { icon: "🎫", label: "VIP专享价" },
            { icon: "🧧", label: "领神券", corner: "35元" },
            { icon: "🍽", label: "聚餐" },
          ].map((f) => (
            <button key={f.label} className="flex flex-col items-center gap-1 relative" style={{ width: 56 }}>
              <div className="text-[26px] leading-none relative">
                {f.icon}
                {f.corner && (
                  <span className="absolute -top-1.5 -right-4 text-[8px] px-1 rounded-full text-white font-bold" style={{ background: "#FF3B30" }}>
                    {f.corner}
                  </span>
                )}
              </div>
              <span className="text-[10.5px] text-dpInk whitespace-nowrap">{f.label}</span>
            </button>
          ))}
        </div>

        {/* ── 双卡:美食排行 / 特价团(对齐图3,点进 /food-rank 与 /special-deals) ── */}
        <div className="px-2.5 pt-2 grid grid-cols-2 gap-2">
          <button onClick={() => navigate("/food-rank")} className="rounded-2xl p-2.5 text-left bg-white" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-[16px] font-black text-dpInk">美食排行</span>
              <span className="text-[15px] font-black" style={{ color: "#FF6F00" }}>↑</span>
              <span className="text-[11px] text-dpText-tertiary">真实评价</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-white shrink-0">
                <img src="https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=200&q=70" alt="" className="w-full h-full object-cover" />
                <span className="absolute top-0 left-0 text-[7px] px-0.5 rounded-br text-white font-bold" style={{ background: "#FF6F00" }}>必吃榜</span>
              </div>
              <div className="min-w-0">
                <div className="text-[12.5px] font-semibold text-dpInk truncate">鲜主·牛肉海鲜·排档</div>
                <div className="text-[10.5px] mt-0.5" style={{ color: "#C8541A" }}>2026年上榜 · 1.5km</div>
              </div>
            </div>
          </button>
          <button onClick={() => navigate("/special-deals")} className="rounded-2xl p-2.5 text-left bg-white" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-[16px] font-black text-dpInk">特价团</span>
              <span className="text-[15px] font-black" style={{ color: "#FF2D6B" }}>↑</span>
              <span className="text-[11px] text-dpText-tertiary">天天低价</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-11 h-11 rounded-lg overflow-hidden bg-white shrink-0">
                <img src={SH_IMG.soso} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="text-[12.5px] font-semibold text-dpInk truncate">AMAM LONBAKER</div>
                <div className="text-[11px] mt-0.5"><span className="font-black" style={{ color: "#FF2D6B" }}>¥9.9</span> <span className="text-[9.5px] px-1 rounded" style={{ background: "#FFE4EC", color: "#FF2D6B" }}>爆卖1万+</span></div>
              </div>
            </div>
          </button>
        </div>

        {/* ── 神券横幅 ── */}
        <div className="mx-2.5 mt-2 rounded-xl px-3 py-2 flex items-center gap-2" style={{ background: "#FFF1E8" }}>
          <span className="px-1 rounded-sm text-white text-[10px] font-bold" style={{ background: "#FF3B30" }}>神券</span>
          <span className="flex-1 text-[11.5px] truncate" style={{ color: "#C8541A" }}>满300减29堂食膨胀神券待使用 <span className="opacity-70">仅剩15:33:22</span></span>
          <span className="px-2.5 h-6 rounded-full text-white text-[11px] font-medium flex items-center shrink-0" style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}>去使用</span>
        </div>

        {/* 好友私藏模块已下移为门店列表第 2 家后的插片(见下方 stores.map) */}

        {/* ── 分类 Tab + 筛选 chips ── */}
        <div className="bg-white mt-2.5 rounded-t-2xl">
          <div className="px-3.5 pt-3 flex gap-5 border-b border-[#f5f5f5] overflow-x-auto no-scrollbar">
            {CATE_TABS.map((t, i) => (
              <button key={t} className="pb-2 relative shrink-0">
                <span className={`text-[14px] ${i === 0 ? "text-dpInk font-bold" : "text-dpText-secondary"}`}>{t}</span>
                {i === 0 && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-dpOrange" />}
              </button>
            ))}
          </div>
          <div className="px-3.5 py-2.5 flex gap-2 overflow-x-auto no-scrollbar">
            {CHIPS.map((c) => {
              const active = chipActive === c;
              const isList = c === "好友私藏过";
              return (
                <button
                  key={c}
                  onClick={() => setChipActive(active ? null : c)}
                  className="shrink-0 px-2.5 h-7 rounded-lg text-[12px] flex items-center gap-1"
                  style={
                    active
                      ? { background: "#FFF0E5", color: "#E65000", border: "1px solid #FFB380" }
                      : { background: "#F5F5F5", color: "#555" }
                  }
                >
                  {isList && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinejoin="round" />
                    </svg>
                  )}
                  {c}
                </button>
              );
            })}
          </div>

          {/* ── 门店列表(清单植入 ②:好友私藏标识;第 2 家后插「好友私藏」插片) ── */}
          {stores.map((name, storeIdx) => {
            const info = STORE_INFO[name];
            const inLists = getListsContaining(name);
            return (
              <React.Fragment key={name}>
              <button
                onClick={() => openStore(name)}
                className="w-full px-3.5 py-3.5 flex gap-3 text-left border-b border-[#f7f7f7]"
              >
                <div className="w-[92px] h-[92px] rounded-xl overflow-hidden bg-[#f0f0f0] shrink-0 relative">
                  <img src={info.photos[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                  {info.tags.includes("新店开业") && (
                    <div className="absolute bottom-0 left-0 right-0 text-center text-[9px] text-white py-0.5" style={{ background: "rgba(0,0,0,0.55)" }}>
                      新店开业
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[16px] font-bold text-dpInk truncate">{name}</div>
                  <div className="flex items-center gap-1.5 mt-1">
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
                    {info.tags.filter((t) => t !== "新店开业").map((t) => (
                      <span key={t} className="text-[10.5px] px-1 py-px rounded text-dpText-secondary" style={{ background: "#F5F5F5" }}>{t}</span>
                    ))}
                  </div>
                  {/* 好友私藏标识 */}
                  {inLists.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="flex -space-x-1.5">
                        {inLists.slice(0, 3).map((l, i) => (
                          <div key={l.id} className="w-4 h-4 rounded-full overflow-hidden bg-[#f5f5f5] border border-white" style={{ zIndex: 3 - i }}>
                            <img src={l.owner.avatar} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10.5px]" style={{ color: "#E65000" }}>
                        被 {inLists.length} 份私藏收录 · “{inLists[0].items.find((it) => it.poi?.name === name)?.reason?.slice(0, 18)}…”
                      </span>
                    </div>
                  )}
                  {info.deals.slice(0, 2).map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 mt-1.5 text-[11.5px]">
                      {d.coupon && <span className="text-[9.5px] px-1 rounded-sm shrink-0" style={{ color: "#FF3B30", background: "#FFF0EF" }}>{d.coupon}</span>}
                      <span className="px-1 rounded-sm text-white text-[10px] font-bold shrink-0" style={{ background: d.type === "秒" ? "#FF3B30" : "#FF6F00" }}>{d.type}</span>
                      <span className="font-semibold" style={{ color: "#FF3B30" }}>¥{d.price}</span>
                      {d.off && <span className="text-[10px] px-0.5 rounded-sm" style={{ color: "#FF3B30", border: "1px solid #FF3B30" }}>{d.off}</span>}
                      <span className="text-dpText-secondary truncate">{d.text}</span>
                    </div>
                  ))}
                </div>
              </button>
              {/* 第 2 家门店后插「好友私藏」插片 */}
              {storeIdx === 1 && <FriendListsInsert friendLists={friendLists} navigate={navigate} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── 好友私藏插片(嵌在门店列表第 2 家之后) ──
function FriendListsInsert({ friendLists, navigate }) {
  if (!friendLists.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b-8 border-[#f5f5f5] py-3"
      style={{ background: "linear-gradient(180deg,#FFFAF3,#ffffff)" }}
    >
      <div className="px-3.5 flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF6F00" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinejoin="round" />
          </svg>
          <span className="text-[15px] font-bold text-dpInk">好友私藏</span>
          <span className="text-[10.5px] text-dpText-tertiary">{friendLists.length} 位好友公开了附近的私藏</span>
        </div>
        <button className="text-[11px] text-dpText-tertiary flex items-center gap-0.5">
          全部
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar px-2.5 pb-1">
        {friendLists.map((l) => (
          <button
            key={l.id}
            onClick={() => navigate(`/album/${l.id}`, { state: { src: "public" } })}
            className="shrink-0 w-[168px] bg-white rounded-2xl overflow-hidden text-left"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
          >
            <div className="relative w-full bg-[#f0f0f0]" style={{ aspectRatio: "16/10" }}>
              <img src={l.cover} alt="" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
                <div className="w-4 h-4 rounded-full overflow-hidden bg-white">
                  <img src={l.owner.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] text-white max-w-[80px] truncate">{l.owner.name}</span>
              </div>
            </div>
            <div className="px-2.5 py-2">
              <div className="text-[12px] font-medium text-dpInk leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {l.title}
              </div>
              <div className="text-[10px] text-dpText-tertiary mt-1">
                {l.items.length} 家店 · 藏 {l.saveCount}
              </div>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
