import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { shPoi } from "../data/shanghaiStores";

// 特价团·美食 —— 美食频道「特价团」入口(对齐图5)
const IMG = {
  tart: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=70",
  luckin: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&q=70",
  cone: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&q=70",
  toast: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=300&q=70",
  tea: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=70",
};

const TABS = ["推荐", "奶茶咖啡", "小吃快餐", "超值大餐", "面包甜点", "零食"];
const CHIPS = ["附近500m", "全年低价"];

const DEALS = [
  { name: "AMAM LONBAKERY TOWN 伦敦烘焙小镇｜英式招牌焦糖贝克威尔蛋", tags: ["爆卖1万+", "全周可用", "免预约", "退款无忧"], dist: "530m", shop: "AMAM LONBAKERY TOWN 伦敦烘…", price: "9.9", ori: "13", off: "超值价·享 7.7 折", img: IMG.tart, top: true },
  { name: "瑞幸咖啡｜【人气特惠】15选1", boost: true, progress: "已抢63%", dist: "226m", shop: "瑞幸咖啡（现代建筑设计大厦店）", price: "8.99", ori: "21", off: "加倍补贴价·享 4.3 折", img: IMG.luckin, timer: true },
  { name: "麦当劳｜泷盐星星圆筒", boost: true, progress: "已抢13%", dist: "481m", shop: "麦当劳（上海静安新闸路利园店）", price: "1.99", ori: "5", off: "加倍补贴价·享 4 折", img: IMG.cone, timer: true },
  { name: "AMAM LONBAKERY TOWN 伦敦烘焙小镇｜【棉韧松软】英式黄油布", tags: ["爆卖1000+", "100%好评", "全周可用", "免预约"], dist: "530m", shop: "AMAM LONBAKERY TOWN 伦敦烘…", price: "13.9", ori: "21", off: "超值价·享 6.7 折", img: IMG.toast },
  { name: "柠季·手打柠檬茶｜百香柠檬冰奶(480ml)", tags: ["爆卖2000+", "96%好评", "秒提·到店取"], dist: "310m", shop: "柠季·手打柠檬茶（上海静安…）", price: "8.8", ori: "16", off: "上新特惠", img: IMG.tea, fresh: true },
];

export default function SpecialDeals() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("推荐");

  return (
    <div className="absolute inset-0 bg-[#F5F5F5] flex flex-col">
      {/* 粉色头部 */}
      <div className="shrink-0" style={{ background: "linear-gradient(180deg, #FF2D6B 0%, #FF3D77 100%)" }}>
        <div className="px-3 pt-3 pb-1 flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="w-6 h-6 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <span className="text-[18px] font-black text-white">特价团·美食</span>
        </div>
        {/* 搜索 */}
        <div className="px-3 pb-3 pt-1">
          <div className="h-10 rounded-full bg-white flex items-center pl-4 pr-1 gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20L17 17" strokeLinecap="round" /></svg>
            <span className="flex-1 text-[13px] text-dpText-tertiary">搜索特价美食</span>
            <span className="h-8 px-4 rounded-full text-white text-[13px] font-bold flex items-center" style={{ background: "linear-gradient(135deg,#FF6F00,#FF2D6B)" }}>搜低价</span>
          </div>
        </div>
      </div>

      {/* 分类 Tab */}
      <div className="bg-white shrink-0 px-3 pt-2.5 flex gap-5 overflow-x-auto no-scrollbar border-b border-[#f5f5f5]">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className="shrink-0 relative pb-2">
            <span className={`text-[14px] ${tab === t ? "font-bold text-dpInk" : "text-dpText-secondary"}`}>{t}</span>
            {tab === t && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full" style={{ background: "#FF2D6B" }} />}
          </button>
        ))}
      </div>
      <div className="bg-white shrink-0 px-3 py-2 flex gap-2 border-b border-[#f5f5f5]">
        {CHIPS.map((c) => (
          <button key={c} className="px-3 h-7 rounded-full text-[12px] bg-[#F5F5F5] text-dpText-secondary">{c}</button>
        ))}
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-white pb-8">
        {DEALS.map((d, i) => (
          <div key={i} className={`px-3 py-3.5 flex gap-3 border-b border-[#f7f7f7] ${d.top ? "border border-[#FFD9A0] rounded-2xl m-2" : ""}`} style={d.top ? { background: "#FFFBF3" } : {}}>
            <div className="relative w-[100px] h-[100px] rounded-xl overflow-hidden bg-[#f0f0f0] shrink-0">
              <img src={d.img} alt="" className="w-full h-full object-cover" loading="lazy" />
              {d.top && <div className="absolute top-1 right-1 text-[8px] font-black px-1 rounded text-white" style={{ background: "#3A6EA5" }}>TOP</div>}
              {d.timer && <div className="absolute left-0 right-0 bottom-0 text-center text-[9px] text-white py-0.5" style={{ background: "rgba(0,0,0,0.55)" }}>仅剩 00:00:00</div>}
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-start gap-1">
                {d.boost && <span className="shrink-0 text-[10px] px-1 py-px rounded text-white" style={{ background: "#C026D3" }}>加倍补</span>}
                <span className="text-[14px] font-bold text-dpInk leading-tight" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{d.name}</span>
              </div>
              {d.tags && (
                <div className="text-[10.5px] text-dpText-tertiary mt-1 truncate">{d.tags.join("  ")}</div>
              )}
              {d.progress && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="flex-1 h-1.5 rounded-full bg-[#FFE0EC] overflow-hidden max-w-[110px]">
                    <div className="h-full rounded-full" style={{ width: d.progress.match(/\d+/)[0] + "%", background: "#FF2D6B" }} />
                  </div>
                  <span className="text-[10.5px] font-bold" style={{ color: "#FF2D6B" }}>{d.progress}</span>
                </div>
              )}
              <div className="text-[10.5px] text-dpText-tertiary mt-1 truncate">{d.dist}  {d.shop}</div>
              <div className="flex items-end gap-2 mt-auto pt-1.5">
                <div className="flex-1 min-w-0">
                  <span className="text-[19px] font-black" style={{ color: "#FF2D6B" }}>¥{d.price}</span>
                  <span className="text-[11px] text-dpText-tertiary line-through ml-1">¥{d.ori}</span>
                  <div className="text-[10px]" style={{ color: "#FF6F00" }}>{d.off}</div>
                </div>
                <button
                  onClick={() => navigate("/store", { state: { poi: shPoi(d.shop.replace(/（.*/, "")), photo: d.img } })}
                  className="shrink-0 w-12 h-9 rounded-lg text-white text-[15px] font-black flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#FF6F00,#FF2D6B)" }}
                >
                  抢
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
