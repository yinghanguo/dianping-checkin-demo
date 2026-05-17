import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createCustomPoi,
  updateCustomPoi,
  deleteCustomPoi,
  findDuplicateNearby,
} from "../utils/customPois";

const EMOJI_PRESETS = [
  "🏠", "🏢", "☕", "🍴", "🍺", "🌳",
  "🏖️", "🏔️", "🛣️", "🚗", "🛍️", "🎨",
  "🏟️", "🎓", "✈️", "📍",
];

// 半屏新建/编辑地点 Sheet
// props:
//   open: boolean
//   onClose: () => void
//   coords: { lat, lng } | null
//   addressLabel: string  (展示用,如 "上海·静安区 南京西路")
//   defaultName: string   (从搜索入口进来时预填)
//   editing: object | null (传入已有地点对象,则进入编辑模式)
//   onCreated: (poi) => void  (保存或更新成功后回调,返回新对象)
//   onDeleted: (id) => void   (编辑模式下点删除后回调)
export default function CreatePoiSheet({
  open,
  onClose,
  coords,
  addressLabel,
  defaultName = "",
  editing = null,
  onCreated,
  onDeleted,
}) {
  const isEdit = !!editing;
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📍");
  const [tag, setTag] = useState("");
  const [customEmojiInput, setCustomEmojiInput] = useState("");
  const [showCustomEmoji, setShowCustomEmoji] = useState(false);
  const [dupHint, setDupHint] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const nameInputRef = useRef(null);

  // 打开时根据 editing 初始化
  useEffect(() => {
    if (open) {
      if (editing) {
        setName(editing.name || "");
        setEmoji(editing.emoji || "📍");
        setTag(editing.tag || "");
      } else {
        setName(defaultName || "");
        setEmoji("📍");
        setTag("");
      }
      setCustomEmojiInput("");
      setShowCustomEmoji(false);
      setDupHint(null);
      setConfirmDelete(false);
      // 自动聚焦名称输入
      setTimeout(() => nameInputRef.current?.focus(), 300);
    }
  }, [open, defaultName, editing]);

  // 名称变化时实时检测重名(编辑时排除自身)
  useEffect(() => {
    if (!coords || !name.trim()) {
      setDupHint(null);
      return;
    }
    const dup = findDuplicateNearby(coords, name, editing?.id || null);
    setDupHint(dup);
  }, [name, coords, editing?.id]);

  const canSave = name.trim().length > 0 && (coords || isEdit) && !dupHint;

  const handleSave = () => {
    if (!canSave) return;
    let saved;
    if (isEdit) {
      saved = updateCustomPoi(editing.id, { name, emoji, tag });
    } else {
      saved = createCustomPoi({ name, emoji, tag, coords });
    }
    // 适配到 POI 行渲染期望的字段
    const adapted = {
      ...saved,
      category: saved.tag || "我创建的地点",
      distance: isEdit ? editing.distance : "0m",
      rating: null,
    };
    onCreated?.(adapted);
  };

  const handleDelete = () => {
    if (!isEdit) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteCustomPoi(editing.id);
    onDeleted?.(editing.id);
  };

  const handlePickCustomEmoji = () => {
    const val = customEmojiInput.trim();
    if (val) {
      // 只取第一个字符(可能是 emoji 复合字符,这里简单处理)
      setEmoji(Array.from(val)[0] || val);
      setShowCustomEmoji(false);
      setCustomEmojiInput("");
    }
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
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 z-40"
          />
          {/* 半屏 Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 flex flex-col max-h-[88%]"
          >
            {/* 抓手 */}
            <div className="pt-2 pb-1 flex justify-center">
              <div className="w-9 h-1 rounded-full bg-[#E5E5E5]" />
            </div>

            {/* 顶部栏 */}
            <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b border-[#f5f5f5]">
              <button
                onClick={onClose}
                className="text-[14px] text-dpText-secondary"
              >
                取消
              </button>
              <div className="text-[15px] font-medium text-dpInk">
                {isEdit ? "编辑地点" : "新建地点"}
              </div>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={`text-[14px] font-medium ${
                  canSave ? "text-dpOrange-deep" : "text-dpText-quaternary"
                }`}
              >
                保存
              </button>
            </div>

            {/* 表单内容 */}
            <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 no-scrollbar">
              {/* 没定位的提示 */}
              {!coords && (
                <div className="mb-4 p-3 rounded-xl bg-[#FFF6E5] flex items-start gap-2">
                  <span className="text-[14px]">⚠️</span>
                  <div className="text-[12px] text-dpOrange-deep leading-relaxed">
                    需要先开启定位才能新建地点
                  </div>
                </div>
              )}

              {/* 图标 emoji 选择 */}
              <div className="mb-5">
                <div className="text-[12px] text-dpText-secondary mb-2">
                  选择图标
                </div>
                <div className="flex items-center gap-3 mb-3">
                  {/* 当前选中预览 */}
                  <div
                    className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-3xl"
                    style={{
                      background: "linear-gradient(135deg, #FFE0B0, #FFC880)",
                    }}
                  >
                    {emoji}
                  </div>
                  <div className="flex-1 text-[11px] text-dpText-tertiary leading-relaxed">
                    给地点选一个能代表它的图标,可选下方预设或自由输入
                  </div>
                </div>

                {/* 预设网格 */}
                <div className="grid grid-cols-8 gap-1.5">
                  {EMOJI_PRESETS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xl transition ${
                        emoji === e
                          ? "bg-dpOrange-bg ring-1 ring-dpOrange"
                          : "bg-[#FAFAF7]"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>

                {/* 自由输入 emoji */}
                <button
                  onClick={() => setShowCustomEmoji((s) => !s)}
                  className="mt-2 text-[12px] text-dpOrange-deep"
                >
                  {showCustomEmoji ? "收起" : "+ 用其他 emoji"}
                </button>
                {showCustomEmoji && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      value={customEmojiInput}
                      onChange={(e) => setCustomEmojiInput(e.target.value)}
                      placeholder="粘贴或输入一个 emoji"
                      maxLength={4}
                      className="flex-1 h-9 px-3 bg-[#F5F5F5] rounded-lg text-[14px] outline-none"
                    />
                    <button
                      onClick={handlePickCustomEmoji}
                      className="h-9 px-3 rounded-lg bg-dpOrange text-white text-[12px] font-medium"
                    >
                      使用
                    </button>
                  </div>
                )}
              </div>

              {/* 名称 */}
              <div className="mb-5">
                <div className="text-[12px] text-dpText-secondary mb-2">
                  地点名称 <span className="text-dpOrange-deep">*</span>
                </div>
                <input
                  ref={nameInputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 30))}
                  placeholder="如:我家、318 国道 K2073、朋友家"
                  className="w-full h-11 px-4 bg-[#F5F5F5] rounded-xl text-[15px] outline-none placeholder:text-dpText-tertiary"
                />
                <div className="flex justify-between mt-1.5">
                  {dupHint ? (
                    <span className="text-[11px] text-dpOrange-deep">
                      附近已有同名地点「{dupHint.name}」,改用现有的更好
                    </span>
                  ) : (
                    <span className="text-[11px] text-dpText-tertiary">
                      最多 30 字
                    </span>
                  )}
                  <span className="text-[11px] text-dpText-quaternary">
                    {name.length}/30
                  </span>
                </div>
              </div>

              {/* 自定义标签 */}
              <div className="mb-5">
                <div className="text-[12px] text-dpText-secondary mb-2">
                  自定义标签
                  <span className="text-dpText-tertiary ml-1">(可选)</span>
                </div>
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value.slice(0, 12))}
                  placeholder="如:老家、自驾沿途、朋友家"
                  className="w-full h-11 px-4 bg-[#F5F5F5] rounded-xl text-[14px] outline-none placeholder:text-dpText-tertiary"
                />
                <div className="text-[11px] text-dpText-tertiary mt-1.5">
                  不强制分类,任何场景都可以贴你自己的标签
                </div>
              </div>

              {/* 位置(只读) */}
              <div className="mb-2">
                <div className="text-[12px] text-dpText-secondary mb-2">
                  位置
                </div>
                <div className="px-4 py-3 bg-[#FAFAF7] rounded-xl flex items-start gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FF6F00"
                    strokeWidth="2"
                    className="mt-0.5 shrink-0"
                  >
                    <path d="M12 21l-6-9a7 7 0 1112 0l-6 9z" strokeLinejoin="round" />
                    <circle cx="12" cy="11" r="2" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-dpInk truncate">
                      {addressLabel || "当前位置"}
                    </div>
                    {coords && (
                      <div className="text-[10px] text-dpText-tertiary mt-0.5">
                        {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-dpText-tertiary mt-1.5">
                  地点会保存在你当前位置,下次到这里可直接选用
                </div>
              </div>
            </div>

            {/* 底部操作区 */}
            <div className="px-5 pt-2 pb-6 bg-white border-t border-[#f5f5f5]">
              {isEdit && (
                <button
                  onClick={handleDelete}
                  className={`w-full h-10 mb-2 rounded-full text-[13px] font-medium transition ${
                    confirmDelete
                      ? "bg-red-50 text-red-600"
                      : "text-dpText-secondary"
                  }`}
                >
                  {confirmDelete ? "再次点击确认删除" : "删除这个地点"}
                </button>
              )}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={!canSave}
                className="w-full h-12 rounded-full text-white font-medium text-[15px] disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #FF6F00, #FFA040)",
                  boxShadow: "0 4px 16px rgba(255,111,0,0.3)",
                }}
              >
                {dupHint
                  ? "附近已有同名地点"
                  : isEdit
                  ? "保存修改"
                  : "保存并选用"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
