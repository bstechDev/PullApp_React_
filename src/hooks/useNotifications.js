import { useState, useEffect } from "react";
import pusherService from "../services/pusherService";
import { toast } from "react-toastify";

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const setupNotificationsChannel = async () => {
      try {
        // Attendre que Pusher soit initialisé
        await pusherService.waitForInitialization();

        // Se connecter au canal des notifications (canal public temporaire)
        const notificationsChannel = pusherService.subscribeToPublicChannel(
          `notifications-${userId}`
        );

        // Écouter les nouvelles notifications
        notificationsChannel.bind("new-notification", (data) => {
          console.log("📢 Nouvelle notification reçue:", data);
          setNotifications((prev) => [data, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Afficher une notification toast
          showNotificationToast(data);
        });

        // Nettoyer à la déconnexion
        return () => {
          pusherService.unsubscribeFromChannel(`notifications-${userId}`);
        };
      } catch (error) {
        console.error("Erreur lors de la connexion aux notifications:", error);
      }
    };

    setupNotificationsChannel();
  }, [userId]);

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
  };
};

// Fonction pour afficher les notifications toast
const showNotificationToast = (notification) => {
  const message =
    notification.message || notification.title || "Nouvelle notification";

  toast.info(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};
