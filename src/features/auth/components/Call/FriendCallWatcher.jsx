// FriendCallWatcher.jsx
import { useEffect, useState } from 'react';
import { callsService } from '../../services/callsService';

export default function FriendCallWatcher({ userId }) {
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const call = await callsService.getCurrentIncomingCall(userId); // crée cette méthode
        if (call && call.status === 'ringing') {
          setIncomingCall(call);
        }
      } catch (error) {
        console.error("Erreur vérification appel entrant", error);
      }
    }, 5000); // toutes les 5 secondes

    return () => clearInterval(interval);
  }, [userId]);

  if (!incomingCall) return null;

  return (
    <div className="notification">
      📞 Appel entrant de {incomingCall.creator?.first_name}
      <a href={incomingCall.url}>
        <button>Rejoindre</button>
      </a>
    </div>
  );
}
