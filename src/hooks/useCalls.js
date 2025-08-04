import { useState, useEffect } from "react";
import pusherService from "../services/pusherService";

export const useCalls = (userId) => {
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [activeCalls, setActiveCalls] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const setupCallsChannel = async () => {
      try {
        // Attendre que Pusher soit initialisé
        await pusherService.waitForInitialization();

        // Se connecter au canal des appels (canal public temporaire)
        const callsChannel = pusherService.subscribeToPublicChannel(
          `calls-${userId}`
        );

        // Écouter les nouveaux appels
        callsChannel.bind("new-call", (data) => {
          console.log("📞 Nouvel appel reçu:", data);
          setIncomingCalls((prev) => [data, ...prev]);
        });

        // Écouter les appels acceptés
        callsChannel.bind("call-accepted", (data) => {
          console.log("✅ Appel accepté:", data);
          setIncomingCalls((prev) =>
            prev.filter((call) => call.id !== data.id)
          );
          setActiveCalls((prev) => [...prev, data]);
        });

        // Écouter les appels refusés
        callsChannel.bind("call-rejected", (data) => {
          console.log("❌ Appel refusé:", data);
          setIncomingCalls((prev) =>
            prev.filter((call) => call.id !== data.id)
          );
        });

        // Écouter les appels terminés
        callsChannel.bind("call-ended", (data) => {
          console.log("📴 Appel terminé:", data);
          setActiveCalls((prev) => prev.filter((call) => call.id !== data.id));
          setIncomingCalls((prev) =>
            prev.filter((call) => call.id !== data.id)
          );
        });

        // Nettoyer à la déconnexion
        return () => {
          pusherService.unsubscribeFromChannel(`calls-${userId}`);
        };
      } catch (error) {
        console.error("Erreur lors de la connexion aux appels:", error);
      }
    };

    setupCallsChannel();
  }, [userId]);

  const addIncomingCall = (call) => {
    setIncomingCalls((prev) => [call, ...prev]);
  };

  const removeIncomingCall = (callId) => {
    setIncomingCalls((prev) => prev.filter((call) => call.id !== callId));
  };

  const addActiveCall = (call) => {
    setActiveCalls((prev) => [...prev, call]);
  };

  const removeActiveCall = (callId) => {
    setActiveCalls((prev) => prev.filter((call) => call.id !== callId));
  };

  const getLatestIncomingCall = () => {
    return incomingCalls[0] || null;
  };

  return {
    incomingCalls,
    activeCalls,
    addIncomingCall,
    removeIncomingCall,
    addActiveCall,
    removeActiveCall,
    getLatestIncomingCall,
  };
};
