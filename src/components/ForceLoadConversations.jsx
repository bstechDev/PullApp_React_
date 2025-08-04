import React, { useState, useEffect } from 'react';
import { useFriends } from '../hooks/useFriends';
import { messagesService } from '../features/auth/services/messagesService';

const ForceLoadConversations = () => {
  const { friendsList } = useFriends();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleForceLoad = async () => {
    if (!friendsList || friendsList.length === 0) {
      console.log('❌ Aucun ami disponible');
      return;
    }

    setLoading(true);
    console.log('🔄 Chargement forcé des conversations...');

    try {
      const conversationPromises = friendsList.map(async (friend) => {
        try {
          const history = await messagesService.getMessageHistory(friend.id);
          console.log(`✅ Historique chargé pour ${friend.first_name}:`, history.length, 'messages');
          
          const unreadCount = history.filter(msg => !msg.is_read && msg.sender_id === friend.id).length;
          
          return {
            friend,
            lastMessage: history.length > 0 ? history[history.length - 1] : null,
            unreadCount,
          };
        } catch (err) {
          console.error(`❌ Erreur pour ${friend.first_name}:`, err);
          return {
            friend,
            lastMessage: null,
            unreadCount: 0,
          };
        }
      });

      const convs = await Promise.all(conversationPromises);
      console.log('✅ Conversations chargées:', convs.length);
      setConversations(convs);

      // Émettre un événement pour forcer l'affichage
      const event = new CustomEvent('forceDisplayConversations', {
        detail: { conversations: convs }
      });
      window.dispatchEvent(event);

    } catch (error) {
      console.error('❌ Erreur globale:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chargement automatique au démarrage
  useEffect(() => {
    if (friendsList && friendsList.length > 0 && conversations.length === 0) {
      const timer = setTimeout(() => {
        console.log('⏰ Chargement automatique des conversations...');
        handleForceLoad();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [friendsList]);

  return (
    <div className="fixed top-40 left-4 bg-yellow-600 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🚀 Force Load</h3>
      
      <div className="space-y-1 mb-3">
        <div>
          <strong>Friends:</strong> {friendsList?.length || 0}
        </div>
        <div>
          <strong>Conversations:</strong> {conversations?.length || 0}
        </div>
        <div>
          <strong>Loading:</strong> {loading ? '⏳' : '✅'}
        </div>
      </div>

      <button 
        onClick={handleForceLoad}
        disabled={loading}
        className="bg-white text-yellow-600 px-2 py-1 rounded text-xs font-bold hover:bg-gray-100 disabled:opacity-50"
      >
        {loading ? '⏳ Chargement...' : '🚀 Force Load'}
      </button>

      {conversations && conversations.length > 0 && (
        <div className="mt-2">
          <strong>Loaded Conversations:</strong>
          <div className="max-h-20 overflow-y-auto">
            {conversations.map(conv => (
              <div key={conv?.friend?.id} className="text-xs">
                {conv?.friend?.first_name} {conv?.friend?.last_name}
                {conv?.lastMessage && ' (avec messages)'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForceLoadConversations; 