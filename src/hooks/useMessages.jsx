import { useState, useEffect, useCallback } from 'react';
import { messagesService } from '../features/auth/services/messagesService';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { useFriends } from '../hooks/useFriends';

export const useMessages = (receiverId = null) => {
  const { user } = useAuth();
  const { friendsList, loading: friendsLoading, error: friendsError } = useFriends();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messagesCache, setMessagesCache] = useState(new Map()); // Cache pour les messages
  const [conversationsLoading, setConversationsLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    console.log('🔄 loadConversations appelé');
    if (!user || friendsLoading) {
      console.log('❌ loadConversations annulé: user ou friendsLoading manquant');
      return;
    }

    let actualFriendsList = [];
    if (Array.isArray(friendsList)) {
      actualFriendsList = friendsList;
    } else if (friendsList && Array.isArray(friendsList.friends)) {
      actualFriendsList = friendsList.friends;
    } else {
      setConversations([]);
      return;
    }

    const confirmedFriends = actualFriendsList.filter(friend => friend.friendship_status === 'friends');
    const friendsToUse = confirmedFriends.length > 0 ? confirmedFriends : actualFriendsList;

    if (friendsToUse.length === 0) {
      setConversations([]);
      return;
    }

    // Créer des conversations avec historique de messages
    setConversationsLoading(true);
    try {
      const conversationPromises = friendsToUse.map(async (friend) => {
        try {
          const history = await messagesService.getMessageHistory(friend.id);
          
          const unreadCount = history.filter(msg => !msg.is_read && msg.sender_id === friend.id).length;
          
          // Mettre en cache les messages pour chaque conversation
          setMessagesCache(prev => new Map(prev.set(friend.id, history)));
          
          return {
            friend,
            lastMessage: history.length > 0 ? history[history.length - 1] : null,
            unreadCount,
          };
        } catch (err) {
          console.error(`Erreur pour l'ami ${friend.id}:`, err);
          // Retourner quand même une conversation même sans historique
          return {
            friend,
            lastMessage: null,
            unreadCount: 0,
          };
        }
      });

      const convs = await Promise.all(conversationPromises);
      setConversations(convs);
    } catch (err) {
      console.error('❌ Erreur globale loadConversations:', err);
      setError('Erreur lors du chargement des conversations');
    } finally {
      setConversationsLoading(false);
    }
  }, [user, friendsList, friendsLoading]);

  const loadMessages = useCallback(async (id) => {
    if (!user || !id) return;
    
    // Vérifier d'abord le cache
    const cachedMessages = messagesCache.get(id);
    if (cachedMessages) {
      setMessages(cachedMessages);
      // Marquer comme lu en arrière-plan
      if (cachedMessages.some(msg => !msg.is_read && msg.sender_id !== user.id)) {
        messagesService.markMessagesAsRead(id).catch(console.error);
      }
      return;
    }
    
    // Si pas en cache, charger depuis l'API
    setLoading(true);
    try {
      const history = await messagesService.getMessageHistory(id);
      setMessages(history);
      // Mettre en cache
      setMessagesCache(prev => new Map(prev.set(id, history)));
      if (history.some(msg => !msg.is_read && msg.sender_id !== user.id)) {
        await messagesService.markMessagesAsRead(id);
      }
    } catch (err) {
      setError('Erreur lors du chargement des messages');
      console.error('Erreur loadMessages:', err);
    } finally {
      setLoading(false);
    }
  }, [user, messagesCache]);

  const sendTextMessage = useCallback(async (receiverId, content) => {
    try {
      const response = await messagesService.sendTextMessage(receiverId, content);
      const newMessage = response.data;
      
      // Mettre à jour les messages affichés
      setMessages(prev => [...prev, newMessage]);
      
      // Mettre à jour le cache
      setMessagesCache(prev => {
        const newCache = new Map(prev);
        const cachedMessages = newCache.get(receiverId) || [];
        newCache.set(receiverId, [...cachedMessages, newMessage]);
        return newCache;
      });
      
      // Mettre à jour les conversations
      setConversations(prev =>
        prev.map(conv =>
          conv.friend.id === receiverId
            ? { ...conv, lastMessage: newMessage, unreadCount: 0 }
            : conv
        )
      );
      return response;
    } catch (err) {
      setError('Erreur lors de l\'envoi du message');
      throw err;
    }
  }, []);

  const sendFileMessage = useCallback(async (receiverId, file) => {
    try {
      const response = await messagesService.sendFileMessage(receiverId, file);
      const newMessage = response.data;
      
      // Mettre à jour les messages affichés
      setMessages(prev => [...prev, newMessage]);
      
      // Mettre à jour le cache
      setMessagesCache(prev => {
        const newCache = new Map(prev);
        const cachedMessages = newCache.get(receiverId) || [];
        newCache.set(receiverId, [...cachedMessages, newMessage]);
        return newCache;
      });
      
      // Mettre à jour les conversations
      setConversations(prev =>
        prev.map(conv =>
          conv.friend.id === receiverId
            ? { ...conv, lastMessage: newMessage, unreadCount: 0 }
            : conv
        )
      );
      return response;
    } catch (err) {
      setError('Erreur lors de l\'envoi du fichier');
      throw err;
    }
  }, []);

  const sendAudioMessage = useCallback(async (receiverId, audioFile) => {
    try {
      const response = await messagesService.sendAudioMessage(receiverId, audioFile);
      const newMessage = response.data;
      
      // Mettre à jour les messages affichés
      setMessages(prev => [...prev, newMessage]);
      
      // Mettre à jour le cache
      setMessagesCache(prev => {
        const newCache = new Map(prev);
        const cachedMessages = newCache.get(receiverId) || [];
        newCache.set(receiverId, [...cachedMessages, newMessage]);
        return newCache;
      });
      
      // Mettre à jour les conversations
      setConversations(prev =>
        prev.map(conv =>
          conv.friend.id === receiverId
            ? { ...conv, lastMessage: newMessage, unreadCount: 0 }
            : conv
        )
      );
      return response;
    } catch (err) {
      setError('Erreur lors de l\'envoi de l\'audio');
      throw err;
    }
  }, []);

  const downloadFile = useCallback(async (messageId, fileName) => {
    try {
      const blob = await messagesService.downloadFile(messageId); // plus de receiverId
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `file_${messageId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erreur lors du téléchargement du fichier');
      throw err;
    }
  }, []);

  const isMyMessage = (message) => message.sender_id === user.id;

  // Chargement initial des conversations
  useEffect(() => {
    console.log('🔄 useEffect conversations - État:', {
      user: !!user,
      friendsListLength: friendsList?.length,
      friendsLoading,
      shouldLoad: !!(user && friendsList && !friendsLoading)
    });
    
    if (user && friendsList && !friendsLoading) {
      console.log('✅ Conditions remplies, chargement des conversations...');
      loadConversations();
    } else {
      console.log('❌ Conditions non remplies pour charger les conversations');
    }
  }, [user, friendsList, friendsLoading, loadConversations]);

  // Chargement forcé après un délai (fallback)
  useEffect(() => {
    if (user && friendsList && friendsList.length > 0 && conversations.length === 0) {
      const timer = setTimeout(() => {
        console.log('⏰ Chargement forcé des conversations après délai...');
        loadConversations();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user, friendsList, conversations.length, loadConversations]);

  // Préchargement des messages pour les conversations non visitées
  useEffect(() => {
    if (conversations.length > 0 && !conversationsLoading) {
      // Précharger les messages pour les 3 premières conversations
      const conversationsToPreload = conversations.slice(0, 3);
      conversationsToPreload.forEach(conv => {
        if (!messagesCache.has(conv.friend.id)) {
          // Charger en arrière-plan sans bloquer l'interface
          messagesService.getMessageHistory(conv.friend.id)
            .then(history => {
              setMessagesCache(prev => new Map(prev.set(conv.friend.id, history)));
            })
            .catch(console.error);
        }
      });
    }
  }, [conversations, conversationsLoading, messagesCache]);

  return {
    conversations,
    setConversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    loading: loading || conversationsLoading,
    error,
    sendTextMessage,
    sendFileMessage,
    sendAudioMessage,
    loadMessages,
    downloadFile,
    isMyMessage,
    reload: loadConversations,
  };
};