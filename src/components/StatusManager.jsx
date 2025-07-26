import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUserStatusContext } from '../contexts';
import { useAuth } from '../features/auth/contexts/AuthContext';

export function StatusManager() {
  const location = useLocation();
  const { sendHeartbeat, isOnline } = useUserStatusContext();
  const { user } = useAuth();

  useEffect(() => {
    // N'envoyer le heartbeat que si l'utilisateur est connecté et en ligne
    if (user && isOnline) {
      const timeoutId = setTimeout(() => {
        sendHeartbeat();
      }, 1000); // Attendre 1 seconde après le changement de route

      return () => clearTimeout(timeoutId);
    }
  }, [location, sendHeartbeat, user, isOnline]);

  return null;
} 