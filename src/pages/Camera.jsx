import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import { usePhoto, MAX_PHOTOS } from "../contexts/PhotoContext";
import { useLocation } from "../contexts/LocationContext";
import VoiceInput from "../components/VoiceInput";
import { optimizeText, generateSuggestions } from "../utils/aiOptimize";
import FriendPicker from "../components/FriendPicker";
import { FRIENDS } from "../data/friends";

// 拍照取景页 + 真实相机接入 + 多张照片(最多 3 张)
// 流程:
//  1. 拍照/相册选 → 进入"已拍胶囊"
//  2. 用户可继续拍 → 最多 3 张
//  3. 用户点"完成" or 拍满 3 张 → Sheet 弹起进入决策
export default function Camera() {
  const navigate = useNavigate();
  const { photos, addPhoto, addPhotos, removePhotoAt, clearPhotos, resetSession, canAddMore, text, setText, visibility, setVisibility, taggedFriends, setTaggedFriends } = usePhoto();
  const {
    requestLocation,
    primaryPOI,
    suggestedPOI,
    poiConfirmed,
    poiSkipped: poiSkippedFlag,
    shortAddress,
    streetAddress,
    permission: locPermission,
    loading: locLoading,
    setUserSelectedPOI,
    setPoiSkipped,
  } = useLocation();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [cameraState, setCameraState] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [showFlash, setShowFlash] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [toast, setToast] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null);
  // ── AI 面板本地 state(showAIPanel/aiLoading 不需要持久化) ──
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showFriendPicker, setShowFriendPicker] = useState(false);

  // 派生:已标记的好友对象
  const taggedFriendObjs = taggedFriends
    .map((id) => FRIENDS.find((f) => f.id === id))
    .filter(Boolean);
  const hasTaggedFriends = taggedFriends.length > 0;

  // 当标记了好友时,如果当前可见范围是 private,自动切到 friends
  React.useEffect(() => {
    if (hasTaggedFriends && visibility === "private") {
      setVisibility("friends");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTaggedFriends]);

  const handleVoiceTranscript = (chunk) => {
    setText((prev) => {
      const needsSpace = prev && !/[\s,。、,!?!？]$/.test(prev);
      return prev + (needsSpace ? " " : "") + chunk;
    });
  };
  const handleVoiceError = (msg) => {
    setToast(msg);
  };

  const hasText = text.trim().length > 0;
  // 是否有任何有效输入(用于发布按钮的可点击判断)
  const hasAnyInput = photos.length > 0 || hasText || poiConfirmed;

  // 进入页面时:如果带 sheet 参数,保留 photos 直接打开 sheet;否则清空开始新流程
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("sheet") === "1") {
      // 从 POI 等子页面返回,重开 sheet 不重置照片
      setShowSheet(true);
    } else {
      // 全新打卡流程:清空所有 session 状态
      resetSession();
      setUserSelectedPOI(null);
      setPoiSkipped(false);
    }
    // 静默请求一次定位(若用户未拒绝过会弹权限弹窗)
    requestLocation().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 启动相机
  useEffect(() => {
    let cancelled = false;
    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setCameraState("error");
          setErrorMsg("当前浏览器不支持调用相机");
          return;
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraState("ready");
      } catch (err) {
        if (cancelled) return;
        if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
          setCameraState("denied");
          setErrorMsg("需要相机权限才能拍照打卡");
        } else if (err?.name === "NotFoundError") {
          setCameraState("error");
          setErrorMsg("没有找到可用的相机");
        } else {
          setCameraState("error");
          setErrorMsg(err?.message || "相机启动失败");
        }
      }
    }
    startCamera();
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode]);

  // toast 自动消失
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const handleFlipCamera = () => {
    setFacingMode((m) => (m === "environment" ? "user" : "environment"));
  };

  // 实际拍照
  const handleShutter = () => {
    if (cameraState !== "ready" || !videoRef.current || !canvasRef.current) return;
    if (!canAddMore) {
      setToast(`最多只能 ${MAX_PHOTOS} 张哦`);
      return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (facingMode === "user") {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    addPhoto(dataUrl);
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);
  };

  // 多选相册
  const handleFilePick = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const room = MAX_PHOTOS - photos.length;
    const toRead = files.slice(0, room);
    if (files.length > room) {
      setToast(`最多 ${MAX_PHOTOS} 张,只取了前 ${room} 张`);
    }
    Promise.all(
      toRead.map(
        (f) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(f);
          })
      )
    ).then((urls) => {
      addPhotos(urls.filter(Boolean));
      // 如果达到 3 张,自动弹 Sheet
      if (photos.length + urls.filter(Boolean).length >= MAX_PHOTOS) {
        setTimeout(() => setShowSheet(true), 200);
      }
    });
    e.target.value = ""; // reset 以便相同文件可再选
  };

  // "完成"按钮 → 进入 Sheet
  const handleDone = () => {
    if (!photos.length) return;
    setShowSheet(true);
  };

  const handlePublish = () => {
    setSubmitting(true);
    setTimeout(() => navigate("/success"), 600);
    // 注意:不在这里立即 reset,因为 success 页可能还要读 photos/text 来展示
    // session reset 由下次进入 camera 页时触发
  };

  // AI 帮你写 / AI 优化 — 真实结合 POI + 照片 + 用户文案
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const handleAIWrite = () => {
    setShowAIPanel(true);
    setAiLoading(true);
    setTimeout(() => {
      setAiSuggestions(generateSuggestions({ poi: primaryPOI || suggestedPOI, photos }));
      setAiLoading(false);
    }, 900);
  };
  const handleAIOptimize = () => {
    if (!text.trim()) {
      handleAIWrite();
      return;
    }
    setAiLoading(true);
    setShowAIPanel(false);
    setTimeout(() => {
      setText(optimizeText({ text, poi: primaryPOI || suggestedPOI, photos }));
      setAiLoading(false);
    }, 700);
  };

  const visibilityConfig = {
    public: { label: "公开", icon: "🌐", desc: "所有人可见" },
    friends: { label: "仅好友", icon: "👥", desc: "通讯录好友可见" },
    private: { label: "仅自己", icon: "🔒", desc: "私域留痕,不分发" },
  };

  const handleRetakeAll = () => {
    setShowSheet(false);
    clearPhotos();
  };

  return (
    <div className="absolute inset-0 bg-black flex flex-col">
      {/* 真实相机视频流 */}
      {(cameraState === "ready" || cameraState === "loading") && (
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: showSheet ? "brightness(0.5) blur(3px)" : "brightness(1)",
            transition: "filter 0.4s ease",
            transform: facingMode === "user" ? "scaleX(-1)" : "none",
          }}
        />
      )}
      <canvas ref={canvasRef} className="hidden" />

      {/* 隐藏的 file inputs */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilePick}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFilePick}
        className="hidden"
      />

      {/* 加载中 */}
      {cameraState === "loading" && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-20 gap-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-dpOrange"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <div className="text-white/80 text-sm">相机启动中…</div>
          <div className="text-white/50 text-xs mt-1">首次使用需允许相机权限</div>
        </div>
      )}

      {/* 错误兜底 */}
      {(cameraState === "denied" || cameraState === "error") && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-20 px-8">
          <div className="bg-white rounded-2xl p-5 max-w-xs">
            <div className="text-[40px] text-center mb-2">
              {cameraState === "denied" ? "📷" : "⚠️"}
            </div>
            <div className="text-[16px] font-semibold text-dpInk text-center mb-1">
              {cameraState === "denied" ? "无法访问相机" : "相机出错了"}
            </div>
            <div className="text-[12px] text-dpText-secondary text-center mb-4">
              {errorMsg}
              {cameraState === "denied" && (
                <>
                  <br />
                  在 Safari 设置里允许后,刷新本页面重试。
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="h-11 rounded-full text-white font-medium text-[13px]"
                style={{
                  background: "linear-gradient(135deg, #FF6F00, #FFA040)",
                }}
              >
                系统相机
              </button>
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="h-11 rounded-full bg-[#F5F5F5] text-dpInk font-medium text-[13px]"
              >
                从相册选
              </button>
            </div>
            <button
              onClick={() => navigate("/")}
              className="w-full h-10 mt-2 text-[13px] text-dpText-tertiary"
            >
              返回首页
            </button>
          </div>
        </div>
      )}

      {/* 顶部栏 */}
      <div className="relative z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-full bg-black/30 flex items-center justify-center"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
            </svg>
          </button>
          {photos.length === 0 && cameraState === "ready" && (
            <button
              onClick={() => navigate("/edit?nophoto=true")}
              className="px-4 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center gap-1"
            >
              <span className="text-white text-sm">跳过</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1" />

      {/* 已拍胶囊 + 完成按钮(有照片时显示) */}
      {photos.length > 0 && cameraState === "ready" && !showSheet && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 px-4 mb-3"
        >
          <div
            className="bg-black/40 backdrop-blur-md rounded-2xl p-2.5 flex items-center gap-2"
            style={{ border: "1px solid rgba(255,255,255,0.15)" }}
          >
            {/* 照片缩略图们 */}
            <div className="flex gap-1.5 flex-1">
              {photos.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative w-12 h-12 rounded-lg overflow-hidden"
                  onClick={() => setPreviewIndex(i)}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  {/* 删除 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhotoAt(i);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/70 flex items-center justify-center"
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </motion.div>
              ))}
              {/* 占位空格(暗示还能拍) */}
              {Array.from({ length: MAX_PHOTOS - photos.length }).map((_, i) => (
                <div
                  key={`slot-${i}`}
                  className="w-12 h-12 rounded-lg border-2 border-dashed border-white/25"
                />
              ))}
            </div>
            {/* 完成按钮 */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDone}
              className="h-10 px-4 rounded-full text-white text-[13px] font-semibold flex items-center gap-1 shrink-0"
              style={{
                background: "linear-gradient(135deg, #FF6F00, #FFA040)",
                boxShadow: "0 2px 8px rgba(255,111,0,0.4)",
              }}
            >
              完成
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </div>
          <div className="text-center text-[11px] text-white/60 mt-1.5">
            已拍 {photos.length}/{MAX_PHOTOS} 张 · {canAddMore ? "可继续拍" : "已满,点完成"}
          </div>
        </motion.div>
      )}

      {/* 底部相机操作区 */}
      {cameraState === "ready" && !showSheet && (
        <div className="relative z-10 pb-12">
          <div className="flex justify-center gap-6 mb-6">
            <span className="text-white/60 text-sm">视频</span>
            <span className="text-white text-sm font-medium relative">
              拍照
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-dpOrange" />
            </span>
          </div>

          <div className="flex items-center justify-around px-8">
            {/* 相册 */}
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="w-12 h-12 rounded-lg bg-black/30 backdrop-blur-md border-2 border-white/40 flex items-center justify-center"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="M21 15l-5-5L5 21" strokeLinecap="round" />
              </svg>
            </button>

            {/* 快门(满 3 张时灰显) */}
            <motion.button
              whileTap={canAddMore ? { scale: 0.92 } : {}}
              onClick={handleShutter}
              className="w-[76px] h-[76px] rounded-full border-[5px] flex items-center justify-center transition-all"
              style={{
                borderColor: canAddMore ? "white" : "rgba(255,255,255,0.3)",
              }}
            >
              <div
                className="w-[58px] h-[58px] rounded-full transition-all"
                style={{
                  background: canAddMore ? "white" : "rgba(255,255,255,0.4)",
                }}
              />
            </motion.button>

            {/* 翻转 */}
            <button
              onClick={handleFlipCamera}
              className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <path d="M3 7v3a4 4 0 004 4h14M21 17v-3a4 4 0 00-4-4H3" strokeLinecap="round" />
                <path d="M16 4l5 3-5 3M8 14l-5 3 5 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 闪屏 */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* 好友选择浮层 */}
      <FriendPicker
        open={showFriendPicker}
        selectedIds={taggedFriends}
        onClose={() => setShowFriendPicker(false)}
        onConfirm={(ids) => {
          setTaggedFriends(ids);
          setShowFriendPicker(false);
        }}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-full bg-black/70 text-white text-[12px] backdrop-blur-md"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 大图预览 - 支持左右滑动 */}
      <AnimatePresence>
        {previewIndex !== null && (
          <PhotoSwiper
            photos={photos}
            initialIndex={previewIndex}
            onClose={() => setPreviewIndex(null)}
          />
        )}
      </AnimatePresence>

      {/* 提交中 */}
      <AnimatePresence>
        {submitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 z-[60] flex items-center justify-center"
          >
            <div className="bg-white rounded-2xl px-6 py-5 flex flex-col items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-dpOrange"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
              <div className="text-[13px] text-dpText-secondary">发布中…</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 拍后 Sheet */}
      <AnimatePresence>
        {showSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSheet(false)}
              className="absolute inset-0 z-40"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 15%, rgba(0,0,0,0.55) 100%)",
              }}
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="absolute left-0 right-0 z-50 bg-white rounded-t-3xl flex flex-col"
              style={{
                bottom: 0,
                height: "92%",
                boxShadow: "0 -10px 40px rgba(0,0,0,0.18)",
              }}
            >
              <div className="pt-2.5 pb-1 flex justify-center shrink-0">
                <div className="w-11 h-1 rounded-full bg-[#e0e0e0]" />
              </div>

              <div className="px-5 pt-2 pb-1 shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[18px] font-bold text-dpInk">
                      捕捉到 {photos.length} 个瞬间 ✨
                    </div>
                    <div className="text-[12px] text-dpText-tertiary mt-0.5">
                      写点什么或直接发布
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSheet(false)}
                    className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4">
                {/* ── 顶部:拍立得照片(居中展示) + 重拍 ── */}
                <div className="mb-4">
                  <PolaroidRow
                    photos={photos}
                    onPreview={(i) => setPreviewIndex(i)}
                    onRemove={(i) => removePhotoAt(i)}
                    onAdd={() => {
                      // 关 sheet 回拍照页继续拍
                      setShowSheet(false);
                    }}
                    maxPhotos={MAX_PHOTOS}
                  />
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={handleRetakeAll}
                      className="flex items-center gap-1 px-3 h-7 rounded-full bg-[#F5F5F5] text-[11px] text-dpText-secondary"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12a9 9 0 1015 -6.7L21 8" strokeLinecap="round" />
                        <path d="M21 3v5h-5" strokeLinecap="round" />
                      </svg>
                      全部重拍
                    </button>
                  </div>
                </div>

                {/* ── 文案输入区(空态简洁,有内容才出 AI 工具) ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl px-3.5 pt-2.5 pb-2.5"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  <div className="flex items-start gap-2">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="记录一下此刻的感受……"
                      className="flex-1 min-h-[72px] outline-none text-[14px] text-dpInk leading-relaxed placeholder:text-dpText-quaternary resize-none bg-transparent"
                    />
                    <div className="shrink-0 mt-0.5">
                      <VoiceInput
                        onTranscript={handleVoiceTranscript}
                        onError={handleVoiceError}
                      />
                    </div>
                  </div>
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
                </motion.div>

                {!hasText && (
                  <button
                    onClick={handleAIWrite}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 text-[12px] text-dpOrange-deep"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
                    </svg>
                    不知道写什么? 让 AI 帮你
                  </button>
                )}

                {/* ── AI 推荐面板 ── */}
                <AnimatePresence>
                  {showAIPanel && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="rounded-2xl p-3 mt-2"
                        style={{
                          background: "linear-gradient(135deg, #FFF6E5 0%, #FFEAD0 100%)",
                          border: "1px solid rgba(255,111,0,0.15)",
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="#FF6F00">
                            <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
                          </svg>
                          <span className="text-[12px] font-medium text-dpOrange-deep">AI 帮你写</span>
                          <button
                            onClick={() => setShowAIPanel(false)}
                            className="ml-auto text-dpText-tertiary"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                        {aiLoading ? (
                          <div className="py-4 flex flex-col items-center gap-2">
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
                            <div className="text-[11px] text-dpText-tertiary">
                              根据照片与地点,生成中……
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {aiSuggestions.map((sg, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setText(sg);
                                  setShowAIPanel(false);
                                }}
                                className="w-full p-2.5 bg-white rounded-xl text-left text-[12px] text-dpInk leading-relaxed ripple"
                              >
                                {sg}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── POI + 同行(移到文案下方) ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4 flex flex-col gap-2"
                >
                  <POICard
                    confirmed={poiConfirmed}
                    skipped={poiSkippedFlag}
                    poi={primaryPOI || suggestedPOI}
                    locLoading={locLoading}
                    shortAddress={shortAddress}
                    onClick={() => navigate("/poi?from=sheet")}
                    onConfirm={() => {
                      // 一键确认 AI 推荐
                      setUserSelectedPOI(suggestedPOI);
                      setPoiSkipped(false);
                    }}
                    onCancel={() => {
                      // 一键取消(已确认 → 私域留痕)
                      setUserSelectedPOI(null);
                      setPoiSkipped(true);
                    }}
                    onUndoSkip={() => {
                      // 私域留痕 → 重新显示 AI 推荐
                      setPoiSkipped(false);
                    }}
                  />

                  <button
                    onClick={() => setShowFriendPicker(true)}
                    className="bg-white rounded-2xl px-3 py-2.5 flex items-center gap-2.5 text-left ripple"
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
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] text-dpInk">标记好友</div>
                      {hasTaggedFriends ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex -space-x-1.5">
                            {taggedFriendObjs.slice(0, 4).map((f, i) => (
                              <div
                                key={f.id}
                                className="w-5 h-5 rounded-full overflow-hidden bg-[#f5f5f5] border-2 border-white"
                                style={{ zIndex: 4 - i }}
                              >
                                <img src={f.avatar} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                          <span className="text-[10px] text-dpText-secondary truncate">
                            {taggedFriendObjs.length === 1
                              ? `@${taggedFriendObjs[0].name}`
                              : `@${taggedFriendObjs[0].name} 等 ${taggedFriendObjs.length} 人`}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-dpText-tertiary mt-0.5">可选 · 通讯录好友</div>
                      )}
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </motion.div>

                {/* ── 可见范围 ── */}
                <div className="mt-5">
                  <div className="text-[13px] font-medium text-dpInk mb-2">谁可以看到</div>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(visibilityConfig).map(([key, conf]) => {
                      const isPrivateDisabled = key === "private" && hasTaggedFriends;
                      const isSelected = visibility === key;
                      return (
                        <button
                          key={key}
                          onClick={() => !isPrivateDisabled && setVisibility(key)}
                          disabled={isPrivateDisabled}
                          className={`p-2.5 rounded-2xl flex flex-col items-center gap-0.5 transition-all ${
                            isSelected
                              ? "bg-dpOrange-bg ring-1 ring-dpOrange/40"
                              : isPrivateDisabled
                              ? "bg-[#F5F5F5] opacity-50"
                              : "bg-[#FAFAF7]"
                          }`}
                        >
                          <span className="text-lg" style={{ filter: isPrivateDisabled ? "grayscale(1)" : "" }}>
                            {conf.icon}
                          </span>
                          <span className={`text-[12px] font-medium ${
                            isSelected ? "text-dpOrange-deep" : isPrivateDisabled ? "text-dpText-quaternary" : "text-dpInk"
                          }`}>
                            {conf.label}
                          </span>
                          <span className="text-[9px] text-dpText-tertiary text-center">
                            {isPrivateDisabled ? "已标记好友" : conf.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── 底部单按钮:发布打卡 ── */}
              <div className="px-5 pt-3 pb-7 shrink-0 bg-white border-t border-[#f5f5f5]">
                <motion.button
                  whileTap={hasAnyInput ? { scale: 0.97 } : {}}
                  onClick={hasAnyInput ? handlePublish : undefined}
                  disabled={!hasAnyInput}
                  className="w-full h-12 rounded-full font-medium text-[15px] flex items-center justify-center gap-2 transition-all"
                  style={
                    hasAnyInput
                      ? {
                          background: "linear-gradient(135deg, #FF6F00, #FFA040)",
                          boxShadow: "0 4px 16px rgba(255,111,0,0.3)",
                          color: "white",
                        }
                      : {
                          background: "#E8E8E8",
                          color: "#AAA",
                        }
                  }
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {hasAnyInput ? "发布打卡" : "添加照片 / 文字 / 地点后发布"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// 拍立得横排:每张一个独立小拍立得,可点击进大图查看
function PolaroidRow({ photos, onPreview, onRemove, onAdd, maxPhotos = 3 }) {
  if (!photos.length) return null;
  const canAddMore = photos.length < maxPhotos;
  return (
    <div className="flex justify-center gap-2.5">
      {photos.map((p, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.85, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 220 }}
          className="bg-white rounded-xl relative shrink-0"
          style={{
            padding: "5px 5px 18px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            width: 92,
          }}
        >
          <button
            onClick={() => onPreview?.(i)}
            className="w-full overflow-hidden rounded-md bg-[#f0f0f0] block"
            style={{ aspectRatio: "4/5" }}
          >
            <img src={p} alt="" className="w-full h-full object-cover" />
          </button>
          {/* 删除 ✕ 按钮 */}
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(i);
              }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/75 flex items-center justify-center z-10 backdrop-blur-md"
              style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <div className="absolute bottom-1.5 left-2 right-2 flex items-baseline justify-between pointer-events-none">
            <span
              className="text-[10px] font-bold text-dpInk leading-none italic"
              style={{ fontFamily: "Georgia, serif" }}
            >
              05/05
            </span>
            <span className="text-[8px] text-dpText-tertiary">{i + 1}/{photos.length}</span>
          </div>
        </motion.div>
      ))}
      {/* + 加号占位:未满时出现 */}
      {canAddMore && onAdd && (
        <motion.button
          initial={{ scale: 0.85, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + photos.length * 0.06, type: "spring", stiffness: 220 }}
          onClick={onAdd}
          className="shrink-0 rounded-xl flex flex-col items-center justify-center gap-1 text-dpText-tertiary"
          style={{
            width: 92,
            aspectRatio: "4 / 5.6", // 同拍立得总高(4:5 photo + 底部 18px)
            border: "2px dashed #d8d8d8",
            background: "rgba(255,255,255,0.5)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          <span className="text-[10px]">再拍一张</span>
        </motion.button>
      )}
    </div>
  );
}

// 大图浏览器:支持左右滑动切换、Esc/点击关闭、底部小圆点指示
function PhotoSwiper({ photos, initialIndex, onClose }) {
  const [idx, setIdx] = useState(initialIndex || 0);
  const goPrev = () => setIdx((i) => Math.max(0, i - 1));
  const goNext = () => setIdx((i) => Math.min(photos.length - 1, i + 1));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[80] bg-black/95 flex flex-col items-center justify-center select-none"
    >
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-12 right-5 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center z-10"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
        </svg>
      </button>

      {/* 主图 + 滑动手势容器 */}
      <div className="flex-1 w-full overflow-hidden flex items-center">
        <motion.div
          className="flex h-full items-center"
          animate={{ x: `-${idx * 100}%` }}
          transition={{ type: "spring", damping: 30, stiffness: 280 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(e, info) => {
            const threshold = 60;
            if (info.offset.x < -threshold && idx < photos.length - 1) goNext();
            else if (info.offset.x > threshold && idx > 0) goPrev();
          }}
          style={{ width: `${photos.length * 100}%` }}
        >
          {photos.map((p, i) => (
            <div
              key={i}
              className="h-full flex items-center justify-center"
              style={{ width: `${100 / photos.length}%` }}
            >
              <img
                src={p}
                alt=""
                draggable={false}
                className="max-w-full max-h-full object-contain pointer-events-none"
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* 底部:页码 + 圆点指示器 */}
      <div className="pb-12 pt-4 flex flex-col items-center gap-3">
        <div className="text-white/80 text-[13px]">
          第 {idx + 1} / {photos.length} 张
        </div>
        {photos.length > 1 && (
          <div className="flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className="rounded-full transition-all"
                style={{
                  width: idx === i ? 22 : 6,
                  height: 6,
                  background:
                    idx === i ? "white" : "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// POI 卡片(待确认 vs 已确认 两态)
function POICard({ confirmed, skipped, poi, locLoading, shortAddress, onClick, onConfirm, onCancel, onUndoSkip }) {
  if (locLoading && !poi) {
    return (
      <button
        onClick={onClick}
        className="bg-white rounded-2xl px-3 py-2.5 flex items-center gap-2.5 text-left ripple"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <path d="M12 21l-6-9a7 7 0 1112 0l-6 9z" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1 text-left">
          <div className="text-[13px] text-dpInk">正在定位…</div>
        </div>
      </button>
    );
  }

  // 私域留痕态(用户取消了 AI 推荐)——点击卡片可重新选择
  if (skipped) {
    return (
      <button
        onClick={onClick}
        className="w-full bg-white rounded-2xl px-3 py-2.5 flex items-center gap-2.5 text-left ripple"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <path d="M12 21l-6-9a7 7 0 1112 0l-6 9z" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-dpInk">添加地点</div>
          <div className="text-[10px] text-dpText-tertiary mt-0.5">点击选择 · 不关联则为私域留痕</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    );
  }

  if (!poi) {
    return (
      <button
        onClick={onClick}
        className="bg-white rounded-2xl px-3 py-2.5 flex items-center gap-2.5 text-left ripple"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <path d="M12 21l-6-9a7 7 0 1112 0l-6 9z" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1 text-left">
          <div className="text-[13px] text-dpInk">添加地点</div>
          <div className="text-[10px] text-dpText-tertiary mt-0.5">无地点 · 私域留痕</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    );
  }

  // 已确认态 = 绿色实色 + 勾;待确认态 = 灰虚框 + AI 推荐
  const distLine = shortAddress
    ? `${shortAddress}${poi.distance ? ` · 距你 ${poi.distance}` : ""}`
    : poi.distance || "120m";

  if (confirmed) {
    return (
      <div
        className="bg-white rounded-2xl px-3 py-2.5 flex items-center gap-2 relative"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        {/* 主区:点击进 POI 页修改 */}
        <button
          onClick={onClick}
          className="flex-1 flex items-center gap-2.5 text-left min-w-0"
        >
          <div className="w-8 h-8 rounded-full bg-dpGreen-bg flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7BC142" strokeWidth="2.5">
              <path d="M12 21l-6-9a7 7 0 1112 0l-6 9z" strokeLinejoin="round" />
              <circle cx="12" cy="11" r="2" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-semibold text-dpInk truncate">
                {poi.name}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#7BC142">
                <path d="M9 16.2l-3.5-3.5a1 1 0 011.4-1.4L9 13.4l7.1-7.1a1 1 0 011.4 1.4l-7.8 7.8a1 1 0 01-1.4 0z" />
              </svg>
            </div>
            <div className="text-[10px] text-dpText-tertiary mt-0.5 truncate">
              {distLine}
            </div>
          </div>
        </button>

        {/* 右侧:修改按钮(只能换，不能删) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0"
          title="修改地点"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    );
  }

  // 待确认 - AI 推荐(灰色虚框 + 橙色 AI 推荐标签 + 右侧 ✓ / ✕ 一键操作)
  return (
    <div
      className="rounded-2xl px-3 py-2.5 flex items-center gap-2 relative"
      style={{
        background: "#FAFAFA",
        border: "1.5px dashed #d8d8d8",
      }}
    >
      <button
        onClick={onClick}
        className="flex-1 flex items-center gap-2.5 text-left min-w-0"
      >
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <path d="M12 21l-6-9a7 7 0 1112 0l-6 9z" strokeLinejoin="round" />
            <circle cx="12" cy="11" r="2" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-semibold text-dpInk truncate">
              {poi.name}
            </span>
            <span
              className="text-[9px] px-1.5 py-px text-white rounded-full font-bold shrink-0 flex items-center gap-0.5"
              style={{
                background: "linear-gradient(135deg, #FF6F00, #FFA040)",
              }}
            >
              <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
              </svg>
              AI 推荐
            </span>
          </div>
          <div className="text-[10px] text-dpText-tertiary mt-0.5 truncate">
            点卡片可进搜索 · 右侧一键确认 / 取消
          </div>
        </div>
      </button>

      {/* 右侧 ✓ / ✕ 一键按钮组 */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onCancel && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            title="取消关联"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5">
              <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {onConfirm && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #FF6F00, #FFA040)",
              boxShadow: "0 2px 8px rgba(255,111,0,0.35)",
            }}
            title="一键确认关联"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="M5 12l5 5 9-9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        )}
      </div>
    </div>
  );
}
