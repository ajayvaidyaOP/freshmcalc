import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
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
