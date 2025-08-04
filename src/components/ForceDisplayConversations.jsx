import React, { useState, useEffect } from 'react';
import { useFriends } from '../hooks/useFriends';
import { useMessages } from '../hooks/useMessages';

const ForceDisplayConversations = () => {
  const { friendsList } = useFriends();
  const { conversations: hookConversations } = useMessages();
  const [localConversations, setLocalConversations] = useState([]);

  // Synchroniser avec les conversations du hook
  useEffect(() => {
    if (hookConversations && hookConversations.length > 0) {
      setLocalConversations(hookConversations);
    }
  }, [hookConversations]);

  const handleForceDisplay = () => {
    console.log('🧪 Force display des conversations...');
    
    if (friendsList && friendsList.length > 0) {
      // Créer des conversations directement à partir des amis
      const forcedConversations = friendsList.map(friend => ({
        friend,
        lastMessage: null,
        unreadCount: 0,
      }));
      
      console.log('📋 Conversations forcées créées:', forcedConversations);
      setLocalConversations(forcedConversations);
      console.log('✅ Conversations locales définies avec succès');
    } else {
      console.log('❌ Aucun ami disponible');
    }
  };

  // Forcer l'affichage dans le DOM
  useEffect(() => {
    if (localConversations.length > 0) {
      console.log('🎯 Forçage de l\'affichage des conversations dans le DOM...');
      
      // Créer un événement personnalisé pour forcer le re-rendu
      const event = new CustomEvent('forceDisplayConversations', {
        detail: { conversations: localConversations }
      });
      window.dispatchEvent(event);
    }
  }, [localConversations]);

  return (
    <div className="fixed top-20 left-4 bg-orange-600 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🧪 Force Display</h3>
      
      <div className="space-y-1 mb-3">
        <div>
          <strong>Friends:</strong> {friendsList?.length || 0}
        </div>
        <div>
          <strong>Hook Conversations:</strong> {hookConversations?.length || 0}
        </div>
        <div>
          <strong>Local Conversations:</strong> {localConversations?.length || 0}
        </div>
      </div>

      <button 
        onClick={handleForceDisplay}
        className="bg-white text-orange-600 px-2 py-1 rounded text-xs font-bold hover:bg-gray-100"
      >
        🎯 Force Display
      </button>

      {localConversations && localConversations.length > 0 && (
        <div className="mt-2">
          <strong>Local Conversations:</strong>
          <div className="max-h-20 overflow-y-auto">
            {localConversations.map(conv => (
              <div key={conv?.friend?.id} className="text-xs">
                {conv?.friend?.first_name} {conv?.friend?.last_name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForceDisplayConversations; 