import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { shPoi } from "../data/shanghaiStores";

// 免费试(霸气宝箱)—— 首页「免费试」入口(对齐图2)
const IMG = {
  yunnan: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=70",
  wagyu: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=300&q=70",
  crab: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300&q=70",
  seafood: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=300&q=70",
};

const FILTERS = ["全部商区 ▾", "全部分类 ▾", "智能排序 ▾", "更多筛选 ▾"];
const CHIPS = ["高中奖率", "附近3km", "连锁餐厅", "200元以上套餐"];

const DEALS = [
  { name: "映泸沽·山珍菌汤·云南料理｜双人套餐", biz: "港汇恒隆广场店 · 徐家汇商圈", dist: "4.8km", value: 352, quota: 50, img: IMG.yunnan, vip: true },
  { name: "竹由日料｜双人套餐", biz: "中山公园/江苏路", dist: "4.1km", value: 566, quota: 30, img: IMG.wagyu, vip: true },
  { name: "蟹小友·蟹黄面·手工点心｜双人套餐", biz: "南京东路店 · 南京东路商圈", dist: "2km", value: 350, quota: 100, img: IMG.crab, vip: true, lv: "Lv6-8" },
  { name: "东海滙舟山海鲜｜单人套餐", biz: "静安寺商圈", dist: "1.6km", value: 288, quota: 60, img: IMG.seafood, vip: true, lv: "Lv6-8" },
];

export default function FreeTrial() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("免费试");

  return (
    <div className="absolute inset-0 bg-[#F5F5F5] flex flex-col">
      {/* 头部(暖色渐变) */}
      <div className="shrink-0 relative" style={{ background: "linear-gradient(180deg, #FFE0B8 0%, #FFEDD6 60%, #F5F5F5 100%)" }}>
        <div className="absolute right-0 top-0 text-[80px] opacity-30 select-none leading-none">🎁</div>
        <div className="px-3 pt-3 flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="w-6 h-6 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A3B00" strokeWidth="2.2"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <span className="text-[22px] font-black" style={{ color: "#E0362E" }}>免费试</span>
          <span className="text-[14px] font-bold" style={{ color: "#C8541A" }}>0元尽享吃喝玩乐</span>
          <div className="ml-auto flex items-center gap-3 text-[#7A3B00]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinejoin="round" /></svg>
            <span className="text-[18px] leading-none">···</span>
          </div>
        </div>

        {/* 霸气宝箱 */}
        <div className="px-4 pt-3">
          <div className="text-[19px] font-black text-dpInk">霸气宝箱天天开</div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[13px]" style={{ color: "#C8541A" }}>🪙 霸气币 <span className="text-[17px] font-black align-middle">39742</span></span>
            <span className="px-2 h-6 rounded-full text-[11px] flex items-center" style={{ background: "rgba(255,255,255,0.7)", color: "#C8541A" }}>去兑换免费试 ›</span>
          </div>
        </div>

        {/* 四宫格 */}
        <div className="px-3 pt-3 grid grid-cols-4 gap-2">
          {[
            { icon: "🪙", label: "霸气币" },
            { icon: "🎟️", label: "PASS卡" },
            { icon: "🚕", label: "美团打车券" },
            { icon: "🍗", label: "随机免费菜" },
          ].map((f) => (
            <div key={f.label} className="rounded-xl bg-white/70 py-2.5 flex flex-col items-center gap-1">
              <span className="text-[24px] leading-none">{f.icon}</span>
              <span className="text-[11px] text-dpInk">{f.label}</span>
            </div>
          ))}
        </div>

        {/* 开宝箱按钮 */}
        <div className="px-3 py-3 flex gap-2.5">
          <button className="flex-1 h-11 rounded-full text-white text-[16px] font-black" style={{ background: "linear-gradient(135deg, #FF6F00, #FF3B30)" }}>立即开宝箱</button>
          <button className="flex-1 h-11 rounded-full text-[16px] font-black" style={{ background: "#FFF0D8", color: "#E0362E", border: "1.5px solid #FFD9A0" }}>获得宝箱</button>
        </div>
      </div>

      {/* 筛选行 */}
      <div className="bg-white shrink-0 px-3 py-2.5 flex items-center justify-between border-b border-[#f5f5f5]">
        {FILTERS.map((f) => (
          <button key={f} className="text-[12.5px] text-dpText-secondary">{f}</button>
        ))}
      </div>
      <div className="bg-white shrink-0 px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-[#f5f5f5]">
        {CHIPS.map((c) => (
          <button key={c} className="shrink-0 px-3 h-7 rounded-full text-[12px] bg-[#F5F5F5] text-dpText-secondary">{c}</button>
        ))}
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-white pb-20">
        {DEALS.map((d, i) => (
          <div key={i} className="px-3 py-3.5 flex gap-3 border-b border-[#f7f7f7]">
            <div className="w-[104px] h-[104px] rounded-xl overflow-hidden bg-[#f0f0f0] shrink-0">
              <img src={d.img} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-start gap-1 flex-wrap">
                {d.lv && <span className="text-[10px] px-1 py-px rounded shrink-0" style={{ background: "#FFF3D6", color: "#B07800" }}>{d.lv}</span>}
                {d.vip && <span className="text-[10px] px-1 py-px rounded text-white shrink-0" style={{ background: "#333" }}>橙V专享</span>}
                <span className="text-[14px] font-bold text-dpInk leading-tight" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{d.name}</span>
              </div>
              <div className="text-[11.5px] text-dpText-tertiary mt-1.5">{d.biz} · {d.dist}</div>
              <div className="flex items-end gap-2 mt-auto pt-2">
                <div className="flex-1">
                  <span className="text-[15px] font-black" style={{ color: "#E0362E" }}>价值{d.value}元</span>
                  <span className="text-[11px] text-dpText-tertiary ml-1.5">{d.quota}个中奖名额</span>
                </div>
                <button
                  onClick={() => navigate("/store", { state: { poi: shPoi(d.name.split("｜")[0]), photo: d.img } })}
                  className="shrink-0 px-5 h-8 rounded-full text-white text-[14px] font-bold"
                  style={{ background: "linear-gradient(135deg, #FF6F00, #FF3B30)" }}
                >
                  免费抽
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部 Tab */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#f0f0f0] flex items-center justify-around" style={{ paddingTop: 8, paddingBottom: 22 }}>
        {[
          { key: "免费试", badge: "0元" },
          { key: "橙V专享价" },
          { key: "我的" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className="flex flex-col items-center gap-0.5">
            <div className="w-6 h-6 flex items-center justify-center">
              {t.badge ? (
                <span className="w-6 h-6 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ background: tab === t.key ? "#FF6F00" : "#ccc" }}>{t.badge}</span>
              ) : t.key === "我的" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tab === t.key ? "#FF6F00" : "#999"} strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tab === t.key ? "#FF6F00" : "#999"} strokeWidth="2"><path d="M20 12V8H6a2 2 0 010-4h12v4M4 6v12a2 2 0 002 2h14v-4M18 12a2 2 0 000 4h4v-4z" /></svg>
              )}
            </div>
            <span className="text-[10px]" style={{ color: tab === t.key ? "#FF6F00" : "#999" }}>{t.key}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
