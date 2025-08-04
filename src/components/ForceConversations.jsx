import React from 'react';
import { useFriends } from '../hooks/useFriends';
import { useMessages } from '../hooks/useMessages';

const ForceConversations = () => {
  const { friendsList } = useFriends();
  const { conversations, reload } = useMessages();

  const handleCreateTestConversations = () => {
    console.log('🧪 Création forcée de conversations de test...');
    
    if (friendsList && friendsList.length > 0) {
      console.log('📋 Amis disponibles pour créer des conversations:', friendsList.map(f => `${f.first_name} ${f.last_name}`));
      
      // Forcer le rechargement des conversations
      reload();
    } else {
      console.log('❌ Aucun ami disponible pour créer des conversations');
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🧪 Force Conversations</h3>
      
      <div className="space-y-1 mb-3">
        <div>
          <strong>Friends:</strong> {friendsList?.length || 0}
        </div>
        <div>
          <strong>Conversations:</strong> {conversations?.length || 0}
        </div>
      </div>

      <button 
        onClick={handleCreateTestConversations}
        className="bg-white text-green-600 px-2 py-1 rounded text-xs font-bold hover:bg-gray-100"
      >
        🔄 Force Create
      </button>

      {friendsList && friendsList.length > 0 && (
        <div className="mt-2">
          <strong>Available Friends:</strong>
          <div className="max-h-20 overflow-y-auto">
            {friendsList.map(friend => (
              <div key={friend.id} className="text-xs">
                {friend.first_name} {friend.last_name} ({friend.friendship_status})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ForceConversations; 