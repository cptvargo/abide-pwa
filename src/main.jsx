import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import Grow from "./Grow.jsx";

// PWA Auto-Update
import { registerSW } from "virtual:pwa-register";

const _updateSW = registerSW({
  onNeedRefresh() {
    // Auto-reload when new version is available
    window.location.reload();
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/grow" element={<Grow />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
