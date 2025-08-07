// src/features/Feed/CreatePostForm.jsx - Version avec modal unifié
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../features/auth/contexts/AuthContext';
import { createPost } from './feedService';

const CreatePostForm = ({ onPostCreated, onCancel, isVisible = false, initialModalType = null }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  
  // États pour les médias
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [previewVideo, setPreviewVideo] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const eventImageInputRef = useRef(null);

  // États pour le modal unifié - NOUVELLE APPROCHE
  const [modalType, setModalType] = useState(null); // 'post', 'photo', 'video', 'event', 'poll'

  // États pour l'événement
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventImage, setEventImage] = useState(null);
  const [eventImagePreview, setEventImagePreview] = useState('');

  // Gestion de la prévisualisation d'image
  useEffect(() => {
    if (!selectedImage) {
      setPreviewImage('');
      return;
    }
    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewImage(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  useEffect(() => {
    if (!selectedVideo) {
      setPreviewVideo('');
      return;
    }
    const objectUrl = URL.createObjectURL(selectedVideo);
    setPreviewVideo(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedVideo]);

  useEffect(() => {
    if (!eventImage) {
      setEventImagePreview('');
      return;
    }
    const objectUrl = URL.createObjectURL(eventImage);
    setEventImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [eventImage]);

  // Fonctions de validation
  const validateVideoFile = useCallback((file) => {
    const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/avi'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Format de vidéo non supporté. Utilisez MP4, MPEG, MOV, WebM ou AVI.');
    }
    if (file.size > maxSize) {
      throw new Error('La vidéo est trop volumineuse. Taille maximale : 100MB.');
    }
    return true;
  }, []);

  const validateImageFile = useCallback((file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Format d\'image non supporté. Utilisez JPG, PNG, GIF ou WebP.');
    }
    if (file.size > maxSize) {
      throw new Error('L\'image est trop volumineuse. Taille maximale : 10MB.');
    }
    return true;
  }, []);

  // Gestionnaires d'événements
  const handleFileSelect = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      try {
        if (file.type.startsWith('image/')) {
          validateImageFile(file);
          setSelectedImage(file);
          setSelectedVideo(null);
        } else if (file.type.startsWith('video/')) {
          validateVideoFile(file);
          setSelectedVideo(file);
          setSelectedImage(null);
        }
        setModalType('post'); // Retour au modal principal
        setError('');
      } catch (err) {
        setError(err.message);
      }
    }
  }, [validateImageFile, validateVideoFile]);

  const handleEventImageSelect = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      try {
        validateImageFile(file);
        setEventImage(file);
        setError('');
      } catch (err) {
        setError(err.message);
      }
    }
  }, [validateImageFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      try {
        if (file.type.startsWith('image/')) {
          validateImageFile(file);
          setSelectedImage(file);
          setSelectedVideo(null);
        } else if (file.type.startsWith('video/')) {
          validateVideoFile(file);
          setSelectedVideo(file);
          setSelectedImage(null);
        } else {
          throw new Error('Type de fichier non supporté. Utilisez des images ou des vidéos.');
        }
        setError('');
      } catch (err) {
        setError(err.message);
      }
    }
  }, [validateImageFile, validateVideoFile]);

  const removeMedia = useCallback(() => {
    setSelectedImage(null);
    setSelectedVideo(null);
  }, []);

  const resetEventForm = useCallback(() => {
    setEventTitle('');
    setEventDescription('');
    setEventDate('');
    setEventTime('');
    setEventLocation('');
    setEventImage(null);
  }, []);

  const handleCancel = useCallback(() => {
    setContent('');
    setSelectedImage(null);
    setSelectedVideo(null);
    setError('');
    setModalType(null); // Ferme le modal
    resetEventForm();
    
    if (onCancel) {
      onCancel();
    }
  }, [onCancel, resetEventForm]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!content.trim() && !selectedImage && !selectedVideo) {
      setError('Veuillez ajouter du texte, une image ou une vidéo');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('privacy', isPrivate ? 'private' : 'public');
      formData.append('type', 'post');
      
      if (selectedImage) {
        formData.append('image', selectedImage);
        formData.append('media_type', 'image');
      } else if (selectedVideo) {
        formData.append('video', selectedVideo);
        formData.append('media_type', 'video');
      }
      
      const response = await createPost(formData);
      const createdPost = response.data.post || response.data;
      
      setContent('');
      setSelectedImage(null);
      setSelectedVideo(null);
      setModalType(null);
      
      if (onPostCreated) {
        onPostCreated(createdPost);
      }
    } catch (err) {
      console.error('Erreur lors de la création du post:', err);
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la création du post.'
      );
    } finally {
      setLoading(false);
    }
  }, [content, selectedImage, selectedVideo, isPrivate, onPostCreated]);

  const handleEventSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!eventTitle.trim() || !eventDate || !eventTime) {
      setError('Veuillez remplir les champs obligatoires (titre, date, heure)');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('content', eventDescription);
      formData.append('type', 'event');
      formData.append('privacy', isPrivate ? 'private' : 'public');
      
      const eventDateTime = new Date(`${eventDate}T${eventTime}`);
      formData.append('event_date', eventDateTime.toISOString());
      formData.append('event_location', eventLocation);
      
      if (eventImage) {
        formData.append('image', eventImage);
        formData.append('media_type', 'image');
      }
      
      const response = await createPost(formData);
      const createdEvent = response.data.post || response.data;
      
      resetEventForm();
      setModalType(null);
      
      if (onPostCreated) {
        onPostCreated(createdEvent);
      }
    } catch (err) {
      console.error('Erreur lors de la création de l\'événement:', err);
      setError(
        err.response?.data?.message || 
        'Une erreur est survenue lors de la création de l\'événement.'
      );
    } finally {
      setLoading(false);
    }
  }, [eventTitle, eventDate, eventTime, eventDescription, eventLocation, eventImage, isPrivate, onPostCreated, resetEventForm]);

  const togglePrivacy = useCallback(() => {
    setIsPrivate(prev => !prev);
  }, []);

  // Ouvrir le modal avec le bon contenu
  useEffect(() => {
    if (isVisible) {
      if (initialModalType && ['photo', 'video', 'event', 'poll'].includes(initialModalType)) {
        setModalType(initialModalType);
      } else {
        setModalType('post');
      }
    }
  }, [isVisible, initialModalType]);

  // Fonction pour ouvrir directement un modal spécifique
  const openSpecificModal = useCallback((type) => {
    if (['photo', 'video', 'event', 'poll', 'post'].includes(type)) {
      setModalType(type);
    }
  }, []);

  // Fonction pour obtenir le titre du modal
  const getModalTitle = () => {
    switch (modalType) {
      case 'photo': return 'Ajouter une photo';
      case 'video': return 'Ajouter une vidéo';
      case 'event': return 'Créer un événement';
      case 'poll': return 'Créer un sondage';
      default: return 'Créer une publication';
    }
  };

  // Fonction pour obtenir le contenu du modal
  const getModalContent = () => {
    switch (modalType) {
      case 'photo':
        return (
          <div className="p-6">
            <div 
              className="border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer border-gray-300 hover:border-blue-400"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 rounded-full p-4 mb-4">
                  <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-700">
                  Cliquez pour sélectionner une photo
                </p>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG, GIF (Max. 10MB)</p>
              </div>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="p-6">
            <div 
              className="border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer border-gray-300 hover:border-blue-400"
              onClick={() => videoInputRef.current?.click()}
            >
              <input
                type="file"
                accept="video/*"
                className="hidden"
                ref={videoInputRef}
                onChange={handleFileSelect}
              />
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 rounded-full p-4 mb-4">
                  <svg className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-700">
                  Cliquez pour sélectionner une vidéo
                </p>
                <p className="text-sm text-gray-500 mt-2">MP4, MOV, WebM (Max. 100MB)</p>
              </div>
            </div>
          </div>
        );

      case 'event':
        return (
          <form onSubmit={handleEventSubmit} className="p-6 space-y-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                {user?.first_name?.[0] || '?'}{user?.last_name?.[0] || '?'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {user?.first_name || 'Utilisateur'} {user?.last_name || ''}
                </p>
                <p className="text-sm text-gray-500">crée un événement</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'événement <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Formation Odoo, Réunion équipe..."
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
                placeholder="Décrivez votre événement, les objectifs, le programme..."
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: BSTEC Institut - Cocody Riviera 3"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image de l'événement</label>
              
              {eventImagePreview ? (
                <div className="relative">
                  <img 
                    src={eventImagePreview} 
                    alt="Aperçu événement" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setEventImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => eventImageInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={eventImageInputRef}
                    onChange={handleEventImageSelect}
                  />
                  <div className="flex flex-col items-center">
                    <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-600">Cliquez pour ajouter une image</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (Max. 10MB)</p>
                  </div>
                </div>
              )}
            </div>

            {(eventTitle || eventDescription || eventDate || eventLocation) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                  Aperçu de votre événement
                </h4>
                
                <div className="space-y-2">
                  {eventTitle && (
                    <p className="font-semibold text-gray-900">{eventTitle}</p>
                  )}
                  {eventDescription && (
                    <p className="text-gray-700 text-sm">{eventDescription}</p>
                  )}
                  {eventDate && eventTime && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(`${eventDate}T${eventTime}`).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                  {eventLocation && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {eventLocation}
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setModalType('post')}
                className="px-6 py-2 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={loading}
              >
                Retour
              </button>
              <button
                type="submit"
                className={`px-6 py-2 text-white font-medium rounded-lg transition-all ${
                  loading || !eventTitle.trim() || !eventDate || !eventTime
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.02]'
                }`}
                disabled={loading || !eventTitle.trim() || !eventDate || !eventTime}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création...
                  </div>
                ) : 'Créer l\'événement'}
              </button>
            </div>
          </form>
        );

      case 'poll':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-5h7v5zm3-8H7V7h10v2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sondage</h3>
              <p className="text-gray-500">Fonctionnalité de sondage à venir...</p>
              <button
                onClick={() => setModalType('post')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retour
              </button>
            </div>
          </div>
        );

      default: // 'post'
        return (
          <>
            {/* User Info */}
            <div className="p-4 flex items-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                {user?.first_name?.[0] || '?'}{user?.last_name?.[0] || '?'}
              </div>
              <div className="ml-3">
                <p className="font-semibold text-gray-900">
                  {user?.first_name || 'Utilisateur'} {user?.last_name || ''}
                </p>
                <button 
                  type="button"
                  onClick={togglePrivacy}
                  className="flex items-center text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1.5 mt-1 transition-colors"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isPrivate ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  {isPrivate ? 'Privé' : 'Public'}
                  <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Content Area */}
              <div className="px-4">
                <textarea
                  className="w-full border-0 focus:outline-none resize-none text-lg placeholder-gray-400 min-h-[120px]"
                  placeholder="Partagez vos pensées..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  autoFocus
                />
              </div>
              
              {/* Media Preview */}
              {(previewImage || previewVideo) && (
                <div className="px-4 mb-4">
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    {previewImage && (
                      <img 
                        src={previewImage} 
                        alt="Aperçu" 
                        className="w-full max-h-60 object-cover"
                      />
                    )}
                    {previewVideo && (
                      <video 
                        src={previewVideo} 
                        className="w-full max-h-60 object-cover"
                        controls
                        preload="metadata"
                      >
                        Votre navigateur ne supporte pas les vidéos.
                      </video>
                    )}
                    <button
                      type="button"
                      onClick={removeMedia}
                      className="absolute top-3 right-3 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-600 rounded-full p-2 transition-all shadow-lg"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Drag & Drop Zone */}
              {!selectedImage && !selectedVideo && (
                <div className="px-4 mb-4">
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                      isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                    />
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-100 rounded-full p-3 mb-3">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-600">
                        {isDragging ? 'Déposez votre fichier ici' : 'Glissez une image ou vidéo ici ou cliquez pour sélectionner'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Images: JPG, PNG, GIF (Max. 10MB) • Vidéos: MP4, MOV, WebM (Max. 100MB)
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="border border-gray-200 rounded-xl mx-4 mb-4 p-3">
                <div className="text-sm font-medium text-gray-700 mb-3">Ajouter à votre publication</div>
                <div className="flex justify-around">
                  <button 
                    type="button" 
                    className="p-2 rounded-full hover:bg-gray-100 text-green-600 transition-colors" 
                    title="Photo"
                    onClick={() => setModalType('photo')}
                  >
                    <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
                    </svg>
                  </button>
                  
                  <button 
                    type="button" 
                    className="p-2 rounded-full hover:bg-gray-100 text-blue-600 transition-colors" 
                    title="Vidéo"
                    onClick={() => setModalType('video')}
                  >
                    <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                  </button>
                  
                  <button 
                    type="button" 
                    className="p-2 rounded-full hover:bg-gray-100 text-orange-600 transition-colors" 
                    title="Événement"
                    onClick={() => setModalType('event')}
                  >
                    <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                  </button>
                  
                  <button 
                    type="button" 
                    className="p-2 rounded-full hover:bg-gray-100 text-yellow-600 transition-colors" 
                    title="Sondage"
                    onClick={() => setModalType('poll')}
                  >
                    <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-5h7v5zm3-8H7V7h10v2z"/>
                    </svg>
                  </button>
                  
                  <button 
                    type="button" 
                    className="p-2 rounded-full hover:bg-gray-100 text-red-600 transition-colors" 
                    title="Localisation"
                  >
                    <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </button>
                  
                  <button 
                    type="button" 
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors" 
                    title="Plus"
                  >
                    <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="mx-4 mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {/* Footer Button */}
              <div className="p-4 border-t border-gray-200">
                <button
                  type="submit"
                  className={`w-full py-3 px-4 text-white font-semibold rounded-xl transition-all ${
                    loading || (!content.trim() && !selectedImage && !selectedVideo) 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.02]'
                  }`}
                  disabled={loading || (!content.trim() && !selectedImage && !selectedVideo)}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Publication...
                    </div>
                  ) : 'Publier'}
                </button>
              </div>
            </form>
          </>
        );
    }
  };

  // Si le formulaire n'est pas visible, ne rien afficher
  if (!isVisible || !modalType) {
    return null;
  }

  // Modal unifié avec contenu dynamique
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCancel}>
      <div 
        className={`bg-white rounded-2xl shadow-2xl transform transition-all ${
          modalType === 'event' ? 'max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col' : 'max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col'
        }`}
        ref={formRef} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className={`font-bold text-gray-900 ${modalType === 'event' ? 'text-2xl' : 'text-xl'}`}>
            {getModalTitle()}
          </h3>
          <button 
            onClick={handleCancel} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Contenu dynamique du modal avec défilement */}
        <div className="flex-1 overflow-y-auto">
          {getModalContent()}
        </div>
      </div>
    </div>
  );
};

export default CreatePostForm;