import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CallList = ({ calls = [], onJoin, onEnd, showDuration = false }) => {
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return [
      hours > 0 ? `${hours}h` : null,
      minutes > 0 ? `${minutes}m` : null,
      `${remainingSeconds}s`
    ].filter(Boolean).join(' ');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'created':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'created':
        return '📞 Appel en cours';
      case 'ongoing':
        return '🟢 En cours';
      case 'ended':
        return 'Terminé';
      default:
        return status;
    }
  };

  if (!calls.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun appel à afficher
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {calls.map((call) => {
        // Fonction pour obtenir le nom complet
        const getFullName = (user) => {
          if (!user) return 'Utilisateur inconnu';
          
          const firstName = user.first_name || '';
          const lastName = user.last_name || '';
          
          if (firstName && lastName) {
            return `${firstName} ${lastName}`;
          } else if (firstName) {
            return firstName;
          } else if (lastName) {
            return lastName;
          } else {
            return 'Utilisateur inconnu';
          }
        };

        const callerName = getFullName(call.caller);
        const participantName = call.participant ? getFullName(call.participant) : null;

        return (
          <div
            key={call.id}
            className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(call.status)}`}>
                  {getStatusText(call.status)}
                </span>
                <h3 className="font-medium">
                  {callerName}
                  {participantName && ` → ${participantName}`}
                </h3>
              </div>
            
            <div className="mt-2 text-sm text-gray-500">
              <div>
                Début : {formatDistanceToNow(new Date(call.started_at), { addSuffix: true, locale: fr })}
              </div>
              {showDuration && call.duration > 0 && (
                <div>Durée : {formatDuration(call.duration)}</div>
              )}
                          </div>
            </div>

            <div className="flex gap-2">
              {call.status === 'created' && onJoin && (
                <button
                  onClick={() => onJoin(call.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Rejoindre
                </button>
              )}
              {(call.status === 'created' || call.status === 'ongoing') && onEnd && (
                <button
                  onClick={() => onEnd(call.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Terminer
                </button>
              )}
            </div>
          </div>
        );
      })}
      <ToastContainer />
    </div>
  );
};

export default CallList;
