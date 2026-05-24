import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Auto-update SW on new deploy; inject <script> registration into HTML
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      // Include static assets in the precache manifest
      includeAssets: ['icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],

      manifest: {
        name: 'Life OS',
        short_name: 'Life OS',
        description: 'Personal OS: daily check-ins, habits, fitness, diet',
        start_url: '/',
        display: 'standalone',
        background_color: '#09090b',
        theme_color: '#7c3aed',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            // 'any maskable' satisfies Lighthouse maskable-icon check
            purpose: 'any maskable',
          },
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },

      workbox: {
        // Precache everything Vite emits (including hashed JS/CSS chunks)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        // Serve index.html for any navigation miss (SPA fallback)
        navigateFallback: '/index.html',

        // Don't apply navigateFallback to API or Supabase calls
        navigateFallbackDenylist: [/^\/api\//, /^https:\/\//],

        runtimeCaching: [
          // Cache Google Fonts stylesheets for a year
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-css',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          // Cache Google Fonts files for a year
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
