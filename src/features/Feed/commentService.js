// src/features/Feed/commentService.js
import api from '../../services/api';

// Récupérer tous les commentaires d'un post
export const getPostComments = (postId) => {
  return api.get(`/posts/${postId}/comments`);
};

// Créer un nouveau commentaire
export const createComment = (postId, commentData) => {
  return api.post(`/posts/${postId}/comments`, commentData);
};

// Répondre à un commentaire
export const replyToComment = (postId, commentId, replyData) => {
  const data = {
    ...replyData,
    parent_id: commentId // Identifier que c'est une réponse à un commentaire spécifique
  };
  return api.post(`/posts/${postId}/comments`, data);
};

// Modifier un commentaire existant
export const updateComment = (postId, commentId, commentData) => {
  return api.put(`/posts/${postId}/comments/${commentId}`, commentData);
};

// Supprimer un commentaire
export const deleteComment = (postId, commentId) => {
  return api.delete(`/posts/${postId}/comments/${commentId}`);
};

// Récupérer le nombre de commentaires pour un post
export const getCommentsCount = (postId) => {
  return api.get(`/posts/${postId}/comments/count`);
};