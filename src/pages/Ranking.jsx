import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FRIENDS } from "../data/friends";
import { getProfileForFriend } from "../data/friendProfiles";

// 5月吃货排行榜 — 改成口味档案样式
// 顶部暖黄头部(Niki 个人卡片) + 下方白 sheet(排行列表)
export default function Ranking() {
  const navigate = useNavigate();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [savedItems, setSavedItems] = useState(new Set());
  const toggleSave = (key) => {
    setSavedItems((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });
  };

  const rankings = useMemo(() => {
    // 用 profile.records.length 作为打卡次数(保持数据一致)
    const data = FRIENDS.map((f, i) => {
      const profile = getProfileForFriend(f.name);
      // 给次数加点波动(基于 i 让每个人不一样)
      const baseCount = profile.records.length;
      const count = Math.max(1, baseCount + 3 + ((f.name.length * 3) % 25));
      return { ...f, count };
    });
    data.push({
      id: "niki",
      name: "Niki",
      avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Niki&backgroundColor=ffd5dc",
      count: 14,
      isMe: true,
    });
    return data.sort((a, b) => b.count - a.count);
  }, []);

  const myRank = rankings.findIndex((r) => r.isMe) + 1;

  // 每行右侧的小食物图 — 用名字 hash 决定,保证每个人都不一样
  const THUMB_IMAGES = [
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=120&q=70", // coffee
    "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=120&q=70", // ramen
    "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=120&q=70",     // steak
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=120&q=70",     // food1
    "https://images.unsplash.com/photo-1544025162-d76694265947?w=120&q=70",     // food2
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&q=70",     // food3
    "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=120&q=70",  // gelato
    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=120&q=70",     // dessert
    "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=120&q=70",  // hotpot
    "https://images.unsplash.com/photo-1559847844-5315695dadae?w=120&q=70",     // seafood
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&q=70",  // burger
    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=120&q=70",     // pastry
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=120&q=70",  // bar
    "https://images.unsplash.com/photo-1553621042-f6e147245754?w=120&q=70",     // sushi
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=120&q=70",  // pizza
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=120&q=70",  // taco
    "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=120&q=70",     // dessert2
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=120&q=70",  // pancakes
    "https://images.unsplash.com/photo-1565895405138-6c3a1555da6a?w=120&q=70",  // bbq
    "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=120&q=70",  // pasta
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=120&q=70",  // burger2
    "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=120&q=70",     // sandwich
    "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=120&q=70",  // bento
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=120&q=70",  // dimsum
    "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=120&q=70",  // pizza2
    "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=120&q=70",     // milktea
    "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=120&q=70",     // breakfast
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=120&q=70",  // donut
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=120&q=70",     // dumpling
    "https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?w=120&q=70",  // cake
  ];
  const getThumbForFriend = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    }
    return THUMB_IMAGES[hash % THUMB_IMAGES.length];
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#f5f5f5]">
      {/* 排行浮层 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex-1 overflow-y-auto no-scrollbar bg-white pt-4 pb-24"
        style={{ boxShadow: "0 -4px 12px rgba(0,0,0,0.06)" }}
      >
        {/* 标题 */}
        <div className="px-4 flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex-1 text-center text-[15px] font-semibold text-dpInk pr-5">
            5月吃货排行榜
          </div>
        </div>

        {/* 我的排名行(无背景色,简洁) */}
        <div className="px-4 flex items-center gap-3 pb-3 border-b border-[#f5f5f5]">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-[#f5f5f5] shrink-0">
            <img
              src="https://api.dicebear.com/9.x/notionists/svg?seed=Niki&backgroundColor=ffd5dc"
              alt="" className="w-full h-full"
            />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-semibold text-dpInk">Niki</div>
            <div className="text-[11px] text-dpText-tertiary mt-0.5">打卡 14 次</div>
          </div>
          <div className="w-7 h-7 rounded overflow-hidden bg-[#f0f0f0] shrink-0">
            <img src={getThumbForFriend("Niki")} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="text-right">
            <span className="text-[12px] text-dpText-tertiary">第 </span>
            <span className="text-[18px] font-bold text-dpInk">{myRank}</span>
            <span className="text-[12px] text-dpText-tertiary"> 名</span>
          </div>
        </div>

        {/* PK 邀请条 */}
        <div className="px-4 pt-3 pb-2">
          <button
            className="w-full px-3 py-2.5 rounded-xl flex items-center gap-2 text-left"
            style={{ background: "#FFF9F0", border: "1px solid rgba(255,111,0,0.12)" }}
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
        </div>

        {/* 排行列表 */}
        <div className="px-3">
          {rankings.map((r, i) => {
            const rank = i + 1;
            const thumb = getThumbForFriend(r.name);
            return (
              <div
                key={r.id}
                onClick={() => !r.isMe && setSelectedFriend(r.name)}
                className={`flex items-center gap-3 px-2 py-2.5 rounded-xl cursor-pointer ${r.isMe ? "" : ""}`}
              >
                {/* 排名 */}
                <div className="w-7 text-center shrink-0">
                  {rank === 1 && <span className="text-[20px]">👑</span>}
                  {rank === 2 && <span className="text-[14px] font-bold text-dpText-secondary">2</span>}
                  {rank === 3 && <span className="text-[14px] font-bold text-dpText-secondary">3</span>}
                  {rank > 3 && <span className="text-[13px] text-dpText-tertiary">{rank}</span>}
                </div>
                {/* 头像 */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#f5f5f5] shrink-0">
                  <img src={r.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                {/* 名字 */}
                <div className="flex-1 min-w-0">
                  <div className={`text-[14px] truncate ${r.isMe ? "font-semibold text-dpInk" : "text-dpInk"}`}>
                    {r.name}
                  </div>
                </div>
                {/* 打卡次数(可点击,带橙色 hover 暗示) */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[12px] text-dpText-secondary">
                    打卡 {r.count} 次
                  </span>
                  {/* 缩略图(从该好友 profile 取一张) */}
                  {thumb && (
                    <div className="w-6 h-6 rounded overflow-hidden bg-[#f0f0f0]">
                      <img src={thumb} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2">
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 好友月度记录浮层 — 在当前页弹出 */}
      <AnimatePresence>
        {selectedFriend && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 z-10"
              onClick={() => setSelectedFriend(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl flex flex-col z-20 overflow-hidden"
              style={{ top: "40%", boxShadow: "0 -4px 12px rgba(0,0,0,0.06)" }}
            >
              <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#f5f5f5]">
                <div className="text-[15px] font-semibold text-dpInk">
                  {selectedFriend}5月美食记录
                </div>
                <button onClick={() => setSelectedFriend(null)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                    <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
                {getProfileForFriend(selectedFriend).records.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[#f5f5f5]">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f0f0f0] shrink-0">
                      <img src={r.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[14px] font-medium text-dpInk truncate">{r.name}</span>
                        {r.times > 0 && (
                          <span className="shrink-0 text-[10px] px-1.5 py-px rounded text-dpOrange-deep font-medium"
                            style={{ background: "rgba(255,111,0,0.1)" }}
                          >
                            吃过{r.times}次
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <StarsRow rating={r.rating} />
                        <span className="text-[11px] text-dpText-tertiary">{r.reviews}条</span>
                        {r.price > 0 && (
                          <span className="text-[11px] text-dpText-tertiary">¥{r.price}/人</span>
                        )}
                      </div>
                      <div className="text-[11px] text-dpText-tertiary truncate">
                        {r.city} {r.category}
                        {r.distance && ` ${r.distance}`}
                      </div>
                    </div>
                    <button onClick={() => toggleSave(`${selectedFriend}-${i}`)} className="shrink-0 ml-1">
                      <svg
                        width="20" height="20" viewBox="0 0 24 24"
                        fill={savedItems.has(`${selectedFriend}-${i}`) ? "#FF6F00" : "none"}
                        stroke={savedItems.has(`${selectedFriend}-${i}`) ? "#FF6F00" : "#ccc"}
                        strokeWidth="1.8"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// 半星评分显示
function StarsRow({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center gap-0.5">
      {Array(full).fill(0).map((_, i) => (
        <svg key={`f${i}`} width="12" height="12" viewBox="0 0 24 24" fill="#FF6F00">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {half && (
        <svg width="12" height="12" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="half-r">
              <stop offset="50%" stopColor="#FF6F00" />
              <stop offset="50%" stopColor="#e0e0e0" />
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#half-r)" />
        </svg>
      )}
      {Array(empty).fill(0).map((_, i) => (
        <svg key={`e${i}`} width="12" height="12" viewBox="0 0 24 24" fill="#e0e0e0">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}
