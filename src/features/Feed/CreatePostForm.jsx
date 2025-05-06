// src/features/Feed/CreatePostForm.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../features/auth/contexts/AuthContext';
import { createPost } from './feedService';

const CreatePostForm = ({ onPostCreated, onCancel, isVisible = false }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Gestion de la prévisualisation d'image
  useEffect(() => {
    if (!selectedImage) {
      setPreviewImage('');
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewImage(objectUrl);

    // Nettoyer l'URL d'objet à la destruction du composant
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('Fichier sélectionné:', file.name, file.type, `${Math.round(file.size / 1024)} KB`);
      setSelectedImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      console.log('Fichier déposé:', file.name, file.type, `${Math.round(file.size / 1024)} KB`);
      setSelectedImage(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };
  
  const handleCancel = () => {
    // Réinitialiser l'état du formulaire
    setContent('');
    setSelectedImage(null);
    setError('');
    
    // Appeler la fonction onCancel fournie par le parent
    if (onCancel) {
      onCancel();
    }
  };
  
  // Dans src/features/Feed/CreatePostForm.jsx, modifiez la fonction handleSubmit:

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!content.trim() && !selectedImage) {
    setError('Veuillez ajouter du texte ou une image');
    return;
  }
  
  setLoading(true);
  setError('');
  
  try {
    // Créer un nouveau FormData (important de le créer à chaque fois)
    const formData = new FormData();
    
    // Ajouter le contenu du post
    formData.append('content', content);
    
    // Vérifier si l'image est bien un fichier File
    if (selectedImage && selectedImage instanceof File) {
      // Vérifier la taille de l'image (max 5MB)
      if (selectedImage.size > 5 * 1024 * 1024) {
        throw new Error('L\'image est trop volumineuse (max 5MB)');
      }
      
      // Ajouter l'image au FormData
      formData.append('image', selectedImage, selectedImage.name);
      
      console.log('Image ajoutée au FormData:', 
        selectedImage.name, 
        selectedImage.type, 
        `${Math.round(selectedImage.size / 1024)} KB`);
    }
    
    // Déboguer le contenu du FormData
    console.log('FormData contenu:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? 
        `Fichier: ${pair[1].name} (${pair[1].type}, ${Math.round(pair[1].size / 1024)} KB)` : 
        pair[1]));
    }
    
    // Envoyer la requête
    const response = await createPost(formData);
    console.log('Réponse complète de création de post:', response);
    
    // Extraire le post de la réponse
    const createdPost = response.data.post || response.data;
    console.log('Post créé:', createdPost);
    
    // Réinitialiser le formulaire
    setContent('');
    setSelectedImage(null);
    
    // Callback pour informer le parent
    if (onPostCreated) {
      onPostCreated(createdPost);
    }
  } catch (err) {
    console.error('Error creating post:', err);
    setError(
      err.message || err.response?.data?.message || 
      'Une erreur est survenue lors de la création du post.'
    );
  } finally {
    setLoading(false);
  }
};
  
  // Si le formulaire n'est pas visible, ne rien afficher
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCancel}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 transform transition-all" 
        ref={formRef} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Créer une publication</h3>
          <button 
            onClick={handleCancel} 
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6 flex items-center">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg shadow-sm">
              {user?.firstname?.[0] || '?'}{user?.lastname?.[0] || '?'}
            </div>
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-900">
              {user?.firstname || 'Utilisateur'} {user?.lastname || ''}
            </p>
            <div className="flex items-center mt-1">
              <button 
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className="flex items-center text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 transition-colors"
              >
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isPrivate ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                {isPrivate ? 'Privé' : 'Public'}
              </button>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700"
              placeholder="Quoi de neuf aujourd'hui ?"
              rows="4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            ></textarea>
          </div>
          
          {/* Zone d'aperçu d'image */}
          {previewImage && (
            <div className="mb-4">
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={previewImage} 
                  alt="Aperçu" 
                  className="w-full max-h-80 object-contain bg-gray-100"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 text-white rounded-full p-1.5 hover:bg-opacity-100 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Zone de drag & drop / upload d'image */}
          {!selectedImage && (
            <div 
              className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <div className="flex flex-col items-center cursor-pointer">
                <svg className="h-10 w-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600 font-medium">
                  {isDragging ? 'Déposez votre image ici' : 'Cliquez ou glissez-déposez une image ici'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF (Max. 5 MB)
                </p>
              </div>
            </div>
          )}
          
          {/* Boutons pour ajouter d'autres types de contenu */}
          <div className="border rounded-lg p-3 mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Ajouter à votre publication</div>
            <div className="flex justify-between">
              <button 
                type="button" 
                className="p-2 rounded-full hover:bg-gray-100 text-green-500" 
                title="Ajouter une photo" 
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"></path>
                </svg>
              </button>
              <button type="button" className="p-2 rounded-full hover:bg-gray-100 text-blue-500" disabled title="Ajouter une vidéo (à venir)">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"></path>
                </svg>
              </button>
              <button type="button" className="p-2 rounded-full hover:bg-gray-100 text-yellow-500" disabled title="Ajouter une humeur (à venir)">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path>
                </svg>
              </button>
              <button type="button" className="p-2 rounded-full hover:bg-gray-100 text-red-500" disabled title="Ajouter un lieu (à venir)">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path>
                </svg>
              </button>
              <button type="button" className="p-2 rounded-full hover:bg-gray-100 text-gray-500" disabled title="Plus d'options (à venir)">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
                </svg>
              </button>
            </div>
          </div>
          
          {error && (
            <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="mr-3 px-4 py-2 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white font-medium bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors ${
                loading || (!content.trim() && !selectedImage) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
              disabled={loading || (!content.trim() && !selectedImage)}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publication...
                </div>
              ) : 'Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostForm;