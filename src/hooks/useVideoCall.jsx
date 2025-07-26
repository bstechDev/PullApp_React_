import { useState, useEffect, useCallback } from 'react';
import { callsService } from '../features/auth/services/callsService';
import { useFriends } from './useFriends';

export const useVideoCall = () => {
  const [incomingCall, setIncomingCall] = useState(null);
  const { friendsList } = useFriends();

  const createRoom = useCallback(async () => {
    try {
      console.log("useVideoCall: Début de création de salle...");
      const response = await callsService.createRoom();
      console.log("useVideoCall: Salle créée avec succès:", response);
      return response;
    } catch (error) {
      console.error('useVideoCall: Erreur lors de la création de la salle:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      throw error;
    }
  }, []);

  const initiateCall = useCallback(async (friendId) => {
    try {
      const response = await callsService.initiateCall(friendId);
      if (response?.room_url) {
        window.open(response.room_url, '_blank');
      }
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'initiation de l\'appel:', error);
      
      // Si l'erreur indique qu'un appel a été récupéré malgré l'erreur 500
      if (error.message?.includes("malgré l'erreur")) {
        console.log("Appel récupéré malgré l'erreur serveur");
        return error; // Retourner l'erreur comme succès
      }
      
      throw error;
    }
  }, []);

  const joinCall = useCallback(async (callId) => {
    try {
      const response = await callsService.joinCall(callId);
      if (response?.room_url) {
        window.open(response.room_url, '_blank');
      }
      return response;
    } catch (error) {
      console.error('Erreur lors de la tentative de rejoindre l\'appel:', error);
      throw error;
    }
  }, []);

  const checkIncomingCalls = useCallback(async () => {
    try {
      const response = await callsService.checkIncomingCalls();
      
      if (response?.call && Array.isArray(friendsList)) {
        // Trouver l'ami qui appelle
        const caller = friendsList.find(friend => friend.id === response.call.caller_id);
        
        if (caller) {
          setIncomingCall({
            ...response.call,
            caller: caller
          });
          
          // Jouer un son de notification
          const audio = new Audio('/notification.mp3');
          audio.play().catch(console.error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des appels entrants:', error);
    }
  }, [friendsList]);

  const acceptCall = useCallback(async (callId) => {
    try {
      const response = await callsService.acceptCall(callId);
      if (response?.room_url) {
        window.open(response.room_url, '_blank');
      }
      setIncomingCall(null);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'appel:', error);
      throw error;
    }
  }, []);

  const rejectCall = useCallback(async (callId) => {
    try {
      await callsService.rejectCall(callId);
      setIncomingCall(null);
    } catch (error) {
      console.error('Erreur lors du rejet de l\'appel:', error);
      throw error;
    }
  }, []);

  const clearIncomingCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  // Fonction pour vérifier le statut d'une salle
  const checkRoomStatus = useCallback(async (roomId) => {
    try {
      const response = await callsService.checkRoomStatus(roomId);
      return response;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de la salle:', error);
      throw error;
    }
  }, []);

  // Fonction pour terminer un appel
  const endCall = useCallback(async (callId) => {
    try {
      const response = await callsService.endCall(callId);
      return response;
    } catch (error) {
      console.error('Erreur lors de la terminaison de l\'appel:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    // Vérifier les appels entrants toutes les 5 secondes
    const interval = setInterval(checkIncomingCalls, 5000);
    return () => clearInterval(interval);
  }, [checkIncomingCalls]);

  return {
    incomingCall,
    createRoom,
    initiateCall,
    joinCall,
    acceptCall,
    rejectCall,
    clearIncomingCall,
    checkRoomStatus,
    endCall
  };
};