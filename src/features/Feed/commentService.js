// src/features/Feed/commentService.js
import api from '../../services/api';

// Récupérer tous les commentaires d'un post
export const getPostComments = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}/comments`);
    console.log('Commentaires récupérés:', response.data);
    return response;
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    throw error;
  }
};

// Créer un nouveau commentaire
export const createComment = async (postId, commentData) => {
  try {
    const response = await api.post(`/posts/${postId}/comments`, commentData);
    console.log('Réponse du serveur (createComment):', response.data);
    return response;
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    throw error;
  }
};

// Répondre à un commentaire
export const replyToComment = async (postId, commentId, replyData) => {
  try {
    // Vérifier si le commentId est temporaire
    if (typeof commentId === 'string' && commentId.startsWith('temp-')) {
      console.warn('Tentative de réponse à un commentaire temporaire:', commentId);
      
      // Créer un ID temporaire pour la réponse
      const tempReplyId = `temp-reply-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Simuler une réponse réussie
      return {
        data: {
          id: tempReplyId,
          content: replyData.content,
          user_id: replyData.user_id,
          post_id: postId,
          parent_id: commentId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
    
    const data = {
      ...replyData,
      parent_id: commentId
    };
    const response = await api.post(`/posts/${postId}/comments`, data);
    console.log('Réponse de réponse au commentaire:', response.data);
    return response;
  } catch (error) {
    console.error('Erreur lors de la réponse au commentaire:', error);
    throw error;
  }
};

// Modifier un commentaire existant
export const updateComment = async (postId, commentId, commentData) => {
  try {
    // Vérifier si l'ID est temporaire
    if (typeof commentId === 'string' && commentId.startsWith('temp-')) {
      return {
        data: {
          ...commentData,
          id: commentId,
          post_id: postId,
          updated_at: new Date().toISOString()
        }
      };
    }
    
    const response = await api.put(`/posts/${postId}/comments/${commentId}`, commentData);
    console.log('Réponse du serveur (updateComment):', response.data);
    return response;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire:', error);
    throw error;
  }
};

// Supprimer un commentaire
export const deleteComment = async (postId, commentId) => {
  try {
    if (typeof commentId === 'string' && commentId.startsWith('temp-')) {
      return { data: { success: true } };
    }
    
    const response = await api.delete(`/posts/${postId}/comments/${commentId}`);
    console.log('Réponse du serveur (deleteComment):', response.data);
    return response;
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    throw error;
  }
};

// Récupérer le nombre de commentaires pour un post
export const getCommentsCount = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}/comments/count`);
    return response;
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de commentaires:', error);
    throw error;
  }
};