import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createRecognizer, isSpeechSupported } from "../utils/speech";

// 语音输入按钮 + 录音蒙层
// props:
//   onTranscript(text): 增量文本回调(直接 append 到 textarea)
//   onError(msg): 错误提示
//   compact: 紧凑模式 - 只显示一个小图标
export default function VoiceInput({ onTranscript, onError, compact = true }) {
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const [supported, setSupported] = useState(true);
  const recogRef = useRef(null);
  const finalSpokenRef = useRef("");

  useEffect(() => {
    setSupported(isSpeechSupported());
    return () => stopRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = () => {
    if (!isSpeechSupported()) {
      onError?.("当前浏览器不支持语音识别,请用 iOS Safari 或 Chrome");
      return;
    }
    finalSpokenRef.current = "";
    const recog = createRecognizer({
      lang: "zh-CN",
      onStart: () => setRecording(true),
      onResult: ({ final, interim }) => {
        if (final) {
          // 把新识别到的最终文字 append
          onTranscript?.(final);
          finalSpokenRef.current += final;
          setInterim("");
        } else {
          setInterim(interim);
        }
      },
      onEnd: () => {
        setRecording(false);
        setInterim("");
      },
      onError: (e) => {
        setRecording(false);
        setInterim("");
        if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
          onError?.("需要麦克风权限,请在 Safari 设置里允许");
        } else if (e?.error === "no-speech") {
          // 用户没说话,静默忽略
        } else {
          onError?.(`语音识别出错: ${e?.error || "未知"}`);
        }
      },
    });
    if (!recog) {
      onError?.("无法启动语音识别");
      return;
    }
    recogRef.current = recog;
    try {
      recog.start();
    } catch (e) {
      onError?.("无法启动:" + (e?.message || ""));
    }
  };

  const stopRecording = () => {
    if (recogRef.current) {
      try {
        recogRef.current.stop();
      } catch {}
      recogRef.current = null;
    }
    setRecording(false);
  };

  const toggle = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  if (!supported) {
    // 浏览器不支持时仍显示按钮但点击会提示
    return (
      <button
        onClick={() => onError?.("当前浏览器不支持语音识别")}
        className="w-9 h-9 rounded-full flex items-center justify-center bg-[#F5F5F5] text-dpText-tertiary"
        title="语音输入"
      >
        <MicIcon />
      </button>
    );
  }

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
          recording
            ? "bg-red-500 text-white"
            : "bg-dpOrange-bg text-dpOrange-deep"
        }`}
        title={recording ? "结束录音" : "语音输入"}
      >
        {recording ? <StopIcon /> : <MicIcon />}
      </motion.button>

      {/* 录音中蒙层 */}
      <AnimatePresence>
        {recording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[90] bg-black/85 flex flex-col items-center justify-center"
            style={{ position: "fixed", inset: 0 }}
            onClick={stopRecording}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-5"
            >
              {/* 跳动波形 */}
              <div className="flex items-end gap-1.5 h-14">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 rounded-full bg-dpOrange"
                    animate={{
                      height: [8, 32 + Math.random() * 18, 8],
                    }}
                    transition={{
                      duration: 0.6 + Math.random() * 0.4,
                      repeat: Infinity,
                      delay: i * 0.08,
                    }}
                  />
                ))}
              </div>
              <div className="text-white text-[16px] font-medium">
                正在听你说……
              </div>
              {/* 实时显示临时识别 */}
              <div className="px-8 max-w-[300px] min-h-[40px]">
                <div className="text-white/70 text-[14px] text-center leading-relaxed">
                  {interim || (
                    <span className="text-white/40">说点什么吧</span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  stopRecording();
                }}
                className="mt-4 px-6 h-11 rounded-full bg-white text-dpInk text-[14px] font-medium"
              >
                完成
              </button>
              <div className="text-white/40 text-[11px]">
                点击屏幕任意位置结束
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="3" width="6" height="13" rx="3" />
      <path d="M5 11a7 7 0 0014 0M12 18v3M9 21h6" strokeLinecap="round" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
