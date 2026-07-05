import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getMyLists, updateList, addList, ME } from "../data/lists";

// 「收入私藏」半屏弹层 — 门店页 / 打卡成功页复用
// 交互:选中清单即完成收录,Toast 提示补一句推荐理由(点击直达编辑器)
export default function SaveToListSheet({ open, poi, photo, onClose, onSaved }) {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null); // { listId, listTitle }
  const myLists = useMemo(() => (open ? getMyLists() : []), [open]);

  const containing = useMemo(
    () => new Set(myLists.filter((l) => l.items.some((it) => it.poi?.name === poi?.name)).map((l) => l.id)),
    [myLists, poi]
  );

  const handlePick = (list) => {
    if (containing.has(list.id)) {
      // 已在清单中 → 移出
      updateList({ ...list, items: list.items.filter((it) => it.poi?.name !== poi.name) });
      onSaved?.();
      return;
    }
    const item = { poi, photo: photo || "", reason: "" };
    updateList({ ...list, items: [...list.items, item] });
    setToast({ listId: list.id, listTitle: list.title });
    onSaved?.();
    setTimeout(() => {
      setToast(null);
      onClose?.();
    }, 2600);
  };

  const handleCreate = () => {
    const now = new Date();
    const list = addList({
      id: `list_${Date.now()}`,
      owner: ME,
      title: "我的私藏清单",
      description: "",
      cover: photo || "",
      visibility: "private",
      likeCount: 0,
      saveCount: 0,
      createdAt: `${now.getMonth() + 1}/${now.getDate()}`,
      updatedAt: `${now.getMonth() + 1}/${now.getDate()}`,
      items: [{ poi, photo: photo || "", reason: "" }],
    });
    onClose?.();
    navigate(`/album/${list.id}/edit`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[100] bg-black/40"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="absolute left-0 right-0 bottom-0 z-[101] bg-white rounded-t-3xl flex flex-col"
            style={{ maxHeight: "70%", boxShadow: "0 -10px 40px rgba(0,0,0,0.15)" }}
          >
            <div className="pt-2.5 pb-1 flex justify-center shrink-0">
              <div className="w-11 h-1 rounded-full bg-[#e0e0e0]" />
            </div>

            <div className="px-5 pt-2 pb-3 shrink-0 border-b border-[#f5f5f5]">
              <div className="text-[16px] font-semibold text-dpInk">收入私藏</div>
              <div className="text-[11px] text-dpText-tertiary mt-0.5 truncate">
                把「{poi?.name}」放进你的清单
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-1 pb-8">
              {/* 新建清单 */}
              <button
                onClick={handleCreate}
                className="w-full flex items-center gap-3 py-3.5 border-b border-[#f5f5f5] text-left"
              >
                <div
                  className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center border-2 border-dashed"
                  style={{ borderColor: "#FF6F00" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6F00" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-[14px] font-medium" style={{ color: "#E65000" }}>
                  新建清单
                </div>
              </button>

              {/* 我的清单 */}
              {myLists.map((list) => {
                const added = containing.has(list.id);
                return (
                  <button
                    key={list.id}
                    onClick={() => handlePick(list)}
                    className="w-full flex items-center gap-3 py-3 border-b border-[#f5f5f5] text-left last:border-0"
                  >
                    <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-[#f0f0f0]">
                      {list.cover && <img src={list.cover} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-medium text-dpInk truncate">{list.title}</span>
                        {list.visibility === "private" && (
                          <span className="shrink-0 text-[10px] text-dpText-tertiary">🔒</span>
                        )}
                      </div>
                      <div className="text-[11px] text-dpText-tertiary mt-0.5">
                        {list.items.length} 家店
                        {list.visibility === "public" && ` · 被收藏 ${list.saveCount}`}
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center border-2 transition-all ${
                        added ? "border-dpOrange bg-dpOrange" : "border-[#ddd] bg-white"
                      }`}
                    >
                      {added && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* 收录成功 Toast:点击直达理由输入 */}
          <AnimatePresence>
            {toast && (
              <motion.button
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                onClick={() => {
                  onClose?.();
                  navigate(`/album/${toast.listId}/edit`);
                }}
                className="absolute bottom-32 left-1/2 -translate-x-1/2 z-[102] whitespace-nowrap px-4 py-2.5 rounded-full text-white text-[13px] flex items-center gap-1.5"
                style={{ background: "rgba(0,0,0,0.78)" }}
              >
                已收入「{toast.listTitle}」✓
                <span className="text-[#FFB199] font-medium">补一句推荐理由 →</span>
              </motion.button>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
