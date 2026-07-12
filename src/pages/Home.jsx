import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import Following from "./Following";
import { getList, loadLists } from "../data/lists";
import { STORE_INFO, SH_IMG, shPoi } from "../data/shanghaiStores";

// 大众点评首页(对齐真实样式):顶部 Tab、搜索条、分类宫格、点评榜单/免费试双卡、双列瀑布流
// 清单植入:信息流清单卡片(四宫格封面+人格化头像前置)
export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "following" ? "following" : "city";
  const [topTab, setTopTab] = useState(initialTab);

  const categories = [
    { icon: "🍗", label: "美食", to: "/food" },
    { icon: "🍹", label: "休闲玩乐" },
    { icon: "🏨", label: "酒店民宿" },
    { icon: "🏝️", label: "景点游玩" },
    { icon: "🐱", label: "电影演出" },
    { icon: "💆", label: "医美" },
    { icon: "🉐", label: "特价团" },
    { icon: "🛍️", label: "商场购物" },
    { icon: "🦶", label: "按摩足疗" },
    { icon: "💇", label: "丽人美发" },
  ];

  const feeds = [
    {
      title: "没想到开年后，上海的第一家排队网红店竟是这里",
      author: "S.Y.D.又饿了",
      lv: "Lv8",
      likes: "74",
      cover: SH_IMG.lighthouse,
      tag: "669m",
      poi: "贰楼 The Lighthouse-亚洲小馆(丰盛里店)",
    },
    {
      title: "上海最值得二刷的咖啡馆，这家排第一",
      author: "咖啡星人小白",
      likes: "2.3w",
      cover: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
      tag: "咖啡馆",
    },
    {
      title: "周末探店 | 静安寺这家融合菜真的绝了",
      author: "Niki",
      likes: "8.6k",
      cover: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
      tag: "美食",
    },
    {
      title: "新晋网红｜安福路的这家小酒馆",
      author: "夜行者",
      likes: "5.4k",
      cover: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80",
      tag: "酒吧",
    },
  ];

  return (
    <div className="absolute inset-0 bg-white flex flex-col">

      {/* ── 顶部 Tab 栏 ── */}
      <div className="px-3 pt-4 pb-1 bg-white flex items-center gap-0">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar flex-1">
          <button
            onClick={() => setTopTab("following")}
            className={`shrink-0 text-[16px] pb-1 relative ${
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
            className={`shrink-0 text-[16px] pb-1 relative flex items-center gap-0.5 ${
              topTab === "city" ? "text-dpInk font-bold" : "text-dpText-secondary"
            }`}
          >
            上海<span className="text-[9px] mt-0.5">▾</span>
            {topTab === "city" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-dpOrange rounded-full" />
            )}
          </button>
          <button
            onClick={() => setTopTab("nearby")}
            className={`shrink-0 text-[16px] pb-1 relative ${
              topTab === "nearby" ? "text-dpInk font-bold" : "text-dpText-secondary"
            }`}
          >
            附近
            {topTab === "nearby" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-dpOrange rounded-full" />
            )}
          </button>
          {["品质外卖", "热点", "周末去哪", "旅"].map((t) => (
            <button key={t} className="shrink-0 text-[16px] pb-1 text-dpText-secondary">
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── 搜索条(金币 + 扫一扫 + 相机 + 搜索按钮) ── */}
      <div className={`px-3 pt-2 pb-3 bg-white flex items-center gap-2 ${topTab === "following" ? "hidden" : ""}`}>
        <div className="shrink-0 flex flex-col items-center" style={{ width: 40 }}>
          <span className="text-[22px] leading-none">🪙</span>
          <span className="text-[8px] mt-0.5 px-1 rounded-full text-white" style={{ background: "#FF6F00" }}>得金币</span>
        </div>
        <button
          onClick={() => navigate("/search")}
          className="flex-1 h-10 rounded-full flex items-center pl-3 pr-1 gap-2"
          style={{ border: "1.5px solid #FF6F00" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8">
            <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" strokeLinecap="round" />
            <path d="M7 12h10" strokeLinecap="round" />
          </svg>
          <span className="flex-1 text-left text-[14px] text-dpText-secondary">南京西路</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.8" className="mr-1.5">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span
            className="h-8 px-4 rounded-full text-white text-[14px] font-medium flex items-center shrink-0"
            style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
          >
            搜索
          </span>
        </button>
      </div>

      {/* 内容区 */}
      {topTab === "following" ? (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          <Following />
        </div>
      ) : topTab === "nearby" ? (
        <NearbyTab navigate={navigate} />
      ) : (
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* ── 分类宫格(2×5) ── */}
        <div className="px-3 mb-3 grid grid-cols-5 gap-y-3">
          {categories.map((c) => (
            <button
              key={c.label}
              onClick={() => c.to && navigate(c.to)}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-12 h-12 rounded-2xl bg-dpOrange-bg flex items-center justify-center text-[24px]">
                {c.icon}
              </div>
              <div className="text-[11.5px] text-dpText-primary">{c.label}</div>
            </button>
          ))}
        </div>

        {/* ── 中通 banner:私藏杯活动主入口(开赛周/决胜周两波强投) ── */}
        <button
          onClick={() => navigate("/pk")}
          className="mx-2.5 mb-3 rounded-2xl px-4 py-3 flex items-center gap-3 text-left relative overflow-hidden"
          style={{ background: "linear-gradient(120deg, #2B1200 0%, #7A2E00 60%, #E65000 140%)", width: "calc(100% - 20px)" }}
        >
          <div className="absolute -right-4 -bottom-5 text-[56px] opacity-20 rotate-12 select-none">🏆</div>
          <div className="shrink-0 px-1.5 h-5 rounded flex items-center text-[10px] font-bold text-white" style={{ background: "#FF6F00" }}>
            开赛中
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-bold text-white">私藏杯 · 上海站</div>
            <div className="text-[10.5px] mt-0.5" style={{ color: "#FFB27A" }}>
              收藏是心动，打卡才是真爱 · 冠军由真实打卡决出
            </div>
          </div>
          <span className="shrink-0 text-[11px] text-white/80">去围观 ›</span>
        </button>

        {/* ── 点评榜单 / 免费试 双卡 ── */}
        <div className="px-2.5 mb-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate("/rankboard")}
            className="rounded-2xl p-3 text-left"
            style={{ background: "linear-gradient(135deg, #FFF8E8, #FFF2D8)" }}
          >
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[14px] font-black" style={{ color: "#C8541A" }}>点评榜单</span>
              <span className="text-[10px]" style={{ color: "#D98E4E" }}>吃喝玩乐指南 ›</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0">
                <img src={SH_IMG.soso} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold text-dpInk truncate">SOSO盐面包</div>
                <div className="text-[11px] mt-0.5">
                  <span style={{ color: "#C8541A" }} className="font-medium">热门榜第3名</span>
                  <span className="text-dpText-tertiary ml-1">499m</span>
                </div>
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate("/free-trial")}
            className="rounded-2xl p-3 text-left"
            style={{ background: "linear-gradient(135deg, #FFF0F5, #FFE5F0)" }}
          >
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[14px] font-black" style={{ color: "#D6336C" }}>免费试</span>
              <span className="text-[10px]" style={{ color: "#E38" }}>2万个活动在线 ›</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0">
                <img src={SH_IMG.shengengzai} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold text-dpInk truncate">神更仔·潮汕魂大排档</div>
                <div className="text-[11px] mt-0.5">
                  <span className="font-bold" style={{ color: "#D6336C" }}>¥0</span>
                  <span className="text-dpText-tertiary line-through ml-1">¥360</span>
                  <span className="text-dpText-tertiary ml-1">2.0km</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* ── 双列瀑布流(清单卡片穿插) ── */}
        <div className="px-2 pt-1 grid grid-cols-2 gap-2 pb-32">
          <FeedCard
            feed={feeds[0]}
            onClick={() =>
              navigate("/store", {
                state: { poi: shPoi(feeds[0].poi), photo: feeds[0].cover },
              })
            }
          />
          {/* 清单卡片:私藏清单在信息流的分发形态 */}
          <ListFeedCard navigate={navigate} />
          {feeds.slice(1).map((f, i) => (
            <FeedCard key={i} feed={f} />
          ))}
        </div>
      </div>
      )}

      {/* ── 底部 Tab 栏 ── */}
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
          <button onClick={() => navigate("/map")} className="flex flex-col items-center gap-0.5 px-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <path d="M9 5l-6 2v14l6-2 6 2 6-2V3l-6 2-6-2z" strokeLinejoin="round" />
              <path d="M9 5v14M15 7v14" />
            </svg>
            <div className="text-[10px] text-dpText-tertiary">地图</div>
          </button>

          <div className="px-3 relative" style={{ width: 70 }}>
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
                x: "-50%",
                width: 56,
                height: 56,
                background: "linear-gradient(135deg, #FF6F00, #FFA040)",
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
          <button onClick={() => navigate("/me")} className="flex flex-col items-center gap-0.5 px-3">
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

// ── 普通内容卡 ──
function FeedCard({ feed, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl overflow-hidden ripple text-left"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f5f5f5" }}
    >
      <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
        <img src={feed.cover} alt="" className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-[10px] text-white">
          {feed.tag}
        </div>
      </div>
      <div className="px-2 py-2">
        <div
          className="text-[13px] font-medium text-dpInk leading-snug"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {feed.title}
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-dpText-tertiary">
          <div className="flex items-center gap-1 min-w-0">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-dpOrange to-dpOrange-light shrink-0" />
            <span className="truncate">{feed.author}</span>
            {feed.lv && (
              <span className="text-[8px] px-0.5 rounded shrink-0" style={{ background: "#FFF3E0", color: "#C8541A" }}>{feed.lv}</span>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <span>♡</span>
            {feed.likes}
          </div>
        </div>
      </div>
    </button>
  );
}

// ── 信息流清单卡片:四宫格封面 + 主题 + 创作者(人格化:头像前置);支持外部传入清单(附近 Tab 复用) ──
function ListFeedCard({ navigate, list: listProp }) {
  const list = listProp || getList("list_f_njxl_richang");
  if (!list) return null;
  const photos = list.items.map((it) => it.photo).slice(0, 4);
  return (
    <button
      onClick={() => navigate(`/album/${list.id}`, { state: { src: "public" } })}
      className="bg-white rounded-xl overflow-hidden text-left"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #FFE0C7" }}
    >
      <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px bg-white">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-[#f0f0f0] overflow-hidden">
              {photos[i % photos.length] && (
                <img src={photos[i % photos.length]} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
        <div
          className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] text-white font-medium flex items-center gap-0.5"
          style={{ background: "rgba(255,111,0,0.9)" }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinejoin="round" />
          </svg>
          私藏清单
        </div>
        <div
          className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md text-[9px] text-white"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          {list.items.length} 家店
        </div>
      </div>
      <div className="px-2 py-2">
        <div
          className="text-[13px] font-medium text-dpInk leading-snug"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {list.title}
        </div>
        <div className="text-[11px] text-dpText-secondary mt-1 truncate">“{list.items[0]?.reason}”</div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-dpText-tertiary">
          <div className="flex items-center gap-1 min-w-0">
            <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 bg-[#f0f0f0]">
              <img src={list.owner.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="truncate">{list.owner.name}</span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <span>♡</span>
            {list.likeCount}
          </div>
        </div>
      </div>
    </button>
  );
}

// ── 附近 Tab:附近活动/热门打卡 + 瀑布流(笔记与「附近的清单」混排分发) ──
const NEARBY_NOTES = [
  { title: "单方面宣布爱上静安寺商圈这家店😍", author: "盈美·科颜Skin Clinic", likes: 42, img: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&q=80", poi: "盈美·科颜Skin Clinic", dist: "1.5km" },
  { title: "爱上网球是我的宿命☀️🎾", author: "lulu", likes: 69, img: "https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=600&q=80", poi: "QuickQuash网球·匹克球", dist: "1.2km" },
  { title: "这个小肚肚也太好戳了🤣", author: "清風徐來821", likes: 178, img: "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&q=80", poi: "Happiness Coffee", dist: "1.5km" },
  { title: "预计明天上海有19w人来抢60r的粒子狂热", author: "欣欣可爱不动了u", likes: 3, img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80", poi: "开时仓OPENMAXX", dist: "424m" },
];

function NearbyTab({ navigate }) {
  // 附近的清单:公开的上海清单按热度取前几份,穿插进瀑布流
  const nearbyLists = React.useMemo(
    () =>
      loadLists()
        .filter((l) => l.visibility === "public" && l.owner?.id !== "me" && l.items.some((it) => it.poi?.city === "上海"))
        .sort((a, b) => (b.saveCount || 0) - (a.saveCount || 0))
        .slice(0, 3),
    []
  );
  const dists = ["500m", "1.2km", "800m"];

  // 双列瀑布流:笔记 + 清单混排(左右列交替塞)
  const cells = [];
  let ni = 0;
  nearbyLists.forEach((l, i) => {
    if (NEARBY_NOTES[ni]) cells.push({ type: "note", data: NEARBY_NOTES[ni++] });
    cells.push({ type: "list", data: l, dist: dists[i % dists.length] });
    if (NEARBY_NOTES[ni]) cells.push({ type: "note", data: NEARBY_NOTES[ni++] });
  });
  while (NEARBY_NOTES[ni]) cells.push({ type: "note", data: NEARBY_NOTES[ni++] });

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
      {/* 定位 + 筛选 chips */}
      <div className="px-3 pt-1 pb-2 flex items-center gap-2">
        <span className="flex items-center gap-0.5 text-[13px] font-medium text-dpInk shrink-0">
          📍 新福康里 <span className="text-[9px]">▾</span>
        </span>
        <div className="flex gap-1.5 ml-auto">
          {["附近1km", "好吃", "好玩"].map((c) => (
            <span key={c} className="px-2.5 h-7 rounded-full bg-[#F5F5F5] text-[12px] text-dpText-secondary flex items-center">{c}</span>
          ))}
        </div>
      </div>

      {/* 附近活动 / 热门打卡 双卡 */}
      <div className="px-2.5 grid grid-cols-2 gap-2 mb-2">
        <div className="bg-white rounded-2xl p-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="text-[14px] font-bold text-dpInk mb-2">附近活动 ›</div>
          <button
            onClick={() => navigate("/pk")}
            className="w-full flex items-center gap-2 text-left"
          >
            <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0" style={{ background: "linear-gradient(120deg,#2B1200,#7A2E00)" }}>
              <div className="w-full h-full flex items-center justify-center text-[20px]">🏆</div>
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-semibold text-dpInk leading-snug">私藏杯·上海站｜打卡即助攻</div>
              <div className="text-[10px] text-dpText-tertiary mt-0.5">开赛中 · 567m</div>
            </div>
          </button>
        </div>
        <div className="bg-white rounded-2xl p-3" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="text-[14px] font-bold text-dpInk mb-1.5">热门打卡 ›</div>
          {[
            { r: 1, name: "王富贵火锅", n: "13623打卡", d: "1.8km" },
            { r: 2, name: "3号仓库·创意中国", n: "8631打卡", d: "1.5km" },
            { r: 3, name: "O'eat", n: "8477打卡", d: "681m" },
          ].map((s) => (
            <div key={s.r} className="flex items-center gap-1.5 py-0.5">
              <span className="w-4 h-4 rounded text-[10px] font-bold text-white flex items-center justify-center shrink-0" style={{ background: s.r === 1 ? "#FF6F00" : s.r === 2 ? "#FF9838" : "#FFC08A" }}>{s.r}</span>
              <span className="text-[11px] font-medium text-dpInk truncate flex-1">{s.name}</span>
              <span className="text-[9.5px] text-dpText-tertiary shrink-0">{s.n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 瀑布流:笔记 + 附近的清单混排 */}
      <div className="px-2 grid grid-cols-2 gap-2 items-start">
        {[0, 1].map((col) => (
          <div key={col} className="space-y-2">
            {cells.filter((_, i) => i % 2 === col).map((cell, i) =>
              cell.type === "list" ? (
                <div key={`l${i}`} className="relative">
                  <ListFeedCard navigate={navigate} list={cell.data} />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[9px] text-white" style={{ background: "rgba(0,0,0,0.5)" }}>
                    离你 {cell.dist}
                  </div>
                </div>
              ) : (
                <NearbyNoteCard key={`n${i}`} note={cell.data} />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NearbyNoteCard({ note }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f5f5f5" }}>
      <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
        <img src={note.img} alt="" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md text-[9px] text-white flex items-center gap-0.5" style={{ background: "rgba(0,0,0,0.5)" }}>
          📍 {note.poi} | {note.dist}
        </div>
      </div>
      <div className="px-2 py-2">
        <div className="text-[13px] font-medium text-dpInk leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {note.title}
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] text-dpText-tertiary">
          <div className="flex items-center gap-1 min-w-0">
            <div className="w-4 h-4 rounded-full overflow-hidden bg-[#f0f0f0] shrink-0">
              <img src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(note.author)}&backgroundColor=ffdfbf`} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="truncate">{note.author}</span>
          </div>
          <span className="shrink-0">♡ {note.likes}</span>
        </div>
      </div>
    </div>
  );
}
