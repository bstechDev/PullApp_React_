import api from "../../../services/api";

export const adminService = {
  // ===== DASHBOARD & STATISTIQUES =====
  getDashboardStats: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  // ===== GESTION DES UTILISATEURS =====
  getAllUsers: async (params = {}) => {
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  createAdmin: async (adminData) => {
    const response = await api.post("/admin/create-admin", adminData);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  toggleBanUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/toggle-ban`);
    return response.data;
  },

  changeUserPassword: async (userId, passwordData) => {
    const response = await api.post(
      `/admin/users/${userId}/change-password`,
      passwordData
    );
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // ===== MODÉRATION DE CONTENU =====
  getModerationPosts: async (params = {}) => {
    const response = await api.get("/admin/moderation/posts", { params });
    return response.data;
  },

  moderatePost: async (postId, action, reason = null) => {
    const data = {
      action: action,
    };

    if (reason) {
      data.reason = reason;
    }

    const response = await api.post(
      `/admin/moderation/posts/${postId}/moderate`,
      data
    );
    return response.data;
  },

  moderateComment: async (commentId, action, reason = null) => {
    const data = {
      action: action,
    };

    if (reason) {
      data.reason = reason;
    }

    const response = await api.post(
      `/admin/moderation/comments/${commentId}/moderate`,
      data
    );
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await api.delete(`/admin/moderation/posts/${postId}`);
    return response.data;
  },

  getModerationComments: async (params = {}) => {
    const response = await api.get("/admin/moderation/comments", { params });
    return response.data;
  },

  approveComment: async (commentId) => {
    const response = await api.post(
      `/admin/moderation/comments/${commentId}/approve`
    );
    return response.data;
  },

  rejectComment: async (commentId, reason) => {
    const response = await api.post(
      `/admin/moderation/comments/${commentId}/reject`,
      { reason }
    );
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(
      `/admin/moderation/comments/${commentId}`
    );
    return response.data;
  },

  getReports: async (params = {}) => {
    const response = await api.get("/admin/moderation/reports", { params });
    return response.data;
  },

  resolveReport: async (reportId, action) => {
    const response = await api.post(
      `/admin/moderation/reports/${reportId}/resolve`,
      { action }
    );
    return response.data;
  },

  // ===== STATISTIQUES DE MODÉRATION =====
  getModerationStats: async () => {
    const response = await api.get("/admin/moderation/stats");
    return response.data;
  },

  // ===== GESTION DES RELATIONS =====
  getRelationsDashboard: async () => {
    const response = await api.get("/admin/relations/dashboard");
    return response.data;
  },

  getFriendshipsList: async (params = {}) => {
    const response = await api.get("/admin/relations/friendships", { params });
    return response.data;
  },

  moderateFriendship: async (friendshipId, action) => {
    const response = await api.post(
      `/admin/relations/friendships/${friendshipId}/moderate`,
      {
        action: action,
      }
    );
    return response.data;
  },

  getBlocksList: async (params = {}) => {
    const response = await api.get("/admin/relations/blocks", { params });
    return response.data;
  },

  createBlock: async (blockData) => {
    const response = await api.post("/admin/relations/blocks", blockData);
    return response.data;
  },

  moderateBlock: async (blockId, action) => {
    const response = await api.post(
      `/admin/relations/blocks/${blockId}/moderate`,
      {
        action: action,
      }
    );
    return response.data;
  },

  getFriendSuggestions: async (params = {}) => {
    const response = await api.get("/admin/relations/suggestions", { params });
    return response.data;
  },

  getUserStatistics: async (userId) => {
    const response = await api.get(
      `/admin/relations/users/${userId}/statistics`
    );
    return response.data;
  },

  performMassActions: async (actions) => {
    const response = await api.post("/admin/relations/mass-actions", actions);
    return response.data;
  },
};
