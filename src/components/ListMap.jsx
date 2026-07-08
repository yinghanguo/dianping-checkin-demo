import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getStoreCoords } from "../data/shanghaiStores";
import { MY_CHECKINS } from "../data/myCheckins";

// 清单地图模式 — 把清单变成"可以走的路线":
//   序号 pin(①②③)按清单顺序连成虚线;拔草状态画在 pin 上(去过=绿✓,没去过=橙)
//   底部横滑店卡与 pin 双向联动
export default function ListMap({ list, checkedSet, height = 230, onStoreClick }) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const cardScroller = useRef(null);
  const [selectedIdx, setSelectedIdx] = useState(null);

  // 取坐标:上海真实档案/虚构补充 → 打卡记录(西班牙等)
  const points = useMemo(
    () =>
      list.items
        .map((it, idx) => {
          const c =
            getStoreCoords(it.poi?.name) ||
            MY_CHECKINS.find((k) => k.poi.name === it.poi?.name)?.coords ||
            null;
          return c ? { ...it, idx, lat: c.lat, lng: c.lng } : null;
        })
        .filter(Boolean),
    [list]
  );

  // 初始化
  useEffect(() => {
    if (!mapEl.current || mapRef.current || points.length === 0) return;
    const map = L.map(mapEl.current, { zoomControl: false, attributionControl: false });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 16 });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [points]);

  // pins + 路线
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
    const layer = L.layerGroup();

    // 路线虚线(白描边 + 橙虚线,按清单顺序)
    if (points.length >= 2) {
      const latlngs = points.map((p) => [p.lat, p.lng]);
      L.polyline(latlngs, { color: "#ffffff", weight: 6, opacity: 0.9, lineJoin: "round", lineCap: "round", interactive: false }).addTo(layer);
      L.polyline(latlngs, { color: "#FF6F00", weight: 3, opacity: 0.9, dashArray: "6 6", lineJoin: "round", lineCap: "round", interactive: false }).addTo(layer);
    }

    points.forEach((p) => {
      const done = checkedSet?.has(p.poi?.name);
      const isSel = selectedIdx === p.idx;
      const size = isSel ? 30 : 25;
      const html = `<div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${done ? "linear-gradient(135deg,#7BC142,#A5D66E)" : "linear-gradient(135deg,#FF6F00,#FFA040)"};
        border:2.5px solid white;
        box-shadow:0 3px 10px ${done ? "rgba(123,193,66,0.5)" : "rgba(255,111,0,0.45)"};
        display:flex;align-items:center;justify-content:center;
        color:white;font-size:${done ? 13 : 12}px;font-weight:800;
        transition:all .15s;
      ">${done ? "✓" : p.idx + 1}</div>`;
      const marker = L.marker([p.lat, p.lng], {
        icon: L.divIcon({ html, className: "", iconSize: [size, size], iconAnchor: [size / 2, size / 2] }),
        riseOnHover: true,
      });
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedIdx(p.idx);
        // 联动:横滑卡片滚到对应位置
        const card = cardScroller.current?.children?.[points.findIndex((x) => x.idx === p.idx)];
        card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      });
      marker.addTo(layer);
    });

    layer.addTo(map);
    layerRef.current = layer;
  }, [points, checkedSet, selectedIdx]);

  if (points.length === 0) return null;

  const doneCount = points.filter((p) => checkedSet?.has(p.poi?.name)).length;

  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden" style={{ height }}>
        <div ref={mapEl} className="absolute inset-0" style={{ zIndex: 1 }} />
        {/* 角标:路线感 + 拔草统计 */}
        <div
          className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full text-[10px] text-white font-medium pointer-events-none"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
        >
          🚶 照着走 · {points.length} 站{checkedSet ? ` · 已去 ${doneCount}` : ""}
        </div>
      </div>

      {/* 横滑店卡(与 pin 联动) */}
      <div ref={cardScroller} className="flex gap-2 overflow-x-auto no-scrollbar mt-2.5 pb-1">
        {points.map((p) => {
          const done = checkedSet?.has(p.poi?.name);
          const isSel = selectedIdx === p.idx;
          return (
            <button
              key={p.idx}
              onClick={() => {
                if (isSel) { onStoreClick?.(list.items[p.idx]); return; }
                setSelectedIdx(p.idx);
                mapRef.current?.panTo([p.lat, p.lng], { animate: true });
              }}
              className="shrink-0 w-[168px] text-left rounded-xl p-2 flex gap-2 items-center transition-all"
              style={{
                border: isSel ? "1.5px solid #FFB380" : "1px solid #f0f0f0",
                background: isSel ? "#FFF8F0" : "white",
              }}
            >
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#f0f0f0]">
                  <img src={p.photo} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div
                  className="absolute -top-1 -left-1 w-[17px] h-[17px] rounded-full flex items-center justify-center text-white text-[10px] font-bold border border-white"
                  style={{ background: done ? "#7BC142" : "linear-gradient(135deg,#FF6F00,#FFA040)" }}
                >
                  {done ? "✓" : p.idx + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] font-semibold text-dpInk truncate">{p.poi.name}</div>
                <div className="text-[9.5px] mt-0.5" style={{ color: done ? "#5a8e2c" : "#999" }}>
                  {done ? "已拔草 ✓" : "还没去过"}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
