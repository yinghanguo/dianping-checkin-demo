import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MY_CHECKINS } from "../data/myCheckins";
import { addList, getList, updateList, publicEligibility, ME, iHaveBeenTo } from "../data/lists";

// 私藏清单编辑器(创作主场景)
// 三条路径汇入:主动新建 / 编辑已有 / AI 草稿预填(location.state.draft)
// - 每店一句话理由;公开需过门槛(≥3店、理由齐全、非默认标题)
export default function AlbumCreate() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const { state: navState } = useLocation();
  const isEditing = Boolean(editId);
  const draft = navState?.draft; // AI 存量转化草稿

  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("private");
  // item: { checkinId, poi, allPhotos, selectedPhoto, text }
  const [items, setItems] = useState([]);
  const [selectSheet, setSelectSheet] = useState(false);
  const [cityFilter, setCityFilter] = useState(null);
  const [pendingIds, setPendingIds] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [fromDraft, setFromDraft] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  // AI 草稿预填
  useEffect(() => {
    if (!draft || editId) return;
    setTitle(draft.title || "");
    setItems(draft.items || []);
    setFromDraft(true);
  }, [draft, editId]);

  // 编辑已有清单预填
  useEffect(() => {
    if (!editId) return;
    const list = getList(editId);
    if (!list) return;
    setTitle(list.title);
    setVisibility(list.visibility || "private");
    setItems(
      list.items.map((item) => {
        const checkin = MY_CHECKINS.find(
          (c) => c.poi.name === item.poi.name && c.photos.length > 0
        );
        return {
          checkinId: checkin?.id ?? null,
          poi: item.poi,
          allPhotos: checkin?.photos ?? (item.photo ? [item.photo] : []),
          selectedPhoto: item.photo,
          text: item.reason ?? "",
        };
      })
    );
  }, [editId]);

  // ── Derived ──
  const cities = useMemo(() => {
    const s = new Set(MY_CHECKINS.filter((c) => c.photos.length > 0).map((c) => c.poi.city));
    return Array.from(s);
  }, []);

  const filteredCheckins = useMemo(() => {
    const base = MY_CHECKINS.filter((c) => c.photos.length > 0);
    return cityFilter ? base.filter((c) => c.poi.city === cityFilter) : base;
  }, [cityFilter]);

  const addedIds = useMemo(
    () => new Set(items.map((i) => i.checkinId).filter(Boolean)),
    [items]
  );

  // 公开门槛实时校验
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

  const handleConfirmSelect = () => {
    // 无 checkinId 的项(从门店页收入的)始终保留;有 checkinId 的按勾选保留
    const keptItems = items.filter((i) => !i.checkinId || pendingIds.has(i.checkinId));
    const newCheckins = MY_CHECKINS.filter(
      (c) => pendingIds.has(c.id) && !addedIds.has(c.id) && c.photos.length > 0
    );
    const newItems = newCheckins.map((c) => ({
      checkinId: c.id,
      poi: c.poi,
      allPhotos: c.photos,
      selectedPhoto: c.photos[0],
      text: c.text || "",
    }));
    setItems([...keptItems, ...newItems]);
    setSelectSheet(false);
  };

  // ── Item editing ──
  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ── AI title generation (mock) ──
  const generateTitle = () => {
    if (items.length === 0) return;
    const uniqueCities = [...new Set(items.map((i) => i.poi.city))];
    const cats = items.map((i) => i.poi.category);
    const isFood = cats.some((c) =>
      ["美食", "餐", "咖啡", "西班牙", "tapas", "小吃"].some((k) => c.includes(k))
    );
    const isSight = cats.some((c) =>
      ["景点", "博物", "教堂", "古迹", "宗教", "公园"].some((k) => c.includes(k))
    );
    let gen = "";
    if (uniqueCities.length === 1) {
      if (isFood && !isSight) gen = `${uniqueCities[0]}不容错过的 ${items.length} 家`;
      else if (isSight && !isFood) gen = `${uniqueCities[0]}必打卡的景点精选`;
      else gen = `${uniqueCities[0]} · 我的私藏`;
    } else if (uniqueCities.length === 2) {
      gen = `${uniqueCities[0]} & ${uniqueCities[1]} 私藏精选`;
    } else {
      gen = `${uniqueCities.length} 座城市的 ${items.length} 个私藏`;
    }
    setTitle(gen);
  };

  // ── 公开切换 ──
  const handleToggleVisibility = () => {
    if (visibility === "public") {
      setVisibility("private");
      return;
    }
    if (!eligibility.ok) {
      showToast(`还差一步：${eligibility.missing[0]}`);
      return;
    }
    setVisibility("public");
  };

  // ── Save ──
  const handleSave = () => {
    if (visibility === "public" && !eligibility.ok) {
      showToast(`公开需要：${eligibility.missing[0]}`);
      return;
    }
    const cover = items[0]?.selectedPhoto || "";
    const now = new Date();
    const listItems = items.map((item) => ({
      poi: item.poi,
      photo: item.selectedPhoto,
      reason: item.text?.trim() || "",
    }));
    if (isEditing) {
      const existing = getList(editId);
      updateList({
        ...existing,
        title: title.trim() || existing.title,
        cover: cover || existing.cover,
        visibility,
        items: listItems,
      });
      navigate(`/album/${editId}`, { replace: true });
    } else {
      const list = {
        id: `list_${Date.now()}`,
        owner: ME,
        title: title.trim() || "我的私藏清单",
        description: fromDraft ? "从我的打卡记录整理" : "",
        cover,
        visibility,
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
            onClick={handleSave}
            className="px-4 h-7 rounded-full text-white text-[12px] font-medium shrink-0"
            style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
          >
            {visibility === "public" ? "公开发布" : "保存"}
          </button>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* ── AI 草稿提示条 ── */}
        {fromDraft && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mt-4 rounded-2xl px-4 py-3 flex items-start gap-2.5"
            style={{ background: "linear-gradient(135deg, #FFF6E5, #FFEAD0)" }}
          >
            <span className="text-lg leading-none mt-0.5">✨</span>
            <div className="text-[12px] text-dpInk leading-relaxed">
              <span className="font-semibold">AI 已按你的打卡记录整理好草稿。</span>
              <br />
              <span className="text-dpText-secondary">
                推荐理由摘自你当时写下的话——删掉不想要的，补上空缺的，就可以公开了。
              </span>
            </div>
          </motion.div>
        )}

        {/* ── Title field ── */}
        <div
          className="mx-4 mt-4 bg-white rounded-2xl px-4 py-3"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <div className="text-[11px] text-dpText-tertiary font-medium mb-1.5 tracking-wide uppercase">
            清单主题
          </div>
          <div className="flex items-center gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="一个主题口径，比如「适合请客的本帮菜」"
              className="flex-1 text-[15px] text-dpInk placeholder-[#bbb] outline-none bg-transparent"
            />
            <button
              onClick={generateTitle}
              disabled={items.length === 0}
              className="shrink-0 flex items-center gap-1 px-2.5 h-6 rounded-full text-[11px] font-medium transition-all"
              style={{
                background:
                  items.length > 0 ? "linear-gradient(135deg, #FF6F00, #FFA040)" : "#f0f0f0",
                color: items.length > 0 ? "white" : "#ccc",
              }}
            >
              ✨ AI生成
            </button>
          </div>
        </div>

        {/* ── 公开开关 ── */}
        <div
          className="mx-4 mt-3 bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <div className="flex-1">
            <div className="text-[13.5px] font-medium text-dpInk">
              {visibility === "public" ? "公开这份私藏" : "私密清单"}
            </div>
            <div className="text-[11px] text-dpText-tertiary mt-0.5 leading-relaxed">
              {visibility === "public"
                ? "会出现在你的主页，可能被分发到门店页与搜索"
                : eligibility.ok
                ? "已满足公开条件，随时可以公开"
                : `公开需要：${eligibility.missing.join("、")}`}
            </div>
          </div>
          <button
            onClick={handleToggleVisibility}
            className="shrink-0 rounded-full transition-all relative"
            style={{
              width: 46,
              height: 27,
              background: visibility === "public" ? "linear-gradient(135deg, #FF6F00, #FFA040)" : "#e0e0e0",
            }}
          >
            <div
              className="absolute top-[3px] w-[21px] h-[21px] rounded-full bg-white transition-all"
              style={{
                left: visibility === "public" ? 22 : 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </button>
        </div>

        {/* ── Item cards ── */}
        {items.length > 0 && (
          <div className="mt-3 px-4 space-y-3">
            {items.map((item, i) => (
              <ItemCard
                key={item.checkinId ?? `${item.poi?.name}-${i}`}
                item={item}
                index={i}
                been={iHaveBeenTo(item.poi?.name)}
                onUpdatePhoto={(photo) => updateItem(i, "selectedPhoto", photo)}
                onUpdateText={(text) => updateItem(i, "text", text)}
                onRemove={() => removeItem(i)}
              />
            ))}
          </div>
        )}

        {/* ── Empty hint ── */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-44 gap-2 mt-4">
            <div className="text-[40px]">📍</div>
            <div className="text-[14px] text-dpInk font-medium">从你的足迹里挑店</div>
            <div className="text-[12px] text-dpText-tertiary">照片和推荐理由会从打卡记录自动拉取</div>
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
            从我的足迹选店
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

      {/* ── Multi-select Sheet ── */}
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
                  <div className="text-[16px] font-semibold text-dpInk">从足迹选店</div>
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

              {/* City filter */}
              <div className="px-5 py-2.5 border-b border-[#f5f5f5] shrink-0">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                  <button
                    onClick={() => setCityFilter(null)}
                    className={`shrink-0 px-3 h-7 rounded-full text-[12px] font-medium ${
                      !cityFilter ? "bg-dpInk text-white" : "bg-[#F5F5F5] text-dpText-secondary"
                    }`}
                  >
                    全部
                  </button>
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => setCityFilter(city === cityFilter ? null : city)}
                      className={`shrink-0 px-3 h-7 rounded-full text-[12px] font-medium ${
                        cityFilter === city
                          ? "bg-dpInk text-white"
                          : "bg-[#F5F5F5] text-dpText-secondary"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkin list */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-1">
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
                          {c.poi.city} · {c.date}
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

// ── Item card with inline editing ──
function ItemCard({ item, index, been, onUpdatePhoto, onUpdateText, onRemove }) {
  const missingReason = !item.text?.trim();
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
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-dpInk truncate">{item.poi.name}</span>
            {been && (
              <span
                className="shrink-0 text-[9px] px-1 py-px rounded font-medium"
                style={{ background: "#EAF5E2", color: "#2E7D32" }}
              >
                去过 ✓
              </span>
            )}
          </div>
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

      {/* Photo selector */}
      {item.allPhotos?.length > 0 && (
        <div className="px-3 pb-2">
          <div className="text-[11px] text-dpText-tertiary mb-1.5">选择照片</div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {item.allPhotos.map((p, i) => (
              <button
                key={i}
                onClick={() => onUpdatePhoto(p)}
                className={`shrink-0 rounded-xl overflow-hidden transition-all ${
                  item.selectedPhoto === p ? "ring-2 ring-dpOrange ring-offset-1" : "opacity-55"
                }`}
                style={{ width: 72, height: 72 }}
              >
                <img src={p} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 一句话推荐理由 */}
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
          onChange={(e) => onUpdateText(e.target.value)}
          placeholder="为什么是这家？一句话就够"
          className="w-full bg-[#F8F8F8] rounded-xl px-3 py-2.5 text-[13px] text-dpInk resize-none outline-none placeholder-[#bbb] leading-relaxed"
          rows={2}
        />
      </div>
    </motion.div>
  );
}
