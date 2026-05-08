import React from "react";

export default function PhoneFrame({ children, indicatorLight = false }) {
  return (
    <div className="iphone-frame">
      {children}
      <div className={`home-indicator ${indicatorLight ? "home-indicator-light" : ""}`} />
    </div>
  );
}
