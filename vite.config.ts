import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  
  // 开发服务器配置
  server: {
    port: 5173,
    strictPort: true,
    host: '127.0.0.1',
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  },
  
  // CSS配置
  css: {
    preprocessorOptions: {
      css: {
        charset: false,
      },
    },
  },
  
  // Tauri兼容配置
  clearScreen: false,
  envPrefix: ['VITE_', 'TAURI_'],
  appType: 'vue',
});
