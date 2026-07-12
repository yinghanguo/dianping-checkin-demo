import nikiAvatar from "../assets/niki-avatar.svg";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getList } from "../data/lists";

// 微信分享落地演示(方案 5.7):清单以小程序卡片的形态出现在聊天里
// 对齐真实门店分享卡样式,点击卡片 → 清单只读落地页(demo 中直接进清单详情)
export default function WechatShare() {
  const navigate = useNavigate();
  const { id } = useParams();
  const list = getList(id) || getList("list_f_njxl_richang");
  if (!list) return null;
  const photos = list.items.map((it) => it.photo).slice(0, 4);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#EDEDED" }}>
      {/* ── 微信导航 ── */}
      <div className="shrink-0 px-3 pt-4 pb-2.5 flex items-center" style={{ background: "#EDEDED" }}>
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 text-center text-[16px] font-medium text-[#1a1a1a]">
          好吃的朋友们(9)
        </div>
        <div className="w-8 flex items-center justify-center text-[#1a1a1a] tracking-widest">···</div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-3">
        <div className="text-center text-[11px] text-[#b0b0b0] py-3">8:27 AM</div>

        {/* ── 发出的小程序卡片(右侧,Niki 发送) ── */}
        <div className="flex justify-end items-start gap-2 mb-4">
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => navigate(`/album/${list.id}`)}
            className="bg-white rounded-lg overflow-hidden text-left"
            style={{ width: 246, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}
          >
            {/* 来源行 */}
            <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: "#FF6F00" }}>
                <span className="text-white text-[8px] font-black">评</span>
              </div>
              <span className="text-[11px] text-[#888] truncate">大众点评美食电影运动旅游门票</span>
              <span className="text-[10px] shrink-0" style={{ color: "#07C160" }}>交易保障</span>
            </div>
            {/* 标题 */}
            <div className="px-3 pb-2 text-[14.5px] text-[#1a1a1a] leading-snug font-medium">
              我私藏的 {list.items.length} 家店｜{list.title}
            </div>
            {/* 四宫格封面 */}
            <div className="mx-3 mb-2 rounded-md overflow-hidden relative">
              <div className="grid grid-cols-2 grid-rows-2 gap-px bg-white" style={{ aspectRatio: "5/4" }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="bg-[#f0f0f0] overflow-hidden">
                    {photos[i % photos.length] && (
                      <img src={photos[i % photos.length]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
              {/* 信任标 */}
              <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] text-white flex items-center gap-0.5" style={{ background: "rgba(0,0,0,0.55)" }}>
                {`${list.items.length} 家店`}
              </div>
              <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] text-white flex items-center gap-1" style={{ background: "rgba(0,0,0,0.55)" }}>
                <div className="w-3 h-3 rounded-full overflow-hidden">
                  <img src={list.owner.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                {list.owner.name}
              </div>
            </div>
            {/* 小程序标识 */}
            <div className="px-3 py-1.5 border-t border-[#f2f2f2] flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#b0b0b0" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M8 12a4 4 0 018 0 4 4 0 01-8 0z" />
              </svg>
              <span className="text-[10px] text-[#b0b0b0]">小程序</span>
            </div>
          </motion.button>
          {/* Niki 头像 */}
          <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 bg-white">
            <img src={nikiAvatar} alt="" className="w-full h-full" />
          </div>
        </div>

        {/* ── 朋友回复 ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-start gap-2 mb-3"
        >
          <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 bg-white">
            <img src="https://api.dicebear.com/9.x/notionists/svg?seed=%E6%97%A5%E9%85%B1&backgroundColor=ffdfbf" alt="" className="w-full h-full" />
          </div>
          <div className="bg-white rounded-lg px-3 py-2 text-[14px] text-[#1a1a1a]" style={{ maxWidth: 220 }}>
            收了收了！周六按这个吃 🐟
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="flex items-start gap-2 mb-4"
        >
          <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 bg-white">
            <img src="https://api.dicebear.com/9.x/notionists/svg?seed=%E5%9D%8F%E8%9B%8Bbobo&backgroundColor=ffcfd2" alt="" className="w-full h-full" />
          </div>
          <div className="bg-white rounded-lg px-3 py-2 text-[14px] text-[#1a1a1a]" style={{ maxWidth: 220 }}>
            终于不用翻聊天记录找你上次推荐的店了
          </div>
        </motion.div>

        <div className="h-6" />
      </div>

      {/* ── 输入条 ── */}
      <div className="shrink-0 px-3 py-2 flex items-center gap-2.5" style={{ background: "#F6F6F6", borderTop: "1px solid #e5e5e5", paddingBottom: 28 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M8 15c1 1.5 2.5 2 4 2s3-.5 4-2" strokeLinecap="round" />
        </svg>
        <div className="flex-1 h-9 bg-white rounded-md" />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 10h.01M16 10h.01M8.5 14.5c1 1 2.2 1.5 3.5 1.5s2.5-.5 3.5-1.5" strokeLinecap="round" />
        </svg>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
