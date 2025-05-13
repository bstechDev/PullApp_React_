// src/features/Feed/likeService.js
import api from '../../services/api';

/**
 * Récupérer tous les utilisateurs qui ont liké un post
 * @param {number} postId - L'ID du post
 * @returns {Promise<Array>} - La liste des utilisateurs qui ont liké le post
 */
export const getUsersWhoLiked = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}/likes`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des likes:', error);
    throw error;
  }
};

/**
 * Basculer l'état de like/dislike pour un post
 * @param {number} postId - L'ID du post
 * @returns {Promise<Object>} - Un objet contenant le message et l'état du like
 */
export const toggleLike = async (postId) => {
  try {
    const response = await api.post(`/posts/${postId}/likes/toggle`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du toggle du like:', error);
    throw error;
  }
};

/**
 * Vérifier si l'utilisateur actuel a liké un post
 * @param {number} postId - L'ID du post
 * @returns {Promise<boolean>} - True si l'utilisateur a liké le post, sinon false
 */
export const checkUserLiked = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}/likes/check`);
    return response.data.liked;
  } catch (error) {
    console.error('Erreur lors de la vérification du like:', error);
    return false; // Par défaut, on considère que l'utilisateur n'a pas liké
  }
};

/**
 * Obtenir le nombre total de likes pour un post
 * @param {number} postId - L'ID du post
 * @returns {Promise<number>} - Le nombre de likes
 */
export const getLikesCount = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}/likes/count`);
    return response.data.count;
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de likes:', error);
    return 0; // Par défaut, retourner 0
  }
};