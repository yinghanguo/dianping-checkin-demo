import { NIKI_AVATAR as nikiAvatar } from "../data/lists";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import { MY_CHECKINS, deriveStats } from "../data/myCheckins";
import { getUserCheckins } from "../utils/userCheckins";
import {
  getMyLists,
  getSavedLists,
  effectiveCheckedOff,
  buildDraftBox,
} from "../data/lists";

// 「我的」页 — 高度还原点评原生设计
// 入口在底部 Tab "我的"
// 数据卡片三联中"打卡"是核心入口,点击进 /footprint
export default function Me() {
  const navigate = useNavigate();
  // 真实打卡(localStorage)+ 历史 baseline,按时间倒序
  const allCheckins = useMemo(
    () => [...getUserCheckins(), ...MY_CHECKINS].sort((a, b) => b.timestamp - a.timestamp),
    []
  );
  const stats = deriveStats(allCheckins);

  // 记录:用户上次在"我的"区域时是 /me
  React.useEffect(() => {
    sessionStorage.setItem("lastMeRoute", "/me");
  }, []);

  // 内容流 Tab
  const [tab, setTab] = useState("打卡");
  const [photoTab, setPhotoTab] = useState(false); // 私藏子 tab
  const [draftDismissed, setDraftDismissed] = useState(
    () => sessionStorage.getItem("dp_draft_dismissed") === "1"
  );
  const [pkDismissed, setPkDismissed] = useState(
    () => sessionStorage.getItem("dp_pk_banner_dismissed") === "1"
  );
  const [draftBoxOpen, setDraftBoxOpen] = useState(false);

  const myLists = useMemo(() => getMyLists(), [photoTab]);
  const savedLists = useMemo(() => getSavedLists(), [photoTab]);
  // 草稿箱:近期打卡按类目自动归置;banner 的内容推荐来自这里
  const draftBox = useMemo(() => buildDraftBox(), []);
  const coffeeDraft = draftBox[0];

  const handleDraft = (draft = coffeeDraft) => {
    navigate("/album/create", { state: { draft } });
  };
  const dismissDraft = () => {
    sessionStorage.setItem("dp_draft_dismissed", "1");
    setDraftDismissed(true);
  };
  const dismissPk = () => {
    sessionStorage.setItem("dp_pk_banner_dismissed", "1");
    setPkDismissed(true);
  };

  return (
    <div className="absolute inset-0 bg-[#F5F5F5] flex flex-col">

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 bg-[#F5F5F5]">
        {/* ── 头部背景 + 资料区 ── */}
        <div
          className="relative pb-3"
          style={{
            background: "linear-gradient(180deg, #FFE8C7 0%, #FFF6E5 50%, #F5F5F5 100%)",
          }}
        >
          {/* 顶部操作栏 */}
          <div className="flex items-center justify-end gap-3 px-4 py-2">
            <button>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20L17 17" strokeLinecap="round" />
              </svg>
            </button>
            <button>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
                <path d="M5 8h14M5 12h14M5 16h10" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* 头像 + 名字 + 编辑/加好友 */}
          <div className="px-4 pt-1 pb-3 flex items-center gap-3">
            <div className="relative shrink-0">
              <div
                className="w-[72px] h-[72px] rounded-full overflow-hidden"
                style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }}
              >
                <img
                  src={nikiAvatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[18px] font-bold text-dpInk">Niki</span>
                <span className="text-[10px] px-1.5 py-px rounded bg-white/70 text-dpText-secondary backdrop-blur-sm">
                  IP:法国
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                {/* Lv.8 */}
                <span
                  className="h-[18px] inline-flex items-center px-1.5 rounded text-[10px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
                >
                  Lv.8
                </span>
                {/* 66 枚勋章 */}
                <span
                  className="h-[18px] inline-flex items-center gap-0.5 px-1.5 rounded text-[10px] bg-white/70 text-dpText-secondary backdrop-blur-sm"
                >
                  <span className="text-dpOrange-deep">🏅</span>
                  66 枚勋章
                </span>
                {/* 黑钻会员 */}
                <span
                  className="h-[18px] inline-flex items-center gap-0.5 px-1.5 rounded text-[10px] font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #2c2c2c, #4a4a4a)",
                  }}
                >
                  💎 黑钻会员
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button className="px-3 h-7 rounded-full bg-white text-[12px] text-dpInk font-medium border border-[#e5e5e5]">
                编辑资料
              </button>
              <button className="px-3 h-7 rounded-full text-[12px] text-white font-medium" style={{
                background: "linear-gradient(135deg, #FF6F00, #FFA040)",
              }}>
                关注
              </button>
            </div>
          </div>

          {/* 粉丝/关注/获赞 */}
          <div className="px-4 flex items-center gap-5 text-[12px] text-dpText-secondary">
            <button className="flex items-baseline gap-1">
              <span className="text-[15px] font-bold text-dpInk">66</span>
              粉丝
            </button>
            <button className="flex items-baseline gap-1">
              <span className="text-[15px] font-bold text-dpInk">40</span>
              关注
            </button>
            <button className="flex items-baseline gap-1">
              <span className="text-[15px] font-bold text-dpInk">735</span>
              获赞
            </button>
          </div>
        </div>

        {/* ── 数据卡片三联:足迹(去过哪) · 收藏含清单(留下什么) · 口味(吃成什么样) ── */}
        <div className="px-3 grid grid-cols-3 gap-2 mt-1">
          {/* 打卡足迹(打卡与足迹合并:打卡是动词,足迹是资产) */}
          <DataCard
            title="打卡足迹"
            primary={`${stats.totalCheckins}`}
            primaryUnit="累计打卡"
            secondary={`${stats.countryCount} 国 ${stats.cityCount} 城`}
            secondaryUnit=""
            decorEmoji="📍"
            onClick={() => navigate("/footprint")}
          />
          {/* 收藏(含清单):我的专辑 + 我收藏的清单,与收藏页联动 */}
          <DataCard
            title="收藏"
            primary={`${new Set([...myLists, ...savedLists].flatMap((l) => l.items.map((i) => i.poi?.name))).size}`}
            primaryUnit="家店"
            secondary={`${myLists.length + savedLists.length}`}
            secondaryUnit="份清单"
            decorEmoji="🔖"
            onClick={() => navigate("/collection")}
          />
          {/* 口味档案 */}
          <DataCard
            title="口味档案"
            primary="2052"
            primaryUnit="累计用餐"
            secondary="28"
            secondaryUnit="解锁菜系"
            decorEmoji="🍴"
          />
        </div>

        {/* ── banner 轮播:活动促稿(默认第一张) + 草稿推荐(来自草稿箱);整框可点,✕ 独立在框右上角 ── */}
        <BannerCarousel
          slides={[
            ...(!pkDismissed
              ? [
                  <div
                    key="pk"
                    onClick={() => navigate("/pk?phase=submit")}
                    className="rounded-2xl pl-4 pr-9 py-3 relative overflow-hidden h-full cursor-pointer"
                    style={{ background: "linear-gradient(120deg, #2B1200 0%, #7A2E00 60%, #E65000 140%)" }}
                  >
                    <div className="absolute -right-3 -bottom-4 text-[48px] opacity-20 rotate-12 select-none">🏆</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); dismissPk(); }}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center z-10"
                      style={{ background: "rgba(255,255,255,0.25)" }}
                      aria-label="关闭"
                    >
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                    <div className="text-[13px] font-semibold text-white leading-snug">
                      私藏杯 · 上海站提报中
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: "#FFB27A" }}>
                      把私藏拿出来比一比 · 大奖:Asia's 50 香港之旅
                      <span className="text-white font-medium ml-1">去报名 ›</span>
                    </div>
                  </div>,
                ]
              : []),
            ...(!draftDismissed && coffeeDraft.items.length >= 3
              ? [
                  <div
                    key="draft"
                    onClick={() => handleDraft()}
                    className="rounded-2xl pl-4 pr-9 py-3 relative h-full cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #FFF3E0, #FFE5C2)",
                      border: "1px solid rgba(255,111,0,0.18)",
                    }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); dismissDraft(); }}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center z-10"
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
                      aria-label="关闭"
                    >
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="3">
                        <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                    <div className="text-[13px] font-semibold text-dpInk leading-snug">
                      最近打卡了 {coffeeDraft.items.length} 家咖啡店
                    </div>
                    <div className="text-[11px] text-dpText-secondary mt-0.5">
                      草稿箱已按类目整理好
                      <span className="text-dpOrange-deep font-medium ml-1">查看草稿 ›</span>
                    </div>
                  </div>,
                ]
              : []),
          ]}
        />

        {/* ── 功能宫格 ── */}
        <div className="mx-3 mt-2 bg-white rounded-2xl px-3 py-3.5"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <div className="grid grid-cols-5 gap-2">
            {[
              { icon: "📦", label: "订单" },
              { icon: "🔖", label: "收藏", onClick: () => navigate("/collection") },
              { icon: "📍", label: "地点标记" },
              { icon: "🎫", label: "卡券" },
              { icon: "📝", label: "待评价" },
            ].map((f) => (
              <button key={f.label} onClick={f.onClick} className="flex flex-col items-center gap-1 relative">
                <div className="w-[42px] h-[42px] rounded-full bg-dpOrange-bg flex items-center justify-center text-2xl relative">
                  {f.icon}
                  {f.redDot && (
                    <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </div>
                <span className="text-[11px] text-dpText-secondary">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 内容流 Tab ── */}
        <div className="mx-3 mt-2.5 bg-white rounded-t-2xl"
          style={{ boxShadow: "0 -1px 3px rgba(0,0,0,0.02)" }}
        >
          <div className="flex items-center px-3 pt-3 border-b border-[#f5f5f5]">
            <div className="flex gap-5 flex-1">
              {["打卡", "笔记", "评价"].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setPhotoTab(false); }}
                  className="pb-2 relative"
                >
                  <span className={`text-[14px] ${
                    tab === t && !photoTab ? "text-dpInk font-bold" : "text-dpText-secondary"
                  }`}>
                    {t}
                  </span>
                  {tab === t && !photoTab && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full bg-dpOrange" />
                  )}
                </button>
              ))}
              <button
                onClick={() => setPhotoTab(true)}
                className="pb-2 relative"
              >
                <span className={`text-[14px] ${photoTab ? "text-dpInk font-bold" : "text-dpText-secondary"}`}>
                  私藏
                </span>
                {photoTab && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full bg-dpOrange" />
                )}
              </button>
            </div>
            <button className="pb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20L17 17" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {photoTab ? (
            /* ── 私藏清单分区:我的清单(公开/私密) + 收藏的清单(拔草进度) ── */
            <div className="px-3 py-3">
              <button
                onClick={() => navigate("/album/create")}
                className="w-full h-10 rounded-xl border-2 border-dashed text-[13px] font-medium flex items-center justify-center gap-1.5 mb-3"
                style={{ borderColor: "#FFD5B0", color: "#E65000" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                新建私藏清单
              </button>

              {/* 草稿箱条:近期打卡按类目自动归置(私藏创作入口) */}
              <button
                onClick={() => setDraftBoxOpen(true)}
                className="w-full mb-3 px-3 py-2.5 flex items-center gap-2 rounded-xl bg-[#FFFAF3] border border-[#FFE8D0]"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FFF6E5] flex items-center justify-center text-base shrink-0">
                  📝
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-[13px] text-dpInk">草稿箱</div>
                  <div className="text-[10px] text-dpText-tertiary mt-0.5 truncate">
                    已按类目整理 {draftBox.length} 份待发布:{draftBox.map((d) => d.category).join(" / ")}
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" className="shrink-0">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                {myLists.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => navigate(`/album/${l.id}`)}
                    className="bg-white rounded-xl overflow-hidden text-left"
                    style={{ border: "1px solid #f0f0f0" }}
                  >
                    <div className="relative w-full bg-[#f0f0f0]" style={{ aspectRatio: "4/3" }}>
                      {l.cover && <img src={l.cover} alt="" className="w-full h-full object-cover" loading="lazy" />}
                      {l.visibility === "private" ? (
                        <div
                          className="absolute top-1.5 left-1.5 px-1.5 py-px rounded text-[9px] text-white flex items-center gap-0.5"
                          style={{ background: "rgba(0,0,0,0.55)" }}
                        >
                          🔒 私密
                        </div>
                      ) : (
                        <div
                          className="absolute top-1.5 left-1.5 px-1.5 py-px rounded text-[9px] text-white font-medium"
                          style={{ background: "rgba(255,111,0,0.85)" }}
                        >
                          公开
                        </div>
                      )}
                    </div>
                    <div className="px-2 py-2">
                      <div
                        className="text-[12px] font-medium text-dpInk leading-snug"
                        style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                      >
                        {l.title}
                      </div>
                      <div className="flex items-center justify-between mt-1.5 text-[10px] text-dpText-tertiary">
                        <span>{l.items.length} 家店</span>
                        {l.visibility === "public" && (
                          <span>♡ {l.likeCount} · 藏 {l.saveCount}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {savedLists.length > 0 && (
                <>
                  <div className="text-[13px] font-semibold text-dpInk mt-4 mb-2">收藏的清单</div>
                  {savedLists.map((l) => {
                    const checked = effectiveCheckedOff(l);
                    const done = l.items.filter((it) => checked.has(it.poi?.name)).length;
                    return (
                      <button
                        key={l.id}
                        onClick={() => navigate(`/album/${l.id}`)}
                        className="w-full bg-white rounded-xl p-2.5 mb-2 flex items-center gap-2.5 text-left"
                        style={{ border: "1px solid #f0f0f0" }}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#f0f0f0] shrink-0">
                          <img src={l.cover} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-medium text-dpInk truncate">{l.title}</div>
                          <div className="text-[10px] text-dpText-tertiary mt-0.5">
                            {l.owner.name} · 已去 {done}/{l.items.length}
                          </div>
                          <div className="mt-1.5 h-1 rounded-full bg-[#f0f0f0] overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${l.items.length ? (done / l.items.length) * 100 : 0}%`,
                                background: "linear-gradient(90deg, #7BC142, #A5D66E)",
                              }}
                            />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          ) : (
          <>
          {/* 内容瀑布流(双列) */}
          <div className="grid grid-cols-2 gap-2 px-2 py-2">
            {allCheckins.slice(0, 8).map((c) => (
              <button
                key={c.id}
                onClick={() => navigate("/footprint")}
                className="bg-white rounded-xl overflow-hidden text-left"
                style={{ border: "1px solid #f5f5f5" }}
              >
                <div
                  className="relative w-full bg-[#f0f0f0]"
                  style={{ aspectRatio: "1/1" }}
                >
                  {c.photos[0] && (
                    <img src={c.photos[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                  )}
                  {/* 多图角标 */}
                  {c.photos.length > 1 && (
                    <div
                      className="absolute top-1.5 right-1.5 px-1.5 py-px rounded text-[9px] text-white font-bold"
                      style={{ background: "rgba(0,0,0,0.55)" }}
                    >
                      ×{c.photos.length}
                    </div>
                  )}
                  {/* 隐私标识 */}
                  {c.visibility === "private" && (
                    <div
                      className="absolute top-1.5 left-1.5 px-1.5 py-px rounded text-[9px] text-white flex items-center gap-0.5"
                      style={{ background: "rgba(0,0,0,0.55)" }}
                    >
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                        <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" />
                      </svg>
                      私
                    </div>
                  )}
                </div>
                <div className="px-2 py-2">
                  <div
                    className="text-[12px] text-dpInk leading-snug"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {c.poi.name}
                  </div>
                  {c.achievement && (
                    <div className="text-[10px] text-dpOrange-deep mt-1 truncate">
                      ✨ {c.achievement}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-dpText-tertiary">
                    <span className="truncate">{c.poi.city} · {c.date}</span>
                    {(c.likes > 0 || c.comments > 0) && (
                      <span className="flex items-center gap-1.5 shrink-0">
                        {c.likes > 0 && <span>♡ {c.likes}</span>}
                        {c.comments > 0 && <span>💬 {c.comments}</span>}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center py-4 text-[11px] text-dpText-tertiary">
            进入「打卡」查看全部 {stats.totalCheckins} 条记录
          </div>
          </>
          )}
        </div>
      </div>

      <BottomTab navigate={navigate} active="me" />

      {/* ── 草稿箱抽屉:按类目整理的待发布草稿,点「去整理」进编辑器 ── */}
      <AnimatePresence>
        {draftBoxOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDraftBoxOpen(false)}
              className="absolute inset-0 z-[100] bg-black/40"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="absolute left-0 right-0 bottom-0 z-[101] bg-white rounded-t-3xl"
              style={{ boxShadow: "0 -10px 40px rgba(0,0,0,0.15)" }}
            >
              <div className="pt-2.5 pb-1 flex justify-center">
                <div className="w-11 h-1 rounded-full bg-[#e0e0e0]" />
              </div>
              <div className="px-5 pt-1 pb-2">
                <div className="text-[16px] font-semibold text-dpInk">草稿箱</div>
                <div className="text-[11px] text-dpText-tertiary mt-0.5">
                  按类目把你近期去过的店整理好了,挑一份接着编
                </div>
              </div>
              <div className="px-4 pb-8">
                {draftBox.map((d) => (
                  <button
                    key={d.category}
                    onClick={() => { setDraftBoxOpen(false); handleDraft(d); }}
                    className="w-full py-3 flex items-center gap-3 border-b border-[#f5f5f5] last:border-0 text-left"
                  >
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#f0f0f0] shrink-0">
                      <img src={d.items[0]?.photos?.[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-dpInk">
                        {d.category} · {d.items.length} 家店
                      </div>
                      <div className="text-[11px] text-dpText-tertiary mt-0.5 truncate">
                        建议主题:「{d.suggestedTitle}」
                      </div>
                    </div>
                    <span
                      className="shrink-0 px-3 h-7 rounded-full text-[12px] text-white font-medium flex items-center"
                      style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
                    >
                      去整理
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// 数据卡片(三联) — 模块名在上方,统一白底
function DataCard({ title, primary, primaryUnit, secondary, secondaryUnit, badge, decorEmoji, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl p-3 text-left flex flex-col relative overflow-hidden bg-white"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      {/* 模块名(上方) */}
      <div className="flex items-center gap-1 text-[12px] font-bold text-dpInk mb-1.5">
        {title}
        {badge && (
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
        )}
      </div>
      {/* 主数据 */}
      <div className="flex items-baseline gap-0.5">
        <span className="text-[20px] font-bold text-dpInk">{primary}</span>
        <span className="text-[10px] text-dpText-tertiary">{primaryUnit}</span>
      </div>
      {/* 次数据 */}
      {secondary && (
        <div className="text-[10px] text-dpText-tertiary mt-1">
          <span className="font-semibold text-dpInk">{secondary}</span>{" "}
          {secondaryUnit}
        </div>
      )}
      {decorEmoji && (
        <span
          className="absolute -bottom-2 -right-1 text-3xl pointer-events-none"
          style={{ opacity: 0.12 }}
        >
          {decorEmoji}
        </span>
      )}
    </button>
  );
}

// 底部 Tab
export function BottomTab({ navigate, active = "home" }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#f0f0f0]"
      style={{ zIndex: 20, paddingBottom: 24, paddingTop: 8 }}
    >
      <div className="flex items-center justify-around relative">
        <button onClick={() => navigate("/")} className="flex flex-col items-center gap-0.5 px-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill={active === "home" ? "#FF6F00" : "none"} stroke={active === "home" ? "none" : "#999"} strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2V9z" />
          </svg>
          <div className={`text-[10px] ${active === "home" ? "text-dpOrange font-medium" : "text-dpText-tertiary"}`}>首页</div>
        </button>
        <button onClick={() => navigate("/map")} className="flex flex-col items-center gap-0.5 px-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active === "map" ? "#FF6F00" : "#999"} strokeWidth="2">
            <path d="M9 5l-6 2v14l6-2 6 2 6-2V3l-6 2-6-2z" strokeLinejoin="round" />
            <path d="M9 5v14M15 7v14" />
          </svg>
          <div className={`text-[10px] ${active === "map" ? "text-dpOrange font-medium" : "text-dpText-tertiary"}`}>地图</div>
        </button>
        <div className="px-3 relative" style={{ width: 70 }}>
          <div style={{ height: 32 }} />
          <div className="text-[10px] text-transparent">打卡</div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/camera")}
            className="absolute rounded-full flex items-center justify-center"
            style={{
              top: -22, left: "50%", x: "-50%",
              width: 56, height: 56,
              background: "linear-gradient(135deg, #FF6F00, #FFA040)",
              border: "4px solid white",
              boxShadow: "0 4px 16px rgba(255,111,0,0.35)",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </motion.button>
        </div>
        <button className="flex flex-col items-center gap-0.5 px-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <path d="M3 7h18M3 12h18M3 17h12" strokeLinecap="round" />
          </svg>
          <div className="text-[10px] text-dpText-tertiary">消息</div>
        </button>
        <button
          onClick={() => {
            const last = sessionStorage.getItem("lastMeRoute") || "/me";
            navigate(last);
          }}
          className="flex flex-col items-center gap-0.5 px-3"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={active === "me" ? "#FF6F00" : "none"} stroke={active === "me" ? "none" : "#999"} strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0116 0" />
          </svg>
          <div className={`text-[10px] ${active === "me" ? "text-dpOrange font-medium" : "text-dpText-tertiary"}`}>我的</div>
        </button>
      </div>
    </div>
  );
}

// ── banner 轮播:一直从右向左无缝轮播(末尾克隆首张实现正向循环),slide 间留间距 ──
function BannerCarousel({ slides }) {
  const scroller = React.useRef(null);
  const [idx, setIdx] = useState(0);
  const count = slides.length;
  // 末尾追加首张克隆:滚到克隆后静默跳回真实首张,保证方向始终右→左
  const loopSlides = count > 1 ? [...slides, slides[0]] : slides;

  React.useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      setIdx((prev) => {
        const next = prev + 1;
        const el = scroller.current;
        if (el) el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
        if (next >= count) {
          setTimeout(() => {
            const e2 = scroller.current;
            if (e2) e2.scrollTo({ left: 0, behavior: "auto" });
            setIdx(0);
          }, 480);
        }
        return next;
      });
    }, 2800);
    return () => clearInterval(timer);
  }, [count]);

  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mx-3 mt-2 relative"
    >
      <div
        ref={scroller}
        className="flex overflow-x-auto no-scrollbar"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {loopSlides.map((s, i) => (
          // px 给相邻 banner 之间留出间距(滑动时可见)
          <div key={i} className="w-full shrink-0 px-1" style={{ scrollSnapAlign: "center" }}>
            {s}
          </div>
        ))}
      </div>
      {count > 1 && (
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
          {slides.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: (idx % count) === i ? 10 : 4,
                height: 4,
                background: (idx % count) === i ? "#FF6F00" : "#ddd",
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
