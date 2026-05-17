import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import { MY_CHECKINS, deriveStats, deriveTrips } from "../data/myCheckins";
import {
  getMergedCheckins,
  removeCheckin,
  setCheckinVisibility,
} from "../utils/userCheckins";
import { BottomTab } from "./Me";
import { FRIENDS } from "../data/friends";
import CheckinMap from "../components/CheckinMap";
import { usePhoto } from "../contexts/PhotoContext";
import { loadAlbums } from "../data/albums";
import CheckinTimelineItem from "../components/CheckinTimelineItem";

// 个人层主页 — 三视图:列表 / 地图 / 路线
export default function Footprint() {
  const navigate = useNavigate();
  const { footprintView: view, setFootprintView: setView } = usePhoto();

  // 实时打卡(localStorage)+ 历史 baseline,按时间倒序;支持删除/改可见性后刷新
  const [refreshTick, setRefreshTick] = useState(0);
  const allCheckins = useMemo(
    () => getMergedCheckins(MY_CHECKINS),
    [refreshTick]
  );
  const refresh = () => setRefreshTick((t) => t + 1);
  const handleDelete = (id) => {
    const target = allCheckins.find((c) => c.id === id);
    removeCheckin(id, { isUserCreated: !!target?.isUserCreated });
    refresh();
  };
  const handleChangeVisibility = (id, visibility) => {
    const target = allCheckins.find((c) => c.id === id);
    setCheckinVisibility(id, visibility, {
      isUserCreated: !!target?.isUserCreated,
    });
    refresh();
  };
  const stats = deriveStats(allCheckins);

  // 记录:用户上次在"我的"区域时是 /footprint
  React.useEffect(() => {
    sessionStorage.setItem("lastMeRoute", "/footprint");
  }, []);
  const trips = useMemo(() => deriveTrips(allCheckins), [allCheckins]);

  return (
    <div className="absolute inset-0 bg-white flex flex-col">
      <StatusBar />

      {/* 顶部栏 */}
      <div className="px-4 pt-4 pb-4 flex items-center justify-between border-b border-[#f5f5f5]">
        <button
          onClick={() => navigate("/me")}
          className="w-9 h-9 flex items-center justify-center"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-[15px] font-medium text-dpInk">我的打卡</div>
        <button
          onClick={() => navigate("/camera")}
          className="px-3 h-7 rounded-full text-white text-[12px] font-medium flex items-center gap-1"
          style={{
            background: "linear-gradient(135deg, #FF6F00, #FFA040)",
            boxShadow: "0 2px 8px rgba(255,111,0,0.3)",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 21l-6-9a7 7 0 1112 0l-6 9z" strokeLinejoin="round" />
            <circle cx="12" cy="11" r="2" />
          </svg>
          打卡
        </button>
      </div>

      {/* 头部数据条 */}
      <div className="px-5 pt-3 pb-2 border-b border-[#f5f5f5]">
        <div className="flex items-baseline gap-1 mb-0.5">
          <span className="text-[24px] font-bold text-dpInk">{stats.totalCheckins}</span>
          <span className="text-[12px] text-dpText-tertiary">条打卡</span>
          <span className="text-[12px] text-dpText-tertiary mx-1">·</span>
          <span className="text-[14px] font-semibold text-dpInk">{stats.countryCount}</span>
          <span className="text-[12px] text-dpText-tertiary">国</span>
          <span className="text-[14px] font-semibold text-dpInk ml-1">{stats.cityCount}</span>
          <span className="text-[12px] text-dpText-tertiary">城</span>
        </div>
        <div className="text-[11px] text-dpText-tertiary">{stats.cities.slice(0, 4).join(" · ")}{stats.cities.length > 4 && ` 等 ${stats.cities.length} 个城市`}</div>
      </div>

      {/* 三视图切换 */}
      <div className="px-4 pt-3 flex gap-2 shrink-0 border-b border-[#f5f5f5] pb-2">
        {[
          { key: "list", label: "打卡", icon: ListIcon },
          { key: "map", label: "地图", icon: MapIcon },
          { key: "trips", label: "路线", icon: RouteIcon },
          { key: "albums", label: "专辑", icon: AlbumIcon },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`flex items-center gap-1 px-3 h-8 rounded-full text-[12px] font-medium transition-all ${
              view === v.key
                ? "bg-dpInk text-white"
                : "bg-[#F5F5F5] text-dpText-secondary"
            }`}
          >
            <v.icon active={view === v.key} />
            {v.label}
          </button>
        ))}
      </div>

      {/* 视图内容 */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <AnimatePresence mode="wait">
          {view === "list" && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ListView
                checkins={allCheckins}
                onDelete={handleDelete}
                onChangeVisibility={handleChangeVisibility}
              />
            </motion.div>
          )}
          {view === "map" && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MapView checkins={allCheckins} stats={stats} />
            </motion.div>
          )}
          {view === "trips" && (
            <motion.div key="trips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TripsView trips={trips} />
            </motion.div>
          )}
          {view === "albums" && (
            <motion.div key="albums" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AlbumsView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 保留底部 Tab(从"我的"页进来时不丢失主导航) */}
      <BottomTab navigate={navigate} active="me" />
    </div>
  );
}

// ──────────────────────────────────────────
// 列表视图(参考点评原生设计 + 时间轴)
// ──────────────────────────────────────────
function ListView({ checkins, onDelete, onChangeVisibility }) {
  return (
    <div className="px-4 py-3">
      {/* 信息流顶部:计数 + 搜索入口 */}
      <div className="flex items-center justify-between pb-3">
        <div className="text-[12px] text-dpText-tertiary">
          共 {checkins.length} 条
        </div>
        <button
          aria-label="搜索打卡"
          className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-dpText-secondary"
          onClick={() => {
            /* TODO:接入搜索 */
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {checkins.map((c) => (
        <CheckinTimelineItem
          key={c.id}
          checkin={c}
          onDelete={onDelete}
          onChangeVisibility={onChangeVisibility}
        />
      ))}
      <div className="text-center text-[11px] text-dpText-tertiary py-6">
        — 已展示全部 {checkins.length} 条打卡 —
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// 地图视图(真实 Leaflet 地图 + 热力图 + POI marker + 城市排行)
// ──────────────────────────────────────────
function MapView({ checkins, stats }) {
  // 城市聚类(按最近打卡时间倒排)
  const cityClusters = useMemo(() => {
    const m = new Map();
    for (const c of checkins) {
      const key = c.poi.city;
      if (!m.has(key)) {
        m.set(key, { city: key, items: [], lat: c.coords.lat, lng: c.coords.lng, lastTime: 0 });
      }
      const cl = m.get(key);
      cl.items.push(c);
      cl.lastTime = Math.max(cl.lastTime, c.timestamp || 0);
    }
    return Array.from(m.values()).sort((a, b) => b.lastTime - a.lastTime);
  }, [checkins]);

  const [selectedCity, setSelectedCity] = useState(null);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const visibleCheckins = selectedCity
    ? checkins.filter((c) => c.poi.city === selectedCity)
    : checkins;

  const handleCityClick = (cl) => {
    if (selectedCity === cl.city) {
      setSelectedCity(null);
    } else {
      setSelectedCity(cl.city);
    }
  };

  // 只展示最近 4 个城市 + "全部"按钮
  const recentCities = cityClusters.slice(0, 4);

  // 按洲/国家分组(用于弹窗)
  const CONTINENT_MAP = {
    上海: "亚洲 · 中国", 浦东机场: "亚洲 · 中国", 北京: "亚洲 · 中国", 中卫: "亚洲 · 中国",
    巴塞罗那: "欧洲 · 西班牙", 巴塞罗那机场: "欧洲 · 西班牙", 蒙塞拉特: "欧洲 · 西班牙",
    格拉纳达: "欧洲 · 西班牙", 塞维利亚: "欧洲 · 西班牙", 马略卡: "欧洲 · 西班牙",
    布达佩斯: "欧洲 · 匈牙利", 布拉格: "欧洲 · 捷克", 伦敦: "欧洲 · 英国",
    皇后镇: "大洋洲 · 新西兰", 基督城: "大洋洲 · 新西兰",
    北海道: "亚洲 · 日本",
    胡志明市: "亚洲 · 越南",
    澳门: "亚洲 · 中国",
  };

  const REGION_ORDER = [
    "亚洲 · 中国", "亚洲 · 日本", "亚洲 · 越南",
    "欧洲 · 西班牙", "欧洲 · 匈牙利", "欧洲 · 捷克", "欧洲 · 英国",
    "大洋洲 · 新西兰",
    "其他",
  ];
  const cityGroups = useMemo(() => {
    const groups = new Map();
    for (const cl of cityClusters) {
      const region = CONTINENT_MAP[cl.city] || "其他";
      if (!groups.has(region)) groups.set(region, []);
      groups.get(region).push(cl);
    }
    // 按预定义洲际顺序排列
    return REGION_ORDER
      .filter((r) => groups.has(r))
      .map((r) => [r, groups.get(r)]);
  }, [cityClusters]);

  return (
    <div className="px-4 py-3">
      {/* 城市快捷切换(最近 4 个 + 全部) */}
      <div className="flex gap-2 mb-3 items-center">
        <button
          onClick={() => setSelectedCity(null)}
          className={`shrink-0 px-3 h-7 rounded-full text-[12px] font-medium ${
            !selectedCity ? "bg-dpInk text-white" : "bg-[#F5F5F5] text-dpText-secondary"
          }`}
        >
          全部
        </button>
        {recentCities.map((cl) => (
          <button
            key={cl.city}
            onClick={() => selectedCity === cl.city ? setSelectedCity(null) : setSelectedCity(cl.city)}
            className={`shrink-0 px-3 h-7 rounded-full text-[12px] font-medium truncate max-w-[90px] ${
              selectedCity === cl.city
                ? "bg-dpInk text-white"
                : "bg-[#F5F5F5] text-dpText-secondary"
            }`}
          >
            {cl.city}
          </button>
        ))}
        {cityClusters.length > 4 && (
          <button
            onClick={() => setShowCityPicker(true)}
            className="shrink-0 px-3 h-7 rounded-full bg-dpOrange-bg text-dpOrange-deep text-[12px] font-medium flex items-center gap-0.5"
          >
            {cityClusters.length}城
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* ── 城市选择弹窗 ── */}
      <AnimatePresence>
        {showCityPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCityPicker(false)}
              className="absolute inset-0 z-[100] bg-black/40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="absolute left-0 right-0 bottom-0 z-[101] bg-white rounded-t-3xl flex flex-col"
              style={{ maxHeight: "75vh", boxShadow: "0 -10px 40px rgba(0,0,0,0.15)" }}
            >
              {/* 抓手 */}
              <div className="pt-2.5 pb-1 flex justify-center shrink-0">
                <div className="w-11 h-1 rounded-full bg-[#e0e0e0]" />
              </div>
              {/* 标题 */}
              <div className="px-5 pt-2 pb-3 flex items-center justify-between shrink-0 border-b border-[#f5f5f5]">
                <div>
                  <div className="text-[16px] font-semibold text-dpInk">选择城市</div>
                  <div className="text-[11px] text-dpText-tertiary mt-0.5">
                    {cityClusters.length} 个城市 · {stats.countryCount} 个国家 · {stats.totalCheckins} 次打卡
                  </div>
                </div>
                <button
                  onClick={() => setShowCityPicker(false)}
                  className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                    <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              {/* 按洲/国家分组 */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-3">
                {cityGroups.map(([region, cities]) => (
                  <div key={region} className="mb-4">
                    <div className="text-[12px] text-dpText-tertiary font-medium mb-2 flex items-center gap-1.5">
                      <span>{region.startsWith("亚洲") ? "🌏" : region.startsWith("欧洲") ? "🌍" : "🌎"}</span>
                      {region}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cities.map((cl) => (
                        <button
                          key={cl.city}
                          onClick={() => {
                            setSelectedCity(cl.city);
                            setShowCityPicker(false);
                          }}
                          className={`px-3 h-8 rounded-full text-[13px] font-medium flex items-center gap-1.5 ${
                            selectedCity === cl.city
                              ? "bg-dpInk text-white"
                              : "bg-[#F5F5F5] text-dpInk"
                          }`}
                        >
                          {cl.city}
                          <span className={`text-[10px] ${
                            selectedCity === cl.city ? "text-white/70" : "text-dpText-tertiary"
                          }`}>
                            {cl.items.length}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 真实地图 */}
      <CheckinMap
        key={selectedCity || "all"}
        checkins={visibleCheckins}
        height={280}
      />

      {/* 本月好友打卡排行(暂不在地图页展示,后续移到朋友圈模块) */}
    </div>
  );
}

// ──────────────────────────────────────────
// 路线视图(连续打卡 → 旅行段)
// ──────────────────────────────────────────
function TripsView({ trips }) {
  return (
    <div className="px-4 py-4 space-y-4">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}

function TripCard({ trip }) {
  const [expanded, setExpanded] = useState(false);
  const sortedItems = useMemo(
    () => [...trip.items].sort((a, b) => a.timestamp - b.timestamp),
    [trip]
  );

  const startDate = new Date(trip.start);
  const endDate = new Date(trip.end);
  const dateRange = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
    >
      {/* 封面 */}
      {trip.coverPhoto && (
        <div className="relative h-32 bg-[#f0f0f0]">
          <img src={trip.coverPhoto} alt="" className="w-full h-full object-cover" />
          <div
            className="absolute inset-0 flex flex-col justify-end p-3"
            style={{
              background:
                "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 50%)",
            }}
          >
            <div className="text-white text-[18px] font-bold">{trip.title}</div>
            <div className="text-white/80 text-[11px] mt-0.5">{dateRange} · {trip.count} 个打卡</div>
          </div>
        </div>
      )}

      {/* 路线地图 */}
      <div className="px-3 pt-3 pb-3">
        <CheckinMap checkins={sortedItems} showRoute height={220} />
      </div>

      {/* 展开/收起 */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full py-2 text-[12px] text-dpText-secondary border-t border-[#f5f5f5] flex items-center justify-center gap-1"
      >
        {expanded ? "收起" : "查看全部时间线"}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transform: expanded ? "rotate(180deg)" : "" }}>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="overflow-hidden border-t border-[#f5f5f5]"
        >
          <div className="px-4 py-3 space-y-2">
            {sortedItems.map((c) => (
              <div key={c.id} className="flex items-center gap-2.5">
                <div className="text-[10px] text-dpText-tertiary w-12 shrink-0">
                  {c.date} {c.time}
                </div>
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0"
                  style={{ background: "linear-gradient(135deg, #FFF6E5, #FFEAD0)" }}
                >
                  {c.poi.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-dpInk truncate">{c.poi.name}</div>
                  <div className="text-[10px] text-dpText-tertiary truncate">
                    {c.poi.city} · {c.poi.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// 专辑视图
// ──────────────────────────────────────────
function AlbumsView() {
  const navigate = useNavigate();
  const albums = loadAlbums();

  return (
    <div className="px-4 py-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] text-dpText-tertiary">{albums.length} 个专辑</div>
        <button
          onClick={() => navigate("/album/create")}
          className="flex items-center gap-1 px-3 h-7 rounded-full text-white text-[12px] font-medium"
          style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          新建专辑
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {albums.map((album) => (
          <button
            key={album.id}
            onClick={() => navigate(`/album/${album.id}`)}
            className="rounded-2xl overflow-hidden text-left bg-white"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
          >
            <div className="relative" style={{ aspectRatio: "3/2" }}>
              <img src={album.cover} alt="" className="w-full h-full object-cover" />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(0deg, rgba(0,0,0,0.45) 0%, transparent 55%)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2">
                <div
                  className="text-white text-[12px] font-semibold leading-snug"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {album.title}
                </div>
              </div>
            </div>
            <div className="px-2.5 py-2 flex items-center justify-between">
              <div className="text-[11px] text-dpText-tertiary">{album.items.length} 个地点</div>
              <div className="text-[11px] text-dpText-tertiary">{album.createdAt}</div>
            </div>
          </button>
        ))}
      </div>

      {albums.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-dpText-tertiary gap-2">
          <div className="text-[40px]">📚</div>
          <div className="text-[14px] text-dpInk">还没有专辑</div>
          <div className="text-[12px]">把打卡记录整理成主题推荐清单</div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// 图标
// ──────────────────────────────────────────
function ListIcon({ active }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}
function MapIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5l-6 2v14l6-2 6 2 6-2V3l-6 2-6-2z" strokeLinejoin="round" />
      <path d="M9 5v14M15 7v14" />
    </svg>
  );
}
function RouteIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M6 8 Q 6 18, 16 18" strokeLinecap="round" />
    </svg>
  );
}
function AlbumIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

// ── 本月好友打卡排行(mock) ──
function FriendCheckinRanking() {
  // mock:给每个好友生成一个本月打卡次数(稳定)
  const rankings = useMemo(() => {
    const data = FRIENDS.map((f, i) => ({
      ...f,
      count: Math.max(1, 31 - i * 2 + ((f.name.length * 3) % 7)),
      recentPhotos: [
        `https://images.unsplash.com/photo-${1550000000000 + i * 11111111}?w=80&q=60`,
      ],
    }));
    // 加入 Niki 自己
    data.push({
      id: "niki",
      name: "Niki",
      avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Niki&backgroundColor=ffd5dc",
      count: 14,
      isMe: true,
    });
    const sorted = data.sort((a, b) => b.count - a.count);
    // 确保 Niki 在 top 10 里
    const top10 = sorted.slice(0, 10);
    const nikiInTop = top10.find(r => r.isMe);
    if (!nikiInTop) {
      const niki = sorted.find(r => r.isMe);
      if (niki) top10.push(niki);
    }
    return top10;
  }, []);

  const myRank = rankings.findIndex((r) => r.isMe) + 1;

  return (
    <div className="mt-5">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-semibold text-dpInk">5 月好友打卡排行</span>
        </div>
        <button className="text-[11px] text-dpText-tertiary flex items-center gap-0.5">
          全部
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 我的排名卡片(置顶) */}
      <div
        className="rounded-2xl p-3 mb-3 flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, #FFF6E5, #FFEAD0)",
          border: "1px solid rgba(255,111,0,0.15)",
        }}
      >
        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-dpOrange">
          <img
            src="https://api.dicebear.com/9.x/notionists/svg?seed=Niki&backgroundColor=ffd5dc"
            alt="" className="w-full h-full"
          />
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-semibold text-dpInk">Niki</div>
          <div className="text-[11px] text-dpOrange-deep mt-0.5">
            打卡 14 次
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[20px] font-bold text-dpOrange-deep">第 {myRank} 名</div>
        </div>
      </div>

      {/* PK 邀请条 */}
      <button
        className="w-full mb-3 px-3 py-2 rounded-xl flex items-center gap-2 text-left"
        style={{ background: "#FFF9F0", border: "1px solid rgba(255,111,0,0.1)" }}
      >
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-bold text-white shrink-0"
          style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)" }}
        >
          PK
        </span>
        <span className="text-[12px] text-dpInk flex-1">邀请好友互相关注，加入 PK</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6F00" strokeWidth="2">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* 排行列表 */}
      <div className="space-y-0.5">
        {rankings.map((r, i) => (
          <div
            key={r.id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
              r.isMe ? "bg-[#FAFAF7]" : ""
            }`}
          >
            {/* 排名 */}
            <div className="w-5 text-center shrink-0">
              {i < 3 ? (
                <span className="text-[16px]">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                </span>
              ) : (
                <span className="text-[14px] font-bold text-dpText-tertiary">
                  {i + 1}
                </span>
              )}
            </div>
            {/* 头像 */}
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#f5f5f5]">
              <img src={r.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            {/* 名字 */}
            <div className="flex-1 min-w-0">
              <div className={`text-[14px] truncate ${r.isMe ? "font-semibold text-dpOrange-deep" : "text-dpInk"}`}>
                {r.name}
                {r.isMe && <span className="text-[10px] ml-1 text-dpOrange">(我)</span>}
              </div>
            </div>
            {/* 打卡次数 + 缩略图 */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[12px] text-dpText-secondary">
                打卡 {r.count} 次
              </span>
              {!r.isMe && r.recentPhotos?.[0] && (
                <div className="flex -space-x-1">
                  <div className="w-6 h-6 rounded overflow-hidden bg-[#f0f0f0]">
                    <img src={r.recentPhotos[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="2">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
