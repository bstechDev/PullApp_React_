import React from 'react';
import { useFriends } from '../hooks/useFriends';
import { useMessages } from '../hooks/useMessages';

const QuickTest = () => {
  const { friendsList, loading: friendsLoading } = useFriends();
  const { conversations, loadConversations, reload } = useMessages();

  const handleQuickTest = () => {
    console.log('🧪 Quick Test - État actuel:');
    console.log('- Friends:', friendsList?.length);
    console.log('- Friends Loading:', friendsLoading);
    console.log('- Conversations:', conversations?.length);
    console.log('- loadConversations type:', typeof loadConversations);
    console.log('- reload type:', typeof reload);
    
    if (typeof loadConversations === 'function') {
      console.log('🔄 Appel de loadConversations...');
      loadConversations();
    } else if (typeof reload === 'function') {
      console.log('🔄 Appel de reload...');
      reload();
    } else {
      console.log('❌ Aucune fonction de chargement disponible');
    }
  };

  return (
    <div className="fixed top-32 left-4 bg-red-600 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🧪 Quick Test</h3>
      
      <div className="space-y-1 mb-3">
        <div>
          <strong>Friends:</strong> {friendsList?.length || 0}
        </div>
        <div>
          <strong>Friends Loading:</strong> {friendsLoading ? '⏳' : '✅'}
        </div>
        <div>
          <strong>Conversations:</strong> {conversations?.length || 0}
        </div>
      </div>

      <button 
        onClick={handleQuickTest}
        className="bg-white text-red-600 px-2 py-1 rounded text-xs font-bold hover:bg-gray-100"
      >
        🔍 Quick Test
      </button>
    </div>
  );
};

export default QuickTest; 