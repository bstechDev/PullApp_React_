import React from "react";
import { useFriends } from "../../../../hooks/useFriends";
import { useVideoCall } from "../../../../hooks/useVideoCall";
import { toast } from "react-toastify";

export default function InviteModal({ room, onClose }) {
  const { friendsList = [], loading } = useFriends();
  const { initiateCall } = useVideoCall();

  const handleInvite = async (friendId) => {
    try {
      await initiateCall(friendId);
      toast.success("Invitation envoyée !");
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'invitation");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Inviter des amis
            {room?.room_name && <span className="text-sm text-gray-500 ml-2">({room.room_name})</span>}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : !Array.isArray(friendsList) || friendsList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">Tu n'as pas encore d'amis 🥲</p>
            <button
              onClick={onClose}
              className="mt-4 text-blue-500 hover:text-blue-600"
            >
              Ajouter des amis
            </button>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {friendsList.map(friend => (
              <div 
                key={friend.id} 
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <div>
                    <p className="font-medium">{friend.first_name} {friend.last_name}</p>
                    {friend.status && (
                      <p className="text-sm text-gray-500">{friend.status}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleInvite(friend.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Inviter
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
