import Pusher from "pusher-js";

class PusherService {
  constructor() {
    this.pusher = null;
    this.channels = new Map();
    this.isConnected = false;
  }

  // Initialiser Pusher avec authentification
  initialize() {
    if (this.pusher) {
      this.disconnect();
    }

    this.pusher = new Pusher(
      import.meta.env.VITE_PUSHER_APP_KEY || "76a687ce58f17f3aa97a",
      {
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || "eu",
        encrypted: true,
        // Désactiver temporairement l'authentification en attendant le backend
        // authEndpoint: `${import.meta.env.VITE_API_URL || 'http://192.168.1.4:8000'}/broadcasting/auth`,
        // auth: {
        //     headers: {
        //         'Authorization': `Bearer ${token}`,
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json',
        //     }
        // }
      }
    );

    // Écouter les événements de connexion
    this.pusher.connection.bind("connected", () => {
      console.log("✅ Pusher connecté");
      this.isConnected = true;
    });

    this.pusher.connection.bind("disconnected", () => {
      console.log("❌ Pusher déconnecté");
      this.isConnected = false;
    });

    this.pusher.connection.bind("error", (err) => {
      console.error("❌ Erreur Pusher:", err);
      this.handleConnectionError(err);
    });

    return this.pusher;
  }

  // Se connecter à un canal public
  subscribeToPublicChannel(channelName) {
    if (!this.pusher) {
      console.log("🔄 Initialisation automatique de Pusher...");
      this.initialize();
    }

    const channel = this.pusher.subscribe(channelName);
    this.channels.set(channelName, channel);
    return channel;
  }

  // Se connecter à un canal privé
  subscribeToPrivateChannel(channelName) {
    if (!this.pusher) {
      console.log("🔄 Initialisation automatique de Pusher...");
      this.initialize();
    }

    const channel = this.pusher.subscribe(`private-${channelName}`);
    this.channels.set(channelName, channel);

    // Gérer les erreurs d'authentification
    channel.bind("pusher:subscription_error", (error) => {
      this.handleAuthError(error);
    });

    return channel;
  }

  // Se déconnecter d'un canal
  unsubscribeFromChannel(channelName) {
    const channel = this.channels.get(channelName);
    if (channel) {
      this.pusher.unsubscribe(channelName);
      this.channels.delete(channelName);
    }
  }

  // Se déconnecter complètement
  disconnect() {
    if (this.pusher) {
      this.pusher.disconnect();
      this.channels.clear();
      this.isConnected = false;
    }
  }

  // Obtenir un canal
  getChannel(channelName) {
    return this.channels.get(channelName);
  }

  // Vérifier si Pusher est initialisé
  isInitialized() {
    return this.pusher !== null;
  }

  // Attendre que Pusher soit initialisé
  async waitForInitialization() {
    if (this.isInitialized()) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const checkInitialization = () => {
        if (this.isInitialized()) {
          resolve();
        } else {
          setTimeout(checkInitialization, 100);
        }
      };
      checkInitialization();
    });
  }

  // Gestion des erreurs de connexion
  handleConnectionError(error) {
    console.error("Erreur de connexion Pusher:", error);

    // Tentative de reconnexion
    setTimeout(() => {
      if (!this.isConnected) {
        console.log("Tentative de reconnexion...");
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
          this.initialize(token);
        }
      }
    }, 5000);
  }

  // Gestion des erreurs d'authentification
  handleAuthError(error) {
    console.error("Erreur d'authentification Pusher:", error);

    // Rediriger vers la page de connexion si le token est invalide
    if (error.status === 401) {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }
  }

  // Logs personnalisés
  logEvent(channelName, eventName, data) {
    console.log(`📡 [${channelName}] ${eventName}:`, data);
  }
}

export default new PusherService();
