import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FRIENDS, searchFriends } from "../data/friends";

// 好友选择浮层
// props:
//   open: 是否显示
//   selectedIds: 当前已选好友 id 数组
//   onClose: 关闭(不提交)
//   onConfirm(ids): 确认选择,传回新的 id 数组
export default function FriendPicker({ open, selectedIds = [], onClose, onConfirm }) {
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(selectedIds);

  // 每次打开时同步选中状态
  React.useEffect(() => {
    if (open) setPending(selectedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const list = useMemo(() => searchFriends(query), [query]);

  const toggle = (id) => {
    setPending((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]));
  };

  const formatStat = (n) => {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}w`;
    return String(n);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[100] bg-black/40"
          />
          {/* 主面板 */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="absolute left-0 right-0 z-[101] bg-white rounded-t-3xl flex flex-col"
            style={{
              bottom: 0,
              height: "82%",
              boxShadow: "0 -10px 40px rgba(0,0,0,0.18)",
            }}
          >
            {/* 抓手 */}
            <div className="pt-2.5 pb-1 flex justify-center shrink-0">
              <div className="w-11 h-1 rounded-full bg-[#e0e0e0]" />
            </div>

            {/* 标题栏 */}
            <div className="px-5 pt-2 pb-3 flex items-center justify-between shrink-0">
              <button onClick={onClose} className="text-[14px] text-dpText-secondary">
                取消
              </button>
              <div className="text-[16px] font-semibold text-dpInk">选择好友</div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#F5F5F5] flex items-center justify-center"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                  <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* 搜索框 */}
            <div className="px-5 pb-3 shrink-0">
              <div className="h-10 bg-[#F5F5F5] rounded-full flex items-center px-4 gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="#999" strokeWidth="2" />
                  <path d="M20 20L17 17" stroke="#999" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索好友"
                  className="flex-1 bg-transparent outline-none text-[14px] text-dpInk"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="w-5 h-5 rounded-full bg-[#ccc] flex items-center justify-center"
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* 列表 */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32">
              {list.length === 0 ? (
                <div className="py-16 flex flex-col items-center gap-2 text-dpText-tertiary">
                  <div className="text-3xl">🔍</div>
                  <div className="text-[13px]">没找到「{query}」相关好友</div>
                </div>
              ) : (
                list.map((f) => {
                  const checked = pending.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() => toggle(f.id)}
                      className="w-full flex items-center gap-3 py-2.5 text-left"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#f5f5f5] shrink-0 relative">
                        <img
                          src={f.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {f.verified && (
                          <div
                            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{
                              background: "linear-gradient(135deg, #FF6F00, #FFA040)",
                              border: "1.5px solid white",
                            }}
                          >
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                              <path d="M5 12l5 5 9-9" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 border-b border-[#f5f5f5] pb-2.5">
                        <div className="text-[14px] text-dpInk truncate font-medium">
                          {f.name}
                        </div>
                        <div className="text-[11px] text-dpText-tertiary mt-0.5">
                          粉丝 {formatStat(f.fans)} · 点评 {formatStat(f.reviews)}
                        </div>
                      </div>
                      <div className="pb-2.5 shrink-0">
                        {checked ? (
                          <motion.div
                            initial={{ scale: 0.6 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{
                              background: "linear-gradient(135deg, #FF6F00, #FFA040)",
                            }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <path d="M5 12l5 5 9-9" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </motion.div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-[#ddd]" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* 底部完成按钮 */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-7 bg-gradient-to-t from-white via-white/95 to-transparent">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onConfirm?.(pending)}
                className="w-full h-12 rounded-full text-white font-medium text-[15px]"
                style={{
                  background: "linear-gradient(135deg, #FF6F00, #FFA040)",
                  boxShadow: "0 4px 16px rgba(255,111,0,0.3)",
                }}
              >
                {pending.length > 0
                  ? `完成 · 已选 ${pending.length} 人`
                  : "完成"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
