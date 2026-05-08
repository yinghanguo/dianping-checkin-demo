import React, { createContext, useContext, useState, useCallback } from "react";

// PhotoContext:在所有页面间共享用户拍的真实照片(支持最多 3 张)
const PhotoContext = createContext(null);
export const MAX_PHOTOS = 3;

export function PhotoProvider({ children }) {
  // photos: 数组,每项是 dataURL 字符串
  const [photos, setPhotos] = useState([]);
  // 文案/可见范围(整个 session 内持久化,session 结束才 reset)
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [taggedFriends, setTaggedFriends] = useState([]); // 标记的好友 id 数组
  // 个人足迹页的视图状态(list/map/trips) — 跨页面持久化
  const [footprintView, setFootprintView] = useState("list");

  const addPhoto = useCallback((dataUrl) => {
    setPhotos((prev) => {
      if (prev.length >= MAX_PHOTOS) return prev;
      return [...prev, dataUrl];
    });
  }, []);

  // 批量加(用于多选相册),返回实际加入数量
  const addPhotos = useCallback((dataUrls) => {
    let added = 0;
    setPhotos((prev) => {
      const room = MAX_PHOTOS - prev.length;
      const toAdd = dataUrls.slice(0, room);
      added = toAdd.length;
      return [...prev, ...toAdd];
    });
    return added;
  }, []);

  const removePhotoAt = useCallback((idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const clearPhotos = useCallback(() => setPhotos([]), []);

  // 整个发布 session 重置(用户从首页加号重新开始,或发布完成后)
  const resetSession = useCallback(() => {
    setPhotos([]);
    setText("");
    setVisibility("public");
    setTaggedFriends([]);
  }, []);

  return (
    <PhotoContext.Provider
      value={{
        photos,
        addPhoto,
        addPhotos,
        removePhotoAt,
        clearPhotos,
        resetSession,
        canAddMore: photos.length < MAX_PHOTOS,
        firstPhoto: photos[0] || null,
        text,
        setText,
        visibility,
        setVisibility,
        taggedFriends,
        setTaggedFriends,
        footprintView,
        setFootprintView,
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
}

export function usePhoto() {
  const ctx = useContext(PhotoContext);
  if (!ctx) throw new Error("usePhoto must be used within PhotoProvider");
  return ctx;
}

// 占位图(用户没拍照时的 fallback)
export const FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80";
