// src/services/api.js
import axios from 'axios';

// Au lieu de l'URL complète, on utilise un chemin relatif
// qui sera géré par le proxy Vite
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Ajouter un intercepteur pour gérer les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Intercepteur pour ajouter le token d'authentification
// api.interceptors.request.use
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // IMPORTANT: ne pas définir Content-Type pour FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    } else {
      // Supprimer explicitement Content-Type pour FormData
      // car Axios l'ajoutera automatiquement avec la boundary
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Erreur API:', error.response?.status, error.response?.data);
    
    if (error.response && error.response.status === 401) {
      // Déconnexion si le token est invalide
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;