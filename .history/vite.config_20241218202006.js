import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'path';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';


export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      live2d: resolve(__dirname, './Framework/src/'),
    },
  },
  optimizeDeps: {
    include: ['live2d-sdk'],
  },
  build: {
    rollupOptions: {
      external: ['/Core/live2dcubismcore.js'] // 빌드에서 제외
    }
  }
});