import { useEffect, useRef, useCallback } from "react";
import pusherService from "../services/pusherService";

export const usePusher = (userId) => {
  const channelsRef = useRef(new Map());

  // Écouter les notifications
  const listenToNotifications = useCallback(
    (callback) => {
      if (!userId) return;

      const channel = pusherService.listenToNotifications(userId, callback);
      channelsRef.current.set("notifications", channel);
    },
    [userId]
  );

  // Écouter les messages
  const listenToMessages = useCallback(
    (callback) => {
      if (!userId) return;

      const channel = pusherService.listenToMessages(userId, callback);
      channelsRef.current.set("messages", channel);
    },
    [userId]
  );

  // Écouter les appels
  const listenToCalls = useCallback(
    (callback) => {
      if (!userId) return;

      const channel = pusherService.listenToCalls(userId, callback);
      channelsRef.current.set("calls", channel);
    },
    [userId]
  );

  // Écouter les posts
  const listenToPosts = useCallback((callback) => {
    const channel = pusherService.listenToPosts(callback);
    channelsRef.current.set("posts", channel);
  }, []);

  // Écouter le statut des utilisateurs
  const listenToUserStatus = useCallback((callback) => {
    const channel = pusherService.listenToUserStatus(callback);
    channelsRef.current.set("user-status", channel);
  }, []);

  // Nettoyer les abonnements
  const cleanup = useCallback(() => {
    channelsRef.current.forEach((channel, key) => {
      pusherService.unsubscribe(channel.name);
    });
    channelsRef.current.clear();
  }, []);

  // Nettoyer à la destruction du composant
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    listenToNotifications,
    listenToMessages,
    listenToCalls,
    listenToPosts,
    listenToUserStatus,
    cleanup,
    connectionState: pusherService.getConnectionState(),
  };
};
