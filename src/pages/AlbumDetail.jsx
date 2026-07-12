import React, { useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getList,
  deleteList,
  updateList,
  getListMeta,
  setListMeta,
  publicEligibility,
  getPublicListsOf,
  getSameThemeLists,
  effectiveCheckedOff,
} from "../data/lists";
import { MY_CHECKINS } from "../data/myCheckins";
import ListMap from "../components/ListMap";

// 私藏清单详情页(消费主场景)
// - 创作者条 + 信任条(N 家店 · 去过) + 互动条(赞/收藏订阅/分享)
// - 一句话理由是店卡的视觉主体
// - 收藏者可拔草勾选;创作者可编辑/公开
export default function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: navState } = useLocation();
  // 流量来源:公域(信息流/搜索/地图/店页)可展示其他作者的同主题推荐;
  // 私域(用户查询的就是这个作者的清单)不加,默认按私域处理
  const isPublicTraffic = navState?.src === "public";
  const [tick, setTick] = useState(0);
  const list = useMemo(() => getList(id), [id, tick]);
  const meta = useMemo(() => getListMeta(id), [id, tick]);

  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [publishSheet, setPublishSheet] = useState(false);

  const isMine = list?.owner?.id === "me";
  const eligibility = list ? publicEligibility(list) : { ok: false, missing: [] };
  // 拔草进度唯一口径:手动勾选 ∪ 我的真实打卡(与收藏页/Me 页一致)
  const checkedSet = useMemo(
    () => (list ? effectiveCheckedOff(list) : new Set()),
    [list, tick] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const checkedCount = list ? list.items.filter((it) => checkedSet.has(it.poi?.name)).length : 0;

  const otherLists = useMemo(
    () => (list && !isMine ? getPublicListsOf(list.owner.name).filter((l) => l.id !== id) : []),
    [list, isMine, id]
  );
  // 同主题的其他作者清单(仅公域流量展示)
  const sameThemeLists = useMemo(
    () => (list && isPublicTraffic ? getSameThemeLists(list, 6) : []),
    [list, isPublicTraffic]
  );

  if (!list) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white">
        <div className="text-dpText-tertiary text-[14px]">清单不存在</div>
      </div>
    );
  }

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleLike = () => {
    setListMeta(id, { liked: !meta.liked });
    setTick((t) => t + 1);
  };

  const handleSave = () => {
    const next = !meta.saved;
    setListMeta(id, { saved: next, subscribed: next });
    setTick((t) => t + 1);
    showToast(next ? "已同步到 收藏·我的专辑 · 更新时会提醒你 🔔" : "已取消收藏");
  };


  const handlePublish = () => {
    updateList({ ...list, visibility: "public" });
    setPublishSheet(false);
    setTick((t) => t + 1);
    showToast("已公开 🎉 你的私藏出现在主页了");
  };

  const handleDelete = () => {
    deleteList(id);
    navigate(-1);
  };

  const handlePoiClick = (item) => {
    const checkin = MY_CHECKINS.find((c) => c.poi.name === item.poi.name);
    navigate("/store", {
      state: { poi: item.poi, photo: item.photos?.[0] || item.photo, caption: item.reason, checkin },
    });
  };

  const likeDisplay = (list.likeCount || 0) + (meta.liked ? 1 : 0);
  const saveDisplay = (list.saveCount || 0) + (meta.saved ? 1 : 0);

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">

        {/* ── Cover header ── */}
        <CoverHeader
          cover={list.cover}
          isMine={isMine}
          visibility={list.visibility}
          onBack={() => navigate(-1)}
          onMenu={() => setMenuOpen((v) => !v)}
          menuOpen={menuOpen}
          onEdit={() => { setMenuOpen(false); navigate(`/album/${id}/edit`); }}
          onDelete={() => { setMenuOpen(false); setConfirmDelete(true); }}
          liked={meta.liked}
          likeCount={likeDisplay}
          onLike={handleLike}
          saved={meta.saved}
          onSave={handleSave}
          onShare={() => navigate(`/wechat-share/${id}`)}
        />

        {/* ── Title + trust ── */}
        <div className="px-5 py-4 border-b border-[#f5f5f5]">
          <div className="text-[20px] font-bold text-dpInk leading-tight">{list.title}</div>
          {list.description && (
            <div className="text-[12.5px] text-dpText-secondary mt-1.5 leading-relaxed">{list.description}</div>
          )}
          {/* 私藏杯参赛标签(灵感标签挂在清单下面) */}
          {list.pkTag && (
            <button
              onClick={() => navigate("/pk")}
              className="mt-2 inline-flex items-center gap-1 px-2 h-6 rounded-full text-[11px] font-medium"
              style={{ background: "linear-gradient(120deg, #2B1200, #7A2E00 80%, #C84A00)", color: "#FFD9B8" }}
            >
              🏆 私藏杯
              <span
                className="px-1 rounded text-[10px]"
                style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}
              >
                {list.pkTag.group} · {list.pkTag.name}
              </span>
            </button>
          )}
          {/* 信息条 */}
          <div className="text-[12px] mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-dpText-tertiary">{list.items.length} 家店</span>
            <span className="text-[#e0e0e0]">·</span>
            <span className="text-dpText-tertiary">更新于 {list.updatedAt}</span>
          </div>
        </div>

        {/* ── 创作者条 ── */}
        <div className="px-5 py-3 border-b border-[#f5f5f5] flex items-center gap-3">
          <button
            onClick={() => !isMine && navigate(`/friend-profile?name=${encodeURIComponent(list.owner.name)}`)}
            className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#f0f0f0] shrink-0">
              <img src={list.owner.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-dpInk truncate">{list.owner.name}</span>
                <span
                  className="shrink-0 h-[16px] inline-flex items-center px-1 rounded text-[9px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
                >
                  {list.owner.level}
                </span>
              </div>
              <div className="text-[10.5px] text-dpText-tertiary mt-0.5">
                {saveDisplay > 0 ? `这份私藏被收藏 ${saveDisplay} 次` : "TA 的私藏"}
              </div>
            </div>
          </button>
          {!isMine && (
            <button
              className="shrink-0 px-3.5 h-7 rounded-full text-[12px] text-white font-medium"
              style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
              onClick={() => showToast("已关注 TA")}
            >
              关注
            </button>
          )}
        </div>

        {/* ── 公开引导(创作者 & 私密 & 达标) ── */}
        {isMine && list.visibility === "private" && eligibility.ok && (
          <button
            onClick={() => setPublishSheet(true)}
            className="mx-4 mt-3 w-[calc(100%-32px)] rounded-2xl px-4 py-3 flex items-center gap-3 text-left"
            style={{ background: "linear-gradient(135deg, #FFF6E5, #FFEAD0)" }}
          >
            <span className="text-xl">✨</span>
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-dpInk">这份私藏已经可以公开了</div>
              <div className="text-[11px] text-dpText-secondary mt-0.5">
                公开后会出现在你的主页，可能被分发到门店页与搜索
              </div>
            </div>
            <span
              className="shrink-0 px-3 h-7 rounded-full text-[12px] text-white font-medium flex items-center"
              style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
            >
              公开
            </span>
          </button>
        )}

        {/* ── 拔草进度(我收藏的清单) ── */}
        {!isMine && meta.saved && (
          <div className="mx-4 mt-3 rounded-2xl px-4 py-3 bg-[#F8FBF4]" style={{ border: "1px solid #E3F0D8" }}>
            <div className="flex items-center justify-between">
              <span className="text-[12.5px] font-medium text-[#3a6b1a]">
                {checkedCount === list.items.length
                  ? "这份私藏你已吃完 🎉"
                  : `我的拔草 · 已去 ${checkedCount}/${list.items.length}`}
              </span>
              <span className="text-[10.5px] text-[#7a9e5c]">打卡过的店自动算去过</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-[#E8F0E0] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${list.items.length ? (checkedCount / list.items.length) * 100 : 0}%`,
                  background: "linear-gradient(90deg, #7BC142, #A5D66E)",
                }}
              />
            </div>
          </div>
        )}

        {/* ── 店卡列表:一句话理由是视觉主体 ── */}
        <div className="px-4 pt-5 pb-4 space-y-7">
          {list.items.map((item, i) => {
            const checked = checkedSet.has(item.poi?.name);
            const photos = item.photos?.length ? item.photos : item.photo ? [item.photo] : [];
            return (
              <motion.div
                key={`${item.poi?.name}-${i}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{ opacity: checked ? 0.66 : 1 }}
              >
                {/* Rank + POI name */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <button className="flex items-center gap-2.5 flex-1 min-w-0 text-left" onClick={() => handlePoiClick(item)}>
                    <div
                      className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                      style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-semibold text-dpInk truncate">{item.poi.name}</div>
                      <div className="text-[11px] text-dpText-tertiary mt-0.5">
                        {item.poi.city} · {item.poi.category}
                      </div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {/* 拔草状态(收藏者):纯由打卡/评价/消费行为自动判定,不可手动勾选 */}
                  {!isMine && meta.saved && (
                    checked ? (
                      <span
                        className="shrink-0 flex items-center gap-0.5 px-1.5 h-6 rounded-full text-[10px] font-medium"
                        style={{ background: "#EAF7E0", color: "#4E9A2A" }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4E9A2A" strokeWidth="3">
                          <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        去过
                      </span>
                    ) : (
                      <span
                        className="shrink-0 px-1.5 h-6 rounded-full text-[10px] flex items-center"
                        style={{ background: "#F5F5F5", color: "#bbb" }}
                      >
                        未去过
                      </span>
                    )
                  )}
                </div>

                {/* 一句话理由(视觉主体,照片之前) */}
                {item.reason && (
                  <div className="mb-2.5 flex gap-2">
                    <div className="w-[3px] rounded-full shrink-0" style={{ background: "linear-gradient(180deg, #FF6F00, #FFA040)" }} />
                    <p className="text-[14.5px] text-dpInk leading-relaxed font-medium">{item.reason}</p>
                  </div>
                )}

                {/* Photo(多图横滑) */}
                {photos.length > 1 ? (
                  <div className="relative rounded-2xl overflow-hidden">
                    <div
                      className="flex overflow-x-auto no-scrollbar"
                      style={{ scrollSnapType: "x mandatory" }}
                    >
                      {photos.map((p, pi) => (
                        <button
                          key={pi}
                          onClick={() => handlePoiClick(item)}
                          className="w-full shrink-0 bg-[#f0f0f0]"
                          style={{ aspectRatio: "4/3", scrollSnapAlign: "center" }}
                        >
                          <img src={p} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </button>
                      ))}
                    </div>
                    <div
                      className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[10px] text-white pointer-events-none"
                      style={{ background: "rgba(0,0,0,0.5)" }}
                    >
                      {photos.length} 张 · 左右滑
                    </div>
                  </div>
                ) : (
                  <button
                    className="w-full rounded-2xl overflow-hidden bg-[#f0f0f0] block"
                    style={{ aspectRatio: "4/3" }}
                    onClick={() => handlePoiClick(item)}
                  >
                    <img src={photos[0]} alt="" className="w-full h-full object-cover" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── 清单地图模式:序号 pin + 拔草状态 + 可走的路线 ── */}
        <div className="px-4 pt-4 pb-5 border-t border-[#f5f5f5]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-semibold text-dpInk">清单地图</span>
            <span className="text-[10.5px] text-dpText-tertiary">清单里的店都在图上</span>
          </div>
          <ListMap
            list={list}
            checkedSet={!isMine && meta.saved ? checkedSet : null}
            height={220}
            onStoreClick={handlePoiClick}
          />
        </div>

        {/* ── TA 的其他私藏 ── */}
        {otherLists.length > 0 && (
          <div className="pt-4 pb-5 border-t border-[#f5f5f5]">
            <div className="px-4 text-[14px] font-semibold text-dpInk mb-3">TA 的其他私藏</div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
              {otherLists.map((l) => (
                <button
                  key={l.id}
                  onClick={() => navigate(`/album/${l.id}`)}
                  className="shrink-0 w-[150px] text-left bg-white rounded-2xl overflow-hidden"
                  style={{ border: "1px solid #f0f0f0" }}
                >
                  <div className="w-full bg-[#f0f0f0]" style={{ aspectRatio: "4/3" }}>
                    <img src={l.cover} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="px-2.5 py-2">
                    <div
                      className="text-[12px] font-medium text-dpInk leading-snug"
                      style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                    >
                      {l.title}
                    </div>
                    <div className="text-[10px] text-dpText-tertiary mt-1">
                      {l.items.length} 家店 · ♡ {l.likeCount}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 同主题的其他私藏(仅公域流量:信息流/搜索/地图/店页进来时展示) ── */}
        {sameThemeLists.length > 0 && (
          <div className="pt-4 pb-5 border-t border-[#f5f5f5]">
            <div className="px-4 flex items-center justify-between mb-3">
              <span className="text-[14px] font-semibold text-dpInk">同主题的其他私藏</span>
              <span className="text-[10.5px] text-dpText-tertiary">来自其他作者</span>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
              {sameThemeLists.map((l) => (
                <button
                  key={l.id}
                  onClick={() => navigate(`/album/${l.id}`, { state: { src: "public" } })}
                  className="shrink-0 w-[170px] text-left bg-white rounded-2xl overflow-hidden"
                  style={{ border: "1px solid #f0f0f0" }}
                >
                  <div className="w-full bg-[#f0f0f0]" style={{ aspectRatio: "4/3" }}>
                    <img src={l.cover} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="px-2.5 py-2">
                    <div
                      className="text-[12px] font-medium text-dpInk leading-snug"
                      style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                    >
                      {l.title}
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="w-3.5 h-3.5 rounded-full overflow-hidden bg-[#f0f0f0] shrink-0">
                        <img src={l.owner.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] text-dpText-tertiary truncate flex-1">{l.owner.name}</span>
                      <span className="text-[10px] text-dpText-tertiary shrink-0">♡ {l.likeCount}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 py-5 border-t border-[#f5f5f5] text-center">
          <div className="text-[11px] text-dpText-tertiary">
            {isMine ? "由你整理 · 私藏好店" : `由 ${list.owner.name} 整理 · 私藏好店`}
          </div>
        </div>
      </div>

      {/* 互动区已上移到封面右上角(点赞/收藏/分享);私密清单的「公开」由达标引导条与编辑器承担 */}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-full text-white text-[13px] z-[105]"
            style={{ background: "rgba(0,0,0,0.72)" }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {menuOpen && <div className="absolute inset-0 z-[9]" onClick={() => setMenuOpen(false)} />}

      {/* ── 公开确认 ── */}
      <AnimatePresence>
        {publishSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[102] bg-black/50"
              onClick={() => setPublishSheet(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              className="absolute z-[103] bg-white rounded-2xl mx-6 overflow-hidden"
              style={{ top: "50%", left: 0, right: 0, transform: "translateY(-50%)" }}
            >
              <div className="px-5 pt-6 pb-4 text-center">
                <div className="text-[28px] mb-2">✨</div>
                <div className="text-[17px] font-semibold text-dpInk mb-2">公开我的私藏</div>
                <div className="text-[13px] text-dpText-secondary leading-relaxed">
                  「{list.title}」将出现在你的主页，
                  <br />
                  并可能被分发到门店页与搜索结果
                </div>
              </div>
              <div className="border-t border-[#f0f0f0] flex">
                <button onClick={() => setPublishSheet(false)} className="flex-1 py-3.5 text-[15px] text-dpText-secondary border-r border-[#f0f0f0]">再想想</button>
                <button onClick={handlePublish} className="flex-1 py-3.5 text-[15px] font-medium" style={{ color: "#E65000" }}>公开</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── 删除确认 ── */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[102] bg-black/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              className="absolute z-[103] bg-white rounded-2xl mx-6 overflow-hidden"
              style={{ top: "50%", left: 0, right: 0, transform: "translateY(-50%)" }}
            >
              <div className="px-5 pt-6 pb-4 text-center">
                <div className="text-[17px] font-semibold text-dpInk mb-2">删除清单</div>
                <div className="text-[13px] text-dpText-secondary leading-relaxed">
                  「{list.title}」将被永久删除，无法恢复
                </div>
              </div>
              <div className="border-t border-[#f0f0f0] flex">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3.5 text-[15px] text-dpText-secondary border-r border-[#f0f0f0]">取消</button>
                <button onClick={handleDelete} className="flex-1 py-3.5 text-[15px] font-medium text-[#FF3B30]">删除</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Cover header:私密/公开徽标 + 右上角互动区(点赞/收藏/分享) + 创作者菜单 ──
function CoverHeader({
  cover, isMine, visibility, onBack, onMenu, menuOpen, onEdit, onDelete,
  liked, likeCount, onLike, saved, onSave, onShare,
}) {
  const pill = { background: "rgba(0,0,0,0.32)", backdropFilter: "blur(8px)" };
  return (
    <div className="relative overflow-hidden shrink-0" style={{ height: 240 }}>
      {cover ? (
        <img src={cover} alt="" className="w-full h-full object-cover" draggable={false} />
      ) : (
        <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #FFE8C7, #FFD5A0)" }} />
      )}
      <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.35) 0%, transparent 50%)" }} />

      <button
        onClick={onBack}
        className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center z-10"
        style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(8px)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* 私密/公开徽标 */}
      {isMine && (
        <div
          className="absolute bottom-3 left-4 z-10 px-2 py-1 rounded-full text-[10px] text-white flex items-center gap-1"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}
        >
          {visibility === "private" ? (
            <>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" />
              </svg>
              私密 · 仅自己可见
            </>
          ) : (
            <>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" strokeLinecap="round" />
              </svg>
              公开
            </>
          )}
        </div>
      )}

      {/* 右上角互动区:点赞 / 收藏(他人清单) / 分享 / 菜单(创作者) */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* 点赞 */}
        <button onClick={onLike} className="h-9 px-2.5 rounded-full flex items-center gap-1" style={pill}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "#FF6F00" : "none"} stroke={liked ? "#FF6F00" : "white"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[12px]" style={{ color: liked ? "#FFB380" : "white" }}>
            {likeCount > 0 ? likeCount : "赞"}
          </span>
        </button>
        {/* 收藏(仅他人清单) */}
        {!isMine && (
          <button onClick={onSave} className="h-9 px-2.5 rounded-full flex items-center gap-1" style={pill}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? "#FF6F00" : "none"} stroke={saved ? "#FF6F00" : "white"} strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinejoin="round" />
            </svg>
            <span className="text-[12px]" style={{ color: saved ? "#FFB380" : "white" }}>
              {saved ? "已收藏" : "收藏"}
            </span>
          </button>
        )}
        {/* 分享 */}
        <button onClick={onShare} className="w-9 h-9 rounded-full flex items-center justify-center" style={pill}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
          </svg>
        </button>
      </div>

      {isMine && (
        <div className="absolute top-[60px] right-4 z-10">
          <button
            onClick={onMenu}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={pill}
          >
            <svg width="18" height="4" viewBox="0 0 18 4" fill="white">
              <circle cx="2" cy="2" r="2" /><circle cx="9" cy="2" r="2" /><circle cx="16" cy="2" r="2" />
            </svg>
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-11 rounded-2xl overflow-hidden z-10"
                style={{ background: "rgba(30,30,30,0.88)", backdropFilter: "blur(16px)", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", minWidth: 130 }}
              >
                <button onClick={onEdit} className="w-full flex items-center gap-2.5 px-4 py-3 border-b border-white/10">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-white text-[13px]">编辑清单</span>
                </button>
                <button onClick={onDelete} className="w-full flex items-center gap-2.5 px-4 py-3">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" strokeLinecap="round" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round" />
                    <path d="M10 11v6M14 11v6" strokeLinecap="round" />
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" strokeLinecap="round" />
                  </svg>
                  <span className="text-[#FF6B6B] text-[13px]">删除清单</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
