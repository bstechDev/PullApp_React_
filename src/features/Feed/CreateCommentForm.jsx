import React, { useState } from 'react';
import { useAuth } from '../auth/contexts/AuthContext';
import { createComment } from './commentService';

const CreateCommentForm = ({ postId, onCommentCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const commentData = {
        content: content.trim(),
        user_id: user.id
      };
      
      const response = await createComment(postId, commentData);
      const commentObject = response.data.comment || response.data;
      
      if (!commentObject.id) {
        throw new Error('Aucun ID retourné par le serveur');
      }
      
      const newComment = {
        ...commentObject,
        post_id: postId,
        parent_id: null,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email
        }
      };
      
      console.log('Commentaire créé:', newComment);
      if (onCommentCreated) {
        onCommentCreated(newComment);
      }
      
      setContent('');
    } catch (err) {
      console.error('Erreur lors de la création du commentaire:', err);
      setError(
        err.response?.data?.message || 
        err.message ||
        'Une erreur est survenue lors de la création du commentaire.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-3">
      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-xs">
        {user?.first_name?.[0]}{user?.last_name?.[0]}
      </div>
      <div className="flex-1 relative">
        <input
          type="text"
          className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Écrivez un commentaire..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button 
            type="submit"
            className={`focus:outline-none ${loading || !content.trim() ? 'text-gray-400' : 'text-blue-500 hover:text-blue-700'}`}
            disabled={loading || !content.trim()}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 text-xs absolute -bottom-5 left-12">
          {error}
        </div>
      )}
    </form>
  );
};

export default CreateCommentForm;