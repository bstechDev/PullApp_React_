import { useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

export const useUserStatus = () => {
  const heartbeatInterval = useRef(null);
  const isOnline = useRef(false);

  // Envoyer le heartbeat
  const sendHeartbeat = useCallback(async () => {
    if (!isOnline.current) return;

    try {
      await api.post('/status/heartbeat');
    } catch (error) {
      if (error.response?.status === 401) {
        // Si non autorisé, ne pas continuer à envoyer des heartbeats
        stopHeartbeat();
      } else {
        console.error('Erreur heartbeat:', error);
      }
    }
  }, []);

  // Démarrer le heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) return;

    isOnline.current = true;
    sendHeartbeat(); // Premier heartbeat
    
    heartbeatInterval.current = setInterval(() => {
      sendHeartbeat();
    }, 60000); // 1 minute
  }, [sendHeartbeat]);

  // Arrêter le heartbeat
  const stopHeartbeat = useCallback(() => {
    isOnline.current = false;
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  }, []);

  // Marquer comme en ligne
  const setOnline = useCallback(async () => {
    if (isOnline.current) return;

    try {
      await api.post('/status/online');
      startHeartbeat();
    } catch (error) {
      console.error('Erreur setOnline:', error);
      if (error.response?.status !== 401) {
        toast.error('Erreur lors de la mise à jour du statut');
      }
    }
  }, [startHeartbeat]);

  // Marquer comme hors ligne
  const setOffline = useCallback(async () => {
    if (!isOnline.current) return;

    try {
      stopHeartbeat();
      await api.post('/status/offline');
    } catch (error) {
      console.error('Erreur setOffline:', error);
    }
  }, [stopHeartbeat]);

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      stopHeartbeat();
    };
  }, [stopHeartbeat]);

  return { 
    startHeartbeat, 
    stopHeartbeat, 
    setOnline, 
    setOffline, 
    sendHeartbeat,
    isOnline: isOnline.current 
  };
}; 