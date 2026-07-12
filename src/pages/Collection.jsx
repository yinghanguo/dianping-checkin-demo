import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getMyLists, getSavedLists, effectiveCheckedOff, iHaveBeenTo, ME } from "../data/lists";

// 收藏页(对齐真实点评收藏页结构):专辑 = 清单的坯子,一个对象三种状态
// 我的专辑:公开/私密角标 + 被收藏数;我收藏的:别人的清单 + 拔草进度
const TOP_TABS = ["专辑", "地点/商户", "推荐菜", "内容", "商品", "其他"];

export default function Collection() {
  const navigate = useNavigate();
  const [topTab, setTopTab] = useState(0);
  const [albumTab, setAlbumTab] = useState("mine"); // mine | saved

  const myLists = useMemo(() => getMyLists(), []);
  const savedLists = useMemo(() => getSavedLists(), []);

  // 地点/商户 Tab:从我的专辑聚合去重的平铺门店列表
  const flatStores = useMemo(() => {
    const seen = new Map();
    myLists.forEach((l) => {
      l.items.forEach((it) => {
        if (!seen.has(it.poi.name)) {
          seen.set(it.poi.name, { ...it, fromList: l.title });
        }
      });
    });
    return [...seen.values()];
  }, [myLists]);

  return (
    <div className="absolute inset-0 bg-[#F7F7F7] flex flex-col">
      {/* ── 头部 ── */}
      <div className="bg-white shrink-0 px-3 pt-3 pb-2 flex items-center">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 text-center text-[17px] font-bold text-dpInk">收藏</div>
        <div className="flex items-center gap-3 shrink-0">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20L17 17" strokeLinecap="round" />
          </svg>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M4 6h12M4 12h12M4 18h8M20 16l-3 3-1.5-1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* ── 顶部 Tab ── */}
      <div className="bg-white shrink-0 px-4 flex gap-5 overflow-x-auto no-scrollbar border-b border-[#f0f0f0]">
        {TOP_TABS.map((t, i) => (
          <button key={t} onClick={() => setTopTab(i)} className="py-2.5 relative shrink-0">
            <span className={`text-[15px] ${topTab === i ? "text-dpInk font-bold" : "text-dpText-secondary"}`}>{t}</span>
            {topTab === i && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-dpOrange" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
        {/* ════ 专辑 Tab ════ */}
        {topTab === 0 && (
          <>
            {/* 我的专辑 | 我收藏的 */}
            <div className="px-3 py-2.5 flex gap-2">
              {[
                { key: "mine", label: "我的专辑" },
                { key: "saved", label: "我收藏的" },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setAlbumTab(c.key)}
                  className="px-3.5 h-8 rounded-full text-[13px] font-medium"
                  style={
                    albumTab === c.key
                      ? { background: "#FFF0E5", color: "#E65000" }
                      : { background: "#fff", color: "#555" }
                  }
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* 我的专辑 */}
            {albumTab === "mine" &&
              myLists.map((l, idx) => (
                <motion.button
                  key={l.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/album/${l.id}`)}
                  className="w-full text-left bg-white rounded-2xl mx-3 mb-3 p-4"
                  style={{ width: "calc(100% - 24px)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[17px] font-bold text-dpInk truncate">{l.title}</span>
                    {l.visibility === "public" ? (
                      <span className="shrink-0 text-[10px] px-1.5 py-px rounded font-medium text-white" style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}>
                        公开 · 私藏清单
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] px-1.5 py-px rounded text-dpText-secondary" style={{ background: "#F5F5F5" }}>
                        🔒 私密
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-dpText-tertiary mt-1">
                    {l.items.length} 个地点/商户 · 0 篇内容
                  </div>
                  {/* 照片条(用户照片,非商家头图) */}
                  <div className="flex gap-1.5 mt-2.5">
                    {l.items.slice(0, 4).map((it, i) => (
                      <div key={i} className="flex-1 rounded-lg overflow-hidden bg-[#f0f0f0]" style={{ aspectRatio: "1/1" }}>
                        <img src={it.photo} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - l.items.length) }).map((_, i) => (
                      <div key={`e${i}`} className="flex-1 rounded-lg bg-[#f5f5f5]" style={{ aspectRatio: "1/1" }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-dpText-tertiary">
                    <div className="w-4 h-4 rounded-full overflow-hidden bg-[#f0f0f0]">
                      <img src={ME.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span>
                      {l.visibility === "public" ? `${l.saveCount} 人收藏 · ♡ ${l.likeCount}` : "1 个共享人 · 仅自己可见"}
                    </span>
                    <span className="ml-auto">{l.updatedAt} 更新</span>
                  </div>
                </motion.button>
              ))}

            {/* 我收藏的(别人的清单 + 拔草进度) */}
            {albumTab === "saved" &&
              (savedLists.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-dpText-tertiary gap-2">
                  <div className="text-[36px]">🔖</div>
                  <div className="text-[13px]">还没收藏别人的清单</div>
                  <div className="text-[11px]">在门店页、搜索里遇到合口味的私藏，收下它</div>
                </div>
              ) : (
                savedLists.map((l) => {
                  const checked = effectiveCheckedOff(l);
                  const done = l.items.filter((it) => checked.has(it.poi?.name)).length;
                  return (
                    <button
                      key={l.id}
                      onClick={() => navigate(`/album/${l.id}`)}
                      className="w-full text-left bg-white rounded-2xl mx-3 mb-3 p-4"
                      style={{ width: "calc(100% - 24px)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[16px] font-bold text-dpInk truncate flex-1">{l.title}</span>
                        <span className="shrink-0 text-[10px] text-dpText-tertiary">已去 {done}/{l.items.length}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-dpText-tertiary">
                        <div className="w-4 h-4 rounded-full overflow-hidden bg-[#f0f0f0]">
                          <img src={l.owner.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                        {l.owner.name} · {l.items.length} 家店 · 更新于 {l.updatedAt}
                      </div>
                      <div className="flex gap-1.5 mt-2.5">
                        {l.items.slice(0, 4).map((it, i) => (
                          <div key={i} className="flex-1 rounded-lg overflow-hidden bg-[#f0f0f0] relative" style={{ aspectRatio: "1/1" }}>
                            <img src={it.photo} alt="" className="w-full h-full object-cover" loading="lazy" />
                            {checked.has(it.poi?.name) && (
                              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)" }}>
                                <span className="text-white text-[13px]">✓</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2.5 h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${l.items.length ? (done / l.items.length) * 100 : 0}%`,
                            background: "linear-gradient(90deg, #7BC142, #A5D66E)",
                          }}
                        />
                      </div>
                    </button>
                  );
                })
              ))}
          </>
        )}

        {/* ════ 地点/商户 Tab(平铺仓库,工具刚需) ════ */}
        {topTab === 1 && (
          <>
            <div className="px-3 py-2.5 flex gap-2">
              {["上海", "区域", "分类", "智能排序"].map((f) => (
                <button key={f} className="px-3 h-8 rounded-full bg-white text-[12.5px] text-dpText-secondary flex items-center gap-0.5">
                  {f}
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
            <div className="bg-white mx-3 rounded-2xl overflow-hidden">
              {flatStores.map((it) => (
                <button
                  key={it.poi.name}
                  onClick={() => navigate("/store", { state: { poi: it.poi, photo: it.photo, caption: it.reason } })}
                  className="w-full px-3.5 py-3 flex items-center gap-3 text-left border-b border-[#f7f7f7] last:border-0"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#f0f0f0] shrink-0">
                    <img src={it.photo} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-semibold text-dpInk truncate">{it.poi.name}</span>
                      {iHaveBeenTo(it.poi.name) && (
                        <span className="shrink-0 text-[9px] px-1 py-px rounded" style={{ background: "#FFF0E5", color: "#E65000" }}>
                          打卡过
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-dpText-tertiary mt-0.5 truncate">
                      {it.poi.category} · {it.poi.city}
                    </div>
                    <div className="text-[10.5px] mt-0.5 truncate" style={{ color: "#B08850" }}>
                      来源于「{it.fromList}」
                    </div>
                  </div>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" className="shrink-0">
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>
          </>
        )}

        {/* 其余 Tab 占位 */}
        {topTab > 1 && (
          <div className="flex flex-col items-center justify-center h-48 text-dpText-tertiary gap-2">
            <div className="text-[36px]">📦</div>
            <div className="text-[13px]">暂无收藏</div>
          </div>
        )}
      </div>

      {/* ── 底部浮动按钮:一键导入 | 创建专辑 ── */}
      {topTab === 0 && albumTab === "mine" && (
        <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center px-6" style={{ zIndex: 30 }}>
          <button
            onClick={() => navigate("/album/create")}
            className="h-11 px-10 rounded-full text-white text-[14px] font-medium"
            style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)", boxShadow: "0 4px 16px rgba(255,111,0,0.35)" }}
          >
            创建专辑
          </button>
        </div>
      )}
    </div>
  );
}
