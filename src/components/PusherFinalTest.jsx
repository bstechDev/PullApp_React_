import React, { useEffect, useState } from 'react';
import { usePusher } from '../hooks/usePusher';
import { useAuth } from '../features/auth/contexts/AuthContext';

const PusherFinalTest = () => {
  const { user } = useAuth();
  const { listenToMessages, connectionState } = usePusher(user?.id);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Initialisation...');

  useEffect(() => {
    if (!user?.id) return;

    console.log('🎯 Test Final - Démarrage pour l\'utilisateur:', user.id);
    setConnectionStatus('Connexion en cours...');
    
    listenToMessages((data) => {
      console.log('🎉 Test Final - Message reçu via Pusher:', data);
      setReceivedMessages(prev => [...prev, data]);
      setConnectionStatus('✅ Messages reçus en temps réel !');
    });
  }, [user?.id, listenToMessages]);

  useEffect(() => {
    if (connectionState === 'connected') {
      setConnectionStatus('✅ Connecté à Pusher');
    } else if (connectionState === 'disconnected') {
      setConnectionStatus('❌ Déconnecté de Pusher');
    } else if (connectionState === 'connecting') {
      setConnectionStatus('🔄 Connexion en cours...');
    }
  }, [connectionState]);

  const testRealMessage = () => {
    console.log('🧪 Test Final - Simulation d\'un vrai message');
    const testData = {
      message: {
        id: Date.now(),
        content: 'Test temps réel ' + new Date().toLocaleTimeString(),
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
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">
        🎯 Test Final Pusher
      </h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-medium">État:</span>
          <span className={`ml-1 ${connectionState === 'connected' ? 'text-green-600' : connectionState === 'connecting' ? 'text-yellow-600' : 'text-red-600'}`}>
            {connectionState}
          </span>
        </div>
        
        <div>
          <span className="font-medium">Status:</span>
          <span className="ml-1 text-blue-600">{connectionStatus}</span>
        </div>
        
        <div>
          <span className="font-medium">User ID:</span>
          <span className="ml-1 text-gray-600">{user?.id || 'Non connecté'}</span>
        </div>
        
        <div>
          <span className="font-medium">Messages reçus:</span>
          <span className="ml-1 text-blue-600">{receivedMessages.length}</span>
        </div>
        
        {receivedMessages.length > 0 && (
          <div className="bg-green-50 p-2 rounded border border-green-200">
            <div className="font-medium text-xs text-green-800">✅ Messages reçus:</div>
            {receivedMessages.slice(-3).map((msg, index) => (
              <div key={index} className="text-xs text-green-700 mt-1">
                {msg.message?.content || 'Contenu non disponible'}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex space-x-1 mt-2">
        <button
          onClick={testRealMessage}
          className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-green-700"
        >
          Test Message
        </button>
        
        <button
          onClick={() => {
            setReceivedMessages([]);
            setConnectionStatus('Test réinitialisé');
          }}
          className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PusherFinalTest; 