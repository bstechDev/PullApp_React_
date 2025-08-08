// src/features/Feed/PostItem.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/contexts/AuthContext';
import Button from '../auth/components/Button';
import { deletePost, updatePost } from './feedService';
import { getCommentsCount } from './commentService';
import { toggleLike, checkUserLiked, getLikesCount } from './likeService';
import CommentsList from './CommentsList';
import CreateCommentForm from './CreateCommentForm';
import VideoPlayer from '../auth/components/VideoPlayer';

// Fonction pour formater la date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

// Fonction pour formater la date d'événement
const formatEventDate = (dateString) => {
  const options = { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

// Fonction pour obtenir le statut de l'événement
const getEventStatus = (eventDate) => {
  const now = new Date();
  const eventDateTime = new Date(eventDate);
  const diffInHours = (eventDateTime - now) / (1000 * 60 * 60);
  
  if (diffInHours < 0) {
    return { status: 'past', label: 'Événement passé', color: 'text-gray-500 bg-gray-100' };
  } else if (diffInHours < 24) {
    return { status: 'today', label: 'Aujourd\'hui', color: 'text-red-600 bg-red-100' };
  } else if (diffInHours < 168) { // 7 jours
    return { status: 'this-week', label: 'Cette semaine', color: 'text-orange-600 bg-orange-100' };
  } else {
    return { status: 'upcoming', label: 'À venir', color: 'text-blue-600 bg-blue-100' };
  }
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

// Fonction pour construire l'URL complète de la vidéo
const getVideoUrl = (videoPath) => {
  if (!videoPath) return null;
  
  if (videoPath.startsWith('http')) {
    return videoPath;
  }
  
  const baseUrl = 'http://192.168.1.4:8000';
  return `${baseUrl}/storage/${videoPath}`;
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
  const [videoError, setVideoError] = useState(false);
  // Nouvelles variables d'état pour les commentaires
  const [newComment, setNewComment] = useState(null);
  const [commentsCount, setCommentsCount] = useState(0);
  
  // États pour la modification d'image
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageKey, setImageKey] = useState(0);

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

  // Ne pas afficher les posts en attente de modération sauf pour l'auteur
  if (postData.status === 'pending' && user?.id !== postData.user_id) {
    return null;
  }

  // Déterminer si c'est un événement
  const isEvent = postData.type === 'event';
  const eventStatus = isEvent && postData.event_date ? getEventStatus(postData.event_date) : null;

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
    
    // Réinitialiser l'état d'erreur d'image quand les données changent
    setImageError(false);
    
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

    // ✅ Cette nouvelle fonction va récupérer le vrai nombre de commentaires
  const fetchCommentsCount = async () => {
    try {
      const count = await getCommentsCount(postData.id);
      setCommentsCount(count);
    } catch (err) {
      console.error('Erreur lors de la récupération du nombre de commentaires:', err);
    }
  };
    
    fetchCommentsCount();
    fetchLikeStatus();
  }, [postData?.content, postData?.comments_count, postData?.likes_count, postData?.id, postData?.image_path]);

  const isAuthor = user?.id === postData.user_id;
  
  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(postData.content);
    setEditImage(null);
    setEditImagePreview('');
    setImageError(false);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(postData.content);
    setEditImage(null);
    setEditImagePreview('');
    setError('');
    setImageError(false);
    
    // Forcer un re-rendu pour s'assurer que l'image actuelle s'affiche correctement
    setTimeout(() => {
      setImageError(false);
    }, 100);
  };
  
  const handleUpdate = async () => {
    if (!editContent.trim() && !editImage) {
      setError('Veuillez ajouter du texte ou une image');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let response;
      
      if (editImage) {
        // Si une nouvelle image est sélectionnée, utiliser FormData
        const formData = new FormData();
        formData.append('content', editContent);
        formData.append('image', editImage);
        formData.append('media_type', 'image');
        
        response = await updatePost(postData.id, formData);
      } else {
        // Sinon, envoyer seulement le texte
        response = await updatePost(postData.id, { content: editContent });
      }
      
      setIsEditing(false);
      setEditImage(null);
      setEditImagePreview('');
      
      // Forcer la mise à jour de l'état local avec les nouvelles données
      const updatedPost = response.data.post || response.data;
      
      // Mettre à jour les données du post localement
      Object.assign(postData, updatedPost);
      
      // Réinitialiser les états d'erreur d'image et forcer le re-rendu
      setImageError(false);
      setImageKey(prev => prev + 1);
      
      if (onPostUpdated) {
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

  // Fonction pour gérer les erreurs vidéo
  const handleVideoError = () => {
    console.error('Erreur de chargement de vidéo:', postData.video_path);
    setVideoError(true);
  };

  // Fonctions pour la modification d'image
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validation du fichier
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        setError('Format d\'image non supporté. Utilisez JPG, PNG, GIF ou WebP.');
        return;
      }
      if (file.size > maxSize) {
        setError('L\'image est trop volumineuse. Taille maximale : 10MB.');
        return;
      }

      setEditImage(file);
      const objectUrl = URL.createObjectURL(file);
      setEditImagePreview(objectUrl);
      setError('');
    }
  };

  const removeEditImage = () => {
    setEditImage(null);
    setEditImagePreview('');
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

        {/* Badge de type pour les événements */}
        {isEvent && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
                Événement
              </div>
              {eventStatus && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventStatus.color}`}>
                  {eventStatus.label}
                </span>
              )}
            </div>
          </div>
        )}

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
                <div>
                  <p className="text-xs text-gray-500">
                    {postData.created_at ? formatDate(postData.created_at) : 'Date inconnue'}
                    {postData.created_at !== postData.updated_at && ' (modifié)'}
                    {postData.privacy === 'private' && ' • Privé'}
                  </p>
                  {postData.status === 'pending' && (
                    <p className="text-xs text-orange-500 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      En attente de modération
                    </p>
                  )}
                  {postData.status === 'rejected' && (
                    <p className="text-xs text-red-500 mt-1 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Post rejeté
                      {postData.rejection_reason && ` - ${postData.rejection_reason}`}
                    </p>
                  )}
                </div>
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

        {/* Informations spécifiques à l'événement */}
        {isEvent && postData.event_date && (
          <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 rounded-lg p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Détails de l'événement
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-700">
                    <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Date:</span>
                    <span className="ml-2">{formatEventDate(postData.event_date)}</span>
                  </div>
                  
                  {postData.event_location && (
                    <div className="flex items-center text-sm text-gray-700">
                      <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">Lieu:</span>
                      <span className="ml-2">{postData.event_location}</span>
                    </div>
                  )}
                </div>
                
                {/* Boutons d'action pour événement */}
                <div className="flex space-x-3 mt-4">
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Participer
                  </button>
                  <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Partager
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Contenu du post */}
        {isEditing ? (
          <div className="mt-4">
            {/* Zone de texte */}
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows="3"
              placeholder="Modifiez votre post..."
            ></textarea>
            
            {/* Section de gestion d'image */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Image du post</h4>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    {postData.image_path ? 'Changer l\'image' : 'Ajouter une image'}
                  </span>
                </label>
              </div>
              
              {/* Affichage de l'image actuelle */}
              {postData.image_path && !editImagePreview && (
                <div className="relative">
                  <img 
                    key={`edit-${postData.id}-${postData.image_path}-${imageKey}`}
                    src={`http://192.168.1.4:8000/storage/${postData.image_path}`}
                    alt="Image actuelle" 
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Image actuelle
                  </div>
                </div>
              )}
              
              {/* Prévisualisation de la nouvelle image */}
              {editImagePreview && (
                <div className="relative">
                  <img 
                    src={editImagePreview}
                    alt="Nouvelle image" 
                    className="w-full h-48 object-cover rounded-lg border border-blue-300"
                  />
                  <button
                    type="button"
                    onClick={removeEditImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Nouvelle image
                  </div>
                </div>
              )}
              
              {/* Zone de drop si aucune image */}
              {!postData.image_path && !editImagePreview && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <svg className="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-500">
                    Cliquez sur "Ajouter une image" pour sélectionner une image
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, GIF (Max. 10MB)
                  </p>
                </div>
              )}
            </div>
            
            {error && (
              <div className="text-sm text-red-600 mt-2 p-2 bg-red-50 rounded">
                {error}
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
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
                disabled={loading || (!editContent.trim() && !editImage)}
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
                    key={`${postData.id}-${postData.image_path}-${imageKey}`}
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

            {/* NOUVEAU : Affichage de la vidéo si elle existe */}
            {postData.video_path && !videoError && (
              <div className="mt-3">
                <VideoPlayer
                  src={getVideoUrl(postData.video_path)}
                  poster={postData.thumbnail_path ? getImageUrl(postData.thumbnail_path) : null}
                  duration={postData.video_duration}
                  onError={handleVideoError}
                />
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

      {/* NOUVEAU : Message d'erreur pour la vidéo */}
      {postData.video_path && videoError && (
        <div className="mt-3">
          <div className="rounded-lg overflow-hidden bg-gray-100 p-4 text-center">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500">Vidéo non disponible</p>
            {postData.video_path && (
              <p className="text-xs text-gray-400 mt-1">
                Chemin: {postData.video_path}
              </p>
            )}
          </div>
        </div>
      )}
      
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
              className={`flex items-center justify-center w-1/3 py-1 text-sm font-medium rounded-md cursor-pointer ${
                isLiked ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700 cursor-pointer' 
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
                <svg className={`h-4 w-4 ${isLiked ? 'text-blue-500' : 'text-gray-400'} mr-1`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"></path>
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
