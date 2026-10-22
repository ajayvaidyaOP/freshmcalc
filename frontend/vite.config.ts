import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    watch: {
      // Native projects contain a full copy of the web build after
      // `npx cap sync`; watching them causes reload storms for no benefit.
      ignored: ['**/android/**', '**/ios/**', '**/dist/**'],
    },
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
});
