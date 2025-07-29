import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { callsService } from '../features/auth/services/callsService';
import { useFriends } from '../hooks/useFriends';

export default function CallDebugger() {
  const [debugInfo, setDebugInfo] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const { friendsList } = useFriends();

  // Test manuel de l'API
  const testIncomingCalls = async () => {
    console.log('🧪 Test manuel de checkIncomingCalls...');
    try {
      const result = await callsService.checkIncomingCalls();
      console.log('🧪 Résultat du test:', result);
      setDebugInfo(prev => ({
        ...prev,
        lastTest: {
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('🧪 Erreur du test:', error);
      setDebugInfo(prev => ({
        ...prev,
        lastTest: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  // Test de l'API toutes les 5 secondes
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(testIncomingCalls, 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      >
        🐛 Debug Appels
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">🐛 Debug Appels</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <strong>Utilisateur:</strong> {user?.id ? `ID: ${user.id}` : 'Non connecté'}
        </div>
        
        <div>
          <strong>Amis:</strong> {friendsList?.length || 0} trouvés
        </div>

        <div>
          <strong>Dernier test:</strong>
          {debugInfo.lastTest ? (
            <div className="ml-2">
              <div className={debugInfo.lastTest.success ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.lastTest.success ? '✅ Succès' : '❌ Erreur'}
              </div>
              <div className="text-xs text-gray-600">
                {debugInfo.lastTest.timestamp}
              </div>
              {debugInfo.lastTest.success && (
                <div className="text-xs">
                  <pre className="bg-gray-100 p-1 rounded">
                    {JSON.stringify(debugInfo.lastTest.data, null, 2)}
                  </pre>
                </div>
              )}
              {debugInfo.lastTest.error && (
                <div className="text-xs text-red-600">
                  {debugInfo.lastTest.error}
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-500">Aucun test effectué</span>
          )}
        </div>

        <button
          onClick={testIncomingCalls}
          className="w-full bg-blue-500 text-white px-3 py-1 rounded text-xs"
        >
          🔄 Test Manuel
        </button>
      </div>
    </div>
  );
} 