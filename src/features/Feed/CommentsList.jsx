// src/features/Feed/CommentsList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getPostComments } from './commentService';
import CommentItem from './CommentItem';

const CommentsList = ({ postId, newComment, onCommentUpdate, onCommentDelete, onCommentsCountChange }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Chargement initial des commentaires
  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  // Ajouter un nouveau commentaire à la liste - version corrigée
  useEffect(() => {
    if (newComment && newComment.post_id === postId) {
      // S'assurer que le nouveau commentaire a un ID valide
      const processedComment = newComment.id ? 
        newComment : 
        {...newComment, id: `new-${Date.now()}`};
        
      setComments(prevComments => {
        // Vérifier si le commentaire existe déjà pour éviter les doublons
        const commentExists = prevComments.some(
          comment => comment.id === processedComment.id || 
                     (comment.content === processedComment.content && 
                      comment.user_id === processedComment.user_id)
        );
        
        if (commentExists) {
          return prevComments; // Ne pas ajouter de doublon
        }
        
        const updatedComments = [processedComment, ...prevComments];
        
        // Mettre à jour le compteur APRÈS avoir mis à jour les commentaires
        // mais en dehors du cycle de rendu avec setTimeout
        if (onCommentsCountChange) {
          const countToUpdate = updatedComments.length;
          setTimeout(() => {
            onCommentsCountChange(countToUpdate);
          }, 0);
        }
        
        return updatedComments;
      });
    }
  }, [newComment, postId, onCommentsCountChange]);

  // Organiser les commentaires par parent/enfant
  const organizeComments = useCallback((commentsArray) => {
    const parentComments = [];
    const repliesMap = {};
    
    // Classer les commentaires
    commentsArray.forEach(comment => {
      if (!comment.parent_id) {
        // C'est un commentaire parent
        parentComments.push({...comment});
      } else {
        // C'est une réponse
        if (!repliesMap[comment.parent_id]) {
          repliesMap[comment.parent_id] = [];
        }
        repliesMap[comment.parent_id].push({...comment});
      }
    });
    
    return { parentComments, repliesMap };
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getPostComments(postId);
      const commentsData = response.data || [];
      
      // Traitement des commentaires pour garantir des IDs valides
      const processedComments = commentsData.map(comment => {
        if (!comment.id) {
          const idBase = `${comment.post_id || postId}-${comment.user_id || 'user'}-${Date.now()}`;
          return {...comment, id: idBase};
        }
        return comment;
      });
      
      // Trier les commentaires (les plus récents d'abord)
      const sortedComments = processedComments.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
      
      setComments(sortedComments);
      
      // Mettre à jour le compteur en dehors du cycle de rendu
      if (onCommentsCountChange) {
        const countToUpdate = processedComments.length;
        setTimeout(() => {
          onCommentsCountChange(countToUpdate);
        }, 0);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Impossible de charger les commentaires');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentUpdated = useCallback((updatedComment) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
    
    if (onCommentUpdate) {
      onCommentUpdate(updatedComment);
    }
  }, [onCommentUpdate]);

  const handleCommentDeleted = useCallback((commentId) => {
    // Traiter la suppression à l'intérieur d'une seule mise à jour
    setComments(prevComments => {
      // Compter combien de commentaires vont être supprimés (le commentaire + ses réponses)
      const replies = prevComments.filter(c => c.parent_id === commentId);
      const totalDeleted = 1 + replies.length; // Le commentaire + ses réponses
      
      // Supprimer le commentaire et ses réponses
      const newComments = prevComments.filter(comment => 
        comment.id !== commentId && comment.parent_id !== commentId
      );
      
      // Mettre à jour le compteur en dehors du cycle de rendu
      if (onCommentDelete) {
        setTimeout(() => {
          onCommentDelete(commentId, totalDeleted);
        }, 0);
      }
      
      return newComments;
    });
  }, [onCommentDelete]);

  // Fonction pour gérer l'ajout d'une réponse
  const handleReplyAdded = useCallback((reply) => {
    setComments(prevComments => {
      const newComments = [...prevComments, reply];
      
      // Mettre à jour le compteur en dehors du cycle de rendu
      if (onCommentsCountChange) {
        const countToUpdate = newComments.length;
        setTimeout(() => {
          onCommentsCountChange(countToUpdate);
        }, 0);
      }
      
      return newComments;
    });
  }, [onCommentsCountChange]);

  if (loading) {
    return (
      <div className="py-2 text-center">
        <div className="inline-block animate-pulse h-5 w-5 rounded-full bg-blue-200"></div>
        <span className="ml-2 text-sm text-gray-500">Chargement des commentaires...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-2 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <button 
          className="text-sm text-blue-500 hover:underline mt-1"
          onClick={fetchComments}
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="py-2 text-center">
        <p className="text-sm text-gray-500">Aucun commentaire pour le moment.</p>
      </div>
    );
  }

  // Organiser les commentaires
  const { parentComments, repliesMap } = organizeComments(comments);

  return (
    <div className="space-y-4 py-2">
      {parentComments.map((comment, index) => {
        const commentReplies = repliesMap[comment.id] || [];
        
        // Vérifier si le commentaire a un ID valide
        if (!comment || !comment.id) {
          const tempId = `temp-${postId}-${index}-${Date.now()}`;
          console.log(`Commentaire #${index} sans ID généré avec ID temporaire:`, tempId);
          
          return (
            <CommentItem 
              key={tempId}
              comment={{...comment, id: tempId}} 
              postId={postId}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
              onReplyAdded={handleReplyAdded}
              replies={[]}
            />
          );
        }
        
        return (
          <CommentItem 
            key={`comment-${comment.id}`}
            comment={comment} 
            postId={postId}
            onCommentUpdated={handleCommentUpdated}
            onCommentDeleted={handleCommentDeleted}
            onReplyAdded={handleReplyAdded}
            replies={commentReplies}
          />
        );
      })}
    </div>
  );
};

export default CommentsList;