import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // Em dev local, redireciona /api/* para o backend no Render,
      // evitando CORS porque a requisição sai do servidor Node do Vite (não do browser).
      '/api': {
        target: 'https://ecobackend888.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
