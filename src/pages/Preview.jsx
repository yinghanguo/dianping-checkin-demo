import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import StatusBar from "../components/StatusBar";

// 拍照完成页（简化版）
// - 主视觉：拍立得风照片 + 日期 + ID（保留情感钩子）
// - 已关联 POI（默认 AI 推荐已选中，可点击修改）
// - 标记同行好友
// - 「下一步」按钮（→ 文案编辑页）
export default function Preview() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const skippedPhoto = params.get("skipped") === "true";

  // 默认 AI 已识别 POI
  const [poi, setPoi] = useState({
    name: "%Arabica 静安寺店",
    distance: "120m",
    confirmed: true,
  });
  const [companions, setCompanions] = useState([]);

  return (
    <div className="absolute inset-0 bg-[#FAFAF7] flex flex-col">
      <StatusBar variant="dark" />

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
        <div className="text-[15px] font-medium text-dpInk">拍照打卡</div>
        <div className="w-9 h-9" />
      </div>

      {/* 主内容滚动区 */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32">
        {/* 拍立得风照片 */}
        {!skippedPhoto ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-2 mb-6"
          >
            <div
              className="bg-white rounded-2xl overflow-hidden mx-auto"
              style={{
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                padding: "10px 10px 50px",
                position: "relative",
              }}
            >
              <div
                className="w-full overflow-hidden rounded-lg"
                style={{ aspectRatio: "4/5" }}
              >
                <img
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 拍立得底部信息 */}
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-dpInk leading-none">
                    05/02
                    <span className="text-xs font-normal text-dpText-secondary ml-1">
                      周六
                    </span>
                  </div>
                  <div className="text-[11px] text-dpText-tertiary mt-0.5">
                    @Niki <span className="px-1 py-px bg-dpOrange/10 text-dpOrange rounded text-[9px] font-medium">Lv8</span>
                  </div>
                </div>
                {/* 重拍按钮 */}
                <button
                  onClick={() => navigate("/camera")}
                  className="text-[11px] text-dpText-secondary flex items-center gap-1 ripple px-2 py-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1015 -6.7L21 8" strokeLinecap="round" />
                    <path d="M21 3v5h-5" strokeLinecap="round" />
                  </svg>
                  重拍
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          // 跳过拍照的占位
          <div className="mt-2 mb-6">
            <button
              onClick={() => navigate("/camera")}
              className="w-full h-32 rounded-2xl border-2 border-dashed border-dpText-quaternary flex flex-col items-center justify-center gap-2 text-dpText-tertiary"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="6" width="18" height="14" rx="2" />
                <circle cx="12" cy="13" r="4" />
                <path d="M9 6l1.5 -3h3l1.5 3" />
              </svg>
              <span className="text-sm">添加照片（可选）</span>
            </button>
          </div>
        )}

        {/* POI 关联卡片 */}
        <div
          className="rounded-2xl bg-white overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <button
            onClick={() => navigate("/poi")}
            className="w-full px-4 py-3.5 flex items-center justify-between ripple"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-full bg-dpGreen-bg flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7BC142" strokeWidth="2">
                  <path d="M12 21l-6-9a7 7 0 1112 0l-6 9z" strokeLinejoin="round" />
                  <circle cx="12" cy="11" r="2.5" />
                </svg>
              </div>
              <div className="text-left min-w-0">
                {poi.confirmed ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[15px] font-medium text-dpInk truncate">
                        {poi.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-px bg-dpOrange-bg text-dpOrange-deep rounded font-medium shrink-0">
                        AI识别
                      </span>
                    </div>
                    <div className="text-[12px] text-dpText-tertiary mt-0.5">
                      距你 {poi.distance} · 点击修改
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[15px] text-dpInk">添加 POI 地点</div>
                    <div className="text-[12px] text-dpText-tertiary mt-0.5">
                      可跳过 · 仅作私域留痕
                    </div>
                  </>
                )}
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="border-t border-[#f5f5f5] mx-4" />

          {/* 标记同行好友 */}
          <button className="w-full px-4 py-3.5 flex items-center justify-between ripple">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FFF6E5] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6F00" strokeWidth="2">
                  <circle cx="9" cy="8" r="3.5" />
                  <circle cx="17" cy="9" r="2.5" />
                  <path d="M3 20a6 6 0 0112 0" strokeLinecap="round" />
                  <path d="M14 20a4 4 0 017 0" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-[15px] text-dpInk">标记同行好友</div>
                <div className="text-[12px] text-dpText-tertiary mt-0.5">
                  让他们也能看到这次打卡
                </div>
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* 提示文案 */}
        <div className="mt-4 text-center text-[12px] text-dpText-tertiary">
          下一步可写感想 · 也可直接发布
        </div>
      </div>

      {/* 底部固定按钮 */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-7 bg-gradient-to-t from-[#FAFAF7] via-[#FAFAF7]/95 to-transparent">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/edit")}
          className="w-full h-12 rounded-full text-white font-medium text-[15px]"
          style={{
            background: "linear-gradient(135deg, #FF6F00, #FFA040)",
            boxShadow: "0 4px 16px rgba(255,111,0,0.3)",
          }}
        >
          下一步:写点什么
        </motion.button>
      </div>
    </div>
  );
}
