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
    setLoading(true);
    try {
      const history = await messagesService.getMessageHistory(id);
      setMessages(history);
      if (history.some(msg => !msg.is_read && msg.sender_id !== user.id)) {
        await messagesService.markMessagesAsRead(id);
      }
    } catch (err) {
      setError('Erreur lors du chargement des messages');
      console.error('Erreur loadMessages:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

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
    reload: loadConversations,
  };
};