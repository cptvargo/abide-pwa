import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/abide-pwa/",

  plugins: [
    react(),
    VitePWA({
      strategies: "generateSW",
      registerType: "prompt", // ← Changed from autoUpdate to prompt
      
      injectRegister: 'auto', // Auto-inject registration code

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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,txt,woff,woff2,m4a}'],
        maximumFileSizeToCacheInBytes: 20000000, // 20MB
        
        // ← Clean up old caches automatically
        cleanupOutdatedCaches: true,
        
        // ← NetworkFirst for navigation to ensure HTML updates
        runtimeCaching: [
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
        ],
        
        navigateFallback: null
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