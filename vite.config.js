import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/abide-pwa/",

  plugins: [
    react(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",

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
        globIgnores: ['**/node_modules/**', '**/audio/**'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.m4a$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30
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

  server: {
    host: true
  }
});