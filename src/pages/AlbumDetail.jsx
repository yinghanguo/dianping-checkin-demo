import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getAlbum, deleteAlbum } from "../data/albums";
import { MY_CHECKINS } from "../data/myCheckins";
import CheckinMap from "../components/CheckinMap";

export default function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const album = getAlbum(id);

  const [toastVisible, setToastVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Map checkins: look up coords from MY_CHECKINS by poi name
  const mapCheckins = useMemo(() => {
    if (!album) return [];
    return album.items
      .map((item) => MY_CHECKINS.find((c) => c.poi.name === item.poi.name))
      .filter(Boolean);
  }, [album]);

  if (!album) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white">
        <div className="text-dpText-tertiary text-[14px]">专辑不存在</div>
      </div>
    );
  }

  const cities = [...new Set(album.items.map((i) => i.poi.city))];

  const handleShare = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleDelete = () => {
    deleteAlbum(id);
    navigate(-1);
  };

  const handlePoiClick = (item) => {
    const checkin = MY_CHECKINS.find((c) => c.poi.name === item.poi.name);
    navigate("/store", { state: { poi: item.poi, photo: item.photo, caption: item.caption, checkin } });
  };

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-28">

        {/* ── Cover header ── */}
        <CoverHeader
          cover={album.cover}
          onBack={() => navigate(-1)}
          onMenu={() => setMenuOpen((v) => !v)}
          menuOpen={menuOpen}
          onEdit={() => { setMenuOpen(false); navigate(`/album/${id}/edit`); }}
          onDelete={() => { setMenuOpen(false); setConfirmDelete(true); }}
        />

        {/* ── Title row ── */}
        <div className="px-5 py-4 border-b border-[#f5f5f5]">
          <div className="text-[20px] font-bold text-dpInk leading-tight">{album.title}</div>
          <div className="text-[12px] text-dpText-tertiary mt-1.5 flex items-center gap-2">
            <span>{album.items.length} 个地点</span>
            <span>·</span>
            <span>{cities.join(" / ")}</span>
          </div>
        </div>

        {/* ── Items ── */}
        <div className="px-4 pt-5 pb-4 space-y-7">
          {album.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              {/* Rank + POI name (clickable) */}
              <button
                className="flex items-center gap-2.5 mb-2.5 w-full text-left"
                onClick={() => handlePoiClick(item)}
              >
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

              {/* Photo (clickable, 4:3) */}
              <button
                className="w-full rounded-2xl overflow-hidden bg-[#f0f0f0] block"
                style={{ aspectRatio: "4/3" }}
                onClick={() => handlePoiClick(item)}
              >
                <img src={item.photo} alt="" className="w-full h-full object-cover" />
              </button>

              {/* Caption */}
              {item.caption && (
                <div className="mt-2.5 text-[13px] text-dpInk leading-relaxed">{item.caption}</div>
              )}
            </motion.div>
          ))}
        </div>

        {/* ── Map section ── */}
        {mapCheckins.length > 0 && (
          <div className="px-4 pt-2 pb-5 border-t border-[#f5f5f5]">
            <div className="text-[13px] font-medium text-dpText-secondary mb-3">专辑地点</div>
            <div className="rounded-2xl overflow-hidden" style={{ height: 200 }}>
              <CheckinMap checkins={mapCheckins} height={200} />
            </div>
          </div>
        )}

        <div className="px-4 py-5 border-t border-[#f5f5f5] text-center">
          <div className="text-[11px] text-dpText-tertiary">由 Niki 整理 · 打开大众点评查看更多</div>
        </div>
      </div>

      {/* Share bar */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#f5f5f5] px-5 pt-3"
        style={{ paddingBottom: 32 }}
      >
        <button
          onClick={handleShare}
          className="w-full h-11 rounded-full text-white text-[15px] font-medium flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #FF6F00, #FFA040)", boxShadow: "0 4px 16px rgba(255,111,0,0.3)" }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
          </svg>
          分享给朋友
        </button>
      </div>

      {/* Share toast */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-full text-white text-[13px]"
            style={{ background: "rgba(0,0,0,0.72)" }}
          >
            链接已复制，快发给朋友吧 🎉
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dismiss popover outside tap */}
      {menuOpen && <div className="absolute inset-0 z-[9]" onClick={() => setMenuOpen(false)} />}

      {/* Delete confirmation */}
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
                <div className="text-[17px] font-semibold text-dpInk mb-2">删除专辑</div>
                <div className="text-[13px] text-dpText-secondary leading-relaxed">
                  「{album.title}」将被永久删除，无法恢复
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

// ── Simple cover image header ──
function CoverHeader({ cover, onBack, onMenu, menuOpen, onEdit, onDelete }) {
  return (
    <div className="relative overflow-hidden shrink-0" style={{ height: 240 }}>
      <img src={cover} alt="" className="w-full h-full object-cover" draggable={false} />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.35) 0%, transparent 50%)" }}
      />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center z-10"
        style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(8px)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Menu button + popover */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onMenu}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(8px)" }}
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
                <span className="text-white text-[13px]">编辑专辑</span>
              </button>
              <button onClick={onDelete} className="w-full flex items-center gap-2.5 px-4 py-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" strokeLinecap="round" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round" />
                  <path d="M10 11v6M14 11v6" strokeLinecap="round" />
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" strokeLinecap="round" />
                </svg>
                <span className="text-[#FF6B6B] text-[13px]">删除专辑</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
