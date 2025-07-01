import React, { useEffect } from 'react';

const ImageModal = ({ isOpen, onClose, imageSrc, postData }) => {
  // Fermer le modal avec la touche Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Empêcher le scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay sombre */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-90"
        onClick={onClose}
      />
      
      {/* Contenu du modal */}
      <div className="relative max-w-7xl max-h-screen w-full h-full flex items-center justify-center p-4">
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Container principal avec sidebar */}
        <div className="flex w-full h-full max-w-6xl bg-white rounded-lg overflow-hidden">
          {/* Image principale */}
          <div className="flex-1 bg-black flex items-center justify-center">
            <img
              src={imageSrc}
              alt="Image en plein écran"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Sidebar avec informations du post */}
          <div className="w-80 bg-white flex flex-col">
            {/* Header avec info utilisateur */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                  {postData.user?.first_name?.[0] || '?'}{postData.user?.last_name?.[0] || '?'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {postData.user?.first_name || 'Utilisateur'} {postData.user?.last_name || ''}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(postData.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Contenu du post */}
            {postData.content && (
              <div className="p-4 border-b border-gray-200">
                <p className="text-gray-800 whitespace-pre-wrap">{postData.content}</p>
              </div>
            )}

            {/* Actions (like, comment, share) */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>{postData.likes_count || 0} J'aime</span>
                <span>{postData.comments_count || 0} commentaires</span>
              </div>
              
              <div className="flex items-center justify-around border-t border-gray-200 pt-3">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>J'aime</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Commenter</span>
                </button>
                
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Partager</span>
                </button>
              </div>
            </div>

            {/* Zone de commentaires (optionnel) */}
            <div className="flex-1 p-4 overflow-y-auto">
              <p className="text-gray-500 text-center">Les commentaires apparaîtront ici</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;