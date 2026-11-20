import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Todo lo que empiece con /api se redirige al backend (evita problemas de CORS en desarrollo)
    proxy: { '/api': 'http://localhost:4000' },
  },
});
