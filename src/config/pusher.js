// Configuration Pusher
export const PUSHER_CONFIG = {
  appKey: "76a687ce58f17f3aa97a",
  cluster: "eu",
  encrypted: true,
  authEndpoint: `${
    import.meta.env.VITE_API_URL || "http://192.168.1.4:8000"
  }/api/broadcasting/auth`,
  auth: {
    headers: {
      "Content-Type": "application/json",
    },
  },
};

// Types d'événements Pusher
export const PUSHER_EVENTS = {
  // Notifications
  NEW_NOTIFICATION: "new-notification",
  NOTIFICATION_READ: "notification-read",

  // Messages
  NEW_MESSAGE: "new-message",
  MESSAGE_READ: "message-read",
  TYPING_START: "typing-start",
  TYPING_STOP: "typing-stop",

  // Appels
  NEW_CALL: "new-call",
  CALL_ACCEPTED: "call-accepted",
  CALL_REJECTED: "call-rejected",
  CALL_ENDED: "call-ended",

  // Posts
  NEW_POST: "new-post",
  POST_LIKED: "post-liked",
  POST_COMMENTED: "post-commented",

  // Statut utilisateur
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline",
  USER_TYPING: "user-typing",
};

// Canaux Pusher
export const PUSHER_CHANNELS = {
  NOTIFICATIONS: (userId) => `private-notifications.${userId}`,
  MESSAGES: (userId) => `private-messages.${userId}`,
  CALLS: (userId) => `private-calls.${userId}`,
  POSTS: "posts",
  USER_STATUS: "user-status",
};
