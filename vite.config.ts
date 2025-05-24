import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      manifest: {
        start_url: '/',
        lang: 'id-ID',
        orientation: 'any',
        name: 'CeritaBersama',
        short_name: 'Ceritain!',
        description:
          'Aplikasi berbagi cerita yang dapat diakses secara offline dan memiliki fitur notifikasi push.',
        display: 'standalone',
        background_color: '#e7edd9',
        theme_color: '#FFFFFF',
        icons: [
          {
            purpose: 'maskable',
            sizes: '512x512',
            src: 'icon_logox512.png',
            type: 'image/png',
          },
          {
            purpose: 'any',
            sizes: '353x449',
            src: 'icon512_maskable.png',
            type: 'image/png',
          },
        ],
        screenshots: [
          {
            src: 'manifest/iPhone-14-Pro-Max.png',
            sizes: '321x707',
            type: 'image/png',
            // form_factor: 'narrow',
          },
          {
            src: 'manifest/Pixel-7-Pro.PNG',
            sizes: '347x745',
            type: 'image/png',
            // form_factor: 'narrow',
          },
          {
            src: 'manifest/iPad-Air.PNG',
            sizes: '493x707',
            type: 'image/png',
            // form_factor: 'wide',
          },
          {
            src: '/manifest/deskop.png', //ini bentuknya Mackbook-Air
            sizes: '1175x736',
            type: 'image/png',
            form_factor: 'wide',
          },
        ],
        shortcuts: [
          {
            name: 'Cerita Baru',
            short_name: 'Baru',
            description: 'Membuat cerita baru.',
            url: '/?source=pwa#/add-new-story',
            icons: [
              {
                src: 'images/plus-icon.png',
                type: 'image/png',
                sizes: '512x512',
              },
            ],
          },
          {
            name: 'Bookmark Cerita',
            short_name: 'Bookmark',
            description: 'Daftar cerita yang sudah di bookmark.',
            url: '/?source=pwa#/bookmark-story',
            icons: [
              {
                src: 'images/bookmark-icon.png',
                type: 'image/png',
                sizes: '512x512',
              },
            ],
          },
        ],
      },
    }),
  ],
});
