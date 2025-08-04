// src/services/api.js
import axios from "axios";

// Configuration de l'instance axios
const api = axios.create({
  baseURL: "/api", // Le proxy Vite s'occupera de rediriger vers http://192.168.1.4:8000/api
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Ne pas définir Content-Type pour FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Gérer les erreurs d'authentification seulement pour les routes protégées
      if (error.response.status === 401) {
        // Ne pas rediriger automatiquement, laisser le contexte d'auth gérer
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");

        // Éviter la redirection automatique qui peut causer des boucles
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
