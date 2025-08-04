import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { callsService } from '../features/auth/services/callsService';
import { useFriends } from '../hooks/useFriends';
import IncomingCallModal from '../features/auth/components/Call/IncomingCallModal';
import { toast } from 'react-toastify';
import { useCalls } from '../hooks/useCalls';

export default function GlobalCallWatcher() {
  const [incomingCall, setIncomingCall] = useState(null);
  const { user } = useAuth();
  const { friendsList } = useFriends();
  const { incomingCalls, getLatestIncomingCall } = useCalls(user?.id);
  
  // ✅ Référence pour stocker l'ID du toast actuel
  const currentToastId = useRef(null);

  // Fonction pour fermer le toast actuel
  const dismissCurrentToast = () => {
    if (currentToastId.current) {
      toast.dismiss(currentToastId.current);
      currentToastId.current = null;
    }
  };

  // Fonction pour gérer un nouvel appel entrant via Pusher
  const handleNewCall = (callData) => {
    if (!Array.isArray(friendsList)) return;
    
    const caller = callData.caller;
    
    if (caller) {
      console.log('📞 Nouvel appel entrant reçu via Pusher:', callData);
      setIncomingCall(callData);
      
      // ✅ Fermer le toast précédent s'il existe
      dismissCurrentToast();
      
      // ✅ Vérifier qu'aucun toast n'est déjà affiché avant d'en créer un nouveau
      if (!currentToastId.current) {
        // Jouer un son de notification
        try {
          const audio = new Audio('/sounds/notification.mp3');
          audio.play().catch(() => {
            // Si le fichier son n'existe pas, on utilise l'API Web Audio pour générer un bip
            console.log('Fichier son non trouvé, génération d\'un bip...');
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
          });
        } catch (error) {
          console.error('Erreur lors de la lecture du son:', error);
        }
        
        // ✅ Créer une nouvelle notification toast avec auto-close
        const toastId = toast.info(`Appel entrant de ${caller.first_name} ${caller.last_name}`, {
          position: "top-center",
          autoClose: 10000, // ✅ Fermer automatiquement après 10 secondes
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClose: () => {
            // ✅ Nettoyer la référence quand le toast se ferme
            if (currentToastId.current === toastId) {
              currentToastId.current = null;
            }
          }
        });
        
        // ✅ Stocker l'ID du toast actuel
        currentToastId.current = toastId;
      }
    }
  };

  // Fonction pour accepter l'appel
  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      const response = await callsService.acceptCall(incomingCall.id);
      if (response?.room_url) {
        window.open(response.room_url, '_blank');
      }
      setIncomingCall(null);
      // ✅ Fermer le toast spécifiquement
      dismissCurrentToast();
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'appel:', error);
      toast.error(error.message || "Erreur lors de l'acceptation de l'appel");
    }
  };

  // Fonction pour refuser l'appel
  const handleDeclineCall = async () => {
    if (!incomingCall) return;

    try {
      await callsService.rejectCall(incomingCall.id);
      setIncomingCall(null);
      // ✅ Fermer le toast spécifiquement
      dismissCurrentToast();
    } catch (error) {
      console.error('Erreur lors du rejet de l\'appel:', error);
      // Même en cas d'erreur, on ferme l'appel entrant
      setIncomingCall(null);
      // ✅ Fermer le toast spécifiquement
      dismissCurrentToast();
    }
  };

  // Fonction pour fermer l'appel entrant
  const handleCloseCall = () => {
    setIncomingCall(null);
    // ✅ Fermer le toast spécifiquement
    dismissCurrentToast();
  };

  // Écouter les appels entrants via Pusher
  useEffect(() => {
    if (!user?.id || !incomingCalls.length) return;

    const latestCall = getLatestIncomingCall();
    if (latestCall && latestCall.id !== incomingCall?.id) {
      handleNewCall(latestCall);
    }
  }, [user?.id, incomingCalls, getLatestIncomingCall, incomingCall?.id]);

  // Nettoyer l'appel entrant quand l'utilisateur se déconnecte
  useEffect(() => {
    if (!user) {
      setIncomingCall(null);
      // ✅ Fermer le toast quand l'utilisateur se déconnecte
      dismissCurrentToast();
    }
  }, [user]);

  // ✅ Nettoyer le toast au démontage du composant
  useEffect(() => {
    return () => {
      dismissCurrentToast();
    };
  }, []);

  // ✅ Nettoyer tous les toasts existants au montage du composant
  useEffect(() => {
    if (user?.id) {
      // Nettoyer tous les toasts existants au démarrage
      toast.dismiss();
      currentToastId.current = null;
    }
  }, [user?.id]);

  // Rendu du modal d'appel entrant
  if (!incomingCall) return null;
  return (
    <IncomingCallModal
      call={incomingCall}
      onClose={handleCloseCall}
      onAccept={handleAcceptCall}
      onDecline={handleDeclineCall}
    />
  );
} 