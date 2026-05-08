import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FRIEND_FEED, FRIEND_STORIES } from "../data/friendFeed";
import { FRIENDS } from "../data/friends";

// 「关注」Tab 页内容(好友圈)
// 结构:Story 行 → Banner(好友打卡排行) → 好友评价信息流
export default function Following() {
  const navigate = useNavigate();
  const [readStories, setReadStories] = useState(new Set());
  const [activeStoryIdx, setActiveStoryIdx] = useState(null);

  // 前三名好友头像(mock:取 FRIENDS 列表前3)
  const top3 = FRIENDS.slice(0, 3);

  // Story 排序:未读优先
  const sortedStories = [...FRIEND_STORIES].sort((a, b) => {
    const aRead = readStories.has(a.friend.id);
    const bRead = readStories.has(b.friend.id);
    if (aRead !== bRead) return aRead ? 1 : -1;
    return 0;
  });

  const handleStoryClick = (story) => {
    const idx = sortedStories.findIndex((st) => st.friend.id === story.friend.id);
    setActiveStoryIdx(idx >= 0 ? idx : 0);
    setReadStories((prev) => new Set([...prev, story.friend.id]));
  };

  return (
    <div className="pb-4">
      {/* ── Story 行 ── */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 py-3">
        {sortedStories.map((s) => {
          const isRead = readStories.has(s.friend.id) || !s.unread;
          return (
            <button
              key={s.friend.id}
              onClick={() => handleStoryClick(s)}
              className="shrink-0 flex flex-col items-center gap-1 w-[58px]"
            >
              <div
                className="w-[52px] h-[52px] rounded-full p-[2.5px]"
                style={{
                  background: isRead
                    ? "#ddd"
                    : "linear-gradient(135deg, #FF6F00, #FFA040)",
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-[2px]">
                  <img
                    src={s.friend.avatar}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span
                className={`text-[10px] truncate w-full text-center ${
                  isRead ? "text-dpText-tertiary" : "text-dpInk font-medium"
                }`}
              >
                {s.friend.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Banner: 好友打卡排行 ── */}
      <div className="px-4 mb-3">
        <button
          onClick={() => navigate("/ranking")}
          className="w-full rounded-2xl p-3 flex items-center gap-3"
          style={{
            background: "#FFF9F5",
            border: "1px solid rgba(255,111,0,0.18)",
          }}
        >
          <div className="text-2xl">🏆</div>
          <div className="flex-1 text-left">
            <div className="text-[14px] font-medium text-dpInk">5 月好友打卡排行</div>
            <div className="text-[11px] text-dpText-tertiary mt-0.5">看看谁是本月打卡王</div>
          </div>
          <div className="flex items-center gap-2">
            {/* 前三名头像堆叠 */}
            <div className="flex -space-x-2">
              {top3.map((f, i) => (
                <div
                  key={f.id}
                  className="w-7 h-7 rounded-full overflow-hidden border-2 border-white bg-[#f5f5f5]"
                  style={{ zIndex: 3 - i }}
                >
                  <img src={f.avatar} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      </div>

      {/* ── 好友评价/打卡信息流 ── */}
      <div className="space-y-0">
        {FRIEND_FEED.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </div>

      {/* ── Story 全屏查看 ── */}
      <AnimatePresence>
        {activeStoryIdx !== null && (
          <StoryViewer
            stories={sortedStories}
            initialIdx={activeStoryIdx}
            onClose={() => setActiveStoryIdx(null)}
            onRead={(id) => setReadStories((prev) => new Set([...prev, id]))}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 信息流卡片 ──
function FeedCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const f = item.friend;
  const isCheckin = item.type === "checkin";
  const textOverflow = item.text && item.text.length > 80;

  return (
    <div className="px-4 py-4 border-b border-[#f5f5f5]">
      {/* 头部:头像 + 名字 + 标签 + 时间 */}
      <div className="flex items-start gap-2.5 mb-2">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#f5f5f5] shrink-0">
          <img src={f.avatar} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-semibold text-dpInk truncate">
              {f.name}
            </span>
            <span
              className="text-[9px] px-1 py-px rounded font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
            >
              Lv{f.name === "Niki" ? "8" : Math.max(3, 8 - (f.name.length % 5))}
            </span>
            {item.tags?.map((t) => (
              <span key={t} className="text-[9px] px-1 py-px bg-dpOrange-bg text-dpOrange-deep rounded shrink-0">
                {t}
              </span>
            ))}
          </div>
          {/* 评价类型行 */}
          <div className="flex items-center gap-1 mt-0.5">
            {isCheckin ? (
              <span className="text-[11px] text-dpText-secondary">打卡成功</span>
            ) : (
              <>
                <span className="text-[11px] text-dpText-secondary">发布评价</span>
                {item.rating && (
                  <span className="text-[11px]">
                    {item.rating === "很棒" ? "😊" : item.rating === "超赞" ? "🤩" : "😊"}
                    <span className="text-dpOrange-deep font-medium ml-0.5">{item.rating}</span>
                  </span>
                )}
                {item.stars && (
                  <span className="text-[11px] text-dpOrange">
                    {"★".repeat(item.stars)}{"☆".repeat(5 - item.stars)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        <span className="text-[11px] text-dpText-tertiary shrink-0">{item.time}</span>
      </div>

      {/* 正文 */}
      {item.text && (
        <div className="mb-2">
          <span className="text-[14px] text-dpInk leading-relaxed">
            {expanded || !textOverflow
              ? item.text
              : item.text.slice(0, 80) + "..."}
          </span>
          {textOverflow && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-[14px] text-dpOrange-deep ml-0.5"
            >
              展开
            </button>
          )}
        </div>
      )}

      {/* 照片(3列网格) */}
      {item.photos && item.photos.length > 0 && (
        <div
          className={`mb-2 gap-1 ${
            item.photos.length === 1
              ? "w-[180px]"
              : "grid grid-cols-3"
          }`}
          style={item.photos.length === 1 ? {} : {}}
        >
          {item.photos.slice(0, 6).map((p, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden bg-[#f0f0f0]"
              style={{ aspectRatio: item.photos.length === 1 ? "4/3" : "1/1" }}
            >
              <img src={p} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      )}

      {/* POI 卡片 */}
      {item.poi && (
        <div
          className="rounded-xl p-2.5 flex items-center gap-2.5 mb-2"
          style={{ background: "#FAFAF7" }}
        >
          {item.poi.image && (
            <img
              src={item.poi.image}
              alt=""
              className="w-10 h-10 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-semibold text-dpInk truncate">
                {item.poi.name}
              </span>
              <span className="text-[12px] text-dpOrange-deep font-medium shrink-0">
                {item.poi.rating}星
              </span>
              {item.poi.city && (
                <span className="text-[11px] text-dpText-tertiary shrink-0 ml-auto">
                  {item.poi.city}
                </span>
              )}
            </div>
            <div className="text-[10px] text-dpText-tertiary mt-0.5 truncate">
              {item.poi.category}
              {item.poi.badge && ` · ${item.poi.badge}`}
            </div>
          </div>
        </div>
      )}

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between text-[12px] text-dpText-tertiary pt-1">
        <button className="flex items-center gap-1">
          <span>···</span>
        </button>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1">
            💬 评论{item.comments ? ` ${item.comments}` : ""}
          </button>
          <button className="flex items-center gap-1">
            {isCheckin ? "♡ 点赞" : "👍 有帮助"}
            {item.likes ? ` ${item.likes}` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Story 全屏查看器(即刻风格,翻页按钮 + 简化底部) ──
function StoryViewer({ stories, initialIdx, onClose, onRead }) {
  const [storyIdx, setStoryIdx] = React.useState(initialIdx);
  const [photoIdx, setPhotoIdx] = React.useState(0);
  const [liked, setLiked] = React.useState(false);

  const story = stories[storyIdx];
  const photos = story.photos || [story.photo];
  const hasPrev = storyIdx > 0;
  const hasNext = storyIdx < stories.length - 1;

  const goPrev = () => {
    if (!hasPrev) return;
    setStoryIdx(i => i - 1);
    setPhotoIdx(0);
    setLiked(false);
    onRead?.(stories[storyIdx - 1].friend.id);
  };
  const goNext = () => {
    if (!hasNext) return;
    setStoryIdx(i => i + 1);
    setPhotoIdx(0);
    setLiked(false);
    onRead?.(stories[storyIdx + 1].friend.id);
  };

  // 多图左右切(在主图上点左右半区)
  const handleImgClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2 && photoIdx > 0) {
      setPhotoIdx(i => i - 1);
    } else if (x >= rect.width / 2 && photoIdx < photos.length - 1) {
      setPhotoIdx(i => i + 1);
    }
  };

  return (
    <motion.div
      key={storyIdx}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#111] flex flex-col select-none"
    >
      {/* 顶部:头像 + 名字 + 时间 + 关闭 */}
      <div className="pt-10 px-5 pb-2 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-white/20 shrink-0">
          <img src={story.friend.avatar} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-[14px] font-semibold truncate">{story.friend.name}</div>
          <div className="text-white/55 text-[11px]">{story.time}</div>
        </div>
        <button onClick={onClose} className="text-white/65 p-1 shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 日期 + 飞机 */}
      <div className="px-5 mb-2 flex items-center gap-2">
        <div className="bg-white/15 rounded-lg px-2 py-1 text-center min-w-[34px]">
          <div className="text-white text-[15px] font-bold leading-tight">{new Date().getDate()}</div>
          <div className="text-white/55 text-[10px]">{new Date().getMonth() + 1}月</div>
        </div>
        {story.isTravel && <span className="text-xl">✈️</span>}
      </div>

      {/* 中部:左右翻页箭头 + 主图 */}
      <div className="flex-1 px-2 flex items-center gap-2">
        {/* 左翻页 */}
        <button
          onClick={goPrev}
          disabled={!hasPrev}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-25"
          style={{ background: "rgba(255,255,255,0.12)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* 主图(方形 1:1) */}
        <div className="flex-1 flex flex-col gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${storyIdx}-${photoIdx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={handleImgClick}
              className="relative w-full rounded-2xl overflow-hidden cursor-pointer"
              style={{ aspectRatio: "1/1", boxShadow: "0 8px 32px rgba(0,0,0,0.55)" }}
            >
              <img
                src={photos[photoIdx]}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* POI 标签(橙色) */}
              <div
                className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full flex items-center gap-1"
                style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="white">
                  <path d="M12 21l-6-9a7 7 0 1112 0l-6 9z" />
                </svg>
                <span className="text-[10px] font-medium text-white">{story.poi}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 多图圆点指示器 */}
          {photos.length > 1 && (
            <div className="flex justify-center gap-1.5">
              {photos.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: i === photoIdx ? 16 : 5,
                    height: 5,
                    background: i === photoIdx ? "white" : "rgba(255,255,255,0.3)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 右翻页 */}
        <button
          onClick={goNext}
          disabled={!hasNext}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-25"
          style={{ background: "rgba(255,255,255,0.12)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 底部:输入框 + 点赞按钮 */}
      <div className="px-4 py-5 flex items-center gap-3">
        <div
          className="flex-1 h-10 rounded-full px-4 flex items-center"
          style={{ background: "rgba(255,255,255,0.12)" }}
        >
          <span className="text-white/45 text-[13px]">说点什么...</span>
        </div>
        <button
          onClick={() => setLiked(l => !l)}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.12)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24"
            fill={liked ? "#FF6F00" : "none"}
            stroke={liked ? "#FF6F00" : "white"}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
