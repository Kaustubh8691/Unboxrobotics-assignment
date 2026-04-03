import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Dev: optional proxy so VITE_BACKEND_URL can be empty and same-origin used.
 * Production / Docker: set VITE_BACKEND_URL to full backend URL (e.g. http://localhost:3001).
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    proxy: {
      '/speed': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
      },
    },
  },
});
