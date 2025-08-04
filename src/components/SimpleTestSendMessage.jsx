import React, { useState } from 'react';
import { useFriends } from '../hooks/useFriends';
import { messagesService } from '../features/auth/services/messagesService';

const SimpleTestSendMessage = () => {
  const { friendsList } = useFriends();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!selectedFriend || !messageText.trim()) {
      alert('Veuillez sélectionner un ami et écrire un message');
      return;
    }

    setSending(true);
    try {
      console.log('📤 Envoi de message à:', selectedFriend.first_name, 'Message:', messageText);
      const response = await messagesService.sendTextMessage(selectedFriend.id, messageText);
      console.log('✅ Message envoyé avec succès:', response);
      setMessageText('');
      alert('Message envoyé avec succès !');
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi:', error);
      alert(`Erreur lors de l'envoi du message: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-purple-600 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">📤 Simple Test Send</h3>
      
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
            disabled={sending}
          />
        </div>
      </div>

      <button 
        onClick={handleSendMessage}
        disabled={!selectedFriend || !messageText.trim() || sending}
        className="bg-white text-purple-600 px-2 py-1 rounded text-xs font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending ? '⏳ Envoi...' : '📤 Envoyer'}
      </button>

      {selectedFriend && (
        <div className="mt-2 text-xs">
          <strong>Destinataire:</strong> {selectedFriend.first_name} {selectedFriend.last_name}
        </div>
      )}
    </div>
  );
};

export default SimpleTestSendMessage; 