import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FRIENDS } from "../data/friends";
import { getProfileForFriend } from "../data/friendProfiles";
import { getPublicListsOf } from "../data/lists";

// 客态个人主页 — 与主态(Me 页)差异化:
//   主态强调资产沉淀(去过哪、发过什么);客态强调"给别人看的东西"——
//   完整头部(等级/粉丝关注获赞)+ 内容,且默认锚定在「私藏」Tab(公开清单是品味门面)
const PERSONA = {
  "日酱": "在南西上班第四年，咖啡因和居酒屋成瘾",
  "一只美食界的Zoe...": "请客选店担当，你永远可以相信粤菜和啫啫煲",
  "坏蛋bobo": "十点后下班，专修深夜食堂",
  "花花花花花": "梧桐区暗访员，回不去云南的日子靠这几家救命",
  "再来一碗豆腐汤": "又四处喝了一年咖啡，理由都摘自我当时写下的话",
  "Fitz": "跟着王教练从静安打到杨浦又打到徐汇，现在开始学发球了",
  "WinWinWendy": "旅行时只信吃货，不信榜单",
};

export default function FriendProfile() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const friendName = params.get("name") || "花花花花花";

  const friend = FRIENDS.find((f) => f.name === friendName) || {
    name: friendName,
    avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(friendName)}&backgroundColor=ffd5dc`,
    fans: 128,
  };

  const profile = useMemo(() => getProfileForFriend(friendName), [friendName]);
  const friendLists = useMemo(() => getPublicListsOf(friendName), [friendName]);

  // 客态默认锚定在公开清单(私藏)上
  const [tab, setTab] = useState("私藏");
  const [followed, setFollowed] = useState(false);

  const totalSaves = friendLists.reduce((s, l) => s + (l.saveCount || 0), 0);
  const totalLikes = friendLists.reduce((s, l) => s + (l.likeCount || 0), 0);
  const followCount = ((friend.fans || 66) % 97) + 12;
  const checkinCount = (profile.records?.length || 6) * 23;
  const level = friendLists[0]?.owner?.level || "Lv.6";

  // 评价 Tab:清单里的一句话理由本身就是 TA 的评价资产
  const reviewItems = useMemo(
    () =>
      friendLists.flatMap((l) =>
        l.items.map((it) => ({ ...it, fromList: l.title, listId: l.id }))
      ),
    [friendLists]
  );

  const TABS = [
    { key: "私藏", count: friendLists.length },
    { key: "动态", count: null },
    { key: "评价", count: reviewItems.length },
  ];

  return (
    <div className="absolute inset-0 bg-[#F5F5F5] flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        {/* ── 头部(渐变背景) ── */}
        <div
          className="relative px-4 pt-3 pb-4"
          style={{ background: "linear-gradient(180deg, #FFE3C2 0%, #FFF3E0 60%, #F5F5F5 100%)" }}
        >
          {/* 顶部操作栏 */}
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate(-1)} className="w-9 h-9 -ml-2 flex items-center justify-center">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20L17 17" strokeLinecap="round" />
              </svg>
              <span className="text-[#1a1a1a] tracking-widest text-[15px] font-bold">···</span>
            </div>
          </div>

          {/* 头像 + 名字 + 等级 */}
          <div className="flex items-start gap-3.5">
            <div
              className="w-[76px] h-[76px] rounded-full overflow-hidden bg-white shrink-0"
              style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }}
            >
              <img src={friend.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="text-[20px] font-bold text-dpInk truncate">{friend.name}</div>
              <div className="text-[11px] text-dpText-tertiary mt-0.5">IP: 上海市 ⓘ</div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className="h-[18px] inline-flex items-center px-1.5 rounded text-[10px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
                >
                  {level}
                </span>
                {totalSaves > 300 && (
                  <span
                    className="h-[18px] inline-flex items-center gap-0.5 px-1.5 rounded text-[10px] font-medium"
                    style={{ background: "#FFF0E5", color: "#C8541A" }}
                  >
                    🔖 私藏达人
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 粉丝/关注/获赞与被藏 */}
          <div className="flex items-center gap-5 mt-3.5 text-[12px] text-dpText-secondary">
            <span>
              <b className="text-[15px] text-dpInk mr-1">{friend.fans ?? 128}</b>粉丝
            </span>
            <span>
              <b className="text-[15px] text-dpInk mr-1">{followCount}</b>关注
            </span>
            <span>
              <b className="text-[15px] text-dpInk mr-1">{totalLikes + totalSaves}</b>获赞与被藏
            </span>
          </div>

          {/* 简介(人设一句话) */}
          <div className="text-[12.5px] text-dpText-secondary mt-2">
            {PERSONA[friend.name] || "认真吃饭的人"}
          </div>

          {/* 轻量资产条:客态只给聚合数,不暴露具体轨迹 */}
          <div className="flex gap-2 mt-2.5">
            <span className="text-[11px] px-2 py-1 rounded-lg bg-white/70 text-dpText-secondary">
              📍 打卡足迹 · 累计 {checkinCount} 次
            </span>
            <span className="text-[11px] px-2 py-1 rounded-lg bg-white/70 text-dpText-secondary">
              🍴 口味档案 · 粤菜 / 咖啡 / 小馆
            </span>
          </div>

          {/* 关注 + 私信(客态操作区) */}
          <div className="flex gap-2.5 mt-3.5">
            <button
              onClick={() => setFollowed((v) => !v)}
              className="flex-1 h-9 rounded-full text-[14px] font-medium"
              style={
                followed
                  ? { background: "white", color: "#999", border: "1px solid #e5e5e5" }
                  : { background: "linear-gradient(135deg, #FF6F00, #FFA040)", color: "white" }
              }
            >
              {followed ? "已关注" : "+ 关注"}
            </button>
            <button className="flex-1 h-9 rounded-full bg-white text-[14px] text-dpInk font-medium" style={{ border: "1px solid #e5e5e5" }}>
              私信
            </button>
          </div>
        </div>

        {/* ── 内容 Tab(客态默认锚定「私藏」) ── */}
        <div className="bg-white rounded-t-2xl -mt-1">
          <div className="px-4 pt-3 flex gap-6 border-b border-[#f5f5f5]">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className="pb-2.5 relative">
                <span className={`text-[15px] ${tab === t.key ? "text-dpInk font-bold" : "text-dpText-secondary"}`}>
                  {t.key}
                  {t.count != null && <span className="text-[11px] font-normal ml-0.5">{t.count}</span>}
                </span>
                {tab === t.key && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full bg-dpOrange" />
                )}
              </button>
            ))}
          </div>

          {/* ══ 私藏:公开清单(品味门面) ══ */}
          {tab === "私藏" && (
            <div className="px-3 py-3">
              {friendLists.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-dpText-tertiary gap-2">
                  <div className="text-[36px]">🔖</div>
                  <div className="text-[13px]">TA 还没有公开的私藏</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {friendLists.map((l, idx) => {
                    return (
                      <motion.button
                        key={l.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        onClick={() => navigate(`/album/${l.id}`)}
                        className="bg-white rounded-xl overflow-hidden text-left"
                        style={{ border: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                      >
                        <div className="relative w-full bg-[#f0f0f0]" style={{ aspectRatio: "4/3" }}>
                          <img src={l.cover} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="px-2.5 py-2">
                          <div
                            className="text-[12.5px] font-medium text-dpInk leading-snug"
                            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                          >
                            {l.title}
                          </div>
                          <div className="text-[10px] text-dpText-tertiary mt-1">
                            {l.items.length} 家店 · ♡ {l.likeCount} · 藏 {l.saveCount}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ 动态:月度美食记录 ══ */}
          {tab === "动态" && (
            <div className="pb-2">
              <div className="px-4 py-3 text-[14px] font-semibold text-dpInk">
                {friend.name} 的 5 月美食记录
              </div>
              {profile.records.map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[#f5f5f5]">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f0f0f0] shrink-0">
                    <img src={r.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[14px] font-medium text-dpInk truncate">{r.name}</span>
                      {r.times > 0 && (
                        <span
                          className="shrink-0 text-[10px] px-1.5 py-px rounded text-dpOrange-deep font-medium"
                          style={{ background: "rgba(255,111,0,0.1)" }}
                        >
                          吃过{r.times}次
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <StarsRow rating={r.rating} />
                      <span className="text-[11px] text-dpText-tertiary">{r.reviews}条</span>
                      {r.price > 0 && <span className="text-[11px] text-dpText-tertiary">¥{r.price}/人</span>}
                    </div>
                    <div className="text-[11px] text-dpText-tertiary truncate">
                      {r.city} {r.category}
                      {r.distance && ` ${r.distance}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ══ 评价:清单理由即评价资产 ══ */}
          {tab === "评价" && (
            <div className="pb-2">
              {reviewItems.map((it, i) => (
                <button
                  key={`${it.poi?.name}-${i}`}
                  onClick={() => navigate(`/album/${it.listId}`)}
                  className="w-full text-left flex gap-3 px-4 py-3.5 border-b border-[#f5f5f5]"
                >
                  <div className="w-[70px] h-[70px] rounded-xl overflow-hidden bg-[#f0f0f0] shrink-0">
                    <img src={it.photo} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-dpInk truncate">{it.poi?.name}</div>
                    <p className="text-[12.5px] text-dpInk leading-relaxed mt-1">“{it.reason}”</p>
                    <div className="text-[10.5px] mt-1" style={{ color: "#B08850" }}>
                      收录于「{it.fromList}」
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
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
