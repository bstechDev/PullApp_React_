import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../features/auth/contexts/AuthContext';

const UserStatusContext = createContext(null);

export const UserStatusProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user } = useAuth();

  // Fonction pour envoyer un heartbeat
  const sendHeartbeat = async () => {
    if (!user?.id) return;

    try {
      // Ici vous pouvez ajouter une API pour envoyer le statut en ligne
      // Par exemple : await api.post('/user/heartbeat', { user_id: user.id });
      console.log('Heartbeat envoyé pour l\'utilisateur:', user.id);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du heartbeat:', error);
    }
  };

  // Surveiller la connectivité réseau
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Utilisateur en ligne');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Utilisateur hors ligne');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Envoyer un heartbeat périodique si l'utilisateur est connecté et en ligne
  useEffect(() => {
    if (!user?.id || !isOnline) return;

    // Le heartbeat est maintenant géré par UserStatusManager
    // Pusher gère les mises à jour de statut en temps réel
    console.log('UserStatusContext: Utilisation de Pusher pour les statuts');
  }, [user?.id, isOnline]);

  const value = {
    isOnline,
    sendHeartbeat,
  };

  return (
    <UserStatusContext.Provider value={value}>
      {children}
    </UserStatusContext.Provider>
  );
};

export const useUserStatusContext = () => {
  const context = useContext(UserStatusContext);
  if (!context) {
    throw new Error('useUserStatusContext doit être utilisé dans un UserStatusProvider');
  }
  return context;
}; 