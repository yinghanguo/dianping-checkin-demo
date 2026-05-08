import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import StatusBar from "../components/StatusBar";
import { usePhoto, FALLBACK_PHOTO } from "../contexts/PhotoContext";
import { useLocation } from "../contexts/LocationContext";
import { FRIENDS } from "../data/friends";

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
  const { photos, firstPhoto, visibility, taggedFriends, resetSession } = usePhoto();
  const { primaryPOI, shortAddress, setUserSelectedPOI, setPoiSkipped } = useLocation();
  const [count, setCount] = useState(228);

  useEffect(() => {
    const t = setTimeout(() => setCount(229), 600);
    return () => clearTimeout(t);
  }, []);

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
      <div className="relative z-10 px-4 py-3 flex items-center justify-end gap-2">
        <button className="px-3 h-8 rounded-full bg-white/70 backdrop-blur-md flex items-center gap-1 text-[12px] text-dpInk">
          {visConfig.icon("currentColor")}
          {visConfig.label}
        </button>
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
        {/* 庆祝文案 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 px-5 pt-2 pb-4"
        >
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div className="inline-flex items-center px-2 py-1 bg-dpGreen-light rounded text-[11px] font-bold text-[#3a6b1a] mb-2">
                打卡成功 ✨
              </div>
              <div
                className="text-[42px] font-black text-dpInk leading-none italic"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                Cool!
              </div>
              <div className="text-[28px] font-bold text-dpInk leading-tight mt-1">
                步履不停
              </div>
              <div className="flex items-center gap-2 text-[15px] text-dpInk mt-1.5">
                <span>今年打卡了</span>
                <motion.div
                  key={count}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="px-2.5 py-0.5 rounded-md text-[20px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
                >
                  {count}个
                </motion.div>
                <span>地点</span>
              </div>
            </div>

            {/* POI 标签(右上,只在已确认时显示) */}
            {primaryPOI && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="flex flex-col items-end"
              >
                <div className="bg-white rounded-l-full rounded-tr-full px-2.5 py-1.5 flex items-center gap-1 shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-dpGreen flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M5 12l5 5 9-9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span
                    className="text-[11px] font-medium text-dpInk truncate"
                    style={{ maxWidth: 110 }}
                  >
                    {primaryPOI.name}
                  </span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="w-px h-3 bg-dpGreen/50 mr-3" />
                <div className="w-3 h-3 rounded-full bg-dpGreen mr-2 shadow-sm" />
              </motion.div>
            )}
          </div>
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
              padding: "12px 12px 60px",
            }}
          >
            <div
              className="w-full overflow-hidden rounded-lg bg-[#f0f0f0] relative"
              style={{ aspectRatio: "4/5" }}
            >
              <img
                src={firstPhoto || FALLBACK_PHOTO}
                alt=""
                className="w-full h-full object-cover"
              />
              {photos.length > 1 && (
                <div
                  className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md text-[11px] font-bold text-white flex items-center gap-1"
                  style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                    <rect x="3" y="6" width="18" height="14" rx="2" />
                    <circle cx="12" cy="13" r="3.5" fill="rgba(0,0,0,0.55)" />
                  </svg>
                  ×{photos.length}
                </div>
              )}
            </div>
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
              <div>
                <div className="flex items-baseline">
                  <span
                    className="text-[28px] font-black text-dpInk leading-none italic"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    05/05
                  </span>
                  <span className="text-[11px] text-dpText-secondary ml-1">周二</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[11px] text-dpText-tertiary">@Niki</span>
                  <span className="px-1 py-px bg-dpOrange/10 text-dpOrange-deep rounded text-[9px] font-bold">
                    Lv8
                  </span>
                </div>
              </div>
              <button className="w-7 h-7 rounded-md border border-[#ddd] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8">
                  <path d="M3 8V3h5M21 8V3h-5M3 16v5h5M21 16v5h-5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
        )}

        {/* 多张照片缩略图 */}
        {photos.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative z-10 px-8 mt-3"
          >
            <div className="flex justify-center gap-1.5">
              {photos.slice(1).map((p, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-lg overflow-hidden bg-[#f0f0f0]"
                  style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

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
                你的 5 月榜单已更新
              </div>
              <div className="text-[12px] text-dpText-tertiary mt-0.5 truncate">
                {primaryPOI
                  ? `${primaryPOI.category || "本月最爱"} Top 1 · ${primaryPOI.name} · 已打卡 6 次`
                  : "本月已打卡 14 个地点"}
              </div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </motion.div>

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
            {/* 头条:当前 POI 的好友打卡(如果 primaryPOI 存在) */}
            {primaryPOI && (() => {
              // mock:为当前 POI 生成 2-3 个"也来过"的好友(伪随机但稳定)
              const seed = (primaryPOI.name || "").length % 5;
              const friendIdsForCurrent = ["f5", "f12", "f9", "f6", "f11"].slice(seed, seed + 3);
              const friendObjs = friendIdsForCurrent
                .map((id) => FRIENDS.find((f) => f.id === id))
                .filter(Boolean);
              const noteMap = [
                "@Zoe @Vivi 都来过",
                "@小七 上周打卡",
                "@日酱 推荐过这里",
                "@拾光 等 3 人也来过",
                "@Vivi 给了 5 星",
              ];
              const note = noteMap[seed];
              return (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                  className="shrink-0 bg-white rounded-2xl p-3 text-left flex flex-col"
                  style={{
                    width: 168,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
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
                  <div className="text-[13px] font-semibold text-dpInk truncate">
                    {primaryPOI.name}
                  </div>
                  <div className="text-[10px] text-dpText-tertiary mt-0.5 truncate">
                    {primaryPOI.category || "你刚打卡"}
                  </div>
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
                      {note}
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
    </div>
  );
}
