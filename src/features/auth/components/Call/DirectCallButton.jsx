import React, { useState } from 'react';
import { useFriends } from '../../../../hooks/useFriends';
import { useVideoCall } from '../../../../hooks/useVideoCall';
import { toast } from 'react-toastify';

export default function DirectCallButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { friendsList = [], loading } = useFriends();
  const { initiateCall } = useVideoCall();

  const handleCall = async (friend) => {
    if (!friend.is_online) {
      toast.warning(`${friend.first_name} n'est pas en ligne`);
      return;
    }

    try {
      await initiateCall(friend.id);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'appel");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Appeler un ami
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Appeler un ami</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : !friendsList.length ? (
              <p className="text-center text-gray-500 py-8">Aucun ami disponible</p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {friendsList.map(friend => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{friend.first_name} {friend.last_name}</p>
                      <p className={`text-sm ${friend.is_online ? 'text-green-500' : 'text-gray-500'}`}>
                        {friend.is_online ? '🟢 En ligne' : '⚫ Hors ligne'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCall(friend)}
                      disabled={!friend.is_online}
                      className={`px-4 py-2 rounded-lg ${
                        friend.is_online
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {friend.is_online ? 'Appeler' : 'Hors ligne'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 