import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import { usePhoto, FALLBACK_PHOTO } from "../contexts/PhotoContext";
import { useLocation } from "../contexts/LocationContext";
import { FRIENDS } from "../data/friends";
import { MY_CHECKINS } from "../data/myCheckins";
import {
  addUserCheckin,
  getUserCheckins,
  getMergedCheckins,
  removeCheckin,
  setCheckinVisibility,
} from "../utils/userCheckins";
import CheckinTimelineItem from "../components/CheckinTimelineItem";
import SaveToListSheet from "../components/SaveToListSheet";

const WEEKDAY_CN = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

// 拍立得里的横向滑动相册:scroll-snap + 圆点指示器
function PhotoSwiper({ photos }) {
  const scrollerRef = useRef(null);
  const [active, setActive] = useState(0);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== active) setActive(idx);
  };

  return (
    <div className="absolute inset-0">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-x-auto no-scrollbar flex snap-x snap-mandatory"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {photos.map((p, i) => (
          <div
            key={i}
            className="w-full h-full shrink-0 snap-center"
            style={{ scrollSnapAlign: "center" }}
          >
            <img src={p} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      {/* 圆点指示器 */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 px-2 py-1 rounded-full bg-black/35 backdrop-blur-sm">
        {photos.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i === active ? 14 : 5,
              height: 5,
              background: i === active ? "white" : "rgba(255,255,255,0.55)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// 统计 baseline + 用户新增的合计
function countThisYear(records, year) {
  return records.filter((c) => new Date(c.timestamp).getFullYear() === year).length;
}
function countThisMonth(records, year, month) {
  return records.filter((c) => {
    const d = new Date(c.timestamp);
    return d.getFullYear() === year && d.getMonth() + 1 === month;
  }).length;
}

// 打卡成功页(情感爆发)
// - 顶部:可见性指示(联动发布页 visibility) + 分享 + 完成
// - 中部:庆祝文案 + YTD 数据 + 拍立得照片
// - 底部模块:个人月度榜单 + 朋友圈热门打卡地

// 可见性配置(与发布页一致)
const VISIBILITY_CONFIG = {
  public: {
    label: "公开",
    icon: (color) => (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" strokeLinecap="round" />
      </svg>
    ),
  },
  friends: {
    label: "仅好友",
    icon: (color) => (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0112 0" strokeLinecap="round" />
        <circle cx="17" cy="9" r="2" />
        <path d="M14 20a4 4 0 017 0" strokeLinecap="round" />
      </svg>
    ),
  },
  private: {
    label: "仅自己",
    icon: (color) => (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" />
      </svg>
    ),
  },
};

// 朋友圈热门打卡地 mock
const FRIEND_HOT_SPOTS = [
  {
    id: "h1",
    name: "Bar Cuba",
    category: "Tapas Bar",
    emoji: "🍺",
    bg: "linear-gradient(135deg, #FFE0E0, #FFD0D0)",
    friendIds: ["f5", "f6", "f11"],
    note: "本月 12 位好友打卡",
  },
  {
    id: "h2",
    name: "Mercado de Santa Catalina",
    category: "Local Market",
    emoji: "🛍️",
    bg: "linear-gradient(135deg, #FFE8B8, #FFDA80)",
    friendIds: ["f12", "f9"],
    note: "@Vivi 上周来过",
  },
  {
    id: "h3",
    name: "Catedral de Palma",
    category: "Cathedral",
    emoji: "⛪",
    bg: "linear-gradient(135deg, #D8E8FF, #B8D5FF)",
    friendIds: ["f6", "f12", "f7", "f11"],
    note: "@日酱 等 4 位好友打过卡",
  },
  {
    id: "h4",
    name: "Parc de la Mar",
    category: "Park · Seaside",
    emoji: "🌳",
    bg: "linear-gradient(135deg, #D8F0D0, #B0E0A0)",
    friendIds: ["f9", "f3"],
    note: "@小七 推荐过这里",
  },
  {
    id: "h5",
    name: "Café Antiquari",
    category: "Café",
    emoji: "☕",
    bg: "linear-gradient(135deg, #F0E0D0, #E0C8A0)",
    friendIds: ["f5", "f12", "f11"],
    note: "@Zoe @Vivi 都来过",
  },
];

export default function Success() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isQuick = params.get("quick") === "true";
  const { photos, firstPhoto, visibility, taggedFriends, resetSession, setVisibility } = usePhoto();

  // 收入私藏弹层
  const [saveListOpen, setSaveListOpen] = useState(false);
  // 半浮层:我的打卡列表
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTick, setSheetTick] = useState(0);
  const sheetCheckins = useMemo(
    () => (sheetOpen ? getMergedCheckins(MY_CHECKINS) : []),
    [sheetOpen, sheetTick]
  );
  const handleSheetDelete = (id) => {
    const target = sheetCheckins.find((c) => c.id === id);
    removeCheckin(id, { isUserCreated: !!target?.isUserCreated });
    setSheetTick((t) => t + 1);
    setStatsTick((t) => t + 1); // 让顶部「今年打卡」数字同步
  };
  const handleSheetVisibility = (id, v) => {
    const target = sheetCheckins.find((c) => c.id === id);
    setCheckinVisibility(id, v, { isUserCreated: !!target?.isUserCreated });
    setSheetTick((t) => t + 1);
  };
  const { primaryPOI, shortAddress, coords, setUserSelectedPOI, setPoiSkipped } = useLocation();

  // 当前真实日期
  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const dateLabel = `${String(month).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
  const weekday = WEEKDAY_CN[now.getDay()];

  // 落库:进入 Success 页 = 提交成功,把这次打卡持久化到 mock 后端。
  // 只在首次 mount 写入一次(防 StrictMode / 重渲染重复写)。
  const savedRef = useRef(false);
  const [savedId, setSavedId] = useState(null);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    const record = addUserCheckin({
      poi: primaryPOI,
      coords,
      shortAddress,
      photos,
      visibility,
      taggedFriends,
    });
    setSavedId(record?.id || null);
    // 触发统计重算
    setStatsTick((t) => t + 1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 顶部可见性切换 popover
  const [visMenuOpen, setVisMenuOpen] = useState(false);
  const handleChangeOwnVisibility = (next) => {
    setVisibility(next);
    if (savedId) {
      setCheckinVisibility(savedId, next, { isUserCreated: true });
    }
    setVisMenuOpen(false);
  };

  // 统计:baseline (MY_CHECKINS) + 用户实时打卡 (userCheckins)
  const [statsTick, setStatsTick] = useState(0);
  const { yearCount, monthCount } = useMemo(() => {
    const userList = getUserCheckins();
    const all = [...MY_CHECKINS, ...userList];
    return {
      yearCount: countThisYear(all, year),
      monthCount: countThisMonth(all, year, month),
    };
  }, [statsTick, year, month]);

  // 动画:数字 +1 跳动(显示落库后的数字时,从前一个值滚到当前)
  const [displayCount, setDisplayCount] = useState(() => Math.max(0, yearCount - 1));
  useEffect(() => {
    setDisplayCount(Math.max(0, yearCount - 1));
    const t = setTimeout(() => setDisplayCount(yearCount), 600);
    return () => clearTimeout(t);
  }, [yearCount]);
  const count = displayCount;

  // 完成 → 重置 session 回首页
  const handleDone = () => {
    resetSession();
    setUserSelectedPOI(null);
    setPoiSkipped(false);
    navigate("/");
  };

  const visConfig = VISIBILITY_CONFIG[visibility] || VISIBILITY_CONFIG.public;

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        background:
          "linear-gradient(180deg, #DFF5C5 0%, #E8F5D8 35%, #FAFAF7 70%)",
      }}
    >

      {/* 地图肌理 */}
      <svg
        className="absolute top-0 left-0 right-0"
        height="320"
        width="100%"
        viewBox="0 0 400 320"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.18 }}
      >
        <defs>
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.6" fill="#5a8e2c" />
          </pattern>
        </defs>
        <rect width="400" height="320" fill="url(#dots)" />
        <path
          d="M-20 80 Q120 60, 200 110 T420 90"
          stroke="#7BC142"
          strokeWidth="1.5"
          fill="none"
          opacity="0.4"
          strokeDasharray="3,4"
        />
        <path
          d="M-20 200 Q100 240, 220 200 T420 220"
          stroke="#7BC142"
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
          strokeDasharray="3,4"
        />
      </svg>

      {/* 顶部栏:可见性 + 分享 + 完成 */}
      <div className="relative z-20 px-4 py-3 flex items-center justify-end gap-2">
        <div className="relative">
          <button
            onClick={() => setVisMenuOpen((o) => !o)}
            className="px-3 h-8 rounded-full bg-white/70 backdrop-blur-md flex items-center gap-1 text-[12px] text-dpInk"
          >
            {visConfig.icon("currentColor")}
            {visConfig.label}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-0.5 opacity-60">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <AnimatePresence>
            {visMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setVisMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 top-9 z-40 w-40 bg-white rounded-2xl py-1.5 shadow-lg origin-top-right"
                  style={{ boxShadow: "0 8px 28px rgba(0,0,0,0.12)" }}
                >
                  {Object.entries(VISIBILITY_CONFIG).map(([key, conf]) => {
                    const active = visibility === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleChangeOwnVisibility(key)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[13px] ${
                          active ? "text-dpOrange-deep" : "text-dpInk"
                        }`}
                      >
                        <span className="shrink-0">
                          {conf.icon(active ? "#cc5500" : "#666")}
                        </span>
                        <span className="flex-1 truncate">{conf.label}</span>
                        {active && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF6F00" strokeWidth="3">
                            <path d="M5 12l5 5 9-9" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <button className="px-3 h-8 rounded-full bg-white/70 backdrop-blur-md flex items-center gap-1 text-[12px] text-dpInk">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          分享
        </button>
        <button
          onClick={handleDone}
          className="px-4 h-8 rounded-full bg-dpInk text-white text-[12px] font-medium"
        >
          完成
        </button>
      </div>

      {/* 主内容滚动 */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* 顶部条:打卡成功 badge + POI 标签 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 px-5 pt-2 pb-4 flex items-center justify-between gap-3"
        >
          <div className="inline-flex items-center px-2 py-1 bg-dpGreen-light rounded text-[11px] font-bold text-[#3a6b1a]">
            打卡成功 ✨
          </div>

          {/* POI 标签(只在已确认时显示,展示性,不可点击) */}
          {primaryPOI && (
            <motion.div
              initial={{ scale: 0, rotate: -6 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-full pl-1.5 pr-2.5 py-1 shadow-sm max-w-[180px]"
            >
              <span className="text-[13px] leading-none shrink-0">📍</span>
              <span className="text-[12px] font-medium text-dpInk truncate">
                {primaryPOI.name}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* 拍立得照片(仅当有照片时显示) */}
        {photos.length > 0 && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative z-10 px-5"
        >
          <div
            className="bg-white rounded-2xl mx-auto relative"
            style={{
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              padding: "12px 12px 56px",
            }}
          >
            {/* 图片区:多张时支持横向滑动 + 分页指示 */}
            <div
              className="w-full overflow-hidden rounded-lg bg-[#f0f0f0] relative"
              style={{ aspectRatio: "4/5" }}
            >
              {photos.length === 1 ? (
                <img
                  src={firstPhoto || FALLBACK_PHOTO}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <PhotoSwiper photos={photos} />
              )}
            </div>
            {/* 底部信息:日期 左 / 创作者 右 */}
            <div className="absolute bottom-4 left-5 right-5 flex items-baseline justify-between">
              <div className="flex items-baseline">
                <span
                  className="text-[26px] font-black text-dpInk leading-none italic"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {dateLabel}
                </span>
                <span className="text-[11px] text-dpText-secondary ml-1">{weekday}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-dpText-tertiary">@Niki</span>
                <span className="px-1 py-px bg-dpOrange/10 text-dpOrange-deep rounded text-[9px] font-bold">
                  Lv8
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {/* 今年打卡数(图片下方,信息陈述而非情绪爆点) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="relative z-10 px-5 mt-4 flex items-center justify-center gap-1.5 text-[12.5px] text-[#5a8e2c]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#5a8e2c">
            <path d="M12 2L4 6v6c0 5 3.5 9.7 8 10 4.5-.3 8-5 8-10V6l-8-4z" opacity="0.85" />
          </svg>
          <span>今年已打卡</span>
          <motion.span
            key={count}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            className="px-2 py-0.5 rounded-full text-[13px] font-bold text-[#3a6b1a] bg-white/70 backdrop-blur-sm"
            style={{ border: "1px solid rgba(123, 193, 66, 0.35)" }}
          >
            {count}
          </motion.span>
          <span>个地点</span>
        </motion.div>

        {/* 同行好友标记(@) - 紧贴拍立得 */}
        {taggedFriends.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="relative z-10 px-5 mt-3 flex justify-center"
          >
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-full px-3 py-1.5">
              {/* 头像堆叠 */}
              <div className="flex -space-x-1.5">
                {taggedFriends
                  .map((id) => FRIENDS.find((f) => f.id === id))
                  .filter(Boolean)
                  .slice(0, 4)
                  .map((f, i, arr) => (
                    <div
                      key={f.id}
                      className="w-5 h-5 rounded-full overflow-hidden bg-[#f5f5f5] border-2 border-white"
                      style={{ zIndex: arr.length - i }}
                    >
                      <img src={f.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
              </div>
              {/* @ 名字 */}
              <div className="text-[11px] text-dpInk">
                <span className="text-dpOrange-deep font-medium">与 </span>
                {(() => {
                  const objs = taggedFriends
                    .map((id) => FRIENDS.find((f) => f.id === id))
                    .filter(Boolean);
                  if (objs.length === 0) return null;
                  if (objs.length === 1) {
                    return <span className="font-medium">@{objs[0].name}</span>;
                  }
                  if (objs.length === 2) {
                    return (
                      <>
                        <span className="font-medium">@{objs[0].name}</span>
                        <span> </span>
                        <span className="font-medium">@{objs[1].name}</span>
                      </>
                    );
                  }
                  return (
                    <>
                      <span className="font-medium">@{objs[0].name}</span>
                      <span className="text-dpText-tertiary"> 等 {objs.length} 人</span>
                    </>
                  );
                })()}
                <span className="text-dpOrange-deep"> 同行</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── 个人月度榜单(保留) ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="relative z-10 px-5 mt-6"
        >
          <button
            onClick={() => setSheetOpen(true)}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 ripple"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <div
              className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-2xl"
              style={{ background: "linear-gradient(135deg, #FFF6E5, #FFEAD0)" }}
            >
              🏆
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-[14px] font-medium text-dpInk">
                你的 {month} 月打卡已更新
              </div>
              <div className="text-[12px] text-dpText-tertiary mt-0.5 truncate">
                本月已打卡 {monthCount} 个地点
                {primaryPOI ? ` · 最近 ${primaryPOI.name}` : ""}
              </div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </motion.div>

        {/* ── 收入私藏追问(顺手收集:创作分散在日常使用中) ── */}
        {primaryPOI && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.62 }}
            className="relative z-10 px-5 mt-3"
          >
            <button
              onClick={() => setSaveListOpen(true)}
              className="w-full rounded-2xl p-4 flex items-center gap-3 ripple"
              style={{
                background: "linear-gradient(135deg, #FFF3E0, #FFE8CC)",
                border: "1px solid rgba(255,111,0,0.2)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-2xl bg-white/70"
              >
                🔖
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-[14px] font-medium text-dpInk truncate">
                  这家店值得留住？
                </div>
                <div className="text-[12px] text-dpText-secondary mt-0.5 truncate">
                  把「{primaryPOI.name}」收入你的私藏清单
                </div>
              </div>
              <span
                className="shrink-0 px-3 h-7 rounded-full text-[12px] text-white font-medium flex items-center"
                style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
              >
                收入私藏
              </span>
            </button>
          </motion.div>
        )}

        {/* ── 朋友圈热门打卡地(新增) ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="relative z-10 mt-5"
        >
          <div className="px-5 flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF6F00">
                <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
              </svg>
              <span className="text-[14px] font-semibold text-dpInk">
                朋友圈热门打卡地
              </span>
            </div>
            <button className="text-[11px] text-dpText-tertiary flex items-center gap-0.5">
              全部
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* 横向滚动卡片 */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-2">
            {/* 头条:当前 POI 卡片 —— 展示自己在此点的累计打卡次数(而非他人评分) */}
            {primaryPOI && (() => {
              // 累计自己在此点的打卡次数 = baseline + userCheckins (含刚才这次)
              const all = [...MY_CHECKINS, ...getUserCheckins()];
              const visitCount = all.filter(
                (c) => (c.poi?.name || "") === primaryPOI.name
              ).length;
              return (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                  className="shrink-0 bg-white rounded-2xl p-3 text-left flex flex-col relative"
                  style={{
                    width: 168,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    border: "1px solid rgba(255, 111, 0, 0.25)",
                  }}
                >
                  {/* 顶部图标 */}
                  <div
                    className="rounded-xl mb-2.5 flex items-center justify-center text-3xl"
                    style={{
                      background: "linear-gradient(135deg, #FFF6E5, #FFEAD0)",
                      height: 80,
                    }}
                  >
                    {primaryPOI.emoji || "📍"}
                  </div>
                  <div className="flex items-center gap-1 min-w-0">
                    <div className="text-[13px] font-semibold text-dpInk truncate flex-1">
                      {primaryPOI.name}
                    </div>
                    {/* 小圆点 + 刚刚 */}
                    <span className="shrink-0 flex items-center gap-0.5 text-[9px] text-dpOrange-deep font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-dpOrange animate-pulse" />
                      刚刚
                    </span>
                  </div>
                  <div className="text-[10px] text-dpText-tertiary mt-0.5 truncate">
                    {primaryPOI.category || "地点"}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[10px]">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#FF6F00">
                      <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
                    </svg>
                    <span className="text-dpOrange-deep font-semibold">
                      你的第 {visitCount} 次打卡
                    </span>
                  </div>
                </motion.div>
              );
            })()}

            {FRIEND_HOT_SPOTS.map((spot) => {
              const friendObjs = spot.friendIds
                .map((id) => FRIENDS.find((f) => f.id === id))
                .filter(Boolean);
              return (
                <button
                  key={spot.id}
                  className="shrink-0 bg-white rounded-2xl p-3 text-left flex flex-col"
                  style={{
                    width: 168,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* 顶部图标背景 */}
                  <div
                    className="rounded-xl mb-2.5 flex items-center justify-center text-3xl"
                    style={{
                      background: spot.bg,
                      height: 80,
                    }}
                  >
                    {spot.emoji}
                  </div>
                  {/* 店名 */}
                  <div className="text-[13px] font-semibold text-dpInk truncate">
                    {spot.name}
                  </div>
                  <div className="text-[10px] text-dpText-tertiary mt-0.5 truncate">
                    {spot.category}
                  </div>
                  {/* 好友头像堆叠 */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex -space-x-1.5">
                      {friendObjs.slice(0, 3).map((f, i) => (
                        <div
                          key={f.id}
                          className="w-5 h-5 rounded-full overflow-hidden bg-[#f5f5f5] border-2 border-white"
                          style={{ zIndex: 3 - i }}
                        >
                          <img src={f.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-dpText-secondary truncate">
                      {spot.note}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>


      </div>

      {/* ── 半浮层:我的打卡 - 打卡记录 ── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 bg-black/40 z-40"
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="absolute left-0 right-0 bottom-0 z-50 bg-white rounded-t-2xl flex flex-col"
              style={{ height: "78%" }}
            >
              {/* 顶部抓手 + 标题 */}
              <div className="shrink-0">
                <div className="w-10 h-1 rounded-full bg-[#e5e5e5] mx-auto mt-2.5 mb-2" />
                <div className="px-5 pb-3 flex items-center justify-between border-b border-[#f5f5f5]">
                  <div>
                    <div className="text-[15px] font-semibold text-dpInk">
                      我的打卡 · 打卡记录
                    </div>
                    <div className="text-[11px] text-dpText-tertiary mt-0.5">
                      共 {sheetCheckins.length} 条
                    </div>
                  </div>
                  <button
                    onClick={() => setSheetOpen(false)}
                    className="w-7 h-7 rounded-full bg-[#f5f5f5] flex items-center justify-center"
                    aria-label="关闭"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5">
                      <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 列表 */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 pb-8">
                {sheetCheckins.length === 0 ? (
                  <div className="text-center text-[12px] text-dpText-tertiary py-10">
                    暂无打卡
                  </div>
                ) : (
                  sheetCheckins.map((c) => (
                    <CheckinTimelineItem
                      key={c.id}
                      checkin={c}
                      onDelete={handleSheetDelete}
                      onChangeVisibility={handleSheetVisibility}
                    />
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 收入私藏弹层 */}
      <SaveToListSheet
        open={saveListOpen}
        poi={primaryPOI}
        photo={firstPhoto}
        onClose={() => setSaveListOpen(false)}
      />
    </div>
  );
}
