// 🌿 ABIDE Service Worker v2 — Optimized for Vite + Netlify
const CACHE_NAME = "abide-v2";
const STATIC_ASSETS = [
  "/",                // App shell
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/pwa-192x192.png",
  "/pwa-512x512.png",
  "/placeholder.svg"
];

// 🪶 INSTALL — pre-cache core assets
self.addEventListener("install", (event) => {
  console.log("🌿 [SW] Installing ABIDE service worker...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 🌱 ACTIVATE — clean up old caches
self.addEventListener("activate", (event) => {
  console.log("🌿 [SW] Activating...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`🧹 [SW] Deleting old cache: ${key}`);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 🌾 FETCH — serve cached assets, fall back to network
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return; // skip POST, etc.

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((response) => {
          // Cache successful GET requests for offline use
          if (
            response &&
            response.status === 200 &&
            response.type === "basic" &&
            !event.request.url.includes("chrome-extension")
          ) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match("/index.html")); // offline fallback
    })
  );
});

// 💫 Optional: Listen for skipWaiting message
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
