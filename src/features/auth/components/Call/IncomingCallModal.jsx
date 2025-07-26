import React from 'react';
import { useVideoCall } from '../../../../hooks/useVideoCall';
import { toast } from 'react-toastify';

export default function IncomingCallModal({ call, onClose }) {
  const { joinCall } = useVideoCall();

  const handleAccept = async () => {
    try {
      await joinCall(call.call_id);
      onClose();
    } catch (error) {
      toast.error(error.message || "Erreur lors de la connexion à l'appel");
    }
  };

  const handleDecline = () => {
    // Ici vous pouvez ajouter une API pour décliner l'appel si nécessaire
    onClose();
  };

  if (!call) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="animate-bounce mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Appel entrant</h2>
          <p className="text-gray-600">
            {call.creator.first_name} {call.creator.last_name} vous appelle
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleDecline}
            className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Refuser
          </button>
          <button
            onClick={handleAccept}
            className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
} 