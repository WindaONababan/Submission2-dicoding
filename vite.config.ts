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
        start_url: 'https://ceritain-vite.netlify.app/',
        lang: 'id-ID',
        orientation: 'any',
        name: 'Ceritain App',
        short_name: 'Ceritain',
        description:
          'Aplikasi berbagi cerita yang dapat diakses secara offline dan memiliki fitur notifikasi push.',
        display: 'standalone',
        background_color: '#FFFFFF',
        theme_color: '#88aaee',
        icons: [
          {
            purpose: 'maskable',
            sizes: '512x512',
            src: 'icon512_maskable.png',
            type: 'image/png',
          },
          {
            purpose: 'any',
            sizes: '512x512',
            src: 'icon512_rounded.png',
            type: 'image/png',
          },
        ],
        screenshots: [
          {
            src: 'manifest/iPhone-14-Pro-Max.png',
            sizes: '387x838',
            type: 'image/png',
            form_factor: 'narrow',
          },
          {
            src: 'manifest/Pixel-7-Pro.png',
            sizes: '432x935',
            type: 'image/png',
            form_factor: 'narrow',
          },
          {
            src: 'manifest/iPad-Air-5.png',
            sizes: '738x1061',
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: 'manifest/Macbook-Air.png',
            sizes: '1403x877',
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
