import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';

const MessageList = ({
  conversations = [],
  selectedConversation = null,
  searchQuery = '',
  setSearchQuery = () => {},
  handleSelectConversation = () => {},
  reload = () => {},
  userStatuses = {},
  lastSeen = {},
}) => {
  const [forcedConversations, setForcedConversations] = useState([]);

  // Écouter l'événement de forçage d'affichage
  useEffect(() => {
    const handleForceDisplay = (event) => {
      console.log('🎯 MessageList - Événement forceDisplayConversations reçu:', event.detail);
      setForcedConversations(event.detail.conversations);
    };

    window.addEventListener('forceDisplayConversations', handleForceDisplay);
    return () => {
      window.removeEventListener('forceDisplayConversations', handleForceDisplay);
    };
  }, []);

  // Utiliser les conversations forcées si disponibles, sinon les conversations normales
  const displayConversations = forcedConversations.length > 0 ? forcedConversations : conversations;

  // Logs de débogage réduits
  if (displayConversations?.length > 0) {
    console.log('MessageList - Conversations affichées:', displayConversations.length);
  }
  const getAvatar = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getAvatarColor = (firstName, lastName) => {
    const colors = ['bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-red-500'];
    const nameHash = (firstName + lastName).length;
    return colors[nameHash % colors.length];
  };

  // Reprise utilitaire pour afficher texte dernière connexion
  const getLastSeenText = (lastSeenISO) => {
    if (!lastSeenISO) return 'Dernière connexion inconnue';
    const diffMs = Date.now() - new Date(lastSeenISO).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return 'À l’instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    if (diffMinutes < 1440) return `Il y a ${Math.floor(diffMinutes / 60)} h`;
    return `Le ${new Date(lastSeenISO).toLocaleDateString()}`;
  };

  const filteredConversations = (displayConversations || []).filter(conv =>
    conv?.friend && `${conv.friend.first_name || ''} ${conv.friend.last_name || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-2 md:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">Messages</h1>
                  <div className="p-1 md:p-2 text-green-500">
          <div className="w-4 md:w-5 h-4 md:h-5 animate-pulse">🟢</div>
        </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 md:w-4 h-3 md:h-4" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-1 md:py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-1 md:p-2">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-4 md:py-8">
            <MessageSquare className="w-6 md:w-8 h-6 md:h-8 text-gray-400 mx-auto mb-2 md:mb-4" />
            <p className="text-gray-500 text-xs md:text-sm">Aucune conversation trouvée</p>
          </div>
        ) : (
          <div className="space-y-1 md:space-y-1 p-1 md:p-2">
            {filteredConversations.map(conv => (
              <button
                key={conv?.friend?.id || Math.random()}
                onClick={() => handleSelectConversation(conv?.friend?.id)}
                className={`w-full p-2 md:p-3 rounded-xl flex items-center space-x-2 md:space-x-3 hover:bg-gray-50 transition-colors duration-200 ${
                  selectedConversation?.friend?.id === conv?.friend?.id ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                <div className={`w-10 md:w-12 h-10 md:h-12 ${getAvatarColor(conv?.friend?.first_name || '', conv?.friend?.last_name || '')} rounded-full flex items-center justify-center text-xs md:text-sm font-bold text-white relative`}>
                  {getAvatar(conv?.friend?.first_name || '', conv?.friend?.last_name || '')}
                  <span
                    className={`absolute -bottom-0.5 md:-bottom-0.5 -right-0.5 md:-right-0.5 w-2 md:w-3 h-2 md:h-3 rounded-full border-2 border-white ${
                      userStatuses[conv?.friend?.id] === 'online' ? 'bg-green-500' : 'bg-gray-500'
                    }`}
                    title={userStatuses[conv?.friend?.id] === 'online'
                      ? 'En ligne'
                      : `Dernière connexion : ${getLastSeenText(lastSeen?.[conv?.friend?.id])}`}
                    onClick={() => console.log(`MessageList - ID: ${conv?.friend?.id}, Status: ${userStatuses?.[conv?.friend?.id]}, Last Seen: ${lastSeen?.[conv?.friend?.id]}, Friend Object:`, conv?.friend)}
                  />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">
                      {conv?.friend?.first_name || ''} {conv?.friend?.last_name || ''}
                    </p>
                    <span className="text-xs text-gray-500">
                      {conv?.lastMessage ? new Date(conv.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {conv?.lastMessage
                      ? conv.lastMessage.type === 'text'
                        ? conv.lastMessage.content
                        : conv.lastMessage.type === 'audio'
                        ? '🎵 Message vocal'
                        : '📎 Fichier'
                      : 'Aucun message'}
                  </p>
                </div>
                {conv?.unreadCount > 0 && (
                  <span className="px-1 md:px-2 py-0.5 md:py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;