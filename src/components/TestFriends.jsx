import React from 'react';
import { useFriends } from '../hooks/useFriends';
import { useMessages } from '../hooks/useMessages';

const TestFriends = () => {
  const { friendsList, loading: friendsLoading, error: friendsError, reload: reloadFriends } = useFriends();
  const { conversations, loading: messagesLoading, error: messagesError, reload: reloadMessages } = useMessages();

  const handleForceReload = () => {
    console.log('🔄 Force reload des données...');
    reloadFriends();
    reloadMessages();
  };

  return (
    <div className="fixed top-4 left-4 bg-blue-600 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🧪 Test Friends</h3>
      
      <div className="space-y-1 mb-3">
        <div>
          <strong>Friends:</strong> {friendsList?.length || 0}
        </div>
        <div>
          <strong>Conversations:</strong> {conversations?.length || 0}
        </div>
        <div>
          <strong>Friends Loading:</strong> {friendsLoading ? '⏳' : '✅'}
        </div>
        <div>
          <strong>Messages Loading:</strong> {messagesLoading ? '⏳' : '✅'}
        </div>
      </div>

      <button 
        onClick={handleForceReload}
        className="bg-white text-blue-600 px-2 py-1 rounded text-xs font-bold hover:bg-gray-100"
      >
        🔄 Force Reload
      </button>

      {friendsError && (
        <div className="mt-2 text-red-300">
          <strong>Error:</strong> {friendsError}
        </div>
      )}

      {friendsList && friendsList.length > 0 && (
        <div className="mt-2">
          <strong>Friends List:</strong>
          <div className="max-h-32 overflow-y-auto">
            {friendsList.map(friend => (
              <div key={friend.id} className="text-xs border-b border-blue-500 py-1">
                {friend.first_name} {friend.last_name} 
                <span className="ml-2 text-blue-300">({friend.friendship_status})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestFriends; 