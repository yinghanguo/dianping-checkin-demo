import React, { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PK_EVENT,
  CREATOR_PRIZES,
  VOTER_PRIZES,
  PK_THEMES,
  PK_DISTRICT_SAMPLES,
  PK_DISTRICT_TOTAL,
  ENTRY_REQUIREMENTS,
  getPkTracks,
  getPkEntriesFlat,
  castVote,
  voteCount,
  MY_PK_STATS,
} from "../data/pkArena";
import { buildCoffeeDraft } from "../data/lists";

// 「私藏杯 · 上海站」活动主会场 — 双阶段
// 提报期(?phase=submit):面向创作者 —— 大奖前置 + 投稿入口;由 Me 页 banner 引流
// 开赛期(默认):面向投票用户 —— 玩法规则 + 用户奖品 + 主题/商圈 Tab 混排双榜;由首页 banner 引流
export default function PkArena() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const phase = searchParams.get("phase") === "submit" ? "submit" : "live";
  const conf = PK_EVENT.phases[phase];

  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // 开赛期奖品橱窗:人气王最前 → 用户奖 → 其余创作者奖
  const livePrizes = [CREATOR_PRIZES[0], ...VOTER_PRIZES, ...CREATOR_PRIZES.slice(1)];

  return (
    <div className="absolute inset-0 bg-[#F5F5F5] flex flex-col">
      {/* ── 沉浸头部:仅标题 + 副标题 + 时间轴 + 大奖橱窗 ── */}
      <div
        className="shrink-0 relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, #2B1200 0%, #7A2E00 55%, #E65000 130%)" }}
      >
        <div className="absolute -right-8 -top-10 text-[120px] opacity-[0.12] rotate-12 select-none">🏆</div>
        <div className="flex items-center gap-2 px-3 pt-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="text-[12px] text-white/70">{conf.statusLine}</span>
        </div>
        <div className="px-5 pb-4 pt-1">
          <div className="text-[24px] font-black text-white tracking-wide">{PK_EVENT.name}</div>
          <div className="text-[13px] text-white/90 mt-1">{PK_EVENT.slogan}</div>

          {/* 时间轴 */}
          <div className="flex items-center mt-3.5">
            {conf.schedule.map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div className="flex-1 h-px mx-1" style={{ background: "rgba(255,255,255,0.25)" }} />}
                <div className="flex flex-col items-center">
                  <div
                    className="px-2 h-5 rounded-full flex items-center text-[10px] font-medium"
                    style={
                      s.active
                        ? { background: "#FF6F00", color: "#fff" }
                        : { background: "rgba(255,255,255,0.14)", color: s.done ? "#FFB27A" : "rgba(255,255,255,0.55)" }
                    }
                  >
                    {s.done ? "✓ " : ""}{s.label}
                  </div>
                  <span className="text-[9px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{s.date}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* 大奖橱窗 */}
          <PrizeShelf
            prizes={phase === "submit" ? CREATOR_PRIZES : livePrizes}
            title={phase === "submit" ? "参赛赢什么" : "投票 + 打卡赢什么"}
          />
        </div>
      </div>

      {/* ── 滚动区 ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        {phase === "submit" ? (
          <SubmitView navigate={navigate} />
        ) : (
          <LiveView navigate={navigate} showToast={showToast} />
        )}

        {/* 计分规则 */}
        <div className="mx-3 mt-3 bg-white rounded-2xl px-4 py-3">
          <div className="text-[11px] font-semibold text-dpText-secondary mb-1.5">计分与规则</div>
          {PK_EVENT.rules.map((r) => (
            <div key={r} className="flex gap-1.5 text-[10.5px] text-dpText-tertiary leading-relaxed">
              <span className="shrink-0">·</span>
              <span>{r}</span>
            </div>
          ))}
        </div>

        {/* 演示用:阶段切换 */}
        <div className="text-center mt-3">
          <button
            onClick={() => setSearchParams(phase === "submit" ? {} : { phase: "submit" })}
            className="text-[10px] text-dpText-tertiary underline"
          >
            演示:切换到{phase === "submit" ? "开赛期" : "提报期"}主会场
          </button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-full text-white text-[12px] z-[105]"
            style={{ background: "rgba(0,0,0,0.78)" }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 大奖橱窗(头部横滑) ──
function PrizeShelf({ prizes, title }) {
  return (
    <div className="mt-3.5">
      <div className="text-[10.5px] font-medium mb-1.5" style={{ color: "#FFB27A" }}>🏅 {title}</div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-0.5">
        {prizes.map((p) => (
          <div
            key={p.name}
            className="shrink-0 rounded-xl px-3 py-2.5 w-[168px]"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,178,122,0.3)" }}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[16px]">{p.emoji}</span>
              <span className="text-[12px] font-bold text-white">{p.name}</span>
            </div>
            <div className="text-[11px] mt-1 leading-snug" style={{ color: "#FFD9B8" }}>{p.prize}</div>
            <div className="text-[9.5px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>{p.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══ 提报期视图:面向创作者 —— 投稿入口 + 赛道库 + 报名要求 ══
function SubmitView({ navigate }) {
  const tracks = useMemo(() => getPkTracks(), []);
  const totalEntries = tracks.reduce((s, t) => s + t.entries.length, 0);
  const owners = tracks.flatMap((t) => t.entries.map((e) => e.list.owner));

  return (
    <>
      {/* 投稿入口(主 CTA) —— 从比赛入口进编辑器,带 pkEntry 触发挂标签流程 */}
      <div className="mx-3 mt-3">
        <button
          onClick={() => navigate("/album/create", { state: { pkEntry: true, draft: buildCoffeeDraft() } })}
          className="w-full rounded-2xl px-4 py-4 text-left relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #FF6F00, #FF9838)" }}
        >
          <div className="text-[16px] font-bold text-white">我要参赛 · 提交我的私藏</div>
          <div className="text-[11px] text-white/85 mt-0.5">
            提交后挂一个灵感标签 · 8/14 23:59 截止
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[28px]">✍️</div>
        </button>
        <div className="flex items-center gap-2 mt-2 px-1">
          <div className="flex -space-x-2">
            {owners.slice(0, 5).map((o, i) => (
              <div key={i} className="w-5 h-5 rounded-full overflow-hidden border border-white bg-[#eee]" style={{ zIndex: 5 - i }}>
                <img src={o.avatar} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <span className="text-[11px] text-dpText-tertiary">已有 {totalEntries} 份私藏提报</span>
        </div>
      </div>

      {/* 灵感库(不是固定赛道,只帮你想清单往哪个方向做,提交时挑一个当标签) */}
      <div className="mx-3 mt-3 bg-white rounded-2xl px-4 py-3.5">
        <div className="text-[13px] font-bold text-dpInk">找灵感 · 私藏往哪个方向做</div>
        <div className="text-[10.5px] text-dpText-tertiary mt-0.5 mb-2">
          商圈和主题不是固定赛道,只是灵感;提交时给清单挂一个当标签就行
        </div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="shrink-0 px-1.5 h-[18px] rounded text-[10px] font-medium flex items-center" style={{ background: "#E8F1FF", color: "#2F6FED" }}>商圈</span>
          <span className="text-[10px] text-dpText-tertiary">你最懂的那片街区</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {PK_DISTRICT_SAMPLES.map((d) => (
            <span key={d} className="px-2 h-6 rounded-full text-[11px] flex items-center bg-[#F5F7FA] text-dpText-secondary">{d}</span>
          ))}
          <span className="px-2 h-6 rounded-full text-[11px] flex items-center text-dpText-tertiary">…共 {PK_DISTRICT_TOTAL} 个</span>
        </div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="shrink-0 px-1.5 h-[18px] rounded text-[10px] font-medium flex items-center" style={{ background: "#FFF0E5", color: "#E65000" }}>主题</span>
          <span className="text-[10px] text-dpText-tertiary">你最懂的那个场景</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PK_THEMES.map((t) => (
            <span key={t} className="px-2 h-6 rounded-full text-[11px] flex items-center bg-[#FFF8F2] text-dpText-secondary">{t}</span>
          ))}
        </div>
      </div>

      {/* 报名要求 */}
      <div className="mx-3 mt-3 bg-white rounded-2xl px-4 py-3.5">
        <div className="text-[13px] font-bold text-dpInk mb-2">报名要求</div>
        {ENTRY_REQUIREMENTS.map((r, i) => (
          <div key={r} className="flex gap-2 text-[12px] text-dpText-secondary leading-relaxed mb-1">
            <span className="shrink-0 w-4 h-4 rounded-full text-[10px] flex items-center justify-center mt-0.5" style={{ background: "#FFF0E5", color: "#E65000" }}>{i + 1}</span>
            <span>{r}</span>
          </div>
        ))}
        <div className="text-[10.5px] text-dpText-tertiary mt-2">
          全部奖品由平台采购,不接受商户赞助;发现商业合作即取消资格并公示。
        </div>
      </div>
    </>
  );
}

// ══ 开赛期视图:玩法 + 我的助攻(去抽奖) + 主题/商圈 Tab 混排双榜 ══
function LiveView({ navigate, showToast }) {
  const [tab, setTab] = useState("主题"); // 默认锚定主题 Tab
  const [board, setBoard] = useState("checkins"); // checkins(打卡榜) | votes(人气榜)
  const [tick, setTick] = useState(0);
  const [lottery, setLottery] = useState(false);

  const entries = useMemo(() => getPkEntriesFlat(tab, board), [tab, board, tick]);

  const handleVote = (entry) => {
    if (entry.voted) return;
    if (voteCount(entry.trackId) >= 3) {
      showToast(`「${entry.trackName}」这个方向已投满 3 票`);
      return;
    }
    if (castVote(entry.trackId, entry.listId)) {
      setTick((v) => v + 1);
      showToast(`已投给「${entry.list.title.slice(0, 12)}…」· 投中打卡王得伯乐奖资格`);
    }
  };

  return (
    <>
      {/* 怎么玩:投票规则前置 */}
      <div className="mx-3 mt-3 bg-white rounded-2xl px-4 py-3.5">
        <div className="text-[13px] font-bold text-dpInk mb-2">怎么玩</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { emoji: "🔖", t: "收藏清单", d: "收藏后你的打卡才计分" },
            { emoji: "🌱", t: "到店打卡", d: "= 为清单助攻,冠军由它决出" },
            { emoji: "🗳️", t: "投票预测", d: "限投 3 份,投中打卡王得伯乐奖资格" },
          ].map((s, i) => (
            <div key={s.t} className="rounded-xl px-2 py-2.5 text-center" style={{ background: "#FFFAF5" }}>
              <div className="text-[18px]">{s.emoji}</div>
              <div className="text-[11.5px] font-semibold text-dpInk mt-1">{i + 1}. {s.t}</div>
              <div className="text-[9.5px] text-dpText-tertiary mt-0.5 leading-snug">{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 我的助攻 + 去抽奖 */}
      <div
        className="mx-3 mt-3 rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, #FFF3E0, #FFE5C2)", border: "1px solid rgba(255,111,0,0.15)" }}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-semibold text-dpInk">
            我的助攻:已完成 {MY_PK_STATS.assists} 次打卡
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            {MY_PK_STATS.ladder.map((n) => (
              <div
                key={n}
                className="px-1.5 h-4 rounded-full text-[9px] flex items-center font-medium"
                style={
                  MY_PK_STATS.assists >= n
                    ? { background: "#FF6F00", color: "#fff" }
                    : { background: "rgba(255,111,0,0.12)", color: "#C8541A" }
                }
              >
                {n} 次{MY_PK_STATS.assists >= n ? " ✓" : ""}
              </div>
            ))}
            <span className="text-[10px] text-dpText-tertiary ml-1">满档可抽奖</span>
          </div>
        </div>
        <button
          onClick={() => setLottery(true)}
          className="shrink-0 px-3.5 h-8 rounded-full text-[12px] text-white font-medium"
          style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
        >
          去抽奖
        </button>
      </div>

      {/* Tab:主题(默认) / 商圈 + 双榜切换 */}
      <div className="mx-3 mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {["主题", "商圈"].map((t) => (
            <button key={t} onClick={() => setTab(t)} className="relative pb-1">
              <span className={`text-[15px] ${tab === t ? "font-bold text-dpInk" : "text-dpText-tertiary"}`}>
                {t}
              </span>
              {tab === t && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-dpOrange rounded-full" />
              )}
            </button>
          ))}
        </div>
        <div className="flex rounded-full bg-white p-0.5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          {[
            { key: "checkins", label: "🌱 打卡榜" },
            { key: "votes", label: "🔥 人气榜" },
          ].map((b) => (
            <button
              key={b.key}
              onClick={() => setBoard(b.key)}
              className={`px-2.5 h-6 rounded-full text-[11px] font-medium transition-all ${
                board === b.key ? "text-white" : "text-dpText-tertiary"
              }`}
              style={board === b.key ? { background: "linear-gradient(135deg, #FF6F00, #FFA040)" } : {}}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-3 text-[10px] text-dpText-tertiary mt-1">
        {board === "checkins"
          ? "打卡榜 = 收藏者的真实到店打卡(结算榜,决定冠军)"
          : "人气榜 = 投票(过程榜,不进冠军计分)"}
      </div>

      {/* 混排榜单:全部清单拉平,赛道名作标签 */}
      <div className="mx-3 mt-2 bg-white rounded-2xl p-3 space-y-2">
        {entries.map((entry, idx) => (
          <EntryCard
            key={entry.listId}
            entry={entry}
            rank={idx + 1}
            board={board}
            onVote={() => handleVote(entry)}
            onOpen={() => navigate(`/album/${entry.listId}`, { state: { src: "public" } })}
          />
        ))}
      </div>

      {/* 抽奖弹窗 */}
      <LotteryModal open={lottery} onClose={() => setLottery(false)} />
    </>
  );
}

// ── 抽奖弹窗:中奖优惠券(美食类目满减券) ──
function LotteryModal({ open, onClose }) {
  const [revealed, setRevealed] = useState(false);

  const close = () => {
    setRevealed(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-[102] bg-black/60"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="absolute z-[103] left-6 right-6 rounded-3xl overflow-hidden"
            style={{ top: "24%", background: "linear-gradient(160deg, #FF6F00, #E63500)" }}
          >
            <div className="px-5 pt-6 pb-5 text-center relative">
              <div className="absolute left-3 top-3 text-[20px] opacity-40">🎊</div>
              <div className="absolute right-3 top-3 text-[20px] opacity-40">🎊</div>
              {!revealed ? (
                <>
                  <div className="text-[40px]">🎁</div>
                  <div className="text-[17px] font-bold text-white mt-2">打卡抽奖 · 已解锁 3 次档</div>
                  <div className="text-[11.5px] text-white/80 mt-1">4 次有效打卡,手气正热,抽一发?</div>
                  <button
                    onClick={() => setRevealed(true)}
                    className="mt-4 w-full h-11 rounded-full text-[15px] font-bold"
                    style={{ background: "linear-gradient(135deg, #FFE9B0, #FFC53D)", color: "#8A3800" }}
                  >
                    立即抽奖
                  </button>
                </>
              ) : (
                <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 14 }}>
                  <div className="text-[13px] text-white/90">🎉 恭喜中奖</div>
                  {/* 优惠券 */}
                  <div className="mt-3 rounded-2xl bg-white px-4 py-3.5 flex items-center gap-3 text-left">
                    <div className="shrink-0 text-center" style={{ color: "#E63500" }}>
                      <span className="text-[13px] font-bold align-top">¥</span>
                      <span className="text-[32px] font-black leading-none">20</span>
                      <div className="text-[9px] mt-0.5">满 100 可用</div>
                    </div>
                    <div className="w-px self-stretch" style={{ borderLeft: "1px dashed #eee" }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-bold text-dpInk">美食类目满减券</div>
                      <div className="text-[10.5px] text-dpText-tertiary mt-0.5 leading-relaxed">
                        全场美食门店通用 · 9/30 前有效<br />继续打卡解锁 6 次档,奖池更大
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={close}
                    className="mt-4 w-full h-11 rounded-full text-[15px] font-bold"
                    style={{ background: "linear-gradient(135deg, #FFE9B0, #FFC53D)", color: "#8A3800" }}
                  >
                    开心收下
                  </button>
                </motion.div>
              )}
              <button onClick={close} className="mt-2.5 text-[11px] text-white/60">关闭</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── 参赛清单卡(混排:赛道名作标签) ──
function EntryCard({ entry, rank, board, onVote, onOpen }) {
  const { list, stats, voted, displayVotes, isMine, trackName, trackGroup, inTrackRank, gapToTrackLeader, soloUnderLine } = entry;
  const rankStyle =
    rank === 1
      ? { background: "linear-gradient(135deg, #FFB300, #FF8F00)", color: "#fff" }
      : rank === 2
      ? { background: "#E8E8E8", color: "#888" }
      : rank === 3
      ? { background: "#F5DCC8", color: "#B07040" }
      : { background: "#F5F5F5", color: "#bbb" };

  return (
    <div className="rounded-xl p-2.5 flex gap-2.5" style={{ background: "#FAFAFA" }}>
      {/* 名次 */}
      <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-black mt-0.5" style={rankStyle}>
        {rank}
      </div>
      {/* 封面 */}
      <button onClick={onOpen} className="shrink-0 w-[52px] h-[52px] rounded-lg overflow-hidden bg-[#eee]">
        <img src={list.cover || list.items[0]?.photo} alt="" className="w-full h-full object-cover" loading="lazy" />
      </button>
      {/* 信息 */}
      <button onClick={onOpen} className="flex-1 min-w-0 text-left">
        <div className="text-[13px] font-semibold text-dpInk truncate">
          {isMine && <span className="text-[9px] px-1 py-px rounded mr-1 align-middle" style={{ background: "#FF6F00", color: "#fff" }}>我的</span>}
          {list.title}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          {/* 赛道标签 */}
          <span
            className="shrink-0 px-1.5 h-[16px] rounded text-[9.5px] font-medium flex items-center"
            style={
              trackGroup === "商圈"
                ? { background: "#E8F1FF", color: "#2F6FED" }
                : { background: "#FFF0E5", color: "#E65000" }
            }
          >
            {trackName}
          </span>
          <div className="w-3.5 h-3.5 rounded-full overflow-hidden bg-[#eee] shrink-0">
            <img src={list.owner.avatar} alt="" className="w-full h-full object-cover" />
          </div>
          <span className="text-[10.5px] text-dpText-tertiary truncate">{list.owner.name}</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-[10.5px]">
          <span className={board === "checkins" ? "font-bold text-dpOrange-deep" : "text-dpText-tertiary"}>
            🌱 打卡 {stats.checkins}
          </span>
          <span className={board === "votes" ? "font-bold text-dpOrange-deep" : "text-dpText-tertiary"}>
            🔥 {displayVotes} 票
          </span>
          <span className="text-dpText-tertiary">🔖 {stats.saves}</span>
        </div>
        {/* 悬念/状态文案 */}
        {board === "checkins" && inTrackRank === 2 && gapToTrackLeader > 0 && gapToTrackLeader <= 30 && (
          <div className="text-[10px] mt-0.5 font-medium" style={{ color: "#E65000" }}>
            距「{trackName}」榜首只差 {gapToTrackLeader} 次打卡
          </div>
        )}
        {soloUnderLine && (
          <div className="text-[10px] mt-0.5 text-dpText-tertiary">
            独苗参赛 · 距授奖线还差 {100 - stats.checkins} 次打卡
          </div>
        )}
        {isMine && stats.checkins === 0 && (
          <div className="text-[10px] mt-0.5" style={{ color: "#E65000" }}>刚参赛 · 分享给朋友帮你助攻</div>
        )}
      </button>
      {/* 投票 */}
      <div className="shrink-0 flex flex-col items-center justify-center">
        <button
          onClick={onVote}
          disabled={voted}
          className="px-2.5 h-7 rounded-full text-[11px] font-medium"
          style={
            voted
              ? { background: "#F5F5F5", color: "#bbb" }
              : { background: "linear-gradient(135deg, #FF6F00, #FFA040)", color: "#fff" }
          }
        >
          {voted ? "已投" : "投票"}
        </button>
      </div>
    </div>
  );
}
