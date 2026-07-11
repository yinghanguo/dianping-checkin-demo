import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MY_CHECKINS } from "../data/myCheckins";
import { addList, getList, updateList, publicEligibility, ME, categorize, CATEGORY_BUCKETS } from "../data/lists";

// 私藏清单编辑器(创作主场景)
// - 无 AI 代写:标题/理由全部用户自己写;AI 只保留选店层面的辅助筛选
// - 照片支持增(上传/从发布带入)删选,多图在清单页横滑展示
// - 「从我的发布选店」:支持地点筛选 + 类目筛选(美食/咖啡/酒店/景点/SPA/购物/运动…)
// - 默认公开;发布时不达标弹窗,可改为私密发布
export default function AlbumCreate() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const { state: navState } = useLocation();
  const isEditing = Boolean(editId);
  const draft = navState?.draft; // AI 选店筛选结果(仅店集合,不代写)

  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("public"); // 默认公开
  // item: { checkinId, poi, allPhotos, photos(已选,首图为封面), text }
  const [items, setItems] = useState([]);
  const [selectSheet, setSelectSheet] = useState(false);
  const [cityFilter, setCityFilter] = useState(null);
  const [cateFilter, setCateFilter] = useState(null);
  const [pendingIds, setPendingIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [publishIssue, setPublishIssue] = useState(null); // 发布不达标弹窗
  const [fromDraft, setFromDraft] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  // AI 选店草稿预填(仅店集合;理由带入用户自己发布过的原文)
  useEffect(() => {
    if (!draft || editId) return;
    setItems(draft.items || []);
    setFromDraft(true);
  }, [draft, editId]);

  // 编辑已有清单预填
  useEffect(() => {
    if (!editId) return;
    const list = getList(editId);
    if (!list) return;
    setTitle(list.title);
    setVisibility(list.visibility || "public");
    setItems(
      list.items.map((item) => {
        const checkin = MY_CHECKINS.find(
          (c) => c.poi.name === item.poi.name && c.photos.length > 0
        );
        const photos = item.photos?.length ? item.photos : item.photo ? [item.photo] : [];
        const allPhotos = [...new Set([...(checkin?.photos ?? []), ...photos])];
        return {
          checkinId: checkin?.id ?? null,
          poi: item.poi,
          allPhotos,
          photos,
          text: item.reason ?? "",
        };
      })
    );
  }, [editId]);

  // ── 选店 sheet 的筛选维度 ──
  const cities = useMemo(() => {
    const s = new Set(MY_CHECKINS.filter((c) => c.photos.length > 0).map((c) => c.poi.city));
    return Array.from(s);
  }, []);

  const cates = useMemo(() => {
    const present = new Set(
      MY_CHECKINS.filter((c) => c.photos.length > 0).map((c) => categorize(c.poi.category))
    );
    return CATEGORY_BUCKETS.filter((b) => present.has(b));
  }, []);

  const filteredCheckins = useMemo(() => {
    let base = MY_CHECKINS.filter((c) => c.photos.length > 0);
    if (cityFilter) base = base.filter((c) => c.poi.city === cityFilter);
    if (cateFilter) base = base.filter((c) => categorize(c.poi.category) === cateFilter);
    return base;
  }, [cityFilter, cateFilter]);

  const addedIds = useMemo(
    () => new Set(items.map((i) => i.checkinId).filter(Boolean)),
    [items]
  );

  const eligibility = useMemo(
    () =>
      publicEligibility({
        title,
        items: items.map((i) => ({ poi: i.poi, reason: i.text })),
      }),
    [title, items]
  );

  // ── Sheet handlers ──
  const handleOpenSelect = () => {
    setPendingIds(new Set(addedIds));
    setSelectSheet(true);
  };

  const togglePending = (id) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // AI 辅助筛选:按当前清单主题(多数类目)圈出候选
  const handleAiFilter = () => {
    if (items.length === 0) {
      showToast("先加一两家店,AI 才知道你的主题");
      return;
    }
    const counts = {};
    items.forEach((i) => {
      const b = categorize(i.poi.category);
      counts[b] = (counts[b] || 0) + 1;
    });
    const major = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    setCateFilter(major);
    setCityFilter(null);
    showToast(`✨ 已按「${major}」主题筛出候选`);
  };

  const handleConfirmSelect = () => {
    const keptItems = items.filter((i) => !i.checkinId || pendingIds.has(i.checkinId));
    const newCheckins = MY_CHECKINS.filter(
      (c) => pendingIds.has(c.id) && !addedIds.has(c.id) && c.photos.length > 0
    );
    const newItems = newCheckins.map((c) => ({
      checkinId: c.id,
      poi: c.poi,
      allPhotos: c.photos,
      photos: [c.photos[0]],
      text: c.text || "",
    }));
    setItems([...keptItems, ...newItems]);
    setSelectSheet(false);
  };

  // ── Item editing ──
  const updateItem = (index, patch) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Save / Publish ──
  const doSave = (vis) => {
    const first = items[0];
    const cover = first?.photos?.[0] || "";
    const now = new Date();
    const listItems = items.map((item) => ({
      poi: item.poi,
      photos: item.photos,
      photo: item.photos?.[0] || "",
      reason: item.text?.trim() || "",
    }));
    if (isEditing) {
      const existing = getList(editId);
      updateList({
        ...existing,
        title: title.trim() || existing.title,
        cover: cover || existing.cover,
        visibility: vis,
        items: listItems,
      });
      navigate(`/album/${editId}`, { replace: true });
    } else {
      const list = {
        id: `list_${Date.now()}`,
        owner: ME,
        title: title.trim() || "我的私藏清单",
        description: "",
        cover,
        visibility: vis,
        likeCount: 0,
        saveCount: 0,
        createdAt: `${now.getMonth() + 1}/${now.getDate()}`,
        updatedAt: `${now.getMonth() + 1}/${now.getDate()}`,
        items: listItems,
      };
      addList(list);
      navigate(`/album/${list.id}`, { replace: true });
    }
  };

  const handlePublish = () => {
    if (visibility === "public" && !eligibility.ok) {
      setPublishIssue(eligibility.missing); // 弹窗:可改私密发布
      return;
    }
    doSave(visibility);
  };

  return (
    <div className="absolute inset-0 bg-[#F5F5F5] flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-[#f5f5f5] shrink-0">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center shrink-0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 text-[16px] font-semibold text-dpInk">
          {isEditing ? "编辑私藏清单" : "新建私藏清单"}
        </div>
        {items.length > 0 && (
          <button
            onClick={handlePublish}
            className="px-4 h-7 rounded-full text-white text-[12px] font-medium shrink-0"
            style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
          >
            发布
          </button>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* ── AI 选店提示条(仅筛选,不代写) ── */}
        {fromDraft && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4 rounded-2xl px-4 py-3 flex items-start gap-2.5"
            style={{ background: "linear-gradient(135deg, #FFF6E5, #FFEAD0)" }}
          >
            <span className="text-lg leading-none mt-0.5">✨</span>
            <div className="text-[12px] text-dpInk leading-relaxed">
              <span className="font-semibold">AI 从你的发布里筛出了这些店。</span>
              <br />
              <span className="text-dpText-secondary">
                删掉不想要的;标题和推荐理由由你自己来写——理由已带入你当时发布的原文,可直接修改。
              </span>
            </div>
          </motion.div>
        )}

        {/* ── Title field(无 AI 生成) ── */}
        <div
          className="mx-4 mt-4 bg-white rounded-2xl px-4 py-3"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <div className="text-[11px] text-dpText-tertiary font-medium mb-1.5 tracking-wide uppercase">
            清单主题
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="一个主题口径，比如「适合请客的本帮菜」"
            className="w-full text-[15px] text-dpInk placeholder-[#bbb] outline-none bg-transparent"
          />
        </div>

        {/* ── Item cards ── */}
        {items.length > 0 && (
          <div className="mt-3 px-4 space-y-3">
            {items.map((item, i) => (
              <ItemCard
                key={item.checkinId ?? `${item.poi?.name}-${i}`}
                item={item}
                index={i}
                onUpdate={(patch) => updateItem(i, patch)}
                onRemove={() => removeItem(i)}
              />
            ))}
          </div>
        )}

        {/* ── Empty hint ── */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-44 gap-2 mt-4">
            <div className="text-[40px]">📍</div>
            <div className="text-[14px] text-dpInk font-medium">从你的发布里挑店</div>
            <div className="text-[12px] text-dpText-tertiary">照片和文字会从你的发布自动带入</div>
          </div>
        )}

        {/* ── Add spot button ── */}
        <div className="px-4 py-4 mt-1">
          <button
            onClick={handleOpenSelect}
            className="w-full h-11 rounded-2xl border-2 border-dashed text-[14px] font-medium flex items-center justify-center gap-2 bg-white"
            style={{ borderColor: "#FF6F00", color: "#E65000" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            从我的发布选店
          </button>
        </div>

        {/* ── 可见性(清单最底部,默认公开) ── */}
        <div
          className="mx-4 mb-6 bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <div className="flex-1">
            <div className="text-[13.5px] font-medium text-dpInk">
              {visibility === "public" ? "公开发布" : "私密清单"}
            </div>
            <div className="text-[11px] text-dpText-tertiary mt-0.5 leading-relaxed">
              {visibility === "public"
                ? "发布后出现在你的主页，可能被分发到门店页与搜索"
                : "仅自己可见，随时可以再公开"}
            </div>
          </div>
          <button
            onClick={() => setVisibility((v) => (v === "public" ? "private" : "public"))}
            className="shrink-0 rounded-full transition-all relative"
            style={{
              width: 46,
              height: 27,
              background: visibility === "public" ? "linear-gradient(135deg, #FF6F00, #FFA040)" : "#e0e0e0",
            }}
          >
            <div
              className="absolute top-[3px] w-[21px] h-[21px] rounded-full bg-white transition-all"
              style={{ left: visibility === "public" ? 22 : 3, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}
            />
          </button>
        </div>

        <div className="h-6" />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-full text-white text-[13px] z-[105]"
            style={{ background: "rgba(0,0,0,0.75)" }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 发布不达标弹窗:可改私密发布 ── */}
      <AnimatePresence>
        {publishIssue && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[102] bg-black/50"
              onClick={() => setPublishIssue(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              className="absolute z-[103] bg-white rounded-2xl mx-6 overflow-hidden"
              style={{ top: "50%", left: 0, right: 0, transform: "translateY(-50%)" }}
            >
              <div className="px-5 pt-6 pb-4">
                <div className="text-[17px] font-semibold text-dpInk text-center mb-2">还不满足公开条件</div>
                <div className="text-[13px] text-dpText-secondary leading-relaxed text-center mb-3">
                  公开的清单需要:
                </div>
                <div className="space-y-1.5">
                  {publishIssue.map((m) => (
                    <div key={m} className="flex items-center gap-2 text-[13px] text-dpInk">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#FF6F00" }} />
                      {m}
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-[#f0f0f0] flex">
                <button
                  onClick={() => { setPublishIssue(null); setVisibility("private"); doSave("private"); }}
                  className="flex-1 py-3.5 text-[14px] text-dpText-secondary border-r border-[#f0f0f0]"
                >
                  改为私密并发布
                </button>
                <button
                  onClick={() => setPublishIssue(null)}
                  className="flex-1 py-3.5 text-[14px] font-medium"
                  style={{ color: "#E65000" }}
                >
                  继续完善
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── 从我的发布选店 Sheet ── */}
      <AnimatePresence>
        {selectSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectSheet(false)}
              className="absolute inset-0 z-[100] bg-black/40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="absolute left-0 right-0 bottom-0 z-[101] bg-white rounded-t-3xl flex flex-col"
              style={{ maxHeight: "82vh", boxShadow: "0 -10px 40px rgba(0,0,0,0.15)" }}
            >
              <div className="pt-2.5 pb-1 flex justify-center shrink-0">
                <div className="w-11 h-1 rounded-full bg-[#e0e0e0]" />
              </div>

              <div className="px-5 pt-2 pb-3 shrink-0 border-b border-[#f5f5f5] flex items-center justify-between">
                <div>
                  <div className="text-[16px] font-semibold text-dpInk">从我的发布选店</div>
                  <div className="text-[11px] text-dpOrange-deep mt-0.5 h-4">
                    {pendingIds.size > 0 ? `已选 ${pendingIds.size} 个` : " "}
                  </div>
                </div>
                <button
                  onClick={handleConfirmSelect}
                  className="px-4 h-8 rounded-full text-white text-[13px] font-medium"
                  style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
                >
                  确认{pendingIds.size > 0 ? `（${pendingIds.size}）` : ""}
                </button>
              </div>

              {/* 类目筛选 + AI 辅助筛选 */}
              <div className="px-5 py-2 border-b border-[#f5f5f5] shrink-0">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                  <button
                    onClick={handleAiFilter}
                    className="shrink-0 px-3 h-7 rounded-full text-[12px] font-medium text-white"
                    style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
                  >
                    ✨ AI 按主题筛
                  </button>
                  <button
                    onClick={() => setCateFilter(null)}
                    className={`shrink-0 px-3 h-7 rounded-full text-[12px] font-medium ${
                      !cateFilter ? "bg-dpInk text-white" : "bg-[#F5F5F5] text-dpText-secondary"
                    }`}
                  >
                    全部类目
                  </button>
                  {cates.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCateFilter(c === cateFilter ? null : c)}
                      className={`shrink-0 px-3 h-7 rounded-full text-[12px] font-medium ${
                        cateFilter === c ? "bg-dpInk text-white" : "bg-[#F5F5F5] text-dpText-secondary"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* 地点筛选 */}
              <div className="px-5 py-2 border-b border-[#f5f5f5] shrink-0">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                  <button
                    onClick={() => setCityFilter(null)}
                    className={`shrink-0 px-3 h-7 rounded-full text-[12px] font-medium ${
                      !cityFilter ? "bg-dpInk text-white" : "bg-[#F5F5F5] text-dpText-secondary"
                    }`}
                  >
                    全部地点
                  </button>
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => setCityFilter(city === cityFilter ? null : city)}
                      className={`shrink-0 px-3 h-7 rounded-full text-[12px] font-medium ${
                        cityFilter === city ? "bg-dpInk text-white" : "bg-[#F5F5F5] text-dpText-secondary"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkin list */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-1">
                {filteredCheckins.length === 0 && (
                  <div className="text-center text-[12px] text-dpText-tertiary py-10">
                    这个筛选下没有发布记录
                  </div>
                )}
                {filteredCheckins.map((c) => {
                  const checked = pendingIds.has(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => togglePending(c.id)}
                      className="w-full flex items-center gap-3 py-3 border-b border-[#f5f5f5] text-left last:border-0"
                    >
                      <div
                        className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center border-2 transition-all ${
                          checked ? "border-dpOrange bg-dpOrange" : "border-[#ddd] bg-white"
                        }`}
                      >
                        {checked && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-[#f0f0f0]">
                        <img src={c.photos[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium text-dpInk truncate">{c.poi.name}</div>
                        <div className="text-[11px] text-dpText-tertiary mt-0.5">
                          {c.poi.city} · {categorize(c.poi.category)} · {c.date}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Item card:多图增删选 + 理由编辑 ──
function ItemCard({ item, index, onUpdate, onRemove }) {
  const fileRef = useRef(null);
  const missingReason = !item.text?.trim();
  const photos = item.photos || [];

  // 从发布带入的候选(未选中的)
  const candidates = (item.allPhotos || []).filter((p) => !photos.includes(p));

  const removePhoto = (p) => onUpdate({ photos: photos.filter((x) => x !== p) });
  const addPhoto = (p) => onUpdate({ photos: [...photos, p] });
  const handleUpload = (e) => {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    const urls = files.map((f) => URL.createObjectURL(f));
    onUpdate({ photos: [...photos, ...urls], allPhotos: [...(item.allPhotos || []), ...urls] });
    e.target.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
    >
      {/* POI header */}
      <div className="px-3 pt-3 pb-2 flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
          style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-dpInk truncate">{item.poi.name}</div>
          <div className="text-[11px] text-dpText-tertiary">
            {item.poi.city} · {item.poi.category}
          </div>
        </div>
        <button onClick={onRemove} className="text-[#ccc] p-1 shrink-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 已选照片(可删,首图为封面) + 上传 */}
      <div className="px-3 pb-2">
        <div className="text-[11px] text-dpText-tertiary mb-1.5">
          照片{photos.length > 0 ? `（${photos.length} 张,首图为封面）` : "（至少一张）"}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {photos.map((p, i) => (
            <div key={p} className="relative shrink-0">
              <div
                className={`rounded-xl overflow-hidden ${i === 0 ? "ring-2 ring-dpOrange ring-offset-1" : ""}`}
                style={{ width: 72, height: 72 }}
              >
                <img src={p} alt="" className="w-full h-full object-cover" />
              </div>
              {i === 0 && (
                <span
                  className="absolute bottom-1 left-1 px-1 rounded text-[8px] text-white"
                  style={{ background: "rgba(255,111,0,0.9)" }}
                >
                  封面
                </span>
              )}
              <button
                onClick={() => removePhoto(p)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
          {/* 上传 */}
          <button
            onClick={() => fileRef.current?.click()}
            className="shrink-0 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-0.5"
            style={{ width: 72, height: 72, borderColor: "#FFD5B0", color: "#E65000" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            <span className="text-[9px]">上传</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
        </div>

        {/* 从发布带入的候选照片 */}
        {candidates.length > 0 && (
          <>
            <div className="text-[10.5px] text-dpText-tertiary mt-2 mb-1">从你的发布带入(点击添加)</div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {candidates.map((p) => (
                <button
                  key={p}
                  onClick={() => addPhoto(p)}
                  className="shrink-0 rounded-xl overflow-hidden opacity-55 relative"
                  style={{ width: 56, height: 56 }}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center text-white text-[16px]" style={{ background: "rgba(0,0,0,0.18)" }}>+</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 一句话推荐理由(用户自己写) */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[11px] text-dpText-tertiary">一句话推荐理由</span>
          {missingReason && (
            <span className="text-[10px] px-1 py-px rounded" style={{ background: "#FFF0E5", color: "#E65000" }}>
              公开必填
            </span>
          )}
        </div>
        <textarea
          value={item.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="为什么是这家？一句话就够"
          className="w-full bg-[#F8F8F8] rounded-xl px-3 py-2.5 text-[13px] text-dpInk resize-none outline-none placeholder-[#bbb] leading-relaxed"
          rows={2}
        />
      </div>
    </motion.div>
  );
}
