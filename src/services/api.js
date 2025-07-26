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
      console.error("Erreur API:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url,
      });

      // Gérer les erreurs d'authentification
      if (error.response.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
