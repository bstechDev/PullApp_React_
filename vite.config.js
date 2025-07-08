// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  server: {
    port: 5173, // Port par défaut de Vite
    host: 'localhost', // Ton adresse IP locale
    
    // Configuration du proxy pour éviter les problèmes CORS
    proxy: {
      // Clé importante : toute requête commençant par /api sera redirigée vers le serveur de destination
      '/api': {
        target: 'http://192.168.1.4:8000',
        changeOrigin: true,
        secure: false,
        // Pas besoin de réécriture si ton API utilise déjà le préfixe /api
        // rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('Erreur de proxy:', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log(`Requête envoyée au backend: ${req.method} ${req.url}`);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log(`Réponse du backend: ${proxyRes.statusCode} pour ${req.url}`);
          });
        },
      },
      // Proxy pour les fichiers statiques et images
      '/storage': {
        target: 'http://192.168.1.4:8000',
        changeOrigin: true,
        secure: false,
      }
    },
  },
});