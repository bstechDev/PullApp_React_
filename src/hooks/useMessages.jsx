// src/hooks/useMessages.jsx
import { useState, useEffect, useCallback } from 'react';
import { messagesService } from '../features/auth/services/messagesService';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { useFriends } from '../hooks/useFriends';

export const useMessages = () => {
  const { user } = useAuth();
  const { friendsList } = useFriends();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadConversations = useCallback(async () => {
    console.log('🔍 loadConversations appelé');
    console.log('👥 friendsList:', friendsList);
    
    // Correction : gérer le cas où friendsList est un objet avec une propriété 'friends'
    let actualFriendsList = [];
    
    if (Array.isArray(friendsList)) {
      actualFriendsList = friendsList;
    } else if (friendsList && Array.isArray(friendsList.friends)) {
      actualFriendsList = friendsList.friends;
      console.log('✅ Extraction du tableau friends:', actualFriendsList);
    } else {
      console.log('❌ friendsList invalide:', friendsList);
      setConversations([]);
      return;
    }
  
    // 🔍 DÉBOGAGE : Afficher tous les amis et leurs statuts
    console.log('📋 Tous les amis avec leurs statuts:');
    actualFriendsList.forEach((friend, index) => {
      console.log(`${index + 1}. ${friend.first_name} ${friend.last_name} - Statut: "${friend.friendship_status}"`);
    });
  
    const confirmedFriends = actualFriendsList.filter(friend => friend.friendship_status === 'friends');
    console.log('✅ Amis confirmés:', confirmedFriends);
  
    // Utiliser les amis confirmés, ou tous les amis pour le test
    const friendsToUse = confirmedFriends.length > 0 ? confirmedFriends : actualFriendsList;
    
    if (friendsToUse.length === 0) {
      console.log('⚠️ Aucun ami trouvé');
      setConversations([]);
      return;
    }
  
    setLoading(true);
    try {
      const conversationPromises = friendsToUse.map(async (friend) => {
        console.log('📨 Chargement messages pour:', friend.first_name, friend.last_name);
        try {
          const history = await messagesService.getMessageHistory(friend.id);
          const unreadCount = history.filter(msg => !msg.is_read && msg.sender_id === friend.id).length;
          return {
            friend,
            lastMessage: history.length > 0 ? history[history.length - 1] : null,
            unreadCount,
          };
        } catch (err) {
          console.log('❌ Erreur pour ami', friend.first_name, ':', err);
          return {
            friend,
            lastMessage: null,
            unreadCount: 0,
          };
        }
      });
  
      const convs = await Promise.all(conversationPromises);
      console.log('💬 Conversations chargées:', convs);
      setConversations(convs);
    } catch (err) {
      console.error('❌ Erreur loadConversations:', err);
      setError('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  }, [friendsList]);

  const loadMessages = useCallback(async (receiverId) => {
    setLoading(true);
    try {
      const history = await messagesService.getMessageHistory(receiverId);
      setMessages(history);
      if (history.some(msg => !msg.is_read && msg.sender_id !== user.id)) {
        await messagesService.markMessagesAsRead(receiverId);
      }
    } catch (err) {
      setError('Erreur lors du chargement des messages');
      console.error('Erreur loadMessages:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  const sendTextMessage = useCallback(async (receiverId, content) => {
    try {
      const response = await messagesService.sendTextMessage(receiverId, content);
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
      setError('Erreur lors de l\'envoi du message');
      console.error('Erreur sendTextMessage:', err);
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
      console.error('Erreur sendFileMessage:', err);
      throw err;
    }
  }, []);

  const downloadFile = useCallback(async (receiverId, messageId, fileName) => {
    try {
      const blob = await messagesService.downloadFile(receiverId, messageId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erreur lors du téléchargement du fichier');
      console.error('Erreur downloadFile:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    console.log('🔄 useEffect useMessages - friendsList changé:', friendsList);
    if (user && friendsList) {
      loadConversations();
    }
  }, [loadConversations, user]);

  return {
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    loading,
    error,
    sendTextMessage,
    sendFileMessage,
    loadMessages,
    downloadFile,
    reload: loadConversations,
  };
};
