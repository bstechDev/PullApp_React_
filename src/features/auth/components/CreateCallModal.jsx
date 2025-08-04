import React, { useState, useRef } from 'react';
import { useFriends } from '../../../hooks/useFriends';
import { useVideoCall } from '../../../hooks/useVideoCall';
import { toast } from 'react-toastify';

export default function CreateCallModal({ onClose }) {
  const { friendsList = [], loading: friendsLoading } = useFriends();
  const { createRoom } = useVideoCall();
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const linkInputRef = useRef(null);

  const handleSelectFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateCall = async () => {
    setLoading(true);
    try {
      console.log("Début de la création de salle...");
      const response = await createRoom();
      console.log("Salle créée avec succès:", response);
      setRoomInfo(response);
      toast.success("Salle d'appel créée avec succès !");
    } catch (error) {
      console.error('Erreur détaillée lors de la création de l\'appel:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      // Message d'erreur plus informatif
      let errorMessage = error.message;
      if (error.message.includes('500')) {
        errorMessage = "Erreur serveur. Vérifiez que le backend est démarré et que l'endpoint /call/create-room existe.";
      } else if (error.message.includes('404')) {
        errorMessage = "Endpoint non trouvé. Vérifiez la configuration du backend.";
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = "Impossible de se connecter au serveur backend. Vérifiez qu'il est démarré sur http://192.168.1.4:8000";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!roomInfo?.room_url) return;

    try {
      // Essayer d'abord l'API Clipboard moderne
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(roomInfo.room_url);
        toast.success('Lien copié dans le presse-papier !');
      } else {
        // Fallback pour les contextes non-sécurisés ou navigateurs plus anciens
        const textArea = document.createElement('textarea');
        textArea.value = roomInfo.room_url;
        
        // Éviter le défilement
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
          toast.success('Lien copié dans le presse-papier !');
        } catch (err) {
          console.error('Erreur lors de la copie du lien:', err);
          // Si tout échoue, on sélectionne simplement le texte pour que l'utilisateur puisse le copier
          if (linkInputRef.current) {
            linkInputRef.current.select();
            toast.info('Sélectionnez le lien et utilisez Ctrl+C pour copier');
          }
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la copie du lien:', err);
      toast.error('Impossible de copier le lien automatiquement');
      // Sélectionner le texte comme dernier recours
      if (linkInputRef.current) {
        linkInputRef.current.select();
        toast.info('Sélectionnez le lien et utilisez Ctrl+C pour copier');
      }
    }
  };

  const validFriendsList = Array.isArray(friendsList) ? friendsList : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Créer une salle d'appel</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {roomInfo ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Salle créée avec succès !</h3>
              <p className="text-sm text-green-700 mb-2">ID de la salle : {roomInfo.room_name}</p>
              <div className="flex items-center gap-2 bg-white rounded p-2 border border-green-200">
            <input
                  ref={linkInputRef}
                  type="text"
                  value={roomInfo.room_url}
                  readOnly
                  className="flex-1 text-sm bg-transparent outline-none"
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={handleCopyLink}
                  className="text-green-600 hover:text-green-700 px-2 py-1 rounded flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copier
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Inviter des amis</h3>
              {friendsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : validFriendsList.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Aucun ami disponible</p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {validFriendsList.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">{friend.first_name} {friend.last_name}</p>
                        <p className="text-sm text-gray-500">
                          {friend.status === 'online' ? '🟢 En ligne' : '⚫ Hors ligne'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectFriend(friend.id)}
                        className={`px-3 py-1 rounded ${
                          selectedFriends.includes(friend.id)
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {selectedFriends.includes(friend.id) ? 'Sélectionné' : 'Inviter'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Créez une nouvelle salle d'appel pour commencer une conversation vidéo.
            </p>
      <button
        onClick={handleCreateCall}
        disabled={loading}
              className={`w-full py-2 px-4 rounded-lg ${
                loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création en cours...
                </span>
              ) : (
                'Créer la salle'
              )}
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          {roomInfo && (
            <button
              onClick={() => window.open(roomInfo.room_url, '_blank')}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Rejoindre l'appel
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Fermer
      </button>
        </div>
      </div>
    </div>
  );
}
