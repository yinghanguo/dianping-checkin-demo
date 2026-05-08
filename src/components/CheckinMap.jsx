import React, { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// zoom 阈值
const HEAT_MAX_ZOOM = 9;   // 热力圆只在 zoom <= 9 显示
const POI_MIN_ZOOM = 8;    // POI marker 在 zoom >= 8 显示
const LABEL_MIN_ZOOM = 11; // POI 文字标签在 zoom >= 11 显示

export default function CheckinMap({ checkins = [], onPoiClick, height = 280, showRoute = false }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const heatLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(3);

  const points = useMemo(
    () =>
      checkins
        .filter((c) => c.coords?.lat && c.coords?.lng)
        .map((c) => ({ ...c, lat: c.coords.lat, lng: c.coords.lng })),
    [checkins]
  );

  // 路线模式 — 按时间排序的点序列
  const routePoints = useMemo(() => {
    if (!showRoute) return [];
    return [...points].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [points, showRoute]);

  // 初始化地图
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
    }).setView([35, 60], 3);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, subdomains: "abcd" }
    ).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);
    map.on("zoomend", () => setZoom(map.getZoom()));
    map.on("click", () => setSelected(null));
    mapRef.current = map;

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // fit bounds
  useEffect(() => {
    if (!mapRef.current || points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 17, animate: true, duration: 0.8 });
    setTimeout(() => {
      if (mapRef.current) setZoom(mapRef.current.getZoom());
    }, 100);
  }, [points]);

  // ── 热力层(低 zoom 才显示) ──
  useEffect(() => {
    if (!mapRef.current) return;
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    if (showRoute) return; // 路线模式不画热力
    if (zoom > HEAT_MAX_ZOOM) return; // 高 zoom 不画热力

    const group = L.layerGroup();

    // 城市级聚合
    const cityMap = new Map();
    for (const p of points) {
      const key = p.poi.city;
      if (!cityMap.has(key)) cityMap.set(key, { lat: 0, lng: 0, count: 0 });
      const c = cityMap.get(key);
      c.lat += p.lat;
      c.lng += p.lng;
      c.count++;
    }

    for (const [, c] of cityMap) {
      const lat = c.lat / c.count;
      const lng = c.lng / c.count;
      const r = Math.min(80000, 15000 + c.count * 5000);
      // 3 层同心渐变
      L.circle([lat, lng], {
        radius: r, color: "transparent",
        fillColor: "#FF6F00", fillOpacity: 0.10, interactive: false,
      }).addTo(group);
      L.circle([lat, lng], {
        radius: r * 0.5, color: "transparent",
        fillColor: "#FF6F00", fillOpacity: 0.15, interactive: false,
      }).addTo(group);
      L.circle([lat, lng], {
        radius: r * 0.2, color: "transparent",
        fillColor: "#FF6F00", fillOpacity: 0.22, interactive: false,
      }).addTo(group);
    }

    // 个体小点
    for (const p of points) {
      L.circleMarker([p.lat, p.lng], {
        radius: 4, color: "transparent",
        fillColor: "#FF8838", fillOpacity: 0.35, interactive: false,
      }).addTo(group);
    }

    group.addTo(mapRef.current);
    heatLayerRef.current = group;
  }, [points, zoom, showRoute]);

  // ── 路线连线层 ──
  useEffect(() => {
    if (!mapRef.current) return;
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
    if (!showRoute || routePoints.length < 2) return;

    const latlngs = routePoints.map((p) => [p.lat, p.lng]);
    const group = L.layerGroup();
    // 白色描边
    L.polyline(latlngs, {
      color: "#ffffff",
      weight: 6,
      opacity: 0.9,
      lineJoin: "round",
      lineCap: "round",
      interactive: false,
    }).addTo(group);
    // 橙色主线
    L.polyline(latlngs, {
      color: "#FF6F00",
      weight: 3,
      opacity: 0.95,
      dashArray: "6 6",
      lineJoin: "round",
      lineCap: "round",
      interactive: false,
    }).addTo(group);
    group.addTo(mapRef.current);
    routeLayerRef.current = group;
  }, [routePoints, showRoute]);

  // ── POI markers + 文字标签(高 zoom) ──
  useEffect(() => {
    if (!mapRef.current) return;
    if (markersLayerRef.current) {
      mapRef.current.removeLayer(markersLayerRef.current);
      markersLayerRef.current = null;
    }
    if (!showRoute && zoom < POI_MIN_ZOOM) return;

    const showLabel = zoom >= LABEL_MIN_ZOOM;
    const layer = L.layerGroup();

    for (const p of points) {
      const isSelected = selected?.id === p.id;

      // 圆点 marker
      const dotSize = isSelected ? 20 : 12;
      const dotIcon = L.divIcon({
        html: `<div style="
          width:${dotSize}px;height:${dotSize}px;border-radius:50%;
          background:linear-gradient(135deg,#FF6F00,#FFA040);
          border:2px solid white;
          box-shadow:0 2px 6px rgba(255,111,0,${isSelected ? 0.65 : 0.4});
          transition:all 0.15s ease;
        "></div>`,
        className: "",
        iconSize: [dotSize, dotSize],
        iconAnchor: [dotSize / 2, dotSize / 2],
      });
      const marker = L.marker([p.lat, p.lng], { icon: dotIcon, riseOnHover: true });
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        setSelected(p);
        onPoiClick?.(p);
      });
      marker.addTo(layer);

      // 文字标签(zoom >= LABEL_MIN_ZOOM)
      if (showLabel) {
        const shortName = p.poi.name.length > 14 ? p.poi.name.slice(0, 14) + "…" : p.poi.name;
        const labelIcon = L.divIcon({
          html: `<div style="
            white-space:nowrap;
            font-size:11px;
            font-weight:600;
            color:#1a1a1a;
            text-shadow: 0 0 3px white, 0 0 3px white, 0 0 3px white, 0 0 3px white;
            padding:1px 3px;
            pointer-events:none;
            transform:translateY(-2px);
          ">${p.poi.emoji || "📍"} ${shortName}</div>`,
          className: "",
          iconSize: [0, 0],
          iconAnchor: [-(dotSize / 2 + 4), dotSize / 2 - 1],
        });
        L.marker([p.lat, p.lng], { icon: labelIcon, interactive: false }).addTo(layer);
      }
    }

    layer.addTo(mapRef.current);
    markersLayerRef.current = layer;
  }, [points, zoom, selected, onPoiClick, showRoute]);

  return (
    <div className="relative" style={{ height }}>
      <div
        ref={containerRef}
        className="absolute inset-0 rounded-2xl overflow-hidden bg-[#EAF4F4]"
        style={{ zIndex: 1 }}
      />

      {/* 左上角 zoom 提示 */}
      <div
        className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] text-white font-medium pointer-events-none"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      >
        {showRoute
          ? `📍 ${points.length} 个打卡`
          : zoom < POI_MIN_ZOOM
          ? "🔍 放大查看地点"
          : zoom < LABEL_MIN_ZOOM
          ? `📍 ${points.length} 个打卡 · 继续放大看名字`
          : `📍 ${points.length} 个打卡`}
      </div>

      {/* 商户小卡 */}
      {selected && (
        <div
          className="absolute left-3 right-3 bottom-3 z-10 bg-white rounded-2xl p-3 flex gap-3"
          style={{ boxShadow: "0 6px 24px rgba(0,0,0,0.18)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {selected.photos?.[0] && (
            <img
              src={selected.photos[0]}
              alt=""
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">{selected.poi.emoji}</span>
              <span className="text-[14px] font-semibold text-dpInk truncate">
                {selected.poi.name}
              </span>
            </div>
            <div className="text-[11px] text-dpText-tertiary mt-0.5 truncate">
              {selected.poi.city}
              {selected.poi.district && ` · ${selected.poi.district}`} ·{" "}
              {selected.poi.category}
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[11px] text-dpText-secondary">
                {selected.date} {selected.time}
              </span>
              {selected.achievement && (
                <span className="text-[10px] text-dpOrange-deep flex items-center gap-0.5 truncate ml-2">
                  ✨ {selected.achievement.slice(0, 15)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setSelected(null)}
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#f0f0f0] flex items-center justify-center"
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="3">
              <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
