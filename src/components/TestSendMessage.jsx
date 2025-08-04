import React, { useState } from 'react';
import { useFriends } from '../hooks/useFriends';
import { useMessages } from '../hooks/useMessages';
import { messagesService } from '../features/auth/services/messagesService';

const TestSendMessage = () => {
  const { friendsList } = useFriends();
  const messagesHook = useMessages();
  const { sendTextMessage } = messagesHook;
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messageText, setMessageText] = useState('');

  console.log('🔍 TestSendMessage - messagesHook:', messagesHook);
  console.log('🔍 TestSendMessage - sendTextMessage:', typeof sendTextMessage);

  const handleSendMessage = async () => {
    if (!selectedFriend || !messageText.trim()) {
      alert('Veuillez sélectionner un ami et écrire un message');
      return;
    }

    try {
      console.log('📤 Envoi de message à:', selectedFriend.first_name, 'Message:', messageText);
      
      // Essayer d'abord avec le hook
      if (typeof sendTextMessage === 'function') {
        await sendTextMessage(selectedFriend.id, messageText);
        console.log('✅ Message envoyé avec succès via hook');
      } else {
        // Fallback: utiliser directement le service
        console.log('🔄 Utilisation du service direct...');
        const response = await messagesService.sendTextMessage(selectedFriend.id, messageText);
        console.log('✅ Message envoyé avec succès via service direct:', response);
      }
      
      setMessageText('');
      alert('Message envoyé !');
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi:', error);
      alert('Erreur lors de l\'envoi du message');
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-purple-600 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">📤 Test Send Message</h3>
      
      <div className="space-y-2 mb-3">
        <div>
          <strong>Friends:</strong> {friendsList?.length || 0}
        </div>
        
        <div>
          <label className="block text-xs mb-1">Sélectionner un ami:</label>
          <select 
            value={selectedFriend?.id || ''} 
            onChange={(e) => {
              const friend = friendsList?.find(f => f.id === parseInt(e.target.value));
              setSelectedFriend(friend);
            }}
            className="w-full p-1 text-black text-xs rounded"
          >
            <option value="">Choisir un ami...</option>
            {friendsList?.map(friend => (
              <option key={friend.id} value={friend.id}>
                {friend.first_name} {friend.last_name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs mb-1">Message:</label>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Tapez votre message..."
            className="w-full p-1 text-black text-xs rounded"
          />
        </div>
      </div>

      <button 
        onClick={handleSendMessage}
        disabled={!selectedFriend || !messageText.trim()}
        className="bg-white text-purple-600 px-2 py-1 rounded text-xs font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        📤 Envoyer
      </button>

      {selectedFriend && (
        <div className="mt-2 text-xs">
          <strong>Destinataire:</strong> {selectedFriend.first_name} {selectedFriend.last_name}
        </div>
      )}
    </div>
  );
};

export default TestSendMessage; 