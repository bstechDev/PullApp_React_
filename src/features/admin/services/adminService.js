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

  // Nouveau: traiter un signalement (resolve, dismiss, escalate)
  processReport: async (reportId, action, adminNote = "") => {
    const response = await api.post(
      `/admin/moderation/reports/${reportId}/process`,
      { action, admin_note: adminNote }
    );
    return response.data;
  },

  // Compatibilité éventuelle (alias vers processReport)
  resolveReport: async (reportId, action, adminNote = "") => {
    const response = await api.post(
      `/admin/moderation/reports/${reportId}/process`,
      { action, admin_note: adminNote }
    );
    return response.data;
  },

  // ===== STATISTIQUES DE MODÉRATION =====
  getModerationStats: async () => {
    const response = await api.get("/admin/moderation/stats");
    return response.data;
  },

  // Nouveau: Dashboard de modération
  getModerationDashboard: async () => {
    const response = await api.get("/admin/moderation/dashboard");
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

  // ===== ANALYTICS =====
  getAnalyticsDashboard: async () => {
    const response = await api.get("/admin/analytics/dashboard");
    return response.data;
  },

  getUserEvolution: async (period = 30) => {
    const response = await api.get(
      `/admin/analytics/user-evolution?period=${period}`
    );
    return response.data;
  },

  getActivityCharts: async (period = 7) => {
    const response = await api.get(
      `/admin/analytics/activity-charts?period=${period}`
    );
    return response.data;
  },

  getDemographics: async () => {
    const response = await api.get("/admin/analytics/demographics");
    return response.data;
  },

  getContentStats: async () => {
    const response = await api.get("/admin/analytics/content-stats");
    return response.data;
  },

  getAnalyticsModerationStats: async () => {
    const response = await api.get("/admin/analytics/moderation-stats");
    return response.data;
  },

  exportAnalyticsData: async (exportParams = {}) => {
    const response = await api.post("/admin/analytics/export", exportParams);
    return response.data;
  },

  getPeriodicReports: async (period = "weekly", date = null) => {
    const params = { period };
    if (date) params.date = date;
    const response = await api.get("/admin/analytics/periodic-reports", {
      params,
    });
    return response.data;
  },

  getPerformanceMetrics: async () => {
    const response = await api.get("/admin/analytics/performance-metrics");
    return response.data;
  },

  // ===== CONFIGURATION SYSTÈME =====

  // Dashboard système
  getSystemDashboard: async () => {
    const response = await api.get("/admin/system/dashboard");
    return response.data;
  },

  // Paramètres système
  getSystemSettings: async () => {
    const response = await api.get("/admin/system/settings");
    return response.data;
  },

  updateSystemSettings: async (settings) => {
    const response = await api.post("/admin/system/settings", { settings });
    return response.data;
  },

  // Mode maintenance
  getMaintenanceStatus: async () => {
    const response = await api.post("/admin/system/maintenance", {
      action: "status",
    });
    return response.data;
  },

  enableMaintenanceMode: async (maintenanceData) => {
    const response = await api.post("/admin/system/maintenance", {
      action: "enable",
      ...maintenanceData,
    });
    return response.data;
  },

  disableMaintenanceMode: async () => {
    const response = await api.post("/admin/system/maintenance", {
      action: "disable",
    });
    return response.data;
  },

  // Notifications globales
  createGlobalNotification: async (notificationData) => {
    const response = await api.post("/admin/system/notifications", {
      action: "create",
      ...notificationData,
    });
    return response.data;
  },

  listGlobalNotifications: async () => {
    const response = await api.post("/admin/system/notifications", {
      action: "list",
    });
    return response.data;
  },

  updateGlobalNotification: async (notificationData) => {
    const response = await api.post("/admin/system/notifications", {
      action: "update",
      ...notificationData,
    });
    return response.data;
  },

  deleteGlobalNotification: async (notificationId) => {
    const response = await api.post("/admin/system/notifications", {
      action: "delete",
      id: notificationId,
    });
    return response.data;
  },

  // Sauvegardes
  createBackup: async (backupData) => {
    const response = await api.post("/admin/system/backups", {
      action: "create",
      ...backupData,
    });
    return response.data;
  },

  listBackups: async () => {
    const response = await api.post("/admin/system/backups", {
      action: "list",
    });
    return response.data;
  },

  downloadBackup: async (backupId) => {
    const response = await api.post("/admin/system/backups", {
      action: "download",
      id: backupId,
    });
    return response.data;
  },

  deleteBackup: async (backupId) => {
    const response = await api.post("/admin/system/backups", {
      action: "delete",
      id: backupId,
    });
    return response.data;
  },

  // ===== GESTION DES RÔLES ET PERMISSIONS =====

  // Dashboard des rôles
  getRolesDashboard: async () => {
    const response = await api.get("/admin/roles/dashboard");
    return response.data;
  },

  // Gestion des rôles
  getAllRoles: async (params = {}) => {
    const response = await api.get("/admin/roles", { params });
    return response.data;
  },

  getRoleById: async (roleId) => {
    const response = await api.get(`/admin/roles/${roleId}`);
    return response.data;
  },

  createRole: async (roleData) => {
    const response = await api.post("/admin/roles", roleData);
    return response.data;
  },

  updateRole: async (roleId, roleData) => {
    const response = await api.put(`/admin/roles/${roleId}`, roleData);
    return response.data;
  },

  deleteRole: async (roleId) => {
    const response = await api.delete(`/admin/roles/${roleId}`);
    return response.data;
  },

  // Gestion des permissions des rôles
  grantRolePermissions: async (roleId, permissions) => {
    const response = await api.post(`/admin/roles/${roleId}/permissions`, {
      action: "grant",
      permissions: permissions,
    });
    return response.data;
  },

  revokeRolePermissions: async (roleId, permissions) => {
    const response = await api.post(`/admin/roles/${roleId}/permissions`, {
      action: "revoke",
      permissions: permissions,
    });
    return response.data;
  },

  // Gestion des permissions
  getAllPermissions: async (params = {}) => {
    const response = await api.get("/admin/roles/permissions/list", { params });
    return response.data;
  },

  createPermission: async (permissionData) => {
    const response = await api.post(
      "/admin/roles/permissions/create",
      permissionData
    );
    return response.data;
  },

  // Gestion des rôles utilisateurs
  assignUserRoles: async (userId, roles, customPermissions = []) => {
    const response = await api.post(`/admin/roles/users/${userId}/roles`, {
      action: "assign",
      roles: roles,
      custom_permissions: customPermissions,
    });
    return response.data;
  },

  removeUserRoles: async (userId, roles) => {
    const response = await api.post(`/admin/roles/users/${userId}/roles`, {
      action: "remove",
      roles: roles,
    });
    return response.data;
  },

  getUserPermissions: async (userId) => {
    const response = await api.get(`/admin/roles/users/${userId}/permissions`);
    return response.data;
  },

  // Statistiques des rôles et permissions
  getRolesStatistics: async () => {
    const response = await api.get("/admin/roles/statistics/overview");
    return response.data;
  },
};
