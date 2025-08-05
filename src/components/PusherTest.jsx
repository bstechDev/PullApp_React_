import React, { useEffect, useState } from 'react';
import { usePusher } from '../hooks/usePusher';
import { useAuth } from '../features/auth/contexts/AuthContext';

const PusherTest = () => {
  const { user } = useAuth();
  const { listenToMessages, listenToNotifications, connectionState } = usePusher(user?.id);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    // Écouter les messages
    listenToMessages((data) => {
      console.log('🧪 TEST - Nouveau message reçu:', data);
      setMessages(prev => [...prev, data]);
    });

    // Écouter les notifications
    listenToNotifications((data) => {
      console.log('🧪 TEST - Nouvelle notification reçue:', data);
      setNotifications(prev => [...prev, data]);
    });
  }, [user?.id, listenToMessages, listenToNotifications]);

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">
        🧪 Test Pusher
      </h3>
      
             <div className="text-xs text-gray-600 mb-2">
         État: <span className={`font-medium ${connectionState === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
           {connectionState}
         </span>
         <br />
         User ID: <span className="font-medium">{user?.id || 'Non connecté'}</span>
       </div>

      <div className="space-y-2">
        <div>
          <h4 className="text-xs font-medium text-gray-700">Messages reçus ({messages.length}):</h4>
          <div className="max-h-20 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className="text-xs text-gray-600">
                📨 {msg.message?.content || 'Message'}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-700">Notifications reçues ({notifications.length}):</h4>
          <div className="max-h-20 overflow-y-auto">
            {notifications.map((notif, index) => (
              <div key={index} className="text-xs text-gray-600">
                🔔 {notif.title || 'Notification'}
              </div>
            ))}
          </div>
        </div>
      </div>

             <div className="flex space-x-1 mt-2">
         <button
           onClick={() => {
             setMessages([]);
             setNotifications([]);
           }}
           className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
         >
           Effacer
         </button>
         
         <button
           onClick={() => {
             // Simuler un message reçu pour tester
             const testMessage = {
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
             
             // Ajouter directement au state pour tester
             console.log('🧪 TEST - Message simulé reçu:', testMessage);
             setMessages(prev => [...prev, testMessage]);
             
             // Envoyer un événement personnalisé pour tester l'intégration avec Messages
             window.dispatchEvent(new CustomEvent('test-message', {
               detail: {
                 type: 'test-message',
                 data: testMessage
               }
             }));
           }}
           className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-blue-700"
         >
           Test Msg
         </button>
         
                   <button
            onClick={() => {
              // Simuler un message d'Emmanuel (ID 2 par exemple)
              const emmanuelMessage = {
                message: {
                  id: Date.now(),
                  content: 'Salut ! Comment ça va ? ' + new Date().toLocaleTimeString(),
                  sender_id: 2, // ID d'Emmanuel
                  receiver_id: user?.id,
                  type: 'text',
                  created_at: new Date().toISOString()
                },
                sender_name: 'Emmanuel Fahe'
              };
              
              console.log('🧪 TEST - Message d\'Emmanuel simulé:', emmanuelMessage);
              setMessages(prev => [...prev, emmanuelMessage]);
              
              // Envoyer un événement personnalisé pour tester l'intégration avec Messages
              window.dispatchEvent(new CustomEvent('test-message', {
                detail: {
                  type: 'test-message',
                  data: emmanuelMessage
                }
              }));
            }}
            className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-green-700"
          >
            Test Emmanuel
          </button>
          
          <button
            onClick={() => {
              console.log('🔍 Test de connexion Pusher...');
              console.log('État de connexion:', connectionState);
              console.log('User ID:', user?.id);
                             console.log('Token:', localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'));
              
              // Tester la connexion au canal
              if (user?.id) {
                const channelName = `private-messages.${user.id}`;
                console.log('Canal testé:', channelName);
              }
            }}
            className="text-xs bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded text-purple-700"
          >
            Test Connexion
          </button>
       </div>
    </div>
  );
};

export default PusherTest; 