import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

export default defineConfig({
  base: "/abide-pwa/",

  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(pkg.version),
  },

  plugins: [
    react(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",

      injectRegister: 'auto',

      includeAssets: [
        "favicon.ico",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "apple-icon.png"
      ],

      manifest: {
        name: "ABIDE Bible App",
        short_name: "ABIDE",
        description: "A quiet, minimal offline Bible reading experience.",
        start_url: "/abide-pwa/",
        scope: "/abide-pwa/",
        display: "standalone",
        background_color: "#1C1C1A",
        theme_color: "#CBB27C",
        orientation: "portrait",

        icons: [
          {
            src: "/abide-pwa/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/abide-pwa/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/abide-pwa/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },

      workbox: {
        skipWaiting: false,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: null,

        // Precache only app shell assets — NOT Bible JSON data or large audio files.
        // JSON data and audio are too large for precache; runtime caching handles them below.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,txt,woff,woff2}'],

        // Exclude data JSON and audio from precache entirely
        globIgnores: [
          '**/data/**/*.json',
          '**/audio/**/*.m4a',
          '**/node_modules/**'
        ],

        // Per-file size limit for precache (app shell files only)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB

        runtimeCaching: [
          // Bible JSON data files — StaleWhileRevalidate so:
          // 1. First visit: fetches from network and caches
          // 2. Subsequent visits: serves from cache instantly, updates in background
          // 3. New deploy: background update picks up changed files automatically
          {
            urlPattern: /\/data\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'abide-bible-data',
              expiration: {
                maxEntries: 2000,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },

          // Navigation (HTML pages)
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'abide-pages',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },

          // Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },


          // Meditation audio — large files, cache on first play
          {
            urlPattern: /\/audio\/.*\.m4a$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'abide-audio',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },

          // Images
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'abide-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },

      devOptions: {
        enabled: true
      }
    })
  ],

  publicDir: 'public',

  build: {
    assetsInlineLimit: 0
  },

  server: {
    host: true
  }
});