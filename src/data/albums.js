// 专辑数据层 — localStorage 持久化 + mock 初始数据
const STORAGE_KEY = "dp_albums";

// ── Mock 初始专辑 ──
const INITIAL_ALBUMS = [
  {
    id: "album_bcn_food",
    title: "巴塞罗那最好吃的5家",
    cover: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&q=80",
    createdAt: "5/5",
    items: [
      {
        poi: { name: "BODEGA AMPOSTA", city: "巴塞罗那", category: "西班牙菜", emoji: "🍷" },
        photo: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
        caption: "哥特区宝藏小馆，tapas 配本地葡萄酒，性价比极高",
      },
      {
        poi: { name: "Casa Rafols", city: "巴塞罗那", category: "更多美食", emoji: "🍴" },
        photo: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80",
        caption: "午市套餐三道菜加酒水才10欧，当地人都来这",
      },
      {
        poi: { name: "波盖利亚市场", city: "巴塞罗那", category: "集市", emoji: "🛍️" },
        photo: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80",
        caption: "现榨橙汁1欧一杯，新鲜海鲜一定要试试",
      },
      {
        poi: { name: "Jon Cake & Coffee", city: "巴塞罗那", category: "咖啡厅", emoji: "☕" },
        photo: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
        caption: "毕加索博物馆旁边，芝士蛋糕是一绝",
      },
      {
        poi: { name: "Farggi Cafe", city: "巴塞罗那", category: "咖啡厅", emoji: "☕" },
        photo: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
        caption: "哥特区转角咖啡馆，坐露台看人来人往",
      },
    ],
  },
  {
    id: "album_granada_bar",
    title: "格拉纳达不能错过的3家",
    cover: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80",
    createdAt: "5/1",
    items: [
      {
        poi: { name: "Bodegas Castañeda", city: "格拉纳达", category: "西班牙菜", emoji: "🍷" },
        photo: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80",
        caption: "1927年老酒馆，点杯雪莉酒配免费tapas，格拉纳达最棒的传统",
      },
      {
        poi: { name: "Restaurante Aixa", city: "格拉纳达", category: "更多美食", emoji: "🍴" },
        photo: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&q=80",
        caption: "炸茄子配蜂蜜，第一次吃到这个搭配，惊艳",
      },
      {
        poi: { name: "La Auténtica Carmela", city: "格拉纳达", category: "更多美食", emoji: "🍴" },
        photo: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80",
        caption: "当地人爱去的小馆，比游客区便宜一倍",
      },
    ],
  },
  {
    id: "album_spain_museum",
    title: "西班牙值得去的博物馆",
    cover: "https://images.unsplash.com/photo-1577083287686-f3f6efe9c894?w=600&q=80",
    createdAt: "4/30",
    items: [
      {
        poi: { name: "毕加索博物馆", city: "巴塞罗那", category: "展览馆", emoji: "🖼️" },
        photo: "https://images.unsplash.com/photo-1577083287686-f3f6efe9c894?w=600&q=80",
        caption: "早年作品比晚期更让我震撼，建议留2小时",
      },
      {
        poi: { name: "加泰罗尼亚国家艺术博物馆", city: "巴塞罗那", category: "展览馆", emoji: "🖼️" },
        photo: "https://images.unsplash.com/photo-1565060169187-5284992a47ea?w=600&q=80",
        caption: "建筑本身就值回票价，俯瞰巴塞的视角无敌",
      },
    ],
  },
];

export function loadAlbums() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveAlbums(INITIAL_ALBUMS);
  return INITIAL_ALBUMS;
}

export function saveAlbums(albums) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
}

export function addAlbum(album) {
  const albums = loadAlbums();
  albums.unshift(album);
  saveAlbums(albums);
  return albums;
}

export function getAlbum(id) {
  return loadAlbums().find((a) => a.id === id);
}

export function updateAlbum(album) {
  const albums = loadAlbums().map((a) => (a.id === album.id ? album : a));
  saveAlbums(albums);
}

export function deleteAlbum(id) {
  saveAlbums(loadAlbums().filter((a) => a.id !== id));
}
