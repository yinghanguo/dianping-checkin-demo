import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// Deterministic pseudo-random from string seed
function seededNum(str, min, max, offset = 0) {
  let h = offset * 31;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return min + (Math.abs(h) % ((max - min) * 10)) / 10;
}

function genRatings(name) {
  const base = seededNum(name, 40, 48, 0) / 10;
  const taste = Math.round((seededNum(name, 38, 50, 1) / 10) * 10) / 10;
  const env = Math.round((seededNum(name, 38, 50, 2) / 10) * 10) / 10;
  const svc = Math.round((seededNum(name, 38, 50, 3) / 10) * 10) / 10;
  const count = 8 + (Math.abs(seededNum(name, 0, 90, 4) | 0));
  const price = 40 + (Math.abs(seededNum(name, 0, 400, 5) | 0));
  return { base: Math.round(base * 10) / 10, taste, env, svc, count, price };
}

// Price category label
function priceLabel(category) {
  if (!category) return "¥¥";
  if (category.includes("酒店")) return "¥¥¥¥";
  if (category.includes("西班牙") || category.includes("西餐")) return "¥¥¥";
  if (category.includes("咖啡")) return "¥¥";
  if (category.includes("博物") || category.includes("展览") || category.includes("景点") || category.includes("教堂") || category.includes("公园")) return "门票";
  return "¥¥";
}

// Star SVG
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(1, Math.max(0, rating - (i - 1)));
        return (
          <div key={i} className="relative w-3 h-3">
            <svg viewBox="0 0 12 12" className="absolute inset-0">
              <path d="M6 0.5l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8l-3 1.6.6-3.3L1.2 4l3.3-.5z" fill="#e0e0e0" />
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

// Photo carousel
function PhotoCarousel({ photos }) {
  const [idx, setIdx] = useState(0);
  const startX = useRef(null);

  const onPointerDown = (e) => { startX.current = e.clientX; };
  const onPointerUp = (e) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    if (dx < -40 && idx < photos.length - 1) setIdx(idx + 1);
    if (dx > 40 && idx > 0) setIdx(idx - 1);
    startX.current = null;
  };

  return (
    <div
      className="relative w-full select-none overflow-hidden"
      style={{ height: 260 }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ width: `${photos.length * 100}%`, transform: `translateX(-${(idx / photos.length) * 100}%)` }}
      >
        {photos.map((src, i) => (
          <div key={i} className="h-full bg-[#f0f0f0]" style={{ width: `${100 / photos.length}%` }}>
            <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
          </div>
        ))}
      </div>

      {/* Photo count badge */}
      {photos.length > 1 && (
        <div
          className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-white text-[11px]"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          {idx + 1}/{photos.length}
        </div>
      )}

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {photos.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{ width: i === idx ? 14 : 5, height: 5, background: i === idx ? "white" : "rgba(255,255,255,0.55)" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const TABS = ["优惠", "推荐菜", "评价"];

export default function StoreDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [activeTab, setActiveTab] = useState(2); // default: 评价
  const [saved, setSaved] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const poi = state?.poi ?? { name: "门店", city: "未知", district: "", category: "" };
  const caption = state?.caption ?? "";
  const checkin = state?.checkin ?? null;

  // Collect photos: prefer checkin.photos, fallback to state.photo
  const photos = (() => {
    if (checkin?.photos?.length) return checkin.photos;
    if (state?.photo) return [state.photo];
    return ["https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&q=80"];
  })();

  const { base, taste, env, svc, count, price } = genRatings(poi.name);
  const isAttractionLike = ["博物", "展览", "景点", "教堂", "公园", "广场", "山", "建筑"].some(k => poi.category?.includes(k));

  // Mock hours
  const hours = (() => {
    if (poi.category?.includes("咖啡")) return "08:00–22:00";
    if (isAttractionLike) return "09:00–18:00（周一闭馆）";
    if (poi.category?.includes("酒店")) return "全天 24 小时";
    return "11:30–14:30  17:30–22:00";
  })();

  // Mock address
  const address = poi.district ? `${poi.city}市 ${poi.district}区` : `${poi.city}`;

  // Mock dishes/highlights
  const highlights = isAttractionLike
    ? ["常设展览", "临时特展", "导览服务"]
    : poi.category?.includes("咖啡")
    ? ["拿铁", "美式", "手冲", "招牌蛋糕"]
    : ["招牌 tapas", "今日特推", "本地特色"];

  const handleSave = () => {
    setSaved((v) => !v);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1800);
  };

  const handleCheckin = () => {
    navigate("/camera");
  };

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">

        {/* ── Photo Carousel ── */}
        <div className="relative">
          <PhotoCarousel photos={photos} />
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center z-10"
            style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(8px)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Store info ── */}
        <div className="px-4 pt-4 pb-3 border-b border-[#f5f5f5]">
          {/* Name */}
          <div className="text-[20px] font-bold text-dpInk leading-tight">{poi.name}</div>

          {/* Rating row */}
          <div className="flex items-center gap-2 mt-2">
            <Stars rating={base} />
            <span className="text-[15px] font-bold text-[#FF6F00]">{base.toFixed(1)}</span>
            <span className="text-[12px] text-dpText-tertiary">{count}条评价</span>
            {!isAttractionLike && (
              <>
                <span className="text-[#e0e0e0]">·</span>
                <span className="text-[12px] text-dpText-tertiary">¥{price}/人</span>
              </>
            )}
          </div>

          {/* Sub-ratings */}
          {!isAttractionLike && (
            <div className="flex items-center gap-4 mt-2.5">
              {[["口味", taste], ["环境", env], ["服务", svc]].map(([label, val]) => (
                <div key={label} className="flex items-center gap-1">
                  <span className="text-[11px] text-dpText-tertiary">{label}</span>
                  <span className="text-[11px] text-[#FF6F00] font-medium">{val.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Category + district */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <span
              className="text-[11px] px-2 py-0.5 rounded-full"
              style={{ background: "#FFF3E8", color: "#FF6F00" }}
            >
              {poi.category || "更多美食"}
            </span>
            {poi.district && (
              <span className="text-[11px] text-dpText-tertiary">{poi.city} · {poi.district}</span>
            )}
            {!poi.district && (
              <span className="text-[11px] text-dpText-tertiary">{poi.city}</span>
            )}
          </div>
        </div>

        {/* ── Info rows ── */}
        <div className="px-4 py-3 border-b border-[#f5f5f5] space-y-3">
          {/* Hours */}
          <div className="flex items-start gap-3">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
            <div>
              <span className="text-[13px] text-dpInk">{hours}</span>
              <span className="ml-2 text-[11px] text-[#4CAF50] font-medium">营业中</span>
            </div>
          </div>
          {/* Address */}
          <div className="flex items-start gap-3">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" className="mt-0.5 shrink-0">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            <span className="text-[13px] text-dpText-secondary leading-snug">{address}</span>
          </div>
          {/* Phone */}
          <div className="flex items-center gap-3">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" className="shrink-0">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .91h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[13px] text-dpText-secondary">点击查看电话</span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-[#f5f5f5] bg-white sticky top-0 z-10">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className="flex-1 py-3 text-[13px] font-medium relative"
              style={{ color: activeTab === i ? "#FF6F00" : "#999" }}
            >
              {tab}
              {i === 2 && <span className="ml-0.5 text-[11px]">({count})</span>}
              {activeTab === i && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#FF6F00]" />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="px-4 pt-4 pb-4">
          {/* 优惠 */}
          {activeTab === 0 && (
            <div className="text-center py-10 text-dpText-tertiary text-[13px]">暂无优惠活动</div>
          )}

          {/* 推荐菜 */}
          {activeTab === 1 && (
            <div className="space-y-3">
              {highlights.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#f9f9f9]">
                  <span className="text-[14px] text-dpInk">{item}</span>
                  <span className="text-[12px] text-dpText-tertiary">热门推荐</span>
                </div>
              ))}
            </div>
          )}

          {/* 评价 */}
          {activeTab === 2 && (
            <div className="space-y-5">
              {/* User's own check-in review */}
              {(caption || checkin?.text) && (
                <div className="bg-[#FFFAF5] rounded-2xl p-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
                      style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
                    >
                      N
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-dpInk">Niki</div>
                      <div className="text-[11px] text-dpText-tertiary flex items-center gap-1">
                        <Stars rating={base} />
                        <span className="ml-1">{base.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="ml-auto text-[11px] text-dpText-tertiary">已打卡</div>
                  </div>
                  {/* Photos */}
                  {checkin?.photos?.length > 0 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
                      {checkin.photos.slice(0, 4).map((p, i) => (
                        <div key={i} className="w-[80px] h-[80px] shrink-0 rounded-xl overflow-hidden bg-[#f0f0f0]">
                          <img src={p} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Text */}
                  <p className="text-[13px] text-dpInk leading-relaxed">
                    {caption || checkin?.text || "去过这里，体验不错～"}
                  </p>
                </div>
              )}

              {/* Placeholder reviews */}
              {[
                { name: "Explorer_L", text: "强烈推荐！环境很好，服务也很周到，下次还会来。", rating: 4.5 },
                { name: "美食家_K", text: "性价比超高，当地人都爱来的地方，比游客区便宜很多。", rating: 4.8 },
                { name: "旅行达人", text: "很有特色的地方，拍照很好看，值得专门去一趟。", rating: 4.3 },
              ].map((r, i) => (
                <div key={i} className="border-b border-[#f5f5f5] pb-4">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                      style={{ background: `hsl(${(i * 80 + 200) % 360}, 60%, 55%)` }}
                    >
                      {r.name[0]}
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-dpInk">{r.name}</div>
                      <div className="flex items-center gap-1">
                        <Stars rating={r.rating} />
                        <span className="text-[10px] text-dpText-tertiary ml-1">{r.rating}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[13px] text-dpText-secondary leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#f5f5f5] flex items-center gap-3 px-4 pt-3"
        style={{ paddingBottom: 28 }}
      >
        {/* 收藏 */}
        <button
          onClick={handleSave}
          className="flex flex-col items-center gap-0.5 min-w-[48px]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? "#FF6F00" : "none"} stroke={saved ? "#FF6F00" : "#999"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px]" style={{ color: saved ? "#FF6F00" : "#999" }}>收藏</span>
        </button>

        {/* 打卡 button */}
        <button
          onClick={handleCheckin}
          className="flex-1 h-10 rounded-full text-white text-[14px] font-medium flex items-center justify-center gap-1.5"
          style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)", boxShadow: "0 4px 14px rgba(255,111,0,0.3)" }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          打卡
        </button>

        {/* 写评价 */}
        <button
          onClick={() => navigate("/camera")}
          className="flex flex-col items-center gap-0.5 min-w-[48px]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] text-[#999]">写评价</span>
        </button>
      </div>

      {/* Save toast */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-full text-white text-[13px]"
            style={{ background: "rgba(0,0,0,0.72)" }}
          >
            {saved ? "已收藏 ❤️" : "已取消收藏"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
