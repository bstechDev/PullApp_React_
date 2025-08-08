import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { adminService } from '../services/adminService';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPermissions, setAdminPermissions] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    const checkAdminStatus = () => {
      if (user && user.role === 'admin') {
        setIsAdmin(true);
        // Charger les permissions admin si nécessaire
        loadAdminPermissions();
      } else {
        setIsAdmin(false);
        setAdminPermissions([]);
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  const loadAdminPermissions = async () => {
    try {
      // Ici on peut charger des permissions spécifiques si nécessaire
      const permissions = ['users.manage', 'content.moderate', 'analytics.view', 'reports.generate'];
      setAdminPermissions(permissions);
    } catch (error) {
      console.error('Erreur lors du chargement des permissions admin:', error);
    }
  };

  const hasPermission = (permission) => {
    return isAdmin && adminPermissions.includes(permission);
  };

  const loadAdminStats = async () => {
    try {
      const stats = await adminService.getDashboardStats();
      setAdminStats(stats);
      return stats;
    } catch (error) {
      console.error('Erreur lors du chargement des stats admin:', error);
      throw error;
    }
  };

  const value = {
    isAdmin,
    adminPermissions,
    adminStats,
    hasPermission,
    loadAdminStats,
    loading
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin doit être utilisé à l\'intérieur d\'un AdminProvider');
  }
  return context;
};
