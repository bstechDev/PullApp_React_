// src/features/Feed/PostItem.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/contexts/AuthContext';
import Button from '../auth/components/Button';
import { deletePost, updatePost } from './feedService';
import { toggleLike, checkUserLiked, getLikesCount } from './likeService';
import CommentsList from './CommentsList';
import CreateCommentForm from './CreateCommentForm';

// Fonction pour formater la date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

// Fonction améliorée pour construire l'URL complète de l'image
// eslint-disable-next-line no-unused-vars
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
  const [likesCount, setLikesCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [imageError, setImageError] = useState(false);
  // Nouvelles variables d'état pour les commentaires
  const [newComment, setNewComment] = useState(null);
  const [commentsCount, setCommentsCount] = useState(0);

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

  // Set initial content and comments count after validation
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (postData?.content) {
      setEditContent(postData.content);
    }
    if (postData?.comments_count !== undefined) {
      setCommentsCount(postData.comments_count);
    }
    if (postData?.likes_count !== undefined) {
      setLikesCount(postData.likes_count);
    }
    
    // Récupérer l'état du like pour ce post
    const fetchLikeStatus = async () => {
      try {
        const liked = await checkUserLiked(postData.id);
        setIsLiked(liked);
        
        // Récupérer le nombre de likes exact
        const count = await getLikesCount(postData.id);
        setLikesCount(count);
      } catch (err) {
        console.error('Erreur lors de la récupération du statut de like:', err);
      }
    };
    
    fetchLikeStatus();
  }, [postData?.content, postData?.comments_count, postData?.likes_count, postData.id]);

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

  const handleLike = async () => {
    setIsLikeLoading(true);
    
    try {
      // Appeler l'API pour toggle le like
      const response = await toggleLike(postData.id);
      
      // Mettre à jour l'état local
      const newLikeState = response.liked;
      setIsLiked(newLikeState);
      
      // Récupérer le compte à jour des likes
      const newCount = await getLikesCount(postData.id);
      setLikesCount(newCount);
      
      // Mettre à jour le post parent si nécessaire
      if (onPostUpdated) {
        const updatedPost = {
          ...postData,
          likes_count: newCount
        };
        onPostUpdated(updatedPost);
      }
    } catch (err) {
      console.error('Erreur lors du toggle du like:', err);
    } finally {
      setIsLikeLoading(false);
    }
  };
  
  // Fonction pour gérer la création d'un nouveau commentaire
  const handleCommentCreated = (comment, tempId = null) => {
    console.log("PostItem reçoit le commentaire:", comment, "tempId:", tempId);
    
    // Si on reçoit un tempId, c'est une mise à jour d'un commentaire temporaire
    if (tempId) {
      // Ne rien faire ici, CommentsList s'occupera de remplacer le commentaire temporaire
      console.log("Mise à jour du commentaire temporaire:", tempId, "avec:", comment);
    } else {
      // C'est un nouveau commentaire, l'ajouter à la liste
      console.log("Nouveau commentaire ajouté:", comment);
      setNewComment(comment);
    }
    
    // Mettre à jour le compteur de commentaires
    setCommentsCount(prevCount => {
      // Ne pas incrémenter si c'est une mise à jour (tempId existe)
      const newCount = tempId ? prevCount : prevCount + 1;
      
      // Mettre à jour le compteur de commentaires dans le post
      const updatedPost = {
        ...postData,
        comments_count: newCount
      };
      
      if (onPostUpdated) {
        onPostUpdated(updatedPost);
      }
      
      return newCount;
    });
  };
  
  // Fonction pour gérer la suppression d'un commentaire
  const handleCommentDeleted = () => {
    if (commentsCount > 0) {
      setCommentsCount(prevCount => prevCount - 1);
      
      // Mettre à jour le compteur de commentaires dans le post
      const updatedPost = {
        ...postData,
        comments_count: commentsCount - 1
      };
      
      if (onPostUpdated) {
        onPostUpdated(updatedPost);
      }
    }
  };

  // Fonction pour mettre à jour le nombre de commentaires
  const handleCommentsCountChange = (count) => {
    // Éviter les mises à jour d'état inutiles
    if (count !== commentsCount) {
      // Utilisez setTimeout pour déplacer la mise à jour en dehors du cycle de rendu actuel
      setTimeout(() => {
        setCommentsCount(count);
        
        // Mettre à jour le compteur de commentaires dans le post
        const updatedPost = {
          ...postData,
          comments_count: count
        };
        
        if (onPostUpdated) {
          onPostUpdated(updatedPost);
        }
      }, 0);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      {/* En-tête du post */}
      <div className="p-4">
        <div className="flex items-start">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
              {postData.user?.first_name?.[0] || '?'}{postData.user?.last_name?.[0] || '?'}
            </div>
          </div>
          
          {/* Info utilisateur et date */}
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {postData.user?.first_name || 'Utilisateur'} {postData.user?.last_name || ''}
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
            
            {/* Affichage de l'image si elle existe */}
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
              <svg className={`h-4 w-4 ${isLiked ? 'text-blue-500' : 'text-gray-400'} mr-1`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"></path>
              </svg>
              <span>
                {likesCount} J'aime
              </span>
            </div>
            <button 
              className="hover:underline"
              onClick={() => setShowComments(!showComments)}
            >
              {commentsCount || 0} commentaires
            </button>
          </div>
          
          {/* Boutons d'action */}
          <div className="px-4 py-2 border-t border-gray-100 flex justify-between">
            <button
              onClick={handleLike}
              disabled={isLikeLoading}
              className={`flex items-center justify-center w-1/3 py-1 text-sm font-medium rounded-md ${
                isLiked ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {isLikeLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <svg className="h-5 w-5 mr-1" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017a2 2 0 01-1.995-1.8l-.73-7.3a2 2 0 011.995-2.2H14z"></path>
                </svg>
              )}
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
          
          {/* Section commentaires - Nouvelle implémentation */}
          {showComments && (
            <div className="px-4 py-3 border-t border-gray-100">
              {/* Formulaire pour ajouter un commentaire */}
              <CreateCommentForm 
                postId={postData.id} 
                onCommentCreated={handleCommentCreated} 
              />
              
              {/* Liste des commentaires */}
              <div className="mt-4">
                <CommentsList 
                  postId={postData.id} 
                  newComment={newComment}
                  onCommentDelete={handleCommentDeleted}
                  onCommentsCountChange={handleCommentsCountChange}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostItem;