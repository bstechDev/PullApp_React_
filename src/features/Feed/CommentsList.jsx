import React, { useState, useEffect, useCallback } from 'react';
import { getPostComments } from './commentService';
import CommentItem from './CommentItem';

const CommentsList = ({ postId, newComment, onCommentUpdate, onCommentDelete, onCommentsCountChange }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  useEffect(() => {
    if (newComment && newComment.post_id === postId) {
      console.log('Nouveau commentaire reçu:', newComment);
      
      setComments(prevComments => {
        const exists = prevComments.some(comment => comment.id === newComment.id);
        if (exists) {
          console.log('Commentaire déjà existant, pas d\'ajout:', newComment);
          return prevComments;
        }
        
        const updatedComments = [newComment, ...prevComments].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        // Appeler onCommentsCountChange uniquement si le nombre de commentaires change
        if (onCommentsCountChange && updatedComments.length !== prevComments.length) {
          setTimeout(() => {
            onCommentsCountChange(updatedComments.length);
          }, 0);
        }
        
        return updatedComments;
      });
    }
  }, [newComment, postId, onCommentsCountChange]);

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log(`Chargement des commentaires pour le post ${postId}...`);
      const response = await getPostComments(postId);
      const commentsData = response.data || [];
      
      const sortedComments = commentsData.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      console.log('Commentaires reçus:', sortedComments);
      setComments(sortedComments);
      
      if (onCommentsCountChange) {
        setTimeout(() => {
          onCommentsCountChange(sortedComments.length);
        }, 0);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des commentaires:', err);
      setError('Impossible de charger les commentaires');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentUpdated = useCallback((updatedComment) => {
    console.log('Mise à jour du commentaire:', updatedComment);
    
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
    console.log('Suppression du commentaire:', commentId);
    
    setComments(prevComments => {
      const updatedComments = prevComments.filter(comment => 
        comment.id !== commentId && comment.parent_id !== commentId
      );
      
      if (onCommentsCountChange) {
        setTimeout(() => {
          onCommentsCountChange(updatedComments.length);
        }, 0);
      }
      
      if (onCommentDelete) {
        onCommentDelete(commentId);
      }
      
      return updatedComments;
    });
  }, [onCommentDelete, onCommentsCountChange]);

  const handleReplyAdded = useCallback((reply) => {
    console.log('Réponse ajoutée:', reply);
    
    setComments(prevComments => {
      const exists = prevComments.some(comment => comment.id === reply.id);
      if (exists) {
        return prevComments;
      }
      
      const updatedComments = [...prevComments, reply].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      if (onCommentsCountChange) {
        setTimeout(() => {
          onCommentsCountChange(updatedComments.length);
        }, 0);
      }
      
      return updatedComments;
    });
  }, [onCommentsCountChange]);

  // Pusher gère maintenant les mises à jour automatiques
  console.log('CommentsList: Utilisation de Pusher pour les commentaires');

  if (loading && comments.length === 0) {
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
        <p className="text-sm text-gray-500 mt-1">
          Les commentaires se mettent à jour automatiquement
        </p>
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

  const organizeComments = (commentsArray) => {
    const parentComments = [];
    const repliesMap = {};
    
    commentsArray.forEach(comment => {
      if (!comment.parent_id) {
        parentComments.push({...comment});
      } else {
        if (!repliesMap[comment.parent_id]) {
          repliesMap[comment.parent_id] = [];
        }
        repliesMap[comment.parent_id].push({...comment});
      }
    });
    
    return { parentComments, repliesMap };
  };

  const { parentComments, repliesMap } = organizeComments(comments);

  return (
    <div className="space-y-4 py-2">
      {parentComments.map((comment) => {
        const commentReplies = repliesMap[comment.id] || [];
        
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
      
      <div className="text-center mt-4">
        <p className="text-xs text-green-500">
          🟢 Mise à jour automatique
        </p>
      </div>
    </div>
  );
};

export default CommentsList;