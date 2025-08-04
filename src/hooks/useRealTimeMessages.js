import { useState, useEffect } from "react";
import pusherService from "../services/pusherService";

export const useRealTimeMessages = (userId) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const setupMessagesChannel = async () => {
      try {
        // Attendre que Pusher soit initialisé
        await pusherService.waitForInitialization();

        // Se connecter au canal des messages (canal public temporaire)
        const messagesChannel = pusherService.subscribeToPublicChannel(
          `messages-${userId}`
        );

        // Écouter les nouveaux messages
        messagesChannel.bind("new-message", (data) => {
          console.log("💬 Nouveau message reçu:", data);
          setMessages((prev) => [...prev, data]);
        });

        // Écouter les messages marqués comme lus
        messagesChannel.bind("message-read", (data) => {
          console.log("👁️ Message marqué comme lu:", data);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === data.message_id ? { ...msg, is_read: true } : msg
            )
          );
        });

        // Nettoyer à la déconnexion
        return () => {
          pusherService.unsubscribeFromChannel(`messages-${userId}`);
        };
      } catch (error) {
        console.error("Erreur lors de la connexion aux messages:", error);
      }
    };

    setupMessagesChannel();
  }, [userId]);

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const updateMessage = (messageId, updates) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  };

  const removeMessage = (messageId) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  const markMessageAsRead = (messageId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, is_read: true } : msg
      )
    );
  };

  return {
    messages,
    addMessage,
    updateMessage,
    removeMessage,
    markMessageAsRead,
  };
};
