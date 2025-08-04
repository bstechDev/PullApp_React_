import React, { useState } from "react";
import { useVideoCall } from "../../../../hooks/useVideoCall";
import InviteModal from "./InviteModal";
import { toast } from "react-toastify";

export default function CallButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const [callInfo, setCallInfo] = useState(null);
  const { createRoom } = useVideoCall();

  const handleCreateRoom = async () => {
    try {
      const response = await createRoom();
      if (response) {
        setCallInfo(response);
        setModalOpen(true);
      }
    } catch (error) {
      toast.error(error.message || "Erreur lors de la création de la salle");
    }
  };

  return (
    <>
      <button 
        onClick={handleCreateRoom}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
        Créer une salle
      </button>
      
      {modalOpen && callInfo && (
        <InviteModal 
          room={callInfo} 
          onClose={() => {
            setModalOpen(false);
            setCallInfo(null);
          }} 
        />
      )}
    </>
  );
}
