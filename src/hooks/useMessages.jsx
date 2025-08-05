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
  const [messagesCache, setMessagesCache] = useState(new Map()); // Cache des messages par conversation

  const loadConversations = useCallback(async () => {
    if (!user || friendsLoading) return;

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

    setLoading(true);
    try {
      const conversationPromises = friendsToUse.map(async (friend) => {
        try {
          const history = await messagesService.getMessageHistory(friend.id);
          const unreadCount = history.filter(msg => !msg.is_read && msg.sender_id === friend.id).length;
          return {
            friend,
            lastMessage: history.length > 0 ? history[history.length - 1] : null,
            unreadCount,
          };
        } catch (err) {
          console.error(`Erreur pour l'ami ${friend.id}:`, err);
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
      setError('Erreur lors du chargement des conversations');
      console.error('Erreur globale loadConversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user, friendsList, friendsLoading]);

  const loadMessages = useCallback(async (id) => {
    if (!user || !id) return;
    
    // Vérifier le cache d'abord
    if (messagesCache.has(id)) {
      setMessages(messagesCache.get(id));
      return;
    }
    
    try {
      const history = await messagesService.getMessageHistory(id);
      setMessages(history);
      
      // Mettre en cache les messages
      setMessagesCache(prev => new Map(prev).set(id, history));
      
      if (history.some(msg => !msg.is_read && msg.sender_id !== user.id)) {
        await messagesService.markMessagesAsRead(id);
      }
    } catch (err) {
      setError('Erreur lors du chargement des messages');
      console.error('Erreur loadMessages:', err);
    }
  }, [user, messagesCache]);

  const sendTextMessage = useCallback(async (receiverId, content) => {
    try {
      const response = await messagesService.sendTextMessage(receiverId, content);
      const newMessage = response.data;
      
      setMessages(prev => [...prev, newMessage]);
      
      // Mettre à jour le cache
      setMessagesCache(prev => {
        const newCache = new Map(prev);
        const cachedMessages = newCache.get(receiverId) || [];
        newCache.set(receiverId, [...cachedMessages, newMessage]);
        return newCache;
      });
      
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
      setMessages(prev => [...prev, response.data]);
      setConversations(prev =>
        prev.map(conv =>
          conv.friend.id === receiverId
            ? { ...conv, lastMessage: response.data, unreadCount: 0 }
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
      setMessages(prev => [...prev, response.data]);
      setConversations(prev =>
        prev.map(conv =>
          conv.friend.id === receiverId
            ? { ...conv, lastMessage: response.data, unreadCount: 0 }
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

  // Fonction pour ajouter un nouveau message reçu via Pusher
  const addNewMessage = useCallback((newMessage) => {
    console.log('📨 Ajout du nouveau message dans useMessages:', newMessage);
    
    // Ajouter le message à la liste des messages si c'est la conversation actuelle
    if (selectedConversation && newMessage.sender_id === selectedConversation.friend.id) {
      setMessages(prev => [...prev, newMessage]);
      
      // Mettre à jour le cache
      setMessagesCache(prev => {
        const newCache = new Map(prev);
        const cachedMessages = newCache.get(selectedConversation.friend.id) || [];
        newCache.set(selectedConversation.friend.id, [...cachedMessages, newMessage]);
        return newCache;
      });
    }
    
    // Mettre à jour la liste des conversations
    setConversations(prev =>
      prev.map(conv => {
        if (conv.friend.id === newMessage.sender_id) {
          return {
            ...conv,
            lastMessage: newMessage,
            unreadCount: conv.unreadCount + 1
          };
        }
        return conv;
      })
    );
  }, [selectedConversation]);

  useEffect(() => {
    if (user && friendsList && !friendsLoading) {
      loadConversations();
    }
    if (receiverId && user) {
      const conv = conversations.find(c => c.friend.id === receiverId);
      setSelectedConversation(conv || null);
      if (conv) loadMessages(receiverId);
    }
  }, [loadConversations, user, friendsList, friendsLoading, receiverId]);

  // Polling temporaire pour les nouveaux messages (en attendant Pusher backend)
  useEffect(() => {
    if (!user?.id || !selectedConversation) return;

    const checkNewMessages = async () => {
      try {
        const history = await messagesService.getMessageHistory(selectedConversation.friend.id);
        
        // Comparer avec les messages actuels
        const currentMessageIds = new Set(messages.map(msg => msg.id));
        const newMessages = history.filter(msg => !currentMessageIds.has(msg.id));
        
        if (newMessages.length > 0) {
          console.log('🔄 Polling - Nouveaux messages détectés:', newMessages);
          
          // Ajouter les nouveaux messages
          setMessages(prev => [...prev, ...newMessages]);
          
          // Mettre à jour le cache
          setMessagesCache(prev => {
            const newCache = new Map(prev);
            const cachedMessages = newCache.get(selectedConversation.friend.id) || [];
            newCache.set(selectedConversation.friend.id, [...cachedMessages, ...newMessages]);
            return newCache;
          });
          
          // Marquer comme lu si nécessaire
          const unreadMessages = newMessages.filter(msg => !msg.is_read && msg.sender_id !== user.id);
          if (unreadMessages.length > 0) {
            await messagesService.markMessagesAsRead(selectedConversation.friend.id);
          }
        }
      } catch (err) {
        console.error('Erreur lors du polling des messages:', err);
      }
    };

    // Vérifier toutes les 3 secondes
    const interval = setInterval(checkNewMessages, 3000);
    
    return () => clearInterval(interval);
  }, [user?.id, selectedConversation, messages]);

  return {
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    loading,
    error,
    sendTextMessage,
    sendFileMessage,
    sendAudioMessage,
    loadMessages,
    downloadFile,
    isMyMessage,
    addNewMessage,
    reload: loadConversations,
  };
};