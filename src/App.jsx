import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PhoneFrame from "./components/PhoneFrame";
import { PhotoProvider } from "./contexts/PhotoContext";
import { LocationProvider } from "./contexts/LocationContext";
import Home from "./pages/Home";
import Camera from "./pages/Camera";
import POI from "./pages/POI";
import Edit from "./pages/Edit";
import Success from "./pages/Success";
import Me from "./pages/Me";
import Footprint from "./pages/Footprint";
import MapExplore from "./pages/MapExplore";
import Ranking from "./pages/Ranking";
import FriendProfile from "./pages/FriendProfile";
import AlbumDetail from "./pages/AlbumDetail";
import AlbumCreate from "./pages/AlbumCreate";
import StoreDetail from "./pages/StoreDetail";
import Search from "./pages/Search";
import FoodChannel from "./pages/FoodChannel";
import WechatShare from "./pages/WechatShare";
import Collection from "./pages/Collection";
import PkArena from "./pages/PkArena";
import RankBoard from "./pages/RankBoard";
import FreeTrial from "./pages/FreeTrial";
import FoodRank from "./pages/FoodRank";
import SpecialDeals from "./pages/SpecialDeals";

export default function App() {
  return (
    <PhotoProvider>
      <LocationProvider>
        <BrowserRouter basename="/dianping-checkin-demo">
          <PhoneFrame>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/camera" element={<Camera />} />
              <Route path="/poi" element={<POI />} />
              <Route path="/edit" element={<Edit />} />
              <Route path="/success" element={<Success />} />
              <Route path="/me" element={<Me />} />
              <Route path="/footprint" element={<Footprint />} />
              <Route path="/map" element={<MapExplore />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/friend-profile" element={<FriendProfile />} />
              <Route path="/album/create" element={<AlbumCreate />} />
              <Route path="/album/:id/edit" element={<AlbumCreate />} />
              <Route path="/album/:id" element={<AlbumDetail />} />
              <Route path="/store" element={<StoreDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/food" element={<FoodChannel />} />
              <Route path="/wechat-share/:id" element={<WechatShare />} />
              <Route path="/collection" element={<Collection />} />
              <Route path="/pk" element={<PkArena />} />
              <Route path="/rankboard" element={<RankBoard />} />
              <Route path="/free-trial" element={<FreeTrial />} />
              <Route path="/food-rank" element={<FoodRank />} />
              <Route path="/special-deals" element={<SpecialDeals />} />
            </Routes>
          </PhoneFrame>
        </BrowserRouter>
      </LocationProvider>
    </PhotoProvider>
  );
}
