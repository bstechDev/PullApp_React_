import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function TestCallNotification() {
  const [showTestModal, setShowTestModal] = useState(false);

  // Simuler un appel entrant
  const simulateIncomingCall = () => {
    // Créer des données d'appel simulées
    const mockCall = {
      id: 123,
      caller: {
        id: 2,
        first_name: "EMMANUEL",
        last_name: "FAHE"
      },
      type: "video",
      room_url: "https://pullapp.daily.co/test-room",
      room_name: "test-room",
      status: "created",
      started_at: new Date().toISOString()
    };

    // Afficher le modal d'appel entrant
    setShowTestModal(true);

    // Jouer un son de notification
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(() => {
        // Fallback audio
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      });
    } catch (error) {
      console.error('Erreur lors de la lecture du son:', error);
    }

    // Notification toast
    toast.info(`Appel entrant de ${mockCall.caller.first_name} ${mockCall.caller.last_name}`, {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleAcceptTestCall = () => {
    toast.success("Appel accepté ! Redirection vers la salle...");
    setShowTestModal(false);
    toast.dismiss();
    
    // Simuler l'ouverture de la salle
    setTimeout(() => {
      window.open("https://pullapp.daily.co/test-room", '_blank');
    }, 1000);
  };

  const handleDeclineTestCall = () => {
    toast.info("Appel refusé");
    setShowTestModal(false);
    toast.dismiss();
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={simulateIncomingCall}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg"
      >
        🧪 Tester Appel Entrant
      </button>

      {/* Modal de test */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
            <div className="text-center mb-6">
              <div className="animate-bounce mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Appel entrant (TEST)</h2>
              <p className="text-gray-600">
                EMMANUEL FAHE vous appelle
              </p>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDeclineTestCall}
                className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Refuser
              </button>
              <button
                onClick={handleAcceptTestCall}
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
      )}
    </div>
  );
} 