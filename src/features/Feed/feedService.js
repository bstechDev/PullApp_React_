// src/features/Feed/feedService.js
import api from '../../services/api';

export const createPost = async (postData) => {
  try {
    // Pour déboguer - vérifier le contenu du FormData
    if (postData instanceof FormData) {
      console.log("Envoi d'un FormData avec les entrées:");
      for (let [key, value] of postData.entries()) {
        console.log(`${key}: ${value instanceof File ? `Fichier: ${value.name} (${value.type}, ${value.size} bytes)` : value}`);
      }
      
      // Créer une configuration spécifique pour cette requête
      const config = {
        headers: {
          // Ne pas définir Content-Type manuellement, laissez Axios le faire
          // Mais vous pouvez ajouter d'autres en-têtes au besoin
          'Accept': 'application/json'
        },
        // Important: désactiver la transformation automatique des données
        transformRequest: (data) => data
      };
      
      return await api.post('/posts', postData, config);
    } else {
      return await api.post('/posts', postData);
    }
  } catch (error) {
    console.error('Erreur lors de la création du post:', error);
    throw error;
  }
};

// Les autres fonctions restent inchangées
export const getAllPosts = () => {
  return api.get('/posts');
};

export const getPostById = (id) => {
  return api.get(`/posts/${id}`);
};

export const updatePost = (id, postData) => {
  if (postData instanceof FormData) {
    return api.put(`/posts/${id}`, postData);
  } else {
    return api.put(`/posts/${id}`, postData);
  }
};

export const deletePost = (id) => {
  return api.delete(`/posts/${id}`);
};