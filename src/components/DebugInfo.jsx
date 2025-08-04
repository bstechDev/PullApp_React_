import React from 'react';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { useFriends } from '../hooks/useFriends';
import { useMessages } from '../hooks/useMessages';

const DebugInfo = () => {
  const { user, loading: authLoading } = useAuth();
  const { friendsList, loading: friendsLoading, error: friendsError } = useFriends();
  const { conversations, loading: messagesLoading, error: messagesError } = useMessages();

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Debug Info</h3>
      
      <div className="space-y-1">
        <div>
          <strong>Auth:</strong> {user ? `✅ ${user.id}` : '❌ Non connecté'}
        </div>
        <div>
          <strong>Auth Loading:</strong> {authLoading ? '⏳' : '✅'}
        </div>
        <div>
          <strong>Friends Loading:</strong> {friendsLoading ? '⏳' : '✅'}
        </div>
        <div>
          <strong>Friends Count:</strong> {friendsList?.length || 0}
        </div>
        <div>
          <strong>Friends Error:</strong> {friendsError ? '❌' : '✅'}
        </div>
        <div>
          <strong>Messages Loading:</strong> {messagesLoading ? '⏳' : '✅'}
        </div>
        <div>
          <strong>Conversations:</strong> {conversations?.length || 0}
        </div>
        <div>
          <strong>Messages Error:</strong> {messagesError ? '❌' : '✅'}
        </div>
      </div>

      {friendsError && (
        <div className="mt-2 text-red-300">
          <strong>Friends Error:</strong> {friendsError}
        </div>
      )}

      {messagesError && (
        <div className="mt-2 text-red-300">
          <strong>Messages Error:</strong> {messagesError}
        </div>
      )}

      {friendsList && friendsList.length > 0 && (
        <div className="mt-2">
          <strong>Friends:</strong>
          <div className="max-h-20 overflow-y-auto">
            {friendsList.slice(0, 3).map(friend => (
              <div key={friend.id} className="text-xs">
                {friend.first_name} {friend.last_name} ({friend.friendship_status})
              </div>
            ))}
            {friendsList.length > 3 && <div>... et {friendsList.length - 3} autres</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugInfo; 