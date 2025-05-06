// src/features/Feed/PostItem.jsx
import React, { useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
import { useAuth } from '../../features/auth/contexts/AuthContext';
import Button from '../auth/components/Button';
import { deletePost, updatePost } from './feedService';

// Fonction pour formater la date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

// Fonction améliorée pour construire l'URL complète de l'image
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si c'est déjà une URL complète, la retourner telle quelle
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // URL de base du serveur
  const baseUrl = 'http://192.168.1.4:8000';
  
  // Utiliser le chemin direct comme première tentative
  return `${baseUrl}/storage/${imagePath}`;
};

const PostItem = ({ post, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Validation checks after hooks
  if (!post) {
    console.error('Post is undefined');
    return null;
  }

  // If the post is inside an object with a 'post' property, extract it
  const postData = post.post || post;

  if (typeof postData !== 'object' || !postData.id) {
    console.error('Invalid post object:', post);
    return null;
  }

  // Set initial content after validation
  // eslint-disable-next-line react-hooks/rules-of-hooks
  React.useEffect(() => {
    if (postData?.content) {
      setEditContent(postData.content);
    }
  }, [postData?.content]);

  const isAuthor = user?.id === postData.user_id;
  
  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(postData.content);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(postData.content);
    setError('');
  };
  
  const handleUpdate = async () => {
    if (!editContent.trim()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await updatePost(postData.id, { content: editContent });
      setIsEditing(false);
      if (onPostUpdated) {
        // Vérifier si la réponse contient une propriété 'post'
        const updatedPost = response.data.post || response.data;
        onPostUpdated(updatedPost);
      }
    } catch (err) {
      console.error('Error updating post:', err);
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la mise à jour du post.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      await deletePost(postData.id);
      if (onPostDeleted) {
        onPostDeleted(postData.id);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Une erreur est survenue lors de la suppression du post.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // Ici vous pourriez ajouter l'appel API pour liker le post
  };
  
  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      {/* En-tête du post */}
      <div className="p-4">
        <div className="flex items-start">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
              {postData.user?.firstname?.[0] || '?'}{postData.user?.lastname?.[0] || '?'}
            </div>
          </div>
          
          {/* Info utilisateur et date */}
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {postData.user?.firstname || 'Utilisateur'} {postData.user?.lastname || ''}
                </p>
                <p className="text-xs text-gray-500">
                  {postData.created_at ? formatDate(postData.created_at) : 'Date inconnue'}
                  {postData.created_at !== postData.updated_at && ' (modifié)'}
                  {postData.privacy === 'private' && ' • Privé'}
                </p>
              </div>
              
              {/* Menu options du post */}
              {isAuthor && !isEditing && (
                <div className="relative inline-block text-left">
                  <div>
                    <button
                      className="flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => {
                        const menu = document.getElementById(`post-menu-${postData.id}`);
                        if (menu) {
                          menu.classList.toggle('hidden');
                        }
                      }}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                      </svg>
                    </button>
                  </div>
                  
                  <div 
                    id={`post-menu-${postData.id}`}
                    className="hidden origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                  >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button
                        onClick={handleEdit}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={handleDelete}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Contenu du post */}
        {isEditing ? (
          <div className="mt-4">
            <textarea
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows="3"
            ></textarea>
            
            {error && (
              <div className="text-sm text-red-600 mt-1">
                {error}
              </div>
            )}
            
            <div className="mt-2 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button 
                variant="primary" 
                onClick={handleUpdate}
                disabled={loading || !editContent.trim()}
              >
                {loading ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mt-3 text-sm text-gray-800 whitespace-pre-wrap">
              {postData.content}
            </div>
            
            {/* Affichage de l'image si elle existe - PARTIE MODIFIÉE */}
            {postData.image_path && !imageError && (
              <div className="mt-3">
                <div className="rounded-lg overflow-hidden bg-gray-50">
                  <img 
                    src={`http://192.168.1.4:8000/storage/${postData.image_path}`}
                    alt="Image du post" 
                    className="w-full h-auto object-cover max-h-96 cursor-pointer transition-all duration-300"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Erreur de chargement d\'image:', postData.image_path);
                      
                      // Essayer plusieurs chemins alternatifs un par un
                      const paths = [
                        // Déjà essayé: baseUrl + '/storage/' + imagePath
                        
                        // Essai 1: Chemin direct sans storage
                        `http://192.168.1.4:8000/${postData.image_path}`,
                        
                        // Essai 2: Sans le préfixe posts/images/
                        `http://192.168.1.4:8000/storage/${postData.image_path.replace('posts/images/', '')}`,
                        
                        // Essai 3: Avec storage/app/public
                        `http://192.168.1.4:8000/storage/app/public/${postData.image_path}`,
                        
                        // Essai 4: Avec public 
                        `http://192.168.1.4:8000/public/${postData.image_path}`,
                        
                        // Essai 5: Utiliser une image placeholder comme dernier recours
                        `https://via.placeholder.com/800x600?text=Image+non+disponible`
                      ];
                      
                      // Récupérer le nombre de tentatives déjà effectuées
                      const retryCount = parseInt(e.target.dataset.retryCount || '0');
                      
                      if (retryCount < paths.length) {
                        // Essayer le chemin suivant
                        e.target.dataset.retryCount = (retryCount + 1).toString();
                        console.log(`Tentative ${retryCount + 1}/${paths.length}: ${paths[retryCount]}`);
                        e.target.src = paths[retryCount];
                      } else {
                        // Si toutes les tentatives ont échoué, afficher l'image de remplacement
                        console.log('Toutes les tentatives ont échoué');
                        setImageError(true);
                      }
                    }}
                    onClick={(e) => {
                      // Option: agrandir l'image au clic
                      e.target.classList.toggle('max-h-96');
                      e.target.classList.toggle('max-h-full');
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Image de remplacement en cas d'erreur */}
            {postData.image_path && imageError && (
              <div className="mt-3">
                <div className="rounded-lg overflow-hidden bg-gray-100 p-4 text-center">
                  <svg className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500">Image non disponible</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Compteurs de réactions */}
      {!isEditing && (
        <>
          <div className="px-4 py-2 border-t border-gray-100 flex justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <svg className="h-4 w-4 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"></path>
              </svg>
              <span>
                {isLiked ? (postData.likes_count ? postData.likes_count + 1 : 1) : (postData.likes_count || 0)} J'aime
              </span>
            </div>
            <button 
              className="hover:underline"
              onClick={() => setShowComments(!showComments)}
            >
              {postData.comments_count || 0} commentaires
            </button>
          </div>
          
          {/* Boutons d'action */}
          <div className="px-4 py-2 border-t border-gray-100 flex justify-between">
            <button
              onClick={handleLike}
              className={`flex items-center justify-center w-1/3 py-1 text-sm font-medium rounded-md ${isLiked ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="h-5 w-5 mr-1" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017a2 2 0 01-1.995-1.8l-.73-7.3a2 2 0 011.995-2.2H14z"></path>
              </svg>
              J'aime
            </button>
            
            <button 
              className="flex items-center justify-center w-1/3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md"
              onClick={() => setShowComments(!showComments)}
            >
              <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              Commenter
            </button>
            
            <button className="flex items-center justify-center w-1/3 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md">
              <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
              </svg>
              Partager
            </button>
          </div>
          
          {/* Section commentaires */}
          {showComments && (
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-start space-x-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-xs">
                  {user?.firstname?.[0]}{user?.lastname?.[0]}
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Écrivez un commentaire..."
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Liste des commentaires (si disponible) */}
              {postData.comments && postData.comments.length > 0 ? (
                <div className="space-y-3">
                  {postData.comments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-xs">
                        {comment.user?.firstname?.[0]}{comment.user?.lastname?.[0]}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg px-4 py-2">
                          <p className="text-sm font-medium text-gray-900">{comment.user?.firstname} {comment.user?.lastname}</p>
                          <p className="text-sm text-gray-800">{comment.content}</p>
                        </div>
                        <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                          <button className="font-medium">J'aime</button>
                          <button className="font-medium">Répondre</button>
                          <span>{formatDate(comment.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center">Aucun commentaire pour le moment.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostItem;