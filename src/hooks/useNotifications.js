import { useState, useEffect, useCallback } from "react";
import { usePusher } from "./usePusher";
import { toast } from "react-toastify";

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { listenToNotifications } = usePusher(userId);

  // Ajouter une nouvelle notification
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Afficher une notification toast
    showNotificationToast(notification);
  }, []);

  // Marquer comme lue
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, is_read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Écouter les nouvelles notifications
  useEffect(() => {
    if (!userId) return;

    listenToNotifications((data) => {
      addNotification(data);
    });
  }, [userId, listenToNotifications, addNotification]);

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
  toast.info(notification.message || notification.title, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};
