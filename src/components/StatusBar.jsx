import React from "react";

// iOS 状态栏：左边时间，右边信号/wifi/电量
// variant: "light" 用于深色背景, "dark" 用于浅色背景
export default function StatusBar({ variant = "dark", time = "9:48" }) {
  const color = variant === "light" ? "white" : "#1a1a1a";
  return (
    <div
      className="status-bar"
      style={{ color, position: "relative", zIndex: 50 }}
    >
      <div style={{ fontWeight: 600 }}>{time}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill={color}>
          <rect x="0" y="8" width="3" height="4" rx="0.5" />
          <rect x="5" y="5" width="3" height="7" rx="0.5" />
          <rect x="10" y="2" width="3" height="10" rx="0.5" />
          <rect x="15" y="0" width="3" height="12" rx="0.5" opacity="0.4" />
        </svg>
        {/* wifi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <path
            d="M8.5 11.5l1.8-1.8a2.55 2.55 0 0 0-3.6 0L8.5 11.5zM4.6 7.6a5.55 5.55 0 0 1 7.85 0l1.4-1.4A7.55 7.55 0 0 0 3.2 6.2l1.4 1.4zM.7 3.7a11 11 0 0 1 15.6 0l1.4-1.4a13 13 0 0 0-18.4 0L.7 3.7z"
            fill={color}
          />
        </svg>
        {/* battery */}
        <svg width="27" height="12" viewBox="0 0 27 12" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="22"
            height="11"
            rx="2.5"
            stroke={color}
            opacity="0.5"
          />
          <rect x="2" y="2" width="19" height="8" rx="1.5" fill={color} />
          <rect x="24" y="4" width="2" height="4" rx="1" fill={color} opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}
