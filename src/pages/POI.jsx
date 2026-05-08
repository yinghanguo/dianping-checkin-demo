import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import { useLocation } from "../contexts/LocationContext";
import { searchPOIs, fetchNearbyPOIs } from "../utils/osmPoi";

export default function POI() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromSheet = searchParams.get("from") === "sheet";
  const fromEdit = searchParams.get("from") === "edit";

  const goBack = () => {
    if (fromSheet) {
      navigate("/camera?sheet=1", { replace: true });
    } else if (fromEdit) {
      // 从编辑页进来 → 返回编辑页（不带 nopoi，以免覆盖刚选的 POI 状态）
      navigate("/edit", { replace: true });
    } else {
      navigate(-1);
    }
  };

  const { coords, recommendedPOIs, shortAddress, streetAddress, userSelectedPOI, setUserSelectedPOI, setPoiSkipped } = useLocation();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [nearby, setNearby] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  // 本地 pending 选中(确认前不写全局)
  const [pendingPOI, setPendingPOI] = useState(userSelectedPOI || null);
  const selectedId = pendingPOI?.id || null;
  const selectPOI = (poi) => {
    setPendingPOI(poi);
  };

  // ── 拉取附近真实 POI(Overpass) ──
  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    setNearbyLoading(true);
    fetchNearbyPOIs(coords, { radius: 800, limit: 30 })
      .then((items) => {
        if (cancelled) return;
        setNearby(items);
        setNearbyLoading(false);
        // 默认高亮第一个(本地 pending,不写全局),给用户视觉错点
        if (items.length > 0 && !pendingPOI) {
          setPendingPOI(items[0]);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setNearbyLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lng]);

  // ── 搜索 debounce ──
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  // ── 执行搜索 ──
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    searchPOIs(debouncedQuery, coords, { limit: 15 })
      .then((items) => {
        if (cancelled) return;
        setSearchResults(items);
        setSearching(false);
      })
      .catch(() => {
        if (cancelled) return;
        setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, coords]);

  const inSearchMode = query.trim().length > 0;
  const aiRecommend = nearby[0];
  const others = nearby.slice(1);

  // mock fallback (当 OSM 真没结果时显示 LocationContext 的 mock)
  const mockFallback =
    !nearbyLoading && nearby.length === 0
      ? recommendedPOIs.map((p, i) => ({
          id: `mock-${i}`,
          name: p.name,
          category: p.category,
          emoji: getEmojiFromCategory(p.category),
          rating: p.rating,
          distance: p.distance,
        }))
      : [];

  const displayList = inSearchMode
    ? searchResults
    : nearby.length > 0
    ? nearby
    : mockFallback;
  const displayAi = inSearchMode ? null : aiRecommend || mockFallback[0];
  const displayOthers = inSearchMode
    ? searchResults
    : nearby.length > 0
    ? others
    : mockFallback.slice(1);

  return (
    <div className="absolute inset-0 bg-white flex flex-col">

      {/* 顶部栏 */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#f5f5f5]">
        <button onClick={goBack} className="w-9 h-9 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-[15px] font-medium text-dpInk">关联地点</div>
        <button
          onClick={() => {
            setPoiSkipped(true);
            setUserSelectedPOI(null);
            // 不再依赖 URL 参数，状态已存入 LocationContext
            if (fromSheet) {
              navigate("/camera?sheet=1", { replace: true });
            } else if (fromEdit) {
              navigate("/edit", { replace: true });
            } else {
              navigate("/edit");
            }
          }}
          className="text-[14px] text-dpText-secondary"
        >
          跳过
        </button>
      </div>

      {/* 搜索框 */}
      <div className="px-4 pt-3 pb-2">
        <div className="h-10 bg-[#F5F5F5] rounded-full flex items-center px-4 gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#999" strokeWidth="2" />
            <path d="M20 20L17 17" stroke="#999" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜店名/景点/品类(机场、海滩、博物馆…)"
            className="flex-1 bg-transparent outline-none text-[14px] text-dpInk"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="w-5 h-5 rounded-full bg-[#ccc] flex items-center justify-center"
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        {!inSearchMode && shortAddress && (
          <div className="text-[11px] text-dpText-tertiary mt-2 px-1 flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <path d="M12 21l-6-9a7 7 0 1112 0l-6 9z" strokeLinejoin="round" />
              <circle cx="12" cy="11" r="2" />
            </svg>
            <span>{streetAddress ? `${shortAddress} · ${streetAddress}` : shortAddress}</span>
          </div>
        )}
      </div>

      {/* 滚动列表 */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* ── 搜索模式 ── */}
        {inSearchMode && (
          <div className="px-4 pt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1 h-3 bg-dpOrange rounded-full" />
              <span className="text-[13px] font-medium text-dpInk">
                搜索结果
              </span>
              {searching && (
                <span className="text-[11px] text-dpText-tertiary ml-2">
                  搜索中…
                </span>
              )}
            </div>

            {!searching && searchResults.length === 0 && debouncedQuery && (
              <div className="py-12 flex flex-col items-center gap-2 text-dpText-tertiary">
                <div className="text-3xl">🔍</div>
                <div className="text-[13px]">没找到「{debouncedQuery}」相关地点</div>
                <div className="text-[11px]">试试搜索其他关键词</div>
              </div>
            )}

            <div className="flex flex-col">
              {searchResults.map((p) => (
                <PoiRow
                  key={p.id}
                  poi={p}
                  selected={selectedId === p.id}
                  onSelect={() => selectPOI(p)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── 默认模式:AI 推荐 + 附近 ── */}
        {!inSearchMode && (
          <>
            {/* AI 推荐区 */}
            {displayAi && (
              <div className="px-4 pt-3 pb-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1 h-3 bg-dpOrange rounded-full" />
                  <span className="text-[13px] font-medium text-dpInk">
                    AI 智能识别
                  </span>
                  <span className="text-[11px] px-1.5 py-px bg-dpOrange-bg text-dpOrange-deep rounded font-medium">
                    推荐
                  </span>
                </div>

                <button
                  onClick={() => selectPOI(displayAi)}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all ${
                    selectedId === displayAi.id
                      ? "bg-dpOrange-bg ring-1 ring-dpOrange/40"
                      : "bg-[#FAFAF7]"
                  }`}
                >
                  <div
                    className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center text-3xl"
                    style={{
                      background: "linear-gradient(135deg, #FFE0B0, #FFC880)",
                    }}
                  >
                    {displayAi.emoji || "📍"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium text-dpInk truncate">
                      {displayAi.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-dpText-tertiary">
                      <span className="text-dpOrange-deep font-medium">
                        ★ {displayAi.rating?.toFixed(1) || "4.7"}
                      </span>
                      <span>·</span>
                      <span>{displayAi.category}</span>
                      {displayAi.distance && (
                        <>
                          <span>·</span>
                          <span>{displayAi.distance}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="#FF6F00">
                        <path d="M9 12l2 2 4-4 6 6V4H3v16l6-8z" />
                      </svg>
                      <span className="text-[10px] text-dpOrange-deep">
                        基于位置 + 图片综合识别
                      </span>
                    </div>
                  </div>
                  {selectedId === displayAi.id && <SelectedDot />}
                </button>
              </div>
            )}

            {/* 附近列表 */}
            <div className="px-4 pt-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1 h-3 bg-dpText-quaternary rounded-full" />
                <span className="text-[13px] font-medium text-dpInk">
                  附近其他
                </span>
                {nearbyLoading && (
                  <span className="text-[11px] text-dpText-tertiary ml-2">
                    加载中…
                  </span>
                )}
              </div>

              {nearbyLoading && nearby.length === 0 && (
                <div className="py-8 flex flex-col items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-dpOrange"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <div className="text-[11px] text-dpText-tertiary">
                    正在搜索你附近的地点…
                  </div>
                </div>
              )}

              {!nearbyLoading && displayOthers.length === 0 && nearby.length === 0 && mockFallback.length === 0 && (
                <div className="py-8 text-center text-[12px] text-dpText-tertiary">
                  附近暂无可用地点 · 试试搜索
                </div>
              )}

              <div className="flex flex-col">
                {displayOthers.map((p) => (
                  <PoiRow
                    key={p.id}
                    poi={p}
                    selected={selectedId === p.id}
                    onSelect={() => selectPOI(p)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 底部确认按钮 */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-7 bg-gradient-to-t from-white via-white/95 to-transparent">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (pendingPOI) {
              setUserSelectedPOI(pendingPOI);
              setPoiSkipped(false);
            }
            goBack();
          }}
          disabled={!pendingPOI}
          className="w-full h-12 rounded-full text-white font-medium text-[15px] disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #FF6F00, #FFA040)",
            boxShadow: "0 4px 16px rgba(255,111,0,0.3)",
          }}
        >
          {pendingPOI ? `确认关联 「${pendingPOI.name?.length > 12 ? pendingPOI.name.slice(0, 12) + '…' : pendingPOI.name}」` : '请选择地点'}
        </motion.button>
      </div>
    </div>
  );
}

// 单个 POI 行
function PoiRow({ poi, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className="flex items-center gap-3 py-3 text-left"
    >
      <div className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center text-2xl bg-[#FAFAF7]">
        {poi.emoji || "📍"}
      </div>
      <div className="flex-1 min-w-0 border-b border-[#f5f5f5] pb-3">
        <div className="text-[14px] text-dpInk truncate">{poi.name}</div>
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-dpText-tertiary">
          <span className="text-dpOrange-deep font-medium">
            ★ {poi.rating?.toFixed(1) || "4.5"}
          </span>
          <span>·</span>
          <span className="truncate max-w-[100px]">{poi.category}</span>
          {poi.distance && (
            <>
              <span>·</span>
              <span>{poi.distance}</span>
            </>
          )}
        </div>
      </div>
      <div className="pb-3">
        {selected ? <SelectedDot /> : <UnselectedDot />}
      </div>
    </button>
  );
}

function SelectedDot() {
  return (
    <div className="w-5 h-5 rounded-full bg-dpOrange flex items-center justify-center shrink-0">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
        <path d="M5 12l5 5 9-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function UnselectedDot() {
  return <div className="w-5 h-5 rounded-full border-2 border-[#ddd]" />;
}

// 兜底: 把品类字符串映射到 emoji(用于 mockFallback)
function getEmojiFromCategory(category) {
  if (!category) return "📍";
  const c = category.toLowerCase();
  if (c.includes("咖啡") || c.includes("café")) return "☕";
  if (c.includes("餐") || c.includes("菜") || c.includes("料")) return "🍴";
  if (c.includes("酒吧") || c.includes("bar")) return "🍺";
  if (c.includes("景点") || c.includes("观光") || c.includes("地标")) return "🌆";
  if (c.includes("博物馆")) return "🖼️";
  if (c.includes("教堂") || c.includes("寺庙")) return "⛪";
  if (c.includes("公园") || c.includes("park")) return "🌳";
  if (c.includes("海滩") || c.includes("beach")) return "🏖️";
  if (c.includes("购物") || c.includes("商业") || c.includes("market")) return "🛍️";
  if (c.includes("酒店") || c.includes("hotel")) return "🏨";
  if (c.includes("机场")) return "✈️";
  if (c.includes("学校") || c.includes("校园")) return "🎓";
  return "📍";
}
