import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { STORE_INFO, getStoreCoords, shPoi } from "../data/shanghaiStores";
import { getListsContaining, getList, getReasonFor } from "../data/lists";
import { BottomTab } from "./Me";

// 地图页(对齐真实点评地图样式) — 清单在地图上的分发:
//   ① 右侧「私藏」图层开关:开启后被清单收录的店切换为书签 pin + 创作者头像
//   ② pin 点击 → 底部对应店卡高亮(卡片带"被 N 份私藏收录"行)
//   ③ 底部卡片流顶部:区域清单卡(视野内命中一份清单 ≥3 家店)
const MAP_STORES = Object.keys(STORE_INFO);
const CATE_CHIPS = ["🔥 推荐", "🍗 美食", "🍹 玩乐", "🏝 景点", "🛍 购物"];
const CATE_EMOJI = { 特色菜: "🍽", 西餐: "🍴", 新疆菜: "🍢", 潮汕菜: "🦐", 面包烘焙: "🥐", 海鲜: "🦞", 商场: "🛍", 小吃快餐: "🥣" };

function Stars({ rating, size = 12 }) {
  return (
    <div className="flex items-center gap-px">
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.min(1, Math.max(0, rating - (i - 1)));
        return (
          <div key={i} className="relative" style={{ width: size, height: size }}>
            <svg viewBox="0 0 12 12" className="absolute inset-0">
              <path d="M6 0.5l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8l-3 1.6.6-3.3L1.2 4l3.3-.5z" fill="#e8e8e8" />
            </svg>
            <svg viewBox="0 0 12 12" className="absolute inset-0" style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}>
              <path d="M6 0.5l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8l-3 1.6.6-3.3L1.2 4l3.3-.5z" fill="#FF6F00" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}

export default function MapExplore() {
  const navigate = useNavigate();
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(null);
  const cardRefs = useRef({});
  const [listLayer, setListLayer] = useState(false);
  const [selected, setSelected] = useState(null);

  // 门店 → 收录清单(一次算好)
  const storeData = useMemo(
    () =>
      MAP_STORES.map((name) => ({
        name,
        info: STORE_INFO[name],
        coords: getStoreCoords(name),
        lists: getListsContaining(name),
      })).filter((s) => s.coords),
    []
  );

  const areaList = useMemo(() => getList("list_f_njxl_richang"), []);

  // ── 初始化地图 ──
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([31.2315, 121.458], 14);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
    // 当前位置蓝点
    L.marker([31.2295, 121.4555], {
      icon: L.divIcon({
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#2E7CF6;border:3px solid white;box-shadow:0 0 0 6px rgba(46,124,246,0.18), 0 2px 6px rgba(0,0,0,0.3);"></div>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
      interactive: false,
    }).addTo(map);
    map.on("click", () => setSelected(null));
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ── 渲染 pins(随图层/选中态刷新) ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (markersRef.current) { map.removeLayer(markersRef.current); markersRef.current = null; }
    const layer = L.layerGroup();

    storeData.forEach((s) => {
      const isSel = selected === s.name;
      const inLists = s.lists.length > 0;
      const shortName = s.name.length > 9 ? s.name.slice(0, 9) + "…" : s.name;
      const nameLabel = `<div style="font-size:11px;font-weight:600;color:#1a1a1a;margin-top:2px;white-space:nowrap;text-align:center;text-shadow:0 0 3px white,0 0 3px white,0 0 3px white;">${shortName}</div>`;

      let html;
      if (listLayer && inLists) {
        // 私藏图层:书签 pin + 创作者头像
        const avatar = s.lists[0].owner.avatar;
        html = `<div style="display:flex;flex-direction:column;align-items:center;width:max-content;transform:scale(${isSel ? 1.12 : 1});transition:transform .15s;">
          <div style="display:flex;align-items:center;gap:4px;white-space:nowrap;background:linear-gradient(135deg,#FF6F00,#FFA040);border-radius:999px;padding:3px 8px 3px 4px;box-shadow:0 3px 10px rgba(255,111,0,0.45);border:1.5px solid white;">
            <img src="${avatar}" style="width:17px;height:17px;border-radius:50%;background:white;border:1px solid white;"/>
            <span style="font-size:11px;font-weight:700;color:white;white-space:nowrap;">🔖 ${s.lists.length} 份私藏</span>
          </div>${nameLabel}</div>`;
      } else {
        // 常规评分 pin
        const emoji = CATE_EMOJI[s.info.category] || "🍴";
        html = `<div style="display:flex;flex-direction:column;align-items:center;width:max-content;transform:scale(${isSel ? 1.12 : 1});transition:transform .15s;opacity:${listLayer && !inLists ? 0.45 : 1};">
          <div style="display:flex;align-items:center;gap:3px;white-space:nowrap;background:white;border-radius:999px;padding:2px 7px 2px 3px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
            <div style="width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#FF6F00,#FFA040);display:flex;align-items:center;justify-content:center;font-size:10px;">${emoji}</div>
            <span style="font-size:11px;font-weight:700;color:#FF6F00;">${s.info.rating}分</span>
          </div>${nameLabel}</div>`;
      }

      const marker = L.marker([s.coords.lat, s.coords.lng], {
        icon: L.divIcon({ html, className: "", iconSize: [0, 0], iconAnchor: [40, 16] }),
        riseOnHover: true,
      });
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        setSelected(s.name);
        // 底部对应店卡滚动到可视区
        cardRefs.current[s.name]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      marker.addTo(layer);
    });

    layer.addTo(map);
    markersRef.current = layer;
  }, [storeData, listLayer, selected]);

  const openStore = (name) => {
    navigate("/store", { state: { poi: shPoi(name), photo: STORE_INFO[name]?.photos?.[0] } });
  };

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden">
      {/* ── 地图区 ── */}
      <div className="relative flex-1">
        <div ref={mapEl} className="absolute inset-0" style={{ zIndex: 1 }} />

        {/* 搜索条 */}
        <div className="absolute top-3 left-3 right-3 z-10">
          <button
            onClick={() => navigate("/search")}
            className="w-full h-11 bg-white rounded-full flex items-center px-4 gap-2"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20L17 17" strokeLinecap="round" />
            </svg>
            <span className="text-[14px] text-dpText-tertiary">搜索地点、美食、景点等</span>
          </button>
          {/* 分类 chips */}
          <div className="flex gap-2 mt-2.5 overflow-x-auto no-scrollbar">
            {CATE_CHIPS.map((c, i) => (
              <span
                key={c}
                className="shrink-0 h-8 px-3 rounded-full text-[13px] font-medium flex items-center bg-white"
                style={{
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  color: i === 0 ? "#E65000" : "#333",
                  border: i === 0 ? "1px solid #FFD5B0" : "none",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* 右侧浮动按钮:必吃榜 / 私藏图层 / 收藏 / 定位 */}
        <div className="absolute right-3 bottom-4 z-10 flex flex-col gap-2 items-center">
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
            <button className="w-12 py-2 flex flex-col items-center gap-0.5 border-b border-[#f5f5f5]">
              <span className="text-[15px]">🥇</span>
              <span className="text-[9.5px] text-dpInk">必吃榜</span>
            </button>
            {/* 私藏图层开关(与必吃榜并列的人格图层) */}
            <button
              onClick={() => { setListLayer((v) => !v); setSelected(null); }}
              className="w-12 py-2 flex flex-col items-center gap-0.5 border-b border-[#f5f5f5] relative"
              style={listLayer ? { background: "linear-gradient(135deg, #FF6F00, #FFA040)" } : {}}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={listLayer ? "white" : "#E65000"} strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinejoin="round" />
              </svg>
              <span className="text-[9.5px]" style={{ color: listLayer ? "white" : "#1a1a1a" }}>私藏</span>
              {!listLayer && (
                <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />
              )}
            </button>
            <button className="w-12 py-2 flex flex-col items-center gap-0.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
              </svg>
              <span className="text-[9.5px] text-dpInk">收藏</span>
            </button>
          </div>
          <button className="w-11 h-11 bg-white rounded-full flex items-center justify-center" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
              <circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2" fill="#333" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 图层开启提示 */}
        <AnimatePresence>
          {listLayer && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full text-[11px] text-white whitespace-nowrap"
              style={{ top: 104, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
            >
              🔖 私藏图层已开启 · 只看被清单收录的店
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 底部卡片流 ── */}
      <div className="shrink-0 bg-white rounded-t-3xl -mt-3 relative z-10" style={{ height: 296, boxShadow: "0 -6px 24px rgba(0,0,0,0.08)" }}>
        <div className="pt-2 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-[#e5e5e5]" />
        </div>
        <div className="overflow-y-auto no-scrollbar px-3 pb-20" style={{ height: 272 }}>
          {/* 区域清单卡:视野内命中一份清单 */}
          {areaList && (
            <button
              onClick={() => navigate(`/album/${areaList.id}`)}
              className="w-full text-left rounded-2xl p-3 mb-2 flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, #FFF6EA, #FFEDD6)", border: "1px solid #FFE0BC" }}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white">
                  <img src={areaList.cover} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full overflow-hidden border-2 border-white bg-white">
                  <img src={areaList.owner.avatar} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium" style={{ color: "#C8541A" }}>🔖 这一带有一份高分私藏</div>
                <div className="text-[13.5px] font-bold text-dpInk truncate mt-0.5">{areaList.title}</div>
                <div className="text-[10.5px] text-dpText-tertiary mt-0.5">
                  {areaList.owner.name} · {areaList.items.length} 家店都在这片 · 藏 {areaList.saveCount}
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E65000" strokeWidth="2" className="shrink-0">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* 门店卡片流(pin 联动高亮) */}
          {storeData.map((s) => (
            <button
              key={s.name}
              ref={(el) => (cardRefs.current[s.name] = el)}
              onClick={() => openStore(s.name)}
              className="w-full text-left py-3 flex gap-3 border-b border-[#f7f7f7] rounded-xl px-1.5 transition-all"
              style={selected === s.name ? { background: "#FFF8F0", boxShadow: "inset 0 0 0 1.5px #FFB380" } : {}}
            >
              <div className="w-[76px] h-[76px] rounded-xl overflow-hidden bg-[#f0f0f0] shrink-0">
                <img src={s.info.photos[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-dpInk truncate">{s.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Stars rating={s.info.rating} />
                  <span className="text-[13px] font-bold text-[#FF6F00]">{s.info.rating}</span>
                  <span className="text-[11px] text-dpText-tertiary">{s.info.reviews}条</span>
                  {s.info.price > 0 && <span className="text-[11px] text-dpText-tertiary">¥{s.info.price}/人</span>}
                  <span className="text-[11px] text-dpText-tertiary ml-auto shrink-0">{s.info.dist}</span>
                </div>
                <div className="text-[11px] text-dpText-tertiary mt-0.5 truncate">
                  {s.info.category} {s.info.biz}
                </div>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1 py-px rounded" style={{ background: "#FFF0E5", color: "#E65000" }}>
                    <span className="px-0.5 rounded-sm text-white text-[8.5px] font-bold" style={{ background: "#FF6F00" }}>榜</span>
                    {s.info.badge}
                  </span>
                </div>
                {/* 被收录行(地图卡片下沉收录模块) */}
                {s.lists.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex -space-x-1.5 shrink-0">
                      {s.lists.slice(0, 3).map((l, i) => (
                        <div key={l.id} className="w-4 h-4 rounded-full overflow-hidden bg-[#f5f5f5] border border-white" style={{ zIndex: 3 - i }}>
                          <img src={l.owner.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <span className="text-[10.5px] truncate" style={{ color: "#E65000" }}>
                      被 {s.lists.length} 份私藏收录 · “{getReasonFor(s.lists[0], s.name).slice(0, 16)}…”
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <BottomTab navigate={navigate} active="map" />
    </div>
  );
}
