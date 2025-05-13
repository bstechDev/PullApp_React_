import React, { useState, useCallback } from 'react';
import { useAuth } from '../../features/auth/contexts/AuthContext';
import { updateComment, deleteComment, replyToComment } from './commentService';

// Fonction pour formater la date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const CommentItem = ({ comment, postId, onCommentUpdated, onCommentDeleted, onReplyAdded, replies = [] }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReplies, setShowReplies] = useState(false);

  // Vérification pour déterminer si l'utilisateur est l'auteur
  const isAuthor = user && comment.user_id && 
    (user.id === comment.user_id || 
     user.id === parseInt(comment.user_id) || 
     parseInt(user.id) === comment.user_id);

  // Gestion de l'édition du commentaire
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditContent(comment.content);
  }, [comment.content]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent(comment.content);
    setError('');
  }, [comment.content]);

  const handleUpdate = async () => {
    if (!editContent.trim()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await updateComment(postId, comment.id, { content: editContent });
      const updatedComment = {
        ...comment,
        content: editContent,
        updated_at: new Date().toISOString()
      };
      
      console.log('Commentaire mis à jour:', response.data);
      setIsEditing(false);
      
      if (onCommentUpdated) {
        onCommentUpdated(updatedComment);
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du commentaire:', err);
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la mise à jour du commentaire.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la suppression du commentaire
  const handleDelete = useCallback(async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    setLoading(true);

    try {
      await deleteComment(postId, comment.id);
      
      if (onCommentDeleted) {
        onCommentDeleted(comment.id);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression du commentaire:', err);
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la suppression du commentaire.'
      );
    } finally {
      setLoading(false);
    }
  }, [postId, comment.id, onCommentDeleted]);

  // Gestion des réponses
  const handleReplyClick = useCallback(() => {
    setIsReplying(true);
  }, []);

  const handleCancelReply = useCallback(() => {
    setIsReplying(false);
    setReplyContent('');
    setError('');
  }, []);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const replyData = {
        content: replyContent.trim(),
        user_id: user.id,
        parent_id: comment.id
      };
      
      const response = await replyToComment(postId, comment.id, replyData);
      const responseData = response.data.comment || response.data;
      
      const newReply = {
        ...responseData,
        post_id: postId,
        parent_id: comment.id,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email
        }
      };
      
      console.log('Réponse créée:', newReply);
      if (onReplyAdded) {
        onReplyAdded(newReply);
      }
      
      setReplyContent('');
      setIsReplying(false);
    } catch (err) {
      console.error('Erreur lors de la création de la réponse:', err);
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la création de la réponse.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comment-container">
      <div className="flex items-start space-x-3">
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-xs">
          {comment.user?.first_name?.[0]}{comment.user?.last_name?.[0]}
        </div>
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows="2"
                disabled={loading}
              ></textarea>
              
              {error && (
                <div className="text-xs text-red-600">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={handleCancelEdit}
                  className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button 
                  onClick={handleUpdate}
                  className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                  disabled={loading || !editContent.trim()}
                >
                  {loading ? 'Mise à jour...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gray-100 rounded-lg px-3 py-2 relative">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-gray-900">{comment.user?.first_name} {comment.user?.last_name}</p>
                  
                  {isAuthor && (
                    <div className="flex space-x-1 ml-2">
                      <button 
                        className="text-gray-500 hover:text-blue-600 p-1"
                        onClick={handleEdit}
                        title="Modifier ce commentaire"
                        disabled={loading}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        className="text-gray-500 hover:text-red-600 p-1"
                        onClick={handleDelete}
                        title="Supprimer ce commentaire"
                        disabled={loading}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-800 mt-1">{comment.content}</p>
              </div>
              <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                <button className="font-medium hover:underline">J'aime</button>
                <button 
                  className="font-medium hover:underline"
                  onClick={handleReplyClick}
                >
                  Répondre
                </button>
                <span>{formatDate(comment.created_at)}</span>
                {comment.created_at !== comment.updated_at && 
                  <span className="text-xs text-gray-400">(modifié)</span>
                }
                {replies.length > 0 && (
                  <button 
                    className="font-medium text-blue-500 hover:underline"
                    onClick={() => setShowReplies(!showReplies)}
                  >
                    {showReplies ? 'Masquer' : `Voir ${replies.length} ${replies.length === 1 ? 'réponse' : 'réponses'}`}
                  </button>
                )}
              </div>
            </>
          )}
          
          {isReplying && !isEditing && (
            <div className="mt-2">
              <form onSubmit={handleSubmitReply} className="flex items-start space-x-2">
                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-xs">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    className="w-full bg-gray-100 rounded-full px-3 py-1.5 text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Écrivez une réponse..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    disabled={loading}
                  />
                  {error && (
                    <div className="mt-1 text-xs text-red-500">
                      {error}
                    </div>
                  )}
                </div>
                <div className="flex space-x-1">
                  <button 
                    type="button"
                    onClick={handleCancelReply}
                    className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 rounded"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className={`px-2 py-1 text-xs font-medium text-white rounded ${
                      loading || !replyContent.trim() 
                        ? 'bg-blue-300 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    disabled={loading || !replyContent.trim()}
                  >
                    {loading ? 'Envoi...' : 'Répondre'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {showReplies && replies.length > 0 && (
            <div className="ml-4 mt-2 space-y-3 border-l-2 border-gray-200 pl-3">
              {replies.map(reply => (
                <CommentItem 
                  key={`reply-${reply.id}`}
                  comment={reply}
                  postId={postId}
                  onCommentUpdated={onCommentUpdated}
                  onCommentDeleted={onCommentDeleted}
                  onReplyAdded={onReplyAdded}
                  replies={[]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;