import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { useFriends } from '../hooks/useFriends';
import { usePusher } from '../hooks/usePusher';

export default function IncomingCallIndicator() {
  const [hasIncomingCall, setHasIncomingCall] = useState(false);
  const [callerName, setCallerName] = useState('');
  const { user } = useAuth();
  const { friendsList } = useFriends();
  const { listenToCalls } = usePusher(user?.id);

  // Gérer les appels entrants via Pusher
  const handleNewCall = (callData) => {
    if (!Array.isArray(friendsList)) return;
    
    const caller = callData.caller;
    
    if (caller) {
      setHasIncomingCall(true);
      setCallerName(`${caller.first_name} ${caller.last_name}`);
    }
  };

  // Écouter les appels entrants via Pusher
  useEffect(() => {
    if (!user?.id) return;

    listenToCalls(handleNewCall);

    return () => {
      // Nettoyage automatique via le hook usePusher
    };
  }, [user?.id, listenToCalls]);

  // Nettoyer quand l'utilisateur se déconnecte
  useEffect(() => {
    if (!user) {
      setHasIncomingCall(false);
      setCallerName('');
    }
  }, [user]);

  if (!hasIncomingCall) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
        <div className="flex items-center gap-2">
          <div className="animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-medium">
            Appel de {callerName}
          </span>
        </div>
      </div>
    </div>
  );
} 