import React, { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { callsService } from '../features/auth/services/callsService';
import { useFriends } from '../hooks/useFriends';
import IncomingCallModal from '../features/auth/components/Call/IncomingCallModal';
import { toast } from 'react-toastify';

export default function GlobalCallWatcher() {
  const [incomingCall, setIncomingCall] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const { user } = useAuth();
  const { friendsList } = useFriends();

  // Fonction pour vérifier les appels entrants
  const checkIncomingCalls = async () => {
    if (!user?.id || isChecking) return;

    setIsChecking(true);
    try {
      const response = await callsService.checkIncomingCalls();
      
      if (response?.call && Array.isArray(friendsList)) {
        // L'API retourne directement l'objet caller, pas caller_id
        const caller = response.call.caller;
        
        if (caller) {
          const callData = {
            ...response.call,
            caller: caller
          };
          
          // Vérifier si c'est un nouvel appel (pas le même que celui déjà affiché)
          if (!incomingCall || incomingCall.id !== callData.id) {
            console.log('📞 Nouvel appel entrant détecté:', callData);
            setIncomingCall(callData);
            
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
            
            // Notification toast
            toast.info(`Appel entrant de ${caller.first_name} ${caller.last_name}`, {
              position: "top-center",
              autoClose: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
            });
          }
        }
      } else if (incomingCall) {
        // Si pas d'appel entrant mais qu'on en avait un affiché, le retirer
        setIncomingCall(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des appels entrants:', error);
    } finally {
      setIsChecking(false);
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
      toast.dismiss(); // Fermer la notification toast
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
      toast.dismiss(); // Fermer la notification toast
    } catch (error) {
      console.error('Erreur lors du rejet de l\'appel:', error);
      // Même en cas d'erreur, on ferme l'appel entrant
      setIncomingCall(null);
      toast.dismiss();
    }
  };

  // Fonction pour fermer l'appel entrant
  const handleCloseCall = () => {
    setIncomingCall(null);
    toast.dismiss(); // Fermer la notification toast
  };

  // Polling pour vérifier les appels entrants
  useEffect(() => {
    if (!user?.id) return;

    // Vérification immédiate au montage
    checkIncomingCalls();

    // Polling toutes les 3 secondes
    const interval = setInterval(checkIncomingCalls, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [user?.id, friendsList]);

  // Nettoyer l'appel entrant quand l'utilisateur se déconnecte
  useEffect(() => {
    if (!user) {
      setIncomingCall(null);
      toast.dismiss();
    }
  }, [user]);

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