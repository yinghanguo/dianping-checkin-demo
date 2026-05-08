import React from "react";
import { useNavigate } from "react-router-dom";
import StatusBar from "../components/StatusBar";
import { BottomTab } from "./Me";

// 「地图」Tab 暂用占位 — 留给世界层(热力图)
export default function MapPlaceholder() {
  const navigate = useNavigate();
  return (
    <div className="absolute inset-0 bg-[#FAFAF7] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="text-5xl mb-4">🗺️</div>
        <div className="text-[18px] font-semibold text-dpInk mb-1">城市地图</div>
        <div className="text-[13px] text-dpText-tertiary text-center mb-6 leading-relaxed">
          查看热门打卡点 · 本地人 vs 游客<br />
          这里将承接世界层的热力图与榜单
        </div>
        <button
          onClick={() => navigate("/me")}
          className="px-4 h-10 rounded-full bg-dpOrange-bg text-dpOrange-deep text-[13px] font-medium"
        >
          先看「我的足迹」
        </button>
      </div>
      <BottomTab navigate={navigate} active="map" />
    </div>
  );
}
