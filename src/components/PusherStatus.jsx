import React, { useEffect, useState } from 'react';
import { usePusher } from '../hooks/usePusher';
import { useAuth } from '../features/auth/contexts/AuthContext';

const PusherStatus = () => {
  const { user } = useAuth();
  const { listenToMessages, connectionState } = usePusher(user?.id);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    console.log('🔌 PusherStatus: Démarrage de l\'écoute pour l\'utilisateur:', user.id);
    
    listenToMessages((data) => {
      console.log('📨 PusherStatus: Nouveau message reçu:', data);
      setLastMessage(data);
      setReceivedMessages(prev => [...prev, data]);
    });
  }, [user?.id, listenToMessages]);

  const testMessage = () => {
    console.log('🧪 Test de message simulé');
    const testData = {
      message: {
        id: Date.now(),
        content: 'Message de test ' + new Date().toLocaleTimeString(),
        sender_id: 999,
        receiver_id: user?.id,
        type: 'text',
        created_at: new Date().toISOString()
      },
      sender_name: 'Test User'
    };
    
    // Simuler un événement Pusher
    window.dispatchEvent(new CustomEvent('test-message', {
      detail: {
        type: 'test-message',
        data: testData
      }
    }));
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">
        🔌 Statut Pusher
      </h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-medium">État:</span>
          <span className={`ml-1 ${connectionState === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
            {connectionState}
          </span>
        </div>
        
        <div>
          <span className="font-medium">User ID:</span>
          <span className="ml-1 text-gray-600">{user?.id || 'Non connecté'}</span>
        </div>
        
        <div>
          <span className="font-medium">Messages reçus:</span>
          <span className="ml-1 text-blue-600">{receivedMessages.length}</span>
        </div>
        
        {lastMessage && (
          <div className="bg-gray-50 p-2 rounded">
            <div className="font-medium text-xs">Dernier message:</div>
            <div className="text-xs text-gray-600">
              {lastMessage.message?.content || 'Contenu non disponible'}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex space-x-1 mt-2">
        <button
          onClick={testMessage}
          className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-blue-700"
        >
          Test Message
        </button>
        
        <button
          onClick={() => {
            setReceivedMessages([]);
            setLastMessage(null);
          }}
          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
        >
          Effacer
        </button>
      </div>
    </div>
  );
};

export default PusherStatus; 