// Configuration Pusher
export const PUSHER_CONFIG = {
  appKey: import.meta.env.VITE_PUSHER_APP_KEY || "76a687ce58f17f3aa97a",
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || "eu",
  encrypted: true,
  authEndpoint: `${
    import.meta.env.VITE_API_URL || "http://192.168.1.4:8000"
  }/broadcasting/auth`,
};

// Types d'événements Pusher
export const PUSHER_EVENTS = {
  // Posts
  NEW_POST: "new-post",

  // Messages
  NEW_MESSAGE: "new-message",
  MESSAGE_READ: "message-read",

  // Notifications
  NEW_NOTIFICATION: "new-notification",
  NOTIFICATION_READ: "notification-read",

  // Appels
  NEW_CALL: "new-call",
  CALL_ACCEPTED: "call-accepted",
  CALL_REJECTED: "call-rejected",
  CALL_ENDED: "call-ended",

  // Statut utilisateur
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline",

  // Amis
  FRIEND_REQUEST: "friend-request",
  FRIEND_ACCEPTED: "friend-accepted",
  FRIEND_REJECTED: "friend-rejected",
};

// Canaux Pusher
export const PUSHER_CHANNELS = {
  // Canaux publics
  POSTS: "posts",
  USER_STATUS: "user-status",

  // Canaux privés (préfixés par 'private-')
  NOTIFICATIONS: "notifications",
  MESSAGES: "messages",
  CALLS: "calls",
  FRIENDS: "friends",
};

// Fonction pour générer les noms de canaux privés
export const getPrivateChannelName = (channelType, userId) => {
  return `${PUSHER_CHANNELS[channelType.toUpperCase()]}.${userId}`;
};

// Fonction pour générer les noms de canaux publics temporaires
export const getPublicChannelName = (channelType, userId) => {
  return `${channelType}-${userId}`;
};
