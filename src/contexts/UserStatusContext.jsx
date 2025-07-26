import React, { createContext, useContext, useEffect } from 'react';
import { useUserStatus } from '../hooks/useUserStatus';
import { useAuth } from '../features/auth/contexts/AuthContext';

const UserStatusContext = createContext(null);

export function UserStatusProvider({ children }) {
  const { user } = useAuth();
  const userStatus = useUserStatus();
  const { setOnline } = userStatus;

  useEffect(() => {
    if (!user) return;

    // Démarrer le statut en ligne au montage de l'app
    setOnline();

    // Gérer la fermeture de l'onglet/navigateur
    const handleBeforeUnload = () => {
      // Utiliser sendBeacon pour une requête fiable à la fermeture
      navigator.sendBeacon('/api/status/offline');
    };

    // Gérer la perte de visibilité de la page
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page cachée - ne pas appeler setOffline
        // Le système utilisera last_seen pour déterminer le statut
      } else {
        // Page visible - envoyer un heartbeat
        setOnline();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, setOnline]);

  return (
    <UserStatusContext.Provider value={userStatus}>
      {children}
    </UserStatusContext.Provider>
  );
}

export function useUserStatusContext() {
  const context = useContext(UserStatusContext);
  if (!context) {
    throw new Error('useUserStatusContext doit être utilisé à l\'intérieur d\'un UserStatusProvider');
  }
  return context;
} 