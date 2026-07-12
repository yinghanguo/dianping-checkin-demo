import nikiAvatar from "../assets/niki-avatar.svg";
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FRIEND_FEED, FRIEND_STORIES } from "../data/friendFeed";
import { FRIENDS } from "../data/friends";
import { getUserCheckins } from "../utils/userCheckins";
import { getList } from "../data/lists";

// 好友发布清单的动态事件(关系链分发:好友发了清单,在关注流里出现)
const LIST_EVENTS = [
  { listId: "list_f_sh_qingke", time: "2 小时前", action: "公开了一份私藏清单" },
  { listId: "list_r_coffee_sh", time: "昨天 20:14", action: "更新了私藏清单 · 新增 2 家店" },
];

const NIKI_AVATAR =
  {nikiAvatar};

// 相对时间:刚刚 / X 分钟前 / X 小时前 / 昨天 HH:MM / M/D HH:MM
function relativeTime(ts) {
  const now = Date.now();
  const diff = Math.max(0, now - ts);
  if (diff < 60_000) return "刚刚";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)} 小时前`;
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (diff < 2 * 86400_000) return `昨天 ${hh}:${mm}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}

// 「关注」Tab 页内容(好友圈)
// 结构:Story 行 → Banner(好友打卡排行) → 好友评价信息流
export default function Following() {
  const navigate = useNavigate();
  const [readStories, setReadStories] = useState(new Set());
  const [activeStoryIdx, setActiveStoryIdx] = useState(null);

  // 我的最近打卡(取最新 3 条) - localStorage
  const myRecentCheckins = useMemo(() => getUserCheckins().slice(0, 3), []);

  // 单一时间线:把"我的打卡 / 好友评价 / 好友清单事件"按时间先后混排(不再分区)
  const timeline = useMemo(() => {
    // 相对时间文案 → 距今毫秒数(用于排序)
    const rel = (t = "") => {
      if (/刚刚/.test(t)) return 0;
      let m = t.match(/(\d+)\s*分钟前/); if (m) return m[1] * 60e3;
      m = t.match(/(\d+)\s*小时前/); if (m) return m[1] * 3600e3;
      m = t.match(/(\d+)\s*天前/); if (m) return m[1] * 86400e3;
      if (/昨天/.test(t)) return 1.2 * 86400e3;
      return 30 * 86400e3;
    };
    return [
      ...myRecentCheckins.map((c) => ({ kind: "mine", key: `m-${c.id}`, age: Date.now() - c.timestamp, data: c })),
      ...LIST_EVENTS.map((ev, i) => ({ kind: "list", key: `l-${i}`, age: rel(ev.time), data: ev })),
      ...FRIEND_FEED.map((it) => ({ kind: "feed", key: `f-${it.id}`, age: rel(it.time), data: it })),
    ].sort((a, b) => a.age - b.age);
  }, [myRecentCheckins]);

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
            <div className="text-[14px] font-medium text-dpInk">7 月好友打卡排行</div>
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

      {/* ── 动态(单一时间线:我的打卡、好友评价、好友清单事件按时间混排) ── */}
      <div className="border-t-[6px] border-[#f5f5f5] space-y-0">
        {timeline.map((entry) =>
          entry.kind === "mine" ? (
            <MyCheckinCard key={entry.key} checkin={entry.data} onClick={() => navigate("/footprint")} />
          ) : entry.kind === "list" ? (
            <ListEventCard key={entry.key} event={entry.data} navigate={navigate} />
          ) : (
            <FeedCard key={entry.key} item={entry.data} />
          )
        )}
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

// ── 我的打卡卡片(简化版 FeedCard,无评分/无评价类型) ──
function MyCheckinCard({ checkin, onClick }) {
  const c = checkin;
  const photos = c.photos || [];
  const text = c.text || "";
  return (
    <button
      onClick={onClick}
      className="block w-full text-left px-4 py-4 border-b border-[#f5f5f5]"
    >
      {/* 头部 */}
      <div className="flex items-start gap-2.5 mb-2">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#f5f5f5] shrink-0">
          <img src={NIKI_AVATAR} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-semibold text-dpInk">Niki</span>
            <span
              className="text-[9px] px-1 py-px rounded font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
            >
              Lv8
            </span>
            <span className="text-[9px] px-1 py-px bg-dpOrange-bg text-dpOrange-deep rounded font-medium shrink-0">
              我
            </span>
          </div>
          <div className="text-[11px] text-dpText-secondary mt-0.5">
            刚刚打卡了 {c.poi?.name && `· ${c.poi.name}`}
          </div>
        </div>
        <span className="text-[11px] text-dpText-tertiary shrink-0">
          {relativeTime(c.timestamp)}
        </span>
      </div>

      {/* 正文(若有) */}
      {text && (
        <div className="mb-2 text-[14px] text-dpInk leading-relaxed">
          {text.length > 80 ? text.slice(0, 80) + "..." : text}
        </div>
      )}

      {/* 照片 */}
      {photos.length > 0 && (
        <div
          className={`mb-2 gap-1 ${
            photos.length === 1 ? "w-[180px]" : "grid grid-cols-3"
          }`}
        >
          {photos.slice(0, 6).map((p, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden bg-[#f0f0f0]"
              style={{ aspectRatio: photos.length === 1 ? "4/3" : "1/1" }}
            >
              <img src={p} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      )}

      {/* POI 卡片(无评分) */}
      {c.poi?.name && (
        <div
          className="rounded-xl p-2.5 flex items-center gap-2.5 mb-2"
          style={{ background: "#FAFAF7" }}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-white shrink-0">
            {c.poi.emoji || "📍"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[13px] font-semibold text-dpInk truncate">
                {c.poi.name}
              </span>
              {c.poi.city && (
                <span className="text-[11px] text-dpText-tertiary shrink-0 ml-auto">
                  {c.poi.city}
                </span>
              )}
            </div>
            <div className="text-[10px] text-dpText-tertiary mt-0.5 truncate">
              {c.poi.category || "地点"}
              {c.poi.district && ` · ${c.poi.district}`}
            </div>
          </div>
        </div>
      )}

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between text-[12px] text-dpText-tertiary pt-1">
        <span className="text-[11px] text-dpText-tertiary">{c.date} · {c.time}</span>
        <div className="flex items-center gap-4">
          <span>💬 评论{c.comments ? ` ${c.comments}` : ""}</span>
          <span>♡ 点赞{c.likes ? ` ${c.likes}` : ""}</span>
        </div>
      </div>
    </button>
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

  // ── 双轴滑动:图片区上下滑 = 切同一人的多张图;空白区上下滑 = 切人 ──
  const touchY = React.useRef(null);
  const wheelLock = React.useRef(0);
  const goPhoto = (dir) => {
    setPhotoIdx((i) => Math.min(photos.length - 1, Math.max(0, i + dir)));
  };
  const swipeDelta = (e) => {
    if (touchY.current == null) return 0;
    const dy = e.changedTouches[0].clientY - touchY.current;
    touchY.current = null;
    return Math.abs(dy) >= 40 ? dy : 0;
  };
  const onZoneTouchStart = (e) => {
    touchY.current = e.touches[0].clientY;
  };
  // 空白区:上滑下一个人,下滑上一个人
  const onBlankTouchEnd = (e) => {
    const dy = swipeDelta(e);
    if (dy < 0) goNext();
    else if (dy > 0) goPrev();
  };
  // 图片区:上滑下一张图,下滑上一张图(阻止冒泡到空白区)
  const onPhotoTouchStart = (e) => {
    e.stopPropagation();
    touchY.current = e.touches[0].clientY;
  };
  const onPhotoTouchEnd = (e) => {
    e.stopPropagation();
    const dy = swipeDelta(e);
    if (dy < 0) goPhoto(1);
    else if (dy > 0) goPhoto(-1);
  };
  // 桌面滚轮同理(节流 400ms)
  const wheelReady = () => {
    const now = Date.now();
    if (now - wheelLock.current < 400) return false;
    wheelLock.current = now;
    return true;
  };
  const onBlankWheel = (e) => {
    if (!wheelReady()) return;
    if (e.deltaY > 0) goNext();
    else goPrev();
  };
  const onPhotoWheel = (e) => {
    e.stopPropagation();
    if (!wheelReady()) return;
    goPhoto(e.deltaY > 0 ? 1 : -1);
  };

  return (
    <motion.div
      key={storyIdx}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onTouchStart={onZoneTouchStart}
      onTouchEnd={onBlankTouchEnd}
      onWheel={onBlankWheel}
      className="fixed inset-0 z-[200] bg-[#111] flex flex-col select-none"
    >
      {/* 顶部:更多(左) + 头像 + 名字 + 时间 + 关闭(右) */}
      <div className="pt-10 px-5 pb-2 flex items-center gap-3">
        <button className="text-white/65 p-1 shrink-0" aria-label="更多">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
          </svg>
        </button>
        <div className="w-9 h-9 rounded-full overflow-hidden bg-white/20 shrink-0">
          <img src={story.friend.avatar} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-[14px] font-semibold truncate">{story.friend.name}</div>
          <div className="text-white/55 text-[11px]">{story.time}</div>
        </div>
        <button onClick={onClose} className="text-white/65 p-1 shrink-0" aria-label="关闭">
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

      {/* 中部:主图(无左右箭头;图内上下滑切内容,框外上下滑切人) */}
      <div className="flex-1 px-4 flex items-center">
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
              onTouchStart={onPhotoTouchStart}
              onTouchEnd={onPhotoTouchEnd}
              onWheel={onPhotoWheel}
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

// ── 好友清单动态卡(与发布内容同构:头部 → 文案 → 三宫格图 → 查看完整清单入口 → 操作栏) ──
function ListEventCard({ event, navigate }) {
  const list = getList(event.listId);
  if (!list) return null;
  const photos = list.items.map((it) => it.photo).slice(0, 3);
  const open = () => navigate(`/album/${list.id}`, { state: { src: "public" } });
  return (
    <div className="px-4 py-4 border-b border-[#f5f5f5]">
      {/* 头部:头像 + 名字 + 动作 + 时间(同 FeedCard) */}
      <div className="flex items-start gap-2.5 mb-2">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#f5f5f5] shrink-0">
          <img src={list.owner.avatar} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-semibold text-dpInk truncate">{list.owner.name}</span>
            <span
              className="text-[9px] px-1 py-px rounded font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
            >
              {list.owner.level?.replace(".", "") || "Lv7"}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[11px]" style={{ color: "#E65000" }}>{event.action}</span>
          </div>
        </div>
        <span className="text-[11px] text-dpText-tertiary shrink-0">{event.time}</span>
      </div>

      {/* 文案(清单简介/标题) */}
      <div className="mb-2">
        <span className="text-[14px] text-dpInk leading-relaxed">
          「{list.title}」{list.description ? ` ${list.description}` : ""}
        </span>
      </div>

      {/* 照片(3列网格,同 FeedCard) */}
      <div className="mb-2 gap-1 grid grid-cols-3">
        {photos.map((ph, i) => (
          <button key={i} onClick={open} className="rounded-lg overflow-hidden bg-[#f0f0f0]" style={{ aspectRatio: "1/1" }}>
            <img src={ph} alt="" className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {/* 查看完整清单入口(同 POI 卡样式) */}
      <button
        onClick={open}
        className="w-full rounded-xl p-2.5 flex items-center gap-2.5 mb-2 text-left"
        style={{ background: "#FFFAF4", border: "1px solid #FFE8D0" }}
      >
        <img src={list.cover || photos[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FF6F00" strokeWidth="2.5">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinejoin="round" />
            </svg>
            <span className="text-[13px] font-semibold text-dpInk truncate">{list.title}</span>
          </div>
          <div className="text-[10px] text-dpText-tertiary mt-0.5">
            {list.items.length} 家店 · 🔖 {list.saveCount} 人收藏
          </div>
        </div>
        <span className="shrink-0 text-[11px] font-medium flex items-center gap-0.5" style={{ color: "#E65000" }}>
          查看完整清单
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {/* 底部操作栏(清单卡:评论 + 收藏,收藏替代点赞) */}
      <div className="flex items-center justify-between text-[12px] text-dpText-tertiary pt-1">
        <button className="flex items-center gap-1"><span>···</span></button>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1">💬 评论</button>
          <button onClick={open} className="flex items-center gap-1">🔖 收藏 {list.saveCount}</button>
        </div>
      </div>
    </div>
  );
}
