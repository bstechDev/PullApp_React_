// src/features/friends/services/friendsService.js
import api from "../../../services/api";

export const friendsService = {
  async getAllUsers(page = 1) {
    try {
      // ✅ Vérifier l'authentification avant la requête
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("🔒 Token manquant pour getAllUsers");
        return {
          users: {
            data: [],
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 0,
          },
        };
      }

      const response = await api.get(`/users?page=${page}`);
      if (!response.data?.success) {
        throw new Error("Erreur lors de la récupération des utilisateurs");
      }
      return response.data;
    } catch (error) {
      // ✅ Gérer spécifiquement les erreurs 401
      if (error.response?.status === 401) {
        console.log(
          "🔒 Erreur 401 - Utilisateur non authentifié pour getAllUsers"
        );
        return {
          users: {
            data: [],
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 0,
          },
        };
      }
      console.error("Erreur getAllUsers:", error.response?.data || error);
      throw error;
    }
  },

  async getUserById(userId) {
    if (!userId) throw new Error("ID utilisateur requis");
    try {
      const response = await api.get(`/users/${userId}`);
      if (!response.data?.success) throw new Error("Utilisateur non trouvé");
      return response.data;
    } catch (error) {
      console.error("Erreur getUserById:", error.response?.data || error);
      throw error;
    }
  },

  async sendFriendRequest(userId) {
    if (!userId) throw new Error("ID requis");
    try {
      const response = await api.post(`/friends/request/${userId}`);
      console.log("✅ Demande d'ami envoyée:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur sendFriendRequest:", error.response?.data || error);
      throw error;
    }
  },

  async removeFriend(userId) {
    if (!userId) throw new Error("ID requis");
    try {
      const response = await api.delete(`/friends/${userId}`);
      console.log("✅ Ami supprimé:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur removeFriend:", error.response?.data || error);
      throw error;
    }
  },

  async acceptFriendRequest(userId) {
    if (!userId) throw new Error("ID requis");
    try {
      const response = await api.post(`/friends/accept/${userId}`);
      console.log("✅ Demande acceptée:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur acceptFriendRequest:",
        error.response?.data || error
      );
      throw error;
    }
  },

  async rejectFriendRequest(userId) {
    if (!userId) throw new Error("ID requis");
    try {
      const response = await api.post(`/friends/reject/${userId}`);
      console.log("✅ Demande refusée:", response.data);

      // ✅ IMPORTANT: Log pour debugger le statut retourné
      if (response.data && response.data.user) {
        console.log(
          "Nouveau statut après refus:",
          response.data.user.friendship_status
        );
      }

      return response.data;
    } catch (error) {
      console.error(
        "Erreur rejectFriendRequest:",
        error.response?.data || error
      );
      throw error;
    }
  },

  async cancelFriendRequest(userId) {
    // Utilise la même route que removeFriend côté backend
    return this.removeFriend(userId);
  },

  async getPendingFriendRequests() {
    try {
      // ✅ Vérifier l'authentification avant la requête
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("🔒 Token manquant pour getPendingFriendRequests");
        return [];
      }

      const response = await api.get("/friends/pending");
      return response.data.pending_requests || [];
    } catch (error) {
      // ✅ Gérer spécifiquement les erreurs 401
      if (error.response?.status === 401) {
        console.log(
          "🔒 Erreur 401 - Utilisateur non authentifié pour getPendingFriendRequests"
        );
        return [];
      }
      console.error(
        "Erreur getPendingFriendRequests:",
        error.response?.data || error
      );
      throw error;
    }
  },

  async getFriendsList() {
    try {
      const response = await api.get("/friends");
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn("Endpoint /friends absent, fallback /users");
        const users = await this.getAllUsers();
        return users.users.data.filter(
          (u) => u.friendship_status === "friends"
        );
      }
      throw error;
    }
  },

  filterUsersByFriendshipStatus(users, status) {
    return users.filter((u) => u.friendship_status === status);
  },

  searchUsers(users, searchTerm) {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.first_name?.toLowerCase().includes(term) ||
        u.last_name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
    );
  },
};
