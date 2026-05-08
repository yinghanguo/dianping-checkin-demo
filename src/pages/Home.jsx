import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import StatusBar from "../components/StatusBar";
import Following from "./Following";

// 大众点评首页（精简版）：保留视觉感，重点突出底部加号入口
export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "following" ? "following" : "city";
  const [topTab, setTopTab] = useState(initialTab); // "following" | "city"

  // 顶部分类（参考真实点评首页）
  const categories = [
    { icon: "🍴", label: "美食" },
    { icon: "🛍️", label: "丽人" },
    { icon: "🎬", label: "电影" },
    { icon: "🏨", label: "酒店" },
    { icon: "✈️", label: "周边游" },
    { icon: "🎮", label: "休闲玩乐" },
    { icon: "🏥", label: "医疗" },
    { icon: "🏠", label: "家装" },
    { icon: "💰", label: "团购" },
    { icon: "📚", label: "更多" },
  ];

  // 信息流卡片
  const feeds = [
    {
      title: "上海最值得二刷的咖啡馆，这家排第一",
      author: "咖啡星人小白",
      likes: "2.3w",
      cover:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
      tag: "咖啡馆",
    },
    {
      title: "周末探店 | 静安寺这家融合菜真的绝了",
      author: "Niki",
      likes: "8.6k",
      cover:
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
      tag: "美食",
    },
    {
      title: "上海city walk路线｜法租界一日游攻略",
      author: "走遍上海",
      likes: "1.2w",
      cover:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
      tag: "周边游",
    },
    {
      title: "新晋网红｜安福路的这家小酒馆",
      author: "夜行者",
      likes: "5.4k",
      cover:
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80",
      tag: "酒吧",
    },
  ];

  return (
    <div className="absolute inset-0 bg-white flex flex-col">

      {/* 顶部 Tab 栏 */}
      <div className="px-3 pt-4 pb-2 bg-white flex items-center gap-0">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar flex-1">
          <button
            onClick={() => setTopTab("following")}
            className={`shrink-0 text-[15px] pb-1 relative ${
              topTab === "following" ? "text-dpInk font-bold" : "text-dpText-secondary"
            }`}
          >
            关注
            {topTab === "following" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-dpOrange rounded-full" />
            )}
          </button>
          <button
            onClick={() => setTopTab("city")}
            className={`shrink-0 text-[15px] pb-1 relative flex items-center gap-0.5 ${
              topTab === "city" ? "text-dpInk font-bold" : "text-dpText-secondary"
            }`}
          >
            <span className="text-[10px]">◎</span>上海
            {topTab === "city" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-dpOrange rounded-full" />
            )}
          </button>
          {["附近", "品质外卖", "热点", "美食", "周末"].map((t) => (
            <button key={t} className="shrink-0 text-[15px] pb-1 text-dpText-secondary">
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 顶部搜索区(关注 tab 时隐藏) */}
      <div className={`px-3 pt-1 pb-3 bg-white ${topTab === "following" ? "hidden" : ""}`}>
        <div className="flex items-center gap-2">
          {/* 定位 */}
          <div className="flex items-center gap-0.5 text-[15px] font-medium text-dpInk shrink-0">
            <span>上海</span>
            <span className="text-dpText-tertiary text-xs">▼</span>
          </div>
          {/* 搜索框 */}
          <div className="flex-1 h-9 bg-[#F5F5F5] rounded-full flex items-center px-3 gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#999" strokeWidth="2" />
              <path d="M20 20L17 17" stroke="#999" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-[13px] text-dpText-tertiary">搜索店名/地点/品类</span>
          </div>
          <button className="w-7 h-7 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 3L9 7M19 3L15 7M5 21L9 17M19 21L15 17"
                stroke="#1a1a1a"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 内容区:按 topTab 切换 */}
      {topTab === "following" ? (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          <Following />
        </div>
      ) : (
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* 分类宫格 */}
        <div className="px-3 mb-3 grid grid-cols-5 gap-y-3">
          {categories.map((c) => (
            <div key={c.label} className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-dpOrange-bg flex items-center justify-center text-[22px]">
                {c.icon}
              </div>
              <div className="text-[11px] text-dpText-primary">{c.label}</div>
            </div>
          ))}
        </div>

        {/* 信息流标题 */}
        <div className="px-3 pt-2 pb-2 flex gap-4 border-b border-[#f0f0f0]">
          <div className="text-[15px] font-bold text-dpInk relative pb-1">
            推荐
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[3px] bg-dpOrange rounded-full" />
          </div>
          <div className="text-[15px] text-dpText-secondary">附近</div>
          <div className="text-[15px] text-dpText-secondary">关注</div>
          <div className="text-[15px] text-dpText-secondary">视频</div>
        </div>

        {/* 双列瀑布流 */}
        <div className="px-2 pt-2 grid grid-cols-2 gap-2 pb-32">
          {feeds.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden ripple"
              style={{
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                border: "1px solid #f5f5f5",
              }}
            >
              <div
                className="relative w-full"
                style={{ aspectRatio: i % 2 === 0 ? "3/4" : "4/5" }}
              >
                <img
                  src={f.cover}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-[10px] text-white">
                  {f.tag}
                </div>
              </div>
              <div className="px-2 py-2">
                <div
                  className="text-[13px] font-medium text-dpInk leading-snug"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {f.title}
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] text-dpText-tertiary">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-dpOrange to-dpOrange-light" />
                    {f.author}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span>♡</span>
                    {f.likes}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      )}
      {/* 底部 Tab 栏 */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#f0f0f0]"
        style={{ zIndex: 20, paddingBottom: "24px", paddingTop: "8px" }}
      >
        <div className="flex items-center justify-around relative">
          <div className="flex flex-col items-center gap-0.5 px-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF6F00">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2V9z" />
            </svg>
            <div className="text-[10px] text-dpOrange font-medium">首页</div>
          </div>
          <button
            onClick={() => navigate("/map")}
            className="flex flex-col items-center gap-0.5 px-3"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <path d="M9 5l-6 2v14l6-2 6 2 6-2V3l-6 2-6-2z" strokeLinejoin="round" />
              <path d="M9 5v14M15 7v14" />
            </svg>
            <div className="text-[10px] text-dpText-tertiary">地图</div>
          </button>

          {/* 中央加号——核心入口（占位 + 浮动按钮） */}
          <div className="px-3 relative" style={{ width: 70 }}>
            {/* 占位:仅用于撑开间距 */}
            <div style={{ height: 32 }} />
            <div className="text-[10px] text-transparent">打卡</div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              animate={{
                boxShadow: [
                  "0 4px 16px rgba(255,111,0,0.35)",
                  "0 4px 24px rgba(255,111,0,0.55)",
                  "0 4px 16px rgba(255,111,0,0.35)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={() => navigate("/camera")}
              className="absolute rounded-full flex items-center justify-center"
              style={{
                top: -22,
                left: "50%",
                x: "-50%", // 用 Framer Motion 的 x 属性避免与 scale 冲突
                width: 56,
                height: 56,
                background:
                  "linear-gradient(135deg, #FF6F00, #FFA040)",
                border: "4px solid white",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </motion.button>
          </div>

          <div className="flex flex-col items-center gap-0.5 px-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <path d="M3 7h18M3 12h18M3 17h12" strokeLinecap="round" />
            </svg>
            <div className="text-[10px] text-dpText-tertiary">消息</div>
          </div>
          <button
            onClick={() => navigate("/me")}
            className="flex flex-col items-center gap-0.5 px-3"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0116 0" />
            </svg>
            <div className="text-[10px] text-dpText-tertiary">我的</div>
          </button>
        </div>
      </div>
    </div>
  );
}
