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
import MapPlaceholder from "./pages/MapPlaceholder";
import Ranking from "./pages/Ranking";
import FriendProfile from "./pages/FriendProfile";
import AlbumDetail from "./pages/AlbumDetail";
import AlbumCreate from "./pages/AlbumCreate";
import StoreDetail from "./pages/StoreDetail";

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
              <Route path="/map" element={<MapPlaceholder />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/friend-profile" element={<FriendProfile />} />
              <Route path="/album/create" element={<AlbumCreate />} />
              <Route path="/album/:id/edit" element={<AlbumCreate />} />
              <Route path="/album/:id" element={<AlbumDetail />} />
              <Route path="/store" element={<StoreDetail />} />
            </Routes>
          </PhoneFrame>
        </BrowserRouter>
      </LocationProvider>
    </PhotoProvider>
  );
}
