import { useState, useEffect } from "react";
import pusherService from "../services/pusherService";

export const useUserStatus = () => {
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [offlineUsers, setOfflineUsers] = useState(new Set());

  useEffect(() => {
    const setupStatusChannel = async () => {
      try {
        // Attendre que Pusher soit initialisé
        await pusherService.waitForInitialization();

        // Se connecter au canal de statut
        const statusChannel =
          pusherService.subscribeToPublicChannel("user-status");

        // Écouter les changements de statut
        statusChannel.bind("user-online", (data) => {
          console.log("🟢 Utilisateur en ligne:", data);
          setOnlineUsers((prev) => new Set([...prev, data.user_id]));
          setOfflineUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.user_id);
            return newSet;
          });
        });

        statusChannel.bind("user-offline", (data) => {
          console.log("🔴 Utilisateur hors ligne:", data);
          setOfflineUsers((prev) => new Set([...prev, data.user_id]));
          setOnlineUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.user_id);
            return newSet;
          });
        });

        // Nettoyer à la déconnexion
        return () => {
          pusherService.unsubscribeFromChannel("user-status");
        };
      } catch (error) {
        console.error(
          "Erreur lors de la connexion au statut utilisateur:",
          error
        );
      }
    };

    setupStatusChannel();
  }, []);

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const isUserOffline = (userId) => {
    return offlineUsers.has(userId);
  };

  const getOnlineUsersCount = () => {
    return onlineUsers.size;
  };

  const getOfflineUsersCount = () => {
    return offlineUsers.size;
  };

  return {
    onlineUsers,
    offlineUsers,
    isUserOnline,
    isUserOffline,
    getOnlineUsersCount,
    getOfflineUsersCount,
  };
};
