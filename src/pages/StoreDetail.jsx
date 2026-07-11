import React, { useState, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SaveToListSheet from "../components/SaveToListSheet";
import { getListsContaining, getReasonFor, getMyLists } from "../data/lists";
import { STORE_INFO } from "../data/shanghaiStores";

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
  // 锚点楼层:优惠 / 推荐菜 / 评价 依次排布,点 Tab 滚动到对应楼层
  const [activeTab, setActiveTab] = useState(0);
  const containerRef = useRef(null);
  const dealsRef = useRef(null);
  const dishesRef = useRef(null);
  const reviewsRef = useRef(null);
  const [saveSheetOpen, setSaveSheetOpen] = useState(false);
  const [listTick, setListTick] = useState(0);

  const sectionRefs = [dealsRef, dishesRef, reviewsRef];
  const scrollToSection = (i) => {
    const c = containerRef.current;
    const sec = sectionRefs[i].current;
    if (!c || !sec) return;
    const top = c.scrollTop + sec.getBoundingClientRect().top - c.getBoundingClientRect().top - 44;
    c.scrollTo({ top, behavior: "smooth" });
  };
  const handleScroll = () => {
    const c = containerRef.current;
    if (!c) return;
    const cTop = c.getBoundingClientRect().top + 52;
    let cur = 0;
    sectionRefs.forEach((r, i) => {
      if (r.current && r.current.getBoundingClientRect().top <= cTop) cur = i;
    });
    // 滚到底时最后一个楼层可能到不了顶,直接高亮它
    if (c.scrollTop >= c.scrollHeight - c.clientHeight - 2) cur = sectionRefs.length - 1;
    setActiveTab(cur);
  };

  const poi = state?.poi ?? { name: "门店", city: "未知", district: "", category: "" };
  const caption = state?.caption ?? "";
  const checkin = state?.checkin ?? null;

  // 真实门店档案(上海南京西路商圈,按真实点评截图整理)
  const real = STORE_INFO[poi.name];

  // Collect photos: prefer checkin.photos, fallback to real store photos / state.photo
  const photos = (() => {
    if (checkin?.photos?.length) return checkin.photos;
    if (real?.photos?.length) return real.photos;
    if (state?.photo) return [state.photo];
    return ["https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&q=80"];
  })();

  const gen = genRatings(poi.name);
  const base = real?.rating ?? gen.base;
  const taste = real?.sub?.taste ?? gen.taste;
  const env = real?.sub?.env ?? gen.env;
  const svc = real?.sub?.svc ?? gen.svc;
  const count = real?.reviews ?? gen.count;
  const price = real?.price ?? gen.price;
  const isAttractionLike = ["博物", "展览", "景点", "教堂", "公园", "广场", "山", "建筑"].some(k => poi.category?.includes(k));

  // Hours / address:真实档案优先
  const hours = real?.hours ?? (() => {
    if (poi.category?.includes("咖啡")) return "08:00–22:00";
    if (isAttractionLike) return "09:00–18:00（周一闭馆）";
    if (poi.category?.includes("酒店")) return "全天 24 小时";
    return "11:30–14:30  17:30–22:00";
  })();
  const address = real?.address ?? (poi.district ? `${poi.city}市 ${poi.district}区` : `${poi.city}`);

  // Mock dishes/highlights
  const highlights = isAttractionLike
    ? ["常设展览", "临时特展", "导览服务"]
    : poi.category?.includes("咖啡")
    ? ["拿铁", "美式", "手冲", "招牌蛋糕"]
    : ["招牌 tapas", "今日特推", "本地特色"];

  // 收录本店的公开清单(店页「被收录」模块)
  const includedLists = useMemo(
    () => getListsContaining(poi.name),
    [poi.name, listTick]
  );
  // 我是否已把本店收入某个清单
  const inMyList = useMemo(
    () => getMyLists().some((l) => l.items.some((it) => it.poi?.name === poi.name)),
    [poi.name, listTick]
  );

  const handleCheckin = () => {
    navigate("/camera");
  };

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden">
      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto no-scrollbar pb-24">

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

          {/* 榜单徽章 + 标签(真实档案) */}
          {real?.badge && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded" style={{ background: "#FFF0E5", color: "#E65000" }}>
                <span className="px-0.5 rounded-sm text-white text-[9px] font-bold" style={{ background: "#FF6F00" }}>榜</span>
                {real.badge}
              </span>
              {real.tags?.map((t) => (
                <span key={t} className="text-[10.5px] px-1.5 py-0.5 rounded text-dpText-secondary" style={{ background: "#F5F5F5" }}>{t}</span>
              ))}
            </div>
          )}
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

        {/* ── 锚点 Tab 栏(吸顶,点按跳楼层) ── */}
        <div className="flex border-b border-[#f5f5f5] bg-white sticky top-0 z-10">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => scrollToSection(i)}
              className="flex-1 py-3 text-[14px] font-medium relative"
              style={{ color: activeTab === i ? "#1a1a1a" : "#999", fontWeight: activeTab === i ? 700 : 500 }}
            >
              {tab}
              {i === 2 && <span className="ml-0.5 text-[11px] font-normal">({count})</span>}
              {activeTab === i && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-[#FF6F00]" />
              )}
            </button>
          ))}
        </div>

        {/* ── 内容楼层(依次排布) ── */}
        <div className="px-4 pb-4">
          {/* ══ 楼层一:优惠(神券 + 到店套餐) ══ */}
          <div ref={dealsRef} className="pt-3">
            <div className="flex items-center gap-2 mb-3">
              {["满80减8", "满20减5"].map((t) => (
                <span key={t} className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: "#FFF0F6", color: "#E0359C" }}>
                  <b>神券</b>｜{t}
                </span>
              ))}
              <span className="ml-auto text-[11px] text-dpText-tertiary">全部 ›</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[16px] font-bold text-dpInk">到店套餐</span>
              <span className="text-[10.5px] text-dpText-tertiary">⊙随时退 ⊙过期退</span>
            </div>
            {(real?.deals?.length
              ? real.deals
              : [
                  { type: "惠", price: Math.round(price * 0.78), off: "7.8折", text: "精选双人餐" },
                  { type: "券", price: 50, off: "5折", text: "100元代金券" },
                ]
            ).map((d, i) => (
              <div key={i} className="flex gap-2.5 py-3 border-b border-[#f9f9f9]">
                <div className="w-[66px] h-[66px] rounded-lg overflow-hidden bg-[#f0f0f0] shrink-0">
                  <img src={photos[i % photos.length]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {i === 0 && (
                      <span className="shrink-0 text-[9px] px-1 py-px rounded text-[#B8860B]" style={{ background: "#2c2c2c", color: "#F0D48A" }}>
                        商家推荐
                      </span>
                    )}
                    <span className="text-[14px] font-semibold text-dpInk truncate">{d.text}</span>
                  </div>
                  <div className="text-[11px] text-dpText-tertiary mt-0.5">全周可用｜免预约</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[17px] font-bold" style={{ color: "#FF3B30" }}>¥{d.price}</span>
                    {d.off && (
                      <span className="text-[10px] px-0.5 rounded-sm" style={{ color: "#FF3B30", border: "1px solid #FF3B30" }}>{d.off}</span>
                    )}
                    {d.coupon && (
                      <span className="text-[9.5px] px-1 rounded-sm" style={{ color: "#FF3B30", background: "#FFF0EF" }}>{d.coupon}</span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end justify-center gap-1">
                  <span
                    className="px-3.5 h-8 rounded-full text-white text-[13px] font-medium flex items-center"
                    style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
                  >
                    抢购
                  </span>
                  <span className="text-[10px] text-dpText-tertiary">半年售 {[800, 400, 200, 59][i] ?? 100}+</span>
                </div>
              </div>
            ))}
          </div>

          {/* ══ 楼层二:推荐菜(网友推荐 + 菜单) ══ */}
          <div ref={dishesRef} className="pt-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[16px] font-bold text-dpInk">推荐菜</span>
              <span className="text-[11px] text-dpText-tertiary">查看全部 ›</span>
            </div>
            <div className="text-[13px] text-dpInk mb-2">网友推荐菜 ({count + 12})</div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
              {highlights.map((name, i) => (
                <div key={name} className="shrink-0 w-[110px]">
                  <div className="relative rounded-xl overflow-hidden bg-[#f0f0f0]" style={{ aspectRatio: "1/1" }}>
                    <img src={photos[i % photos.length]} alt="" className="w-full h-full object-cover" loading="lazy" />
                    <div
                      className="absolute bottom-0 left-0 right-0 px-1.5 py-1 text-[10px] text-white"
                      style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.55), transparent)" }}
                    >
                      {[35, 18, 13, 13][i] ?? 8}人推荐
                    </div>
                  </div>
                  <div className="text-[12px] text-dpInk mt-1 truncate">{name}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f9f9f9]">
              <span className="text-[14px] font-semibold text-dpInk">菜单 (3)</span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-7 h-7 rounded overflow-hidden bg-[#f0f0f0]">
                    <img src={photos[i % photos.length]} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══ 楼层三:评价(标签 → 关注的人来过 → 私藏收录 → 评价流) ══ */}
          <div ref={reviewsRef} className="pt-5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[16px] font-bold text-dpInk">
                评价 <span className="text-[12px] font-normal text-dpText-tertiary">({count}) · 4小时前有新增</span>
              </span>
              <span className="text-[11px] text-dpText-tertiary">查看全部 ›</span>
            </div>

            {/* 评价标签 */}
            <div className="flex gap-1.5 flex-wrap mb-3">
              {[`高性价比团购 ${Math.round(count / 6)}`, `${poi.category || "菜品"}出品稳 ${Math.round(count / 4)}`, "氛围感 5", "位置好找 28"].map((t) => (
                <span key={t} className="text-[11.5px] px-2 py-1 rounded-lg" style={{ background: "#FFF6EE", color: "#8a6a4a" }}>
                  {t}
                </span>
              ))}
            </div>

            {/* 关注的人来过(人格化信任信号 ①) */}
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-2" style={{ background: "#FFFAF4" }}>
              <div className="w-6 h-6 rounded-full overflow-hidden bg-[#f0f0f0] shrink-0">
                <img src="https://api.dicebear.com/9.x/notionists/svg?seed=%E6%97%A5%E9%85%B1&backgroundColor=ffdfbf" alt="" className="w-full h-full" />
              </div>
              <span className="flex-1 text-[12.5px] text-dpInk">1 个关注的人来过</span>
              <span className="text-[11.5px] flex items-center gap-0.5" style={{ color: "#B08850" }}>
                去看看
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>

            {/* 被收录模块(人格化信任信号 ②:清单为门店背书) */}
            {includedLists.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF6F00" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[13.5px] font-semibold text-dpInk">被 {includedLists.length} 份私藏收录</span>
                  </div>
                  <span className="text-[10.5px] text-dpText-tertiary">TA们为什么私藏这家</span>
                </div>
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
                  {includedLists.slice(0, 3).map((l) => (
                    <button
                      key={l.id}
                      onClick={() => navigate(`/album/${l.id}`, { state: { src: "public" } })}
                      className="shrink-0 w-[240px] text-left rounded-2xl p-3"
                      style={{ background: "#FFFAF5", border: "1px solid #FFE8D5" }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-[#f0f0f0] shrink-0">
                          <img src={l.owner.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] text-dpText-secondary truncate flex-1">{l.owner.name}</span>
                        <span className="text-[10px] text-dpText-tertiary shrink-0">♡ {l.likeCount}</span>
                      </div>
                      <div className="text-[13px] font-semibold text-dpInk truncate">{l.title}</div>
                      {getReasonFor(l, poi.name) && (
                        <div
                          className="text-[11.5px] text-dpText-secondary mt-1 leading-snug"
                          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                        >
                          “{getReasonFor(l, poi.name)}”
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#f5f5f5] flex items-center gap-3 px-4 pt-3"
        style={{ paddingBottom: 28 }}
      >
        {/* 收入私藏(原收藏按钮升级) */}
        <button
          onClick={() => setSaveSheetOpen(true)}
          className="flex flex-col items-center gap-0.5 min-w-[48px]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={inMyList ? "#FF6F00" : "none"} stroke={inMyList ? "#FF6F00" : "#999"} strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px]" style={{ color: inMyList ? "#FF6F00" : "#999" }}>
            {inMyList ? "已私藏" : "收入私藏"}
          </span>
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

      {/* 收入私藏弹层 */}
      <SaveToListSheet
        open={saveSheetOpen}
        poi={poi}
        photo={photos[0]}
        onClose={() => setSaveSheetOpen(false)}
        onSaved={() => setListTick((t) => t + 1)}
      />
    </div>
  );
}
