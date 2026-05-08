import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import { FRIENDS } from "../data/friends";
import { getProfileForFriend } from "../data/friendProfiles";

// 口味档案页 — 好友月度美食记录
// 参考真实点评截图:
//  - 顶部暖黄头部(头像+名字+美食人格+口味偏好)
//  - 下方白色 sheet 弹出(月度美食记录列表)
export default function FriendProfile() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const friendName = params.get("name") || "花花花花花";

  const friend = FRIENDS.find((f) => f.name === friendName) || {
    name: friendName,
    avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(friendName)}&backgroundColor=ffd5dc`,
  };

  const profile = useMemo(() => getProfileForFriend(friendName), [friendName]);
  const [savedItems, setSavedItems] = useState(new Set());

  const toggleSave = (i) => {
    setSavedItems((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#f5f5f5]">

      {/* 月度记录浮层 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex-1 overflow-y-auto no-scrollbar rounded-t-3xl bg-white mt-[220px] pt-4 pb-24"
        style={{ boxShadow: "0 -4px 12px rgba(0,0,0,0.06)" }}
      >
        {/* 标题行 */}
        <div className="px-4 flex items-center justify-between mb-3">
          <div className="text-[15px] font-semibold text-dpInk">
            {friend.name}5月美食记录
          </div>
          <button onClick={() => navigate("/ranking")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 列表 */}
        <div>
          {profile.records.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[#f5f5f5]">
              {/* 店铺图 */}
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f0f0f0] shrink-0">
                <img src={r.image} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[14px] font-medium text-dpInk truncate">
                    {r.name}
                  </span>
                  {r.times > 0 && (
                    <span className="shrink-0 text-[10px] px-1.5 py-px rounded text-dpOrange-deep font-medium"
                      style={{ background: "rgba(255,111,0,0.1)" }}
                    >
                      吃过{r.times}次
                    </span>
                  )}
                </div>

                {/* 评分 + 评价数 + 人均 */}
                <div className="flex items-center gap-1 mb-0.5">
                  <StarsRow rating={r.rating} />
                  <span className="text-[11px] text-dpText-tertiary">
                    {r.reviews}条
                  </span>
                  {r.price > 0 && (
                    <span className="text-[11px] text-dpText-tertiary">
                      ¥{r.price}/人
                    </span>
                  )}
                </div>

                {/* 城市 + 品类 + 距离 */}
                <div className="text-[11px] text-dpText-tertiary truncate">
                  {r.city} {r.category}
                  {r.distance && ` ${r.distance}`}
                </div>
              </div>

              {/* 收藏 */}
              <button
                onClick={() => toggleSave(i)}
                className="shrink-0 ml-1"
              >
                <svg
                  width="20" height="20" viewBox="0 0 24 24"
                  fill={savedItems.has(i) ? "#FF6F00" : "none"}
                  stroke={savedItems.has(i) ? "#FF6F00" : "#ccc"}
                  strokeWidth="1.8"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// 半星评分显示
function StarsRow({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center gap-0.5">
      {Array(full).fill(0).map((_, i) => (
        <svg key={`f${i}`} width="12" height="12" viewBox="0 0 24 24" fill="#FF6F00">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {half && (
        <svg width="12" height="12" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="#FF6F00" />
              <stop offset="50%" stopColor="#e0e0e0" />
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#half)" />
        </svg>
      )}
      {Array(empty).fill(0).map((_, i) => (
        <svg key={`e${i}`} width="12" height="12" viewBox="0 0 24 24" fill="#e0e0e0">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}
