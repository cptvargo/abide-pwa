import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "public",
      filename: "sw.js",
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "ABIDE.png",
        "pwa-192x192.png",
        "pwa-512x512.png"
      ],

      manifest: {
        name: "ABIDE Bible App",
        short_name: "ABIDE",
        description: "A minimal, quiet, offline-first Bible reader.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#1C1C1A",
        theme_color: "#CBB27C",
        orientation: "portrait",
        icons: [
          {
            src: "ABIDE.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "ABIDE.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },

      devOptions: {
        enabled: true,
        type: "module"
      }
    })
  ],

  server: {
    host: true
  }
});
