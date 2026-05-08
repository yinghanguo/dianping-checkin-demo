import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

// LocationContext:获取真实 GPS + 反查地址 + 按地区生成多元 mock POI
const LocationContext = createContext(null);

// 多品类 POI 库 —— 覆盖打卡场景的所有真实场所类型
// 每个地区返回:餐厅、咖啡馆、景点、商场、酒吧、公园、地铁站等混合
const POI_BANK = {
  // ───── 上海 ─────
  静安区: [
    { name: "%Arabica 静安寺店", category: "咖啡馆", rating: 4.7, distance: "120m" },
    { name: "鹿园 上海中心店", category: "日料", rating: 4.6, distance: "180m" },
    { name: "兴业太古汇", category: "购物中心", rating: 4.7, distance: "260m" },
    { name: "静安寺", category: "景点·寺庙", rating: 4.5, distance: "320m" },
    { name: "Speak Low", category: "鸡尾酒吧", rating: 4.7, distance: "400m" },
    { name: "静安公园", category: "公园", rating: 4.4, distance: "150m" },
  ],
  徐汇区: [
    { name: "Manner Coffee 徐家汇店", category: "咖啡馆", rating: 4.5, distance: "150m" },
    { name: "徐家汇天主堂", category: "景点·教堂", rating: 4.7, distance: "230m" },
    { name: "美罗城", category: "购物中心", rating: 4.5, distance: "320m" },
    { name: "上海图书馆", category: "公共空间", rating: 4.7, distance: "180m" },
    { name: "桂花楼 衡山路店", category: "本帮菜", rating: 4.6, distance: "270m" },
    { name: "衡复风貌区", category: "街区·散步", rating: 4.8, distance: "200m" },
  ],
  浦东新区: [
    { name: "上海中心大厦", category: "景点·观光", rating: 4.8, distance: "180m" },
    { name: "Blue Bottle 张江店", category: "咖啡馆", rating: 4.7, distance: "240m" },
    { name: "国金中心 IFC", category: "购物中心", rating: 4.7, distance: "300m" },
    { name: "陆家嘴中心绿地", category: "公园", rating: 4.5, distance: "150m" },
    { name: "外滩茂悦", category: "酒店", rating: 4.7, distance: "350m" },
    { name: "海洋水族馆", category: "景点·亲子", rating: 4.5, distance: "260m" },
  ],
  黄浦区: [
    { name: "外滩观景台", category: "景点·观光", rating: 4.8, distance: "120m" },
    { name: "Blue Bottle 新天地店", category: "咖啡馆", rating: 4.6, distance: "220m" },
    { name: "Mr & Mrs Bund", category: "法式餐厅", rating: 4.7, distance: "180m" },
    { name: "新天地", category: "街区·购物", rating: 4.6, distance: "280m" },
    { name: "豫园", category: "景点·古迹", rating: 4.6, distance: "350m" },
    { name: "上海博物馆", category: "博物馆", rating: 4.8, distance: "300m" },
  ],
  长宁区: [
    { name: "Manner Coffee 来福士", category: "咖啡馆", rating: 4.5, distance: "140m" },
    { name: "中山公园", category: "公园", rating: 4.6, distance: "220m" },
    { name: "上海动物园", category: "景点·亲子", rating: 4.6, distance: "300m" },
    { name: "上海虹桥机场", category: "交通枢纽", rating: 4.4, distance: "500m" },
    { name: "天山茶城", category: "市集", rating: 4.3, distance: "280m" },
    { name: "古北 SOHO", category: "购物中心", rating: 4.5, distance: "320m" },
  ],
  普陀区: [
    { name: "环球港", category: "购物中心", rating: 4.6, distance: "150m" },
    { name: "Manner Coffee 长寿路店", category: "咖啡馆", rating: 4.5, distance: "200m" },
    { name: "苏州河滨水步道", category: "公园·散步", rating: 4.6, distance: "260m" },
    { name: "M50 创意园", category: "艺术园区", rating: 4.5, distance: "320m" },
    { name: "中远两湾城", category: "住宅区", rating: 4.3, distance: "280m" },
  ],
  虹口区: [
    { name: "% Arabica 北外滩店", category: "咖啡馆", rating: 4.7, distance: "180m" },
    { name: "北外滩观景台", category: "景点·观光", rating: 4.7, distance: "250m" },
    { name: "鲁迅公园", category: "公园", rating: 4.5, distance: "220m" },
    { name: "凯德龙之梦", category: "购物中心", rating: 4.4, distance: "320m" },
    { name: "1933 老场坊", category: "建筑·摄影", rating: 4.6, distance: "300m" },
  ],

  // ───── 北京 ─────
  朝阳区: [
    { name: "%Arabica 三里屯店", category: "咖啡馆", rating: 4.7, distance: "150m" },
    { name: "三里屯太古里", category: "购物中心", rating: 4.7, distance: "200m" },
    { name: "工人体育场", category: "运动场馆", rating: 4.5, distance: "280m" },
    { name: "蓝色港湾", category: "购物中心", rating: 4.5, distance: "320m" },
    { name: "京 A 工体酒吧", category: "酒吧", rating: 4.6, distance: "250m" },
    { name: "朝阳公园", category: "公园", rating: 4.5, distance: "350m" },
    { name: "798 艺术区", category: "艺术园区", rating: 4.7, distance: "400m" },
  ],
  海淀区: [
    { name: "颐和园", category: "景点·古迹", rating: 4.8, distance: "200m" },
    { name: "Seesaw Coffee 中关村", category: "咖啡馆", rating: 4.6, distance: "280m" },
    { name: "圆明园遗址公园", category: "景点·古迹", rating: 4.7, distance: "350m" },
    { name: "中关村购物中心", category: "购物中心", rating: 4.4, distance: "250m" },
    { name: "国家图书馆", category: "公共空间", rating: 4.7, distance: "300m" },
    { name: "北京大学", category: "学校·校园", rating: 4.8, distance: "400m" },
  ],
  东城区: [
    { name: "故宫博物院", category: "博物馆", rating: 4.9, distance: "200m" },
    { name: "天安门广场", category: "景点·地标", rating: 4.8, distance: "280m" },
    { name: "南锣鼓巷", category: "街区·胡同", rating: 4.5, distance: "350m" },
    { name: "雍和宫", category: "景点·寺庙", rating: 4.7, distance: "300m" },
    { name: "王府井大街", category: "商业街", rating: 4.5, distance: "260m" },
  ],

  // ───── 通用兜底(中国其他地区) ─────
  default_cn: [
    { name: "本地老字号餐厅", category: "本地菜", rating: 4.6, distance: "120m" },
    { name: "%Arabica 城市店", category: "咖啡馆", rating: 4.7, distance: "180m" },
    { name: "中央商业广场", category: "购物中心", rating: 4.5, distance: "240m" },
    { name: "市民公园", category: "公园", rating: 4.5, distance: "200m" },
    { name: "城市博物馆", category: "博物馆", rating: 4.6, distance: "300m" },
  ],

  // ───── 西班牙 ─────
  Palma: [
    { name: "Catedral de Palma", category: "Cathedral · Landmark", rating: 4.8, distance: "180m" },
    { name: "Mercado de Santa Catalina", category: "Local Market", rating: 4.6, distance: "240m" },
    { name: "Café Antiquari", category: "Café", rating: 4.6, distance: "120m" },
    { name: "Passeig del Born", category: "Promenade", rating: 4.7, distance: "300m" },
    { name: "Bar Cuba", category: "Tapas Bar", rating: 4.5, distance: "200m" },
    { name: "Parc de la Mar", category: "Park · Seaside", rating: 4.7, distance: "260m" },
  ],
  "Can Pastilla": [
    { name: "Playa de Can Pastilla", category: "Beach", rating: 4.5, distance: "120m" },
    { name: "Restaurante Marisol", category: "Seafood", rating: 4.4, distance: "200m" },
    { name: "Aquarium Palma", category: "Aquarium", rating: 4.6, distance: "350m" },
    { name: "Es Pastilla Coffee", category: "Café", rating: 4.5, distance: "180m" },
    { name: "Paseo Marítimo", category: "Seaside Walk", rating: 4.7, distance: "260m" },
  ],
  Madrid: [
    { name: "Plaza Mayor", category: "Plaza · Landmark", rating: 4.7, distance: "180m" },
    { name: "Mercado de San Miguel", category: "Tapas Market", rating: 4.6, distance: "230m" },
    { name: "Museo del Prado", category: "Museum", rating: 4.9, distance: "320m" },
    { name: "Café Comercial", category: "Café", rating: 4.5, distance: "200m" },
    { name: "Parque del Retiro", category: "Park", rating: 4.8, distance: "350m" },
  ],
  Barcelona: [
    { name: "Sagrada Família", category: "Cathedral", rating: 4.9, distance: "240m" },
    { name: "La Boqueria Market", category: "Food Market", rating: 4.7, distance: "300m" },
    { name: "Park Güell", category: "Park · Architecture", rating: 4.8, distance: "350m" },
    { name: "Nomad Coffee", category: "Café", rating: 4.6, distance: "180m" },
    { name: "Bar Velódromo", category: "Tapas Bar", rating: 4.5, distance: "220m" },
  ],

  // ───── 海外通用兜底 ─────
  default_intl: [
    { name: "Local Specialty Restaurant", category: "Restaurant", rating: 4.5, distance: "120m" },
    { name: "Blue Bottle Coffee", category: "Café", rating: 4.7, distance: "180m" },
    { name: "Central Market", category: "Local Market", rating: 4.6, distance: "240m" },
    { name: "City Park", category: "Park", rating: 4.5, distance: "200m" },
    { name: "Heritage Museum", category: "Museum", rating: 4.6, distance: "300m" },
  ],
};

// 城市级 fallback —— 当 district 不在库里时,用 city 找
const CITY_FALLBACK = {
  上海: "default_cn",
  北京: "default_cn",
  Palma: "Palma",
  "Palma de Mallorca": "Palma",
  Madrid: "Madrid",
  Barcelona: "Barcelona",
};

import { fetchNearbyPOIs } from "../utils/osmPoi";

export function LocationProvider({ children }) {
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState(null);
  const [permission, setPermission] = useState("prompt");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nearbyPOIs, setNearbyPOIs] = useState([]);
  // 用户在 POI 页主动选中的 POI(覆盖 AI 推荐的默认值)
  const [userSelectedPOI, setUserSelectedPOI] = useState(null);
  // 用户主动跳过 POI(进入私域留痕模式)
  const [poiSkipped, setPoiSkipped] = useState(false);

  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=zh-CN,zh,en&zoom=18`
      );
      if (!res.ok) throw new Error("OSM error");
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("当前设备不支持定位");
      return;
    }
    setLoading(true);
    setError(null);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const c = { lat: latitude, lng: longitude, accuracy };
          setCoords(c);
          setPermission("granted");
          const data = await reverseGeocode(latitude, longitude);
          if (data?.address) {
            const addr = data.address;
            const district =
              addr.city_district ||
              addr.suburb ||
              addr.district ||
              addr.county ||
              addr.borough ||
              addr.village ||
              addr.town ||
              "";
            const city = addr.city || addr.town || addr.county || "";
            const state = addr.state || "";
            const country = addr.country || "";
            const road =
              addr.road ||
              addr.pedestrian ||
              addr.neighbourhood ||
              addr.quarter ||
              "";
            const isChina = country === "中国" || country === "China";
            setAddress({
              district,
              city,
              state,
              country,
              road,
              raw: data.display_name,
              isChina,
            });
          }
          setLoading(false);
          resolve(c);
        },
        (err) => {
          setLoading(false);
          if (err.code === 1) {
            setPermission("denied");
            setError("定位权限被拒绝");
          } else if (err.code === 2) {
            setError("定位不可用");
          } else if (err.code === 3) {
            setError("定位超时");
          } else {
            setError(err.message || "定位出错");
          }
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, [reverseGeocode]);

  // 当 coords 变化时,拉真实附近 POI(用于 sheet/edit 页 AI 推荐)
  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    fetchNearbyPOIs(coords, { radius: 800, limit: 20 })
      .then((items) => {
        if (cancelled) return;
        setNearbyPOIs(items);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [coords?.lat, coords?.lng]);

  useEffect(() => {
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((status) => {
          if (status.state === "granted") {
            requestLocation();
          }
          status.onchange = () => {
            if (status.state === "granted") requestLocation();
            else if (status.state === "denied") setPermission("denied");
          };
        })
        .catch(() => {});
    }
  }, [requestLocation]);

  // 选择 POI 列表(按 district → city → 国家兜底)
  const recommendedPOIs = (() => {
    if (!address) return POI_BANK.default_cn;
    const district = address.district;
    const city = address.city;

    if (district && POI_BANK[district]) return POI_BANK[district];
    if (city && POI_BANK[city]) return POI_BANK[city];
    if (city && CITY_FALLBACK[city]) return POI_BANK[CITY_FALLBACK[city]];
    if (address.isChina) return POI_BANK.default_cn;
    return POI_BANK.default_intl;
  })();

  const shortAddress = (() => {
    if (!address) return null;
    if (!address.isChina) {
      const parts = [];
      if (address.district) parts.push(address.district);
      if (address.city) parts.push(address.city);
      return parts.join(" · ") || address.country;
    }
    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.district) parts.push(address.district);
    return parts.join(" · ");
  })();

  const streetAddress = (() => {
    if (!address) return null;
    return address.road || address.district || null;
  })();

  // suggestedPOI:AI 给的默认建议(浅显示,需要用户确认)
  const suggestedPOI = nearbyPOIs[0] || recommendedPOIs[0];
  // primaryPOI:已确认的 POI(用户点击确定才进入此状态)
  // - 跳过模式 → null
  // - 用户在 POI 页点确定后,setUserSelectedPOI 会把选中的存进来
  const primaryPOI = poiSkipped ? null : userSelectedPOI;
  // POI 是否已确认关联(只要 primaryPOI 有值就是已确认)
  const poiConfirmed = !!primaryPOI;

  return (
    <LocationContext.Provider
      value={{
        coords,
        address,
        shortAddress,
        streetAddress,
        permission,
        loading,
        error,
        requestLocation,
        recommendedPOIs,
        nearbyPOIs,
        primaryPOI,
        suggestedPOI,
        poiConfirmed,
        userSelectedPOI,
        setUserSelectedPOI,
        poiSkipped,
        setPoiSkipped,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}
