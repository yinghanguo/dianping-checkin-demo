import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 单条打卡时间轴项 - 支持 ... 菜单 (改可见性 / 删除)
// props:
//   checkin: 打卡记录
//   onDelete?: (id) => void   - 用户确认删除后回调 (调用方负责落库)
//   onChangeVisibility?: (id, visibility) => void - 改可见性回调
//   showActions?: boolean (默认 true) - 是否显示 ... 菜单
export default function CheckinTimelineItem({
  checkin: c,
  onDelete,
  onChangeVisibility,
  showActions = true,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
    setConfirmDelete(false);
  };

  return (
    <div className="relative pl-5 pb-5">
      {/* 时间轴左侧的点 + 线 */}
      <div className="absolute left-0 top-2 w-2.5 h-2.5 rounded-full bg-dpOrange shrink-0" />
      <div className="absolute left-[5px] top-5 bottom-0 w-px bg-[#eee]" />

      {/* 头部:日期 + 时间 + 隐私 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[14px] font-semibold text-dpInk">{c.date}日</span>
          <span className="text-[11px] text-dpText-tertiary">{c.weekday} {c.time}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {c.visibility === "private" && (
            <span className="text-[10px] text-dpText-tertiary flex items-center gap-0.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" />
              </svg>
              仅自己可见
            </span>
          )}
          {c.visibility === "friends" && (
            <span className="text-[10px] text-dpText-tertiary flex items-center gap-0.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="8" r="3" />
                <path d="M3 20a6 6 0 0112 0" strokeLinecap="round" />
              </svg>
              仅好友
            </span>
          )}
          {showActions && (
            <button
              onClick={() => setMenuOpen(true)}
              className="text-dpText-tertiary p-1 -mr-1"
              aria-label="更多操作"
            >
              <svg width="14" height="3" viewBox="0 0 14 3" fill="currentColor">
                <circle cx="2" cy="1.5" r="1.5" />
                <circle cx="7" cy="1.5" r="1.5" />
                <circle cx="12" cy="1.5" r="1.5" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* POI 卡片 */}
      <div className="bg-[#F8F8F5] rounded-xl px-3 py-2.5 flex items-center gap-2.5 mb-2">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-xl shrink-0"
          style={{
            background: "linear-gradient(135deg, #FFF6E5, #FFEAD0)",
          }}
        >
          {c.poi.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-medium text-dpInk truncate">
            {c.poi.name}
          </div>
          <div className="text-[11px] text-dpText-tertiary mt-0.5 truncate">
            {c.poi.district || c.poi.city} {c.poi.district && `· ${c.poi.city}`} · {c.poi.category}
          </div>
        </div>
      </div>

      {/* 成就标签 */}
      {c.achievement && (
        <div className="flex items-center gap-1 text-[12px] text-dpOrange-deep mb-2">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
          </svg>
          <span className="truncate">{c.achievement}</span>
        </div>
      )}

      {/* 文字内容 */}
      {c.text && (
        <div className="text-[13px] text-dpInk leading-relaxed mb-2 whitespace-pre-wrap">
          {c.text}
        </div>
      )}

      {/* 照片 */}
      {c.photos && c.photos.length > 0 && (
        <div
          className={
            c.photos.length === 1
              ? "w-[160px] rounded-xl overflow-hidden"
              : c.photos.length === 2
              ? "grid grid-cols-2 gap-1.5 max-w-[280px]"
              : "grid grid-cols-3 gap-1.5"
          }
        >
          {c.photos.map((p, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden bg-[#f0f0f0]"
              style={{ aspectRatio: "1/1" }}
            >
              <img src={p} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      )}

      {/* 互动数据 */}
      {(c.likes > 0 || c.comments > 0) && (
        <div className="flex items-center gap-3 mt-2 text-[11px] text-dpText-tertiary">
          {c.likes > 0 && <span>♡ {c.likes}</span>}
          {c.comments > 0 && <span>💬 {c.comments}</span>}
        </div>
      )}

      {/* ── 操作菜单 (action sheet) ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/40 z-[80]"
              onClick={closeMenu}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-[81] bg-white rounded-t-2xl pb-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-[#e5e5e5] mx-auto mt-3 mb-2" />
              <div className="px-5 pt-2 pb-3 border-b border-[#f5f5f5]">
                <div className="text-[13px] font-medium text-dpInk truncate">
                  {c.poi.name}
                </div>
                <div className="text-[11px] text-dpText-tertiary mt-0.5">
                  {c.date}日 · {c.weekday} {c.time}
                </div>
              </div>

              {/* 改可见性 */}
              <div className="px-3 py-2">
                <div className="text-[11px] text-dpText-tertiary px-2 py-1.5">
                  谁可以看到
                </div>
                {[
                  { key: "public", label: "公开", emoji: "🌐" },
                  { key: "friends", label: "仅好友", emoji: "👥" },
                  { key: "private", label: "仅自己", emoji: "🔒" },
                ].map((opt) => {
                  const active = (c.visibility || "public") === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => {
                        onChangeVisibility?.(c.id, opt.key);
                        closeMenu();
                      }}
                      className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left ${
                        active ? "bg-dpOrange-bg" : ""
                      }`}
                    >
                      <span className="text-[16px]">{opt.emoji}</span>
                      <span
                        className={`flex-1 text-[14px] ${
                          active ? "text-dpOrange-deep font-medium" : "text-dpInk"
                        }`}
                      >
                        {opt.label}
                      </span>
                      {active && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6F00" strokeWidth="2.5">
                          <path d="M5 12l5 5 9-9" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 删除 */}
              <div className="px-3 pt-1 border-t border-[#f5f5f5]">
                <button
                  onClick={() => {
                    if (!confirmDelete) {
                      setConfirmDelete(true);
                      return;
                    }
                    onDelete?.(c.id);
                    closeMenu();
                  }}
                  className={`w-full px-2 py-3 text-[14px] text-left rounded-lg ${
                    confirmDelete ? "bg-red-50 text-red-600 font-medium" : "text-red-500"
                  }`}
                >
                  {confirmDelete ? "再次点击确认删除这条打卡" : "删除这条打卡"}
                </button>
                <button
                  onClick={closeMenu}
                  className="w-full px-2 py-3 mt-1 text-[14px] text-dpText-secondary"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
