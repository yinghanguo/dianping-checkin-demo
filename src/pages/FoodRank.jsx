import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { shPoi } from "../data/shanghaiStores";

// 大众点评榜单(必吃榜大卡样式)—— 美食频道「美食排行」入口(对齐图4)
const IMG = {
  xianzhu: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=700&q=75",
  dimsum: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=700&q=75",
  seafood: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=700&q=75",
};

const CATE_TABS = ["全部美食", "特色菜", "面包蛋糕甜品", "西餐"];
const LIST_TABS = ["必吃榜", "黑珍珠", "热门榜", "好评榜", "口味榜"];

const CARDS = [
  {
    name: "鲜主·牛肉海鲜·排档火锅(CP静安店)", img: IMG.xianzhu,
    badge: "必吃榜", newYear: "2026年新上榜", banner: "新鲜牛肉每日现切，可选海鲜种类丰富",
    rating: 4.7, price: 90, cat: "海鲜火锅", biz: "静安寺商圈", dist: "1.5km",
    rec: "174人推荐“（灰盘）现切牛肉”",
  },
  {
    name: "神更仔·潮汕魂大排档(汉口路店)", img: IMG.dimsum,
    badge: "必吃榜", newYear: "2026年上榜", banner: "潮汕生腌天花板，带外地朋友来从没失手",
    rating: 4.6, price: 128, cat: "潮汕菜", biz: "人民广场商圈", dist: "2.0km",
    rec: "301人推荐“潮汕生腌拼盘”", coupon: true,
  },
];

function HalfStars({ rating }) {
  return (
    <div className="flex items-center gap-px">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(1, Math.max(0, rating - (i - 1)));
        return (
          <div key={i} className="relative" style={{ width: 15, height: 15 }}>
            <svg viewBox="0 0 12 12" className="absolute inset-0"><path d="M6 0.5l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8l-3 1.6.6-3.3L1.2 4l3.3-.5z" fill="#e8e8e8" /></svg>
            <svg viewBox="0 0 12 12" className="absolute inset-0" style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}><path d="M6 0.5l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8l-3 1.6.6-3.3L1.2 4l3.3-.5z" fill="#FF6F00" /></svg>
          </div>
        );
      })}
    </div>
  );
}

export default function FoodRank() {
  const navigate = useNavigate();
  const [cate, setCate] = useState("全部美食");
  const [listTab, setListTab] = useState("必吃榜");

  return (
    <div className="absolute inset-0 bg-[#F5F5F5] flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        {/* 深色 Hero */}
        <div className="relative px-4 pt-3 pb-5" style={{ background: "radial-gradient(120% 90% at 70% 0%, #3a2a1a 0%, #1a1a1e 60%, #0d0d10 100%)" }}>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="w-6 h-6 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button className="flex items-center gap-0.5 text-[14px] font-medium text-white bg-white/10 px-2 h-7 rounded-full">上海<span className="text-[9px]">▾</span></button>
            <div className="ml-auto flex items-center gap-3 text-white">
              <div className="flex flex-col items-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20L17 17" strokeLinecap="round" /></svg><span className="text-[8px]">搜索</span></div>
              <div className="flex flex-col items-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" /><circle cx="12" cy="9" r="2.5" /></svg><span className="text-[8px]">地图</span></div>
              <span className="text-[18px] leading-none">···</span>
            </div>
          </div>
          {/* Logo */}
          <div className="text-center mt-4">
            <div className="inline-flex items-center gap-2 text-[26px] font-black text-white">
              <span className="text-[22px]">🏆</span>
              <span style={{ background: "linear-gradient(90deg,#FFE0A3,#FF8A3D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>大众点评榜单</span>
            </div>
            <div className="text-[14px] text-white/90 mt-1.5">9亿人跟着去的吃喝玩乐指南</div>
            <div className="text-[11px] text-white/55 mt-1">公正不收费 · 依托消费者浏览行为和真实评价得出</div>
            <button className="mt-3 px-4 h-7 rounded-full text-[12px] text-white/85" style={{ background: "rgba(255,255,255,0.12)" }}>评选规则 ▾</button>
          </div>
        </div>

        {/* 品类 Tab */}
        <div className="bg-white px-3 pt-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar -mt-3 rounded-t-2xl relative">
          {CATE_TABS.map((c) => (
            <button key={c} onClick={() => setCate(c)} className="shrink-0 px-3.5 h-9 rounded-lg text-[14px] font-bold" style={cate === c ? { background: "#FFF0E5", color: "#E65000" } : { background: "#F5F5F5", color: "#555" }}>{c}</button>
          ))}
          <span className="shrink-0 self-center text-dpText-tertiary text-[12px]">▾</span>
        </div>

        {/* 榜单 Tab */}
        <div className="bg-white px-3 py-2 flex items-center gap-4 overflow-x-auto no-scrollbar border-b border-[#f5f5f5]">
          <button className="shrink-0 flex items-center gap-0.5 text-[13px] text-dpText-secondary">全城<span className="text-[8px]">▾</span></button>
          {LIST_TABS.map((t) => (
            <button key={t} onClick={() => setListTab(t)} className="shrink-0 relative pb-1">
              <span className={`text-[14px] ${listTab === t ? "font-black text-[#E65000]" : "text-dpText-secondary"}`}>{t}</span>
            </button>
          ))}
        </div>

        {/* 大卡列表 */}
        <div className="bg-white px-3 pt-3">
          {CARDS.map((c, i) => (
            <button
              key={i}
              onClick={() => navigate("/store", { state: { poi: shPoi(c.name), photo: c.img } })}
              className="w-full text-left mb-4 rounded-2xl overflow-hidden bg-white"
              style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #f2f2f2" }}
            >
              <div className="relative w-full" style={{ aspectRatio: "16/10" }}>
                <img src={c.img} alt="" className="w-full h-full object-cover" loading="lazy" />
                {c.coupon && (
                  <div className="absolute right-2 bottom-2 w-12 h-12 rounded-full flex flex-col items-center justify-center text-white text-center" style={{ background: "linear-gradient(135deg,#FFB300,#FF6F00)" }}>
                    <span className="text-[13px] font-black leading-none">200</span>
                    <span className="text-[8px]">元免单卡</span>
                  </div>
                )}
                {/* 底部横幅 */}
                <div className="absolute left-0 right-0 bottom-0 px-2.5 py-1.5 flex items-center gap-1.5" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.6), rgba(0,0,0,0.15))" }}>
                  <span className="shrink-0 text-[9px] font-bold px-1 rounded text-[#7A3B00]" style={{ background: "linear-gradient(135deg,#FFE0A3,#FFC24D)" }}>🏅{c.badge}</span>
                  <span className="shrink-0 text-[9px] text-white/85">{c.newYear}</span>
                  <span className="text-[12px] font-medium text-white truncate">{c.banner}</span>
                </div>
              </div>
              <div className="px-3 py-2.5">
                <div className="text-[17px] font-black text-dpInk leading-tight">{c.name}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <HalfStars rating={c.rating} />
                  <span className="text-[15px] font-black text-[#FF6F00]">{c.rating}</span>
                  <span className="text-[12px] text-dpText-tertiary">¥{c.price}/人</span>
                  <span className="text-[12px] text-dpText-tertiary">{c.cat}</span>
                  <span className="text-[12px] text-dpText-tertiary">{c.biz}</span>
                  <span className="text-[12px] text-dpText-tertiary ml-auto">{c.dist}</span>
                </div>
                <div className="inline-block mt-2 text-[11.5px] px-1.5 py-0.5 rounded" style={{ background: "#FFF6E8", color: "#C8541A" }}>{c.rec}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
