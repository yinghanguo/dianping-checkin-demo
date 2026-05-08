import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import { usePhoto, MAX_PHOTOS } from "../contexts/PhotoContext";
import { useLocation } from "../contexts/LocationContext";
import VoiceInput from "../components/VoiceInput";

// 完整编辑页(合并版 v2)
// 排版顺序:
//  1. 照片缩略图
//  2. 文案输入(空态只有语音 → 输入后浮现 AI 帮我写 / AI 优化 / 字数)
//  3. POI 卡片 + 同行入口
//  4. 可见范围
//  5. 底部发布按钮
export default function Edit() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const noPhoto = params.get("nophoto") === "true";

  const { photos, removePhotoAt, text, setText, visibility, setVisibility } = usePhoto();
  const { primaryPOI, shortAddress, poiSkipped } = useLocation();
  const effectiveNoPoi = poiSkipped || !primaryPOI;

  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [voiceError, setVoiceError] = useState(null);

  const aiSuggestions = [
    "店里那盏暖光吊灯,把午后照得刚刚好。一杯西达摩坐下来,半个下午就过去了。",
    "周六的咖啡时刻,光线慢慢往窗边斜过去,什么都不用做。",
    "在静安寺的角落发现这家,氛围治愈,适合一个人放空。",
  ];

  const handleAIWrite = () => {
    setShowAIPanel(true);
    setAiLoading(true);
    setTimeout(() => setAiLoading(false), 1200);
  };

  const handleAIOptimize = () => {
    if (!text.trim()) {
      handleAIWrite();
      return;
    }
    setAiLoading(true);
    setTimeout(() => {
      setText(text + " 慢慢喝,慢慢看,这种状态最近真是难得。");
      setAiLoading(false);
    }, 800);
  };

  // 语音追加文本(VoiceInput 实时回调)
  const handleVoiceTranscript = (chunk) => {
    setText((prev) => {
      // 如果已有文本且不以空格/标点结尾,加个空格
      const needsSpace = prev && !/[\s,。、,!?！？]$/.test(prev);
      return prev + (needsSpace ? " " : "") + chunk;
    });
  };

  const visibilityConfig = {
    public: { label: "公开", icon: "🌐", desc: "所有人可见" },
    friends: { label: "仅好友", icon: "👥", desc: "通讯录好友可见" },
    private: { label: "仅自己", icon: "🔒", desc: "私域留痕,不分发" },
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="absolute inset-0 bg-[#FAFAF7] flex flex-col">

      {/* 顶部栏 */}
      <div className="px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-[15px] font-medium text-dpInk">发布打卡</div>
        <div className="w-9 h-9" />
      </div>

      {/* 滚动区 */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* ── 1. 照片缩略图 ── */}
        <div className="px-5 pt-2">
          {!noPhoto && photos.length > 0 && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex gap-2 mb-4"
            >
              {photos.map((p, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#f0f0f0]">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhotoAt(i)}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center"
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  onClick={() => navigate("/camera")}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-dpText-quaternary flex items-center justify-center text-dpText-tertiary"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </motion.div>
          )}
          {(noPhoto || photos.length === 0) && (
            <button
              onClick={() => navigate("/camera")}
              className="w-full h-14 mb-4 rounded-xl border-2 border-dashed border-dpText-quaternary flex items-center justify-center gap-2 text-dpText-tertiary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="6" width="18" height="14" rx="2" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span className="text-[12px]">添加照片(可选)</span>
            </button>
          )}
        </div>

        {/* ── 2. 文案输入区 ── */}
        <div className="px-5">
          <div className="bg-white rounded-2xl px-4 pt-3 pb-3"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-start gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="记录一下此刻的感受……"
                className="flex-1 min-h-[88px] outline-none text-[14px] text-dpInk leading-relaxed placeholder:text-dpText-quaternary resize-none bg-transparent"
              />
              {/* 语音按钮 - 始终在右上角 */}
              <div className="shrink-0 mt-0.5">
                <VoiceInput
                  onTranscript={handleVoiceTranscript}
                  onError={(msg) => {
                    setVoiceError(msg);
                    setTimeout(() => setVoiceError(null), 3000);
                  }}
                />
              </div>
            </div>

            {/* 有内容时才显示:字数 + AI 工具 */}
            <AnimatePresence>
              {hasText && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f5f5f5]">
                    <button
                      onClick={handleAIOptimize}
                      className="flex items-center gap-1 px-2.5 h-7 rounded-full bg-dpOrange-bg text-dpOrange-deep text-[11px]"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
                      </svg>
                      AI 优化
                    </button>
                    <span className="text-[10px] text-dpText-tertiary">
                      {text.length} / 500
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 空态提示:点击 AI 帮我写 */}
          {!hasText && (
            <button
              onClick={handleAIWrite}
              className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 text-[12px] text-dpOrange-deep"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
              </svg>
              不知道写什么? 让 AI 帮你
            </button>
          )}
        </div>

        {/* AI 辅助面板 */}
        <AnimatePresence>
          {showAIPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mx-5 mt-2 rounded-2xl p-3.5"
                style={{
                  background: "linear-gradient(135deg, #FFF6E5 0%, #FFEAD0 100%)",
                  border: "1px solid rgba(255,111,0,0.15)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-2.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF6F00">
                    <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
                  </svg>
                  <span className="text-[13px] font-medium text-dpOrange-deep">AI 帮你写</span>
                  <button
                    onClick={() => setShowAIPanel(false)}
                    className="ml-auto text-dpText-tertiary"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                {aiLoading ? (
                  <div className="py-6 flex flex-col items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-dpOrange"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                    <div className="text-[12px] text-dpText-tertiary">
                      根据照片与地点,生成中……
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {aiSuggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setText(s);
                          setShowAIPanel(false);
                        }}
                        className="w-full p-3 bg-white rounded-xl text-left text-[13px] text-dpInk leading-relaxed ripple"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 3. POI + 同行 (移到文案下方) ── */}
        <div className="px-5 pt-5 flex flex-col gap-2">
          {/* POI 卡片 */}
          <button
            onClick={() => navigate("/poi?from=edit")}
            className="bg-white rounded-xl px-3 py-2.5 flex items-center gap-2 ripple"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            {effectiveNoPoi ? (
              <>
                <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                    <path d="M12 21l-6-9a7 7 0 1112 0l-6 9z" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-[13px] text-dpInk">添加地点</div>
                  <div className="text-[10px] text-dpText-tertiary">
                    无地点 · 私域留痕
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-dpGreen-bg flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7BC142" strokeWidth="2.5">
                    <path d="M12 21l-6-9a7 7 0 1112 0l-6 9z" strokeLinejoin="round" />
                    <circle cx="12" cy="11" r="2" />
                  </svg>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] font-medium text-dpInk truncate">
                      {primaryPOI?.name || "附近地点"}
                    </span>
                    <span className="text-[9px] px-1 py-px bg-dpOrange-bg text-dpOrange-deep rounded font-bold shrink-0">
                      AI
                    </span>
                  </div>
                  <div className="text-[10px] text-dpText-tertiary mt-0.5 truncate">
                    {shortAddress || primaryPOI?.distance || "120m"} · 点击修改
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>

          {/* 标记同行 */}
          <button
            className="bg-white rounded-xl px-3 py-2.5 flex items-center gap-2 ripple"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div className="w-8 h-8 rounded-full bg-[#FFF6E5] flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6F00" strokeWidth="2">
                <circle cx="9" cy="8" r="3" />
                <path d="M3 20a6 6 0 0112 0" strokeLinecap="round" />
                <circle cx="17" cy="9" r="2" />
                <path d="M14 20a4 4 0 017 0" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <div className="text-[13px] text-dpInk">标记同行</div>
              <div className="text-[10px] text-dpText-tertiary mt-0.5">
                可选
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── 4. 可见范围 ── */}
        <div className="px-5 pt-5">
          <div className="text-[13px] font-medium text-dpInk mb-2">谁可以看到</div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(visibilityConfig).map(([key, conf]) => (
              <button
                key={key}
                onClick={() => setVisibility(key)}
                className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                  visibility === key
                    ? "bg-dpOrange-bg ring-1 ring-dpOrange/40"
                    : "bg-white"
                }`}
                style={
                  visibility !== key
                    ? { boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }
                    : {}
                }
              >
                <span className="text-xl">{conf.icon}</span>
                <span className={`text-[13px] font-medium ${
                  visibility === key ? "text-dpOrange-deep" : "text-dpInk"
                }`}>
                  {conf.label}
                </span>
                <span className="text-[10px] text-dpText-tertiary text-center">
                  {conf.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 语音错误 toast */}
      <AnimatePresence>
        {voiceError && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-full bg-black/80 text-white text-[12px] backdrop-blur-md max-w-[80%] text-center"
          >
            {voiceError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部固定按钮 */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-7 bg-gradient-to-t from-[#FAFAF7] via-[#FAFAF7]/95 to-transparent">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/success")}
          className="w-full h-12 rounded-full text-white font-medium text-[15px]"
          style={{
            background: "linear-gradient(135deg, #FF6F00, #FFA040)",
            boxShadow: "0 4px 16px rgba(255,111,0,0.3)",
          }}
        >
          发布打卡
        </motion.button>
      </div>
    </div>
  );
}
