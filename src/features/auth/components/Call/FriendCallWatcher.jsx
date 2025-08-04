// FriendCallWatcher.jsx
import { useEffect, useState } from 'react';
import { callsService } from '../../services/callsService';

export default function FriendCallWatcher({ userId }) {
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    // Le FriendCallWatcher n'est plus nécessaire avec Pusher
    // Les appels sont maintenant gérés par GlobalCallWatcher via Pusher
    console.log('FriendCallWatcher: Utilisation de Pusher pour les appels');
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
