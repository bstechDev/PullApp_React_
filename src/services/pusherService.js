import Pusher from "pusher-js";
import { PUSHER_CONFIG } from "../config/pusher";

class PusherService {
  constructor() {
    this.pusher = new Pusher(PUSHER_CONFIG.appKey, {
      cluster: PUSHER_CONFIG.cluster,
      encrypted: PUSHER_CONFIG.encrypted,
      authEndpoint: PUSHER_CONFIG.authEndpoint,
      auth: {
        headers: {
          Authorization: `Bearer ${this.getToken()}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    });

    this.channels = new Map();
    this.setupGlobalListeners();
  }

  // Récupérer le token d'authentification
  getToken() {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    console.log(
      "🔑 Token récupéré pour Pusher:",
      token ? "Token présent" : "Aucun token"
    );
    return token;
  }

  // Configuration des listeners globaux
  setupGlobalListeners() {
    this.pusher.connection.bind("connected", () => {
      console.log("✅ Connexion Pusher établie");
    });

    this.pusher.connection.bind("disconnected", () => {
      console.log("❌ Connexion Pusher perdue");
    });

    this.pusher.connection.bind("error", (error) => {
      console.error("❌ Erreur Pusher:", error);
    });
  }

  // Écouter les notifications
  listenToNotifications(userId, callback) {
    const channelName = `private-notifications.${userId}`;
    const channel = this.pusher.subscribe(channelName);

    channel.bind("new-notification", (data) => {
      console.log("📢 Nouvelle notification reçue:", data);
      callback(data);
    });

    this.channels.set(channelName, channel);
    return channel;
  }

  // Écouter les messages
  listenToMessages(userId, callback) {
    const channelName = `private-messages.${userId}`;
    console.log(`🔌 Tentative de connexion au canal: ${channelName}`);

    const channel = this.pusher.subscribe(channelName);

    channel.bind("new-message", (data) => {
      console.log("💬 Nouveau message reçu:", data);
      callback(data);
    });

    channel.bind("pusher:subscription_succeeded", () => {
      console.log(`✅ Connexion réussie au canal: ${channelName}`);
    });

    channel.bind("pusher:subscription_error", (error) => {
      console.error(`❌ Erreur de connexion au canal ${channelName}:`, error);
    });

    this.channels.set(channelName, channel);
    return channel;
  }

  // Écouter les appels
  listenToCalls(userId, callback) {
    const channelName = `private-calls.${userId}`;
    const channel = this.pusher.subscribe(channelName);

    channel.bind("new-call", (data) => {
      console.log("📞 Nouvel appel reçu:", data);
      callback(data);
    });

    this.channels.set(channelName, channel);
    return channel;
  }

  // Écouter les nouveaux posts
  listenToPosts(callback) {
    const channelName = "posts";
    const channel = this.pusher.subscribe(channelName);

    channel.bind("new-post", (data) => {
      console.log("📝 Nouveau post reçu:", data);
      callback(data);
    });

    this.channels.set(channelName, channel);
    return channel;
  }

  // Écouter le statut des utilisateurs
  listenToUserStatus(callback) {
    const channelName = "user-status";
    const channel = this.pusher.subscribe(channelName);

    channel.bind("user-online", (data) => {
      console.log("🟢 Utilisateur en ligne:", data);
      callback(data);
    });

    channel.bind("user-offline", (data) => {
      console.log("🔴 Utilisateur hors ligne:", data);
      callback(data);
    });

    this.channels.set(channelName, channel);
    return channel;
  }

  // Se désabonner d'un canal
  unsubscribe(channelName) {
    if (this.channels.has(channelName)) {
      this.pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
      console.log(`🔇 Désabonné du canal: ${channelName}`);
    }
  }

  // Se désabonner de tous les canaux
  unsubscribeAll() {
    this.channels.forEach((channel, channelName) => {
      this.pusher.unsubscribe(channelName);
    });
    this.channels.clear();
    console.log("🔇 Désabonné de tous les canaux");
  }

  // Obtenir l'état de la connexion
  getConnectionState() {
    return this.pusher.connection.state;
  }

  // Forcer la reconnexion
  reconnect() {
    this.pusher.disconnect();
    setTimeout(() => {
      this.pusher.connect();
    }, 1000);
  }
}

// Instance singleton
const pusherService = new PusherService();
export default pusherService;
