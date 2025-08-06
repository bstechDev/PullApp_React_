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
          
          // Mettre à jour le cache des messages pour cette conversation
          setMessagesCache(prev => {
            const newCache = new Map(prev);
            newCache.set(friend.id, history);
            return newCache;
          });
          
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
    
    try {
      const history = await messagesService.getMessageHistory(id);
      
      // Vérifier s'il y a de nouveaux messages
      const currentMessageIds = new Set(messages.map(msg => msg.id));
      const newMessages = history.filter(msg => !currentMessageIds.has(msg.id));
      
      if (newMessages.length > 0) {
      }
      
      setMessages(history);
      
      // Mettre en cache les messages
      setMessagesCache(prev => new Map(prev).set(id, history));
      
      // Marquer comme lu si nécessaire
      const unreadMessages = history.filter(msg => !msg.is_read && msg.sender_id !== user.id);
      if (unreadMessages.length > 0) {
        await messagesService.markMessagesAsRead(id);
      }
    } catch (err) {
      setError('Erreur lors du chargement des messages');
      console.error('Erreur loadMessages:', err);
    }
  }, [user, messagesCache, messages]);

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
    // Vérifier si le message est pour la conversation actuelle
    const isCurrentConversation = selectedConversation && 
      (newMessage.sender_id === selectedConversation.friend.id || 
       newMessage.receiver_id === selectedConversation.friend.id ||
       receiverId === newMessage.sender_id);
    
    // Si c'est un message pour l'utilisateur actuel mais que la conversation n'est pas chargée
    if (newMessage.receiver_id === user?.id && !isCurrentConversation) {
      loadConversations();
      
      // Si on a un receiverId et que c'est la conversation actuelle, forcer le chargement
      if (receiverId && (newMessage.sender_id === receiverId || newMessage.receiver_id === receiverId)) {
        loadMessages(receiverId);
      }
    }
    
    // TOUJOURS ajouter le message à la liste des messages si c'est la conversation actuelle
    if (isCurrentConversation) {
      setMessages(prev => {
        // Vérifier si le message n'existe pas déjà
        const messageExists = prev.some(msg => msg.id === newMessage.id);
        if (messageExists) {
          return prev;
        }
        return [...prev, newMessage];
      });
      
      // Mettre à jour le cache
      setMessagesCache(prev => {
        const newCache = new Map(prev);
        const conversationId = selectedConversation.friend.id;
        const cachedMessages = newCache.get(conversationId) || [];
        
        // Vérifier si le message n'existe pas déjà dans le cache
        const messageExistsInCache = cachedMessages.some(msg => msg.id === newMessage.id);
        if (!messageExistsInCache) {
          newCache.set(conversationId, [...cachedMessages, newMessage]);
        }
        return newCache;
      });
      
      // Marquer automatiquement comme lu si c'est un message reçu
      if (newMessage.sender_id !== user?.id && !newMessage.is_read) {
        messagesService.markMessagesAsRead(selectedConversation.friend.id).catch(err => {
          console.error('Erreur lors du marquage comme lu:', err);
        });
      }
    }
    
    // Mettre à jour la liste des conversations (TOUJOURS)
    setConversations(prev =>
      prev.map(conv => {
        // Vérifier si le message concerne cette conversation
        const isThisConversation = conv.friend.id === newMessage.sender_id || 
                                 conv.friend.id === newMessage.receiver_id;
        
        if (isThisConversation) {
          return {
            ...conv,
            lastMessage: newMessage,
            unreadCount: newMessage.sender_id !== user?.id ? conv.unreadCount + 1 : conv.unreadCount
          };
        }
        return conv;
      })
    );
    
    // NOUVEAU : Mettre à jour le cache pour TOUTES les conversations concernées
    setMessagesCache(prev => {
      const newCache = new Map(prev);
      
      // Identifier la conversation concernée
      const conversationId = newMessage.sender_id === user?.id ? newMessage.receiver_id : newMessage.sender_id;
      
      if (conversationId) {
        const cachedMessages = newCache.get(conversationId) || [];
        const messageExistsInCache = cachedMessages.some(msg => msg.id === newMessage.id);
        
        if (!messageExistsInCache) {
          newCache.set(conversationId, [...cachedMessages, newMessage]);
        }
      }
      
      return newCache;
    });
  }, [selectedConversation, receiverId, user?.id, loadConversations, loadMessages]);

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

  // Polling temporaire pour les nouveaux messages (en attendant correction erreur 403)
  // ACTIVÉ - Backend Pusher a des problèmes d'authentification
  useEffect(() => {
    if (!user?.id) return;

    const checkNewMessages = async () => {
      try {
        // Vérifier les messages pour toutes les conversations, pas seulement la conversation actuelle
        const conversationPromises = conversations.map(async (conv) => {
          try {
            const history = await messagesService.getMessageHistory(conv.friend.id);
            
            // Comparer avec les messages actuels dans le cache
            const cachedMessages = messagesCache.get(conv.friend.id) || [];
            const currentMessageIds = new Set(cachedMessages.map(msg => msg.id));
            const newMessages = history.filter(msg => !currentMessageIds.has(msg.id));
            
            if (newMessages.length > 0) {
              // Mettre à jour le cache pour cette conversation
              setMessagesCache(prev => {
                const newCache = new Map(prev);
                newCache.set(conv.friend.id, history);
                return newCache;
              });
              
              // Si c'est la conversation actuelle, mettre à jour l'affichage
              if (selectedConversation && conv.friend.id === selectedConversation.friend.id) {
                setMessages(history);
              }
              
              // Mettre à jour la liste des conversations
              setConversations(prev =>
                prev.map(conversation => {
                  if (conversation.friend.id === conv.friend.id) {
                    return {
                      ...conversation,
                      lastMessage: history.length > 0 ? history[history.length - 1] : null,
                      unreadCount: history.filter(msg => !msg.is_read && msg.sender_id === conv.friend.id).length
                    };
                  }
                  return conversation;
                })
              );
              
              // Marquer comme lu si c'est la conversation actuelle
              if (selectedConversation && conv.friend.id === selectedConversation.friend.id) {
                const unreadMessages = newMessages.filter(msg => !msg.is_read && msg.sender_id !== user.id);
                if (unreadMessages.length > 0) {
                  await messagesService.markMessagesAsRead(conv.friend.id);
                }
              }
            }
          } catch (err) {
            console.error(`Erreur lors du polling pour ${conv.friend.first_name}:`, err);
          }
        });

        await Promise.all(conversationPromises);
      } catch (err) {
        console.error('Erreur lors du polling des messages:', err);
      }
    };

    // Vérifier toutes les 3 secondes
    const interval = setInterval(checkNewMessages, 3000);
    
    return () => clearInterval(interval);
  }, [user?.id, conversations, selectedConversation, messagesCache]);

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