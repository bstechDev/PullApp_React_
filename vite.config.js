// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  server: {
    port: 5173, // Port par défaut de Vite
    host: "0.0.0.0", // Permettre l'accès depuis toutes les interfaces
    strictPort: true, // Éviter les conflits de port

    // Headers pour éviter les problèmes MIME type
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },

    // Configuration du proxy pour éviter les problèmes CORS
    proxy: {
      // Clé importante : toute requête commençant par /api sera redirigée vers le serveur de destination
      "/api": {
        target: "http://192.168.1.4:8000",
        changeOrigin: true,
        secure: false,
      },
      // Proxy pour les fichiers statiques et images
      "/storage": {
        target: "http://192.168.1.4:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
