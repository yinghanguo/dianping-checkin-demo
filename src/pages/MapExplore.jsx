import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { STORE_INFO, getStoreCoords, shPoi } from "../data/shanghaiStores";
import { getListsContaining, loadLists, effectiveCheckedOff, getListMeta } from "../data/lists";
import { BottomTab } from "./Me";

// 地图页 — 清单分发的三态结构:
//   ① 默认态:热门门店(评分 pin) + 底部门店卡
//   ② 私藏态(点右侧「私藏」):同样的热门门店,pin 追加"被 N 份私藏收录"标记,底部变为清单列表
//   ③ 清单态(点选一份清单):地图只呈现该清单的门店(序号 pin + 路线),底部为该清单的店卡
const MAP_STORES = Object.keys(STORE_INFO);
const CATE_CHIPS = ["🔥 推荐", "🍗 美食", "🍹 玩乐", "🏝 景点", "🛍 购物"];
const CATE_EMOJI = { 特色菜: "🍽", 西餐: "🍴", 新疆菜: "🍢", 潮汕菜: "🦐", 面包烘焙: "🥐", 海鲜: "🦞", 商场: "🛍", 小吃快餐: "🥣" };
const DEFAULT_VIEW = { center: [31.2315, 121.458], zoom: 14 };
// 上海范围(过滤进入地图清单列表的清单)
const inShanghai = (c) => c && c.lat > 30.8 && c.lat < 31.6 && c.lng > 121 && c.lng < 122;

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
  // 三态:layerOn=false 默认态;layerOn=true 私藏态;activeListId 非空 → 清单态
  const [layerOn, setLayerOn] = useState(false);
  const [activeListId, setActiveListId] = useState(null);
  const [selected, setSelected] = useState(null);

  // 热门门店(默认态/私藏态共用)
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

  // 地图清单列表(私藏态底部):上海范围内的公开清单
  const mapLists = useMemo(
    () =>
      loadLists()
        .filter((l) => l.visibility === "public")
        .map((l) => ({
          ...l,
          points: l.items
            .map((it, idx) => {
              const c = getStoreCoords(it.poi?.name);
              return c ? { ...it, idx, lat: c.lat, lng: c.lng } : null;
            })
            .filter(Boolean),
        }))
        .filter((l) => l.points.length >= 2 && l.points.every((p) => inShanghai(p)))
        .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0)),
    []
  );

  const activeList = useMemo(
    () => mapLists.find((l) => l.id === activeListId) || null,
    [mapLists, activeListId]
  );
  // 拔草口径(与清单页一致):仅对我收藏过的清单展示
  const activeChecked = useMemo(() => {
    if (!activeList) return null;
    return getListMeta(activeList.id).saved ? effectiveCheckedOff(activeList) : null;
  }, [activeList]);

  // ── 初始化地图 ──
  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, { zoomControl: false, attributionControl: false }).setView(
      DEFAULT_VIEW.center,
      DEFAULT_VIEW.zoom
    );
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
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

  // ── 视野切换:进清单态 fit 到清单,退出回默认视野 ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (activeList) {
      map.fitBounds(L.latLngBounds(activeList.points.map((p) => [p.lat, p.lng])), {
        padding: [56, 56],
        maxZoom: 16,
        animate: true,
      });
    } else {
      map.setView(DEFAULT_VIEW.center, DEFAULT_VIEW.zoom, { animate: true });
    }
  }, [activeList]);

  // ── 渲染 pins(随三态刷新) ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (markersRef.current) { map.removeLayer(markersRef.current); markersRef.current = null; }
    const layer = L.layerGroup();

    if (activeList) {
      // ══ 清单态:只呈现该清单的门店(序号 pin + 虚线路线) ══
      const latlngs = activeList.points.map((p) => [p.lat, p.lng]);
      if (latlngs.length >= 2) {
        L.polyline(latlngs, { color: "#ffffff", weight: 6, opacity: 0.9, lineJoin: "round", lineCap: "round", interactive: false }).addTo(layer);
        L.polyline(latlngs, { color: "#FF6F00", weight: 3, opacity: 0.9, dashArray: "6 6", lineJoin: "round", lineCap: "round", interactive: false }).addTo(layer);
      }
      activeList.points.forEach((p, seq) => {
        const done = activeChecked?.has(p.poi?.name);
        const isSel = selected === p.poi?.name;
        const size = isSel ? 30 : 25;
        const shortName = p.poi.name.length > 9 ? p.poi.name.slice(0, 9) + "…" : p.poi.name;
        const html = `<div style="display:flex;flex-direction:column;align-items:center;width:max-content;">
          <div style="width:${size}px;height:${size}px;border-radius:50%;
            background:${done ? "linear-gradient(135deg,#7BC142,#A5D66E)" : "linear-gradient(135deg,#FF6F00,#FFA040)"};
            border:2.5px solid white;box-shadow:0 3px 10px ${done ? "rgba(123,193,66,0.5)" : "rgba(255,111,0,0.45)"};
            display:flex;align-items:center;justify-content:center;color:white;font-size:${done ? 13 : 12}px;font-weight:800;">${done ? "✓" : seq + 1}</div>
          <div style="font-size:11px;font-weight:600;color:#1a1a1a;margin-top:2px;white-space:nowrap;text-shadow:0 0 3px white,0 0 3px white,0 0 3px white;">${shortName}</div>
        </div>`;
        const marker = L.marker([p.lat, p.lng], {
          icon: L.divIcon({ html, className: "", iconSize: [0, 0], iconAnchor: [size / 2, size / 2] }),
          riseOnHover: true,
        });
        marker.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          setSelected(p.poi.name);
          cardRefs.current[p.poi.name]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
        marker.addTo(layer);
      });
    } else {
      // ══ 默认态 / 私藏态:热门门店评分 pin;私藏态在 pin 上追加收录标记 ══
      storeData.forEach((s) => {
        const isSel = selected === s.name;
        const inLists = s.lists.length > 0;
        const emoji = CATE_EMOJI[s.info.category] || "🍴";
        const shortName = s.name.length > 9 ? s.name.slice(0, 9) + "…" : s.name;
        // 私藏态:评分胶囊右侧拼接收录段
        const listBadge =
          layerOn && inLists
            ? `<span style="display:inline-flex;align-items:center;gap:2px;background:linear-gradient(135deg,#FF6F00,#FFA040);color:white;font-size:10px;font-weight:700;border-radius:999px;padding:1px 6px;margin-left:3px;white-space:nowrap;">🔖 ${s.lists.length}</span>`
            : "";
        const html = `<div style="display:flex;flex-direction:column;align-items:center;width:max-content;transform:scale(${isSel ? 1.12 : 1});transition:transform .15s;">
          <div style="display:flex;align-items:center;gap:3px;white-space:nowrap;background:white;border-radius:999px;padding:2px 7px 2px 3px;box-shadow:0 2px 8px rgba(0,0,0,0.2);${layerOn && inLists ? "border:1.5px solid #FFB380;" : ""}">
            <div style="width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,#FF6F00,#FFA040);display:flex;align-items:center;justify-content:center;font-size:10px;">${emoji}</div>
            <span style="font-size:11px;font-weight:700;color:#FF6F00;">${s.info.rating}分</span>${listBadge}
          </div>
          <div style="font-size:11px;font-weight:600;color:#1a1a1a;margin-top:2px;white-space:nowrap;text-shadow:0 0 3px white,0 0 3px white,0 0 3px white;">${shortName}</div>
        </div>`;
        const marker = L.marker([s.coords.lat, s.coords.lng], {
          icon: L.divIcon({ html, className: "", iconSize: [0, 0], iconAnchor: [40, 16] }),
          riseOnHover: true,
        });
        marker.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          setSelected(s.name);
          cardRefs.current[s.name]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
        marker.addTo(layer);
      });
    }

    layer.addTo(map);
    markersRef.current = layer;
  }, [storeData, layerOn, activeList, activeChecked, selected]);

  const openStore = (name, photo, reason) => {
    navigate("/store", { state: { poi: shPoi(name), photo, caption: reason } });
  };

  const toggleLayer = () => {
    setSelected(null);
    setActiveListId(null);
    setLayerOn((v) => !v);
  };

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden">
      {/* ── 地图区 ── */}
      <div className="relative flex-1">
        <div ref={mapEl} className="absolute inset-0" style={{ zIndex: 1 }} />

        {/* 搜索条 + 分类 chips */}
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

        {/* 右侧浮动按钮 */}
        <div className="absolute right-3 bottom-4 z-10 flex flex-col gap-2 items-center">
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}>
            <button className="w-12 py-2 flex flex-col items-center gap-0.5 border-b border-[#f5f5f5]">
              <span className="text-[15px]">🥇</span>
              <span className="text-[9.5px] text-dpInk">必吃榜</span>
            </button>
            <button
              onClick={toggleLayer}
              className="w-12 py-2 flex flex-col items-center gap-0.5 border-b border-[#f5f5f5] relative"
              style={layerOn ? { background: "linear-gradient(135deg, #FF6F00, #FFA040)" } : {}}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={layerOn ? "white" : "#E65000"} strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinejoin="round" />
              </svg>
              <span className="text-[9.5px]" style={{ color: layerOn ? "white" : "#1a1a1a" }}>私藏</span>
              {!layerOn && <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-[#FF3B30]" />}
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

        {/* 状态提示条 */}
        <AnimatePresence>
          {layerOn && (
            <motion.div
              key={activeList ? "list" : "layer"}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="absolute left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full text-[11px] text-white whitespace-nowrap"
              style={{ top: 104, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
            >
              {activeList ? `🚶 ${activeList.title.slice(0, 14)} · ${activeList.points.length} 站` : "🔖 已标记热门门店的私藏收录 · 在下方挑一份清单"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 底部卡片流(随三态切换) ── */}
      <div className="shrink-0 bg-white rounded-t-3xl -mt-3 relative z-10" style={{ height: 296, boxShadow: "0 -6px 24px rgba(0,0,0,0.08)" }}>
        <div className="pt-2 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-[#e5e5e5]" />
        </div>
        <div className="overflow-y-auto no-scrollbar px-3 pb-20" style={{ height: 272 }}>

          {/* ══ 清单态:清单头 + 该清单的店卡 ══ */}
          {layerOn && activeList && (
            <>
              <div className="rounded-2xl p-3 mb-2 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #FFF6EA, #FFEDD6)", border: "1px solid #FFE0BC" }}>
                <button onClick={() => { setActiveListId(null); setSelected(null); }} className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5">
                    <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold text-dpInk truncate">{activeList.title}</div>
                  <div className="text-[10.5px] text-dpText-tertiary mt-0.5">
                    {activeList.owner.name} · {activeList.points.length} 家店
                    {activeChecked ? ` · 已去 ${activeList.points.filter((p) => activeChecked.has(p.poi?.name)).length}` : ""} · 藏 {activeList.saveCount}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/album/${activeList.id}`)}
                  className="shrink-0 px-3 h-7 rounded-full text-[11.5px] text-white font-medium"
                  style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
                >
                  完整清单
                </button>
              </div>
              {activeList.points.map((p, seq) => {
                const done = activeChecked?.has(p.poi?.name);
                return (
                  <button
                    key={p.poi.name}
                    ref={(el) => (cardRefs.current[p.poi.name] = el)}
                    onClick={() => openStore(p.poi.name, p.photo, p.reason)}
                    className="w-full text-left py-3 flex gap-3 border-b border-[#f7f7f7] rounded-xl px-1.5 transition-all"
                    style={selected === p.poi.name ? { background: "#FFF8F0", boxShadow: "inset 0 0 0 1.5px #FFB380" } : {}}
                  >
                    <div className="relative shrink-0">
                      <div className="w-[62px] h-[62px] rounded-xl overflow-hidden bg-[#f0f0f0]">
                        <img src={p.photo} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div
                        className="absolute -top-1.5 -left-1.5 w-[20px] h-[20px] rounded-full flex items-center justify-center text-white text-[11px] font-bold border-2 border-white"
                        style={{ background: done ? "#7BC142" : "linear-gradient(135deg,#FF6F00,#FFA040)" }}
                      >
                        {done ? "✓" : seq + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-semibold text-dpInk truncate">{p.poi.name}</span>
                        {done && (
                          <span className="shrink-0 text-[9px] px-1 py-px rounded" style={{ background: "#EAF5E2", color: "#2E7D32" }}>已拔草</span>
                        )}
                      </div>
                      <div className="text-[12px] text-dpInk mt-1 leading-snug" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        “{p.reason}”
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {/* ══ 私藏态:清单列表 ══ */}
          {layerOn && !activeList && (
            <>
              <div className="px-1 pb-2 text-[12px] text-dpText-secondary">
                这一带的 <b className="text-dpInk">{mapLists.length} 份公开私藏</b> · 点一份看它的店
              </div>
              {mapLists.map((l) => (
                <button
                  key={l.id}
                  onClick={() => { setActiveListId(l.id); setSelected(null); }}
                  className="w-full text-left rounded-2xl p-3 mb-2 flex items-center gap-3 bg-white"
                  style={{ border: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                >
                  <div className="relative shrink-0">
                    <div className="w-[52px] h-[52px] rounded-xl overflow-hidden bg-[#f0f0f0]">
                      <img src={l.cover} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full overflow-hidden border-2 border-white bg-white">
                      <img src={l.owner.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-dpInk truncate">{l.title}</div>
                    <div className="text-[10.5px] text-dpText-tertiary mt-0.5">
                      {l.owner.name} · {l.points.length} 家店 · 作者全部去过 ✓
                    </div>
                    <div className="text-[10.5px] mt-0.5" style={{ color: "#E65000" }}>
                      ♡ {l.likeCount} · 被收藏 {l.saveCount} 次
                    </div>
                  </div>
                  <span
                    className="shrink-0 px-2.5 h-7 rounded-full text-[11.5px] font-medium flex items-center gap-0.5"
                    style={{ background: "#FFF0E5", color: "#E65000" }}
                  >
                    上图
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              ))}
            </>
          )}

          {/* ══ 默认态:热门门店卡 ══ */}
          {!layerOn &&
            storeData.map((s) => (
              <button
                key={s.name}
                ref={(el) => (cardRefs.current[s.name] = el)}
                onClick={() => openStore(s.name, s.info.photos[0])}
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
                </div>
              </button>
            ))}
        </div>
      </div>

      <BottomTab navigate={navigate} active="map" />
    </div>
  );
}
