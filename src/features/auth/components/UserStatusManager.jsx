// src/components/UserStatusManager.jsx
import { useEffect } from 'react';
import api from '../../../services/api';

const UserStatusManager = ({ isEnabled = true }) => {
  useEffect(() => {
    if (!isEnabled) return;

    // Appel pour marquer en ligne
    const goOnline = async () => {
      try {
        const response = await api.post('/status/online');
        console.log('Go Online response à', new Date().toISOString(), ':', response.data);
      } catch (err) {
        console.error('Erreur goOnline à', new Date().toISOString(), ':', err);
      }
    };

    // Appel périodique pour signaler l’activité
    const heartbeat = async () => {
      try {
        const response = await api.post('/status/activity');
        console.log('Heartbeat response à', new Date().toISOString(), ':', response.data);
      } catch (err) {
        console.error('Erreur heartbeat à', new Date().toISOString(), ':', err);
      }
    };

    // Appel pour marquer hors ligne
    const goOffline = async () => {
      try {
        await api.post('/status/offline');
        console.log('🔴 Statut utilisateur : hors ligne');
      } catch (err) {
        console.error('Erreur goOffline :', err);
      }
    };

    goOnline();
    const heartbeatInterval = setInterval(heartbeat, 30_000); // toutes les 30s
    window.addEventListener('beforeunload', goOffline);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', goOffline);
      goOffline();
    };
  }, [isEnabled]);

  return null; // pas d'affichage
};

export default UserStatusManager;
