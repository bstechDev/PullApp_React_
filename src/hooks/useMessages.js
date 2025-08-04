import { useState, useEffect } from "react";
import pusherService from "../services/pusherService";

export const useMessages = (userId) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!userId) return;

    try {
      // Se connecter au canal des messages (canal public temporaire)
      const messagesChannel = pusherService.subscribeToPublicChannel(
        `messages-${userId}`
      );

      // Écouter les nouveaux messages
      messagesChannel.bind("new-message", (data) => {
        console.log("💬 Nouveau message reçu:", data);
        setMessages((prev) => [...prev, data]);
      });

      // Nettoyer à la déconnexion
      return () => {
        pusherService.unsubscribeFromChannel(`messages-${userId}`);
      };
    } catch (error) {
      console.error("Erreur lors de la connexion aux messages:", error);
    }
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

  return {
    messages,
    addMessage,
    updateMessage,
    removeMessage,
  };
};
