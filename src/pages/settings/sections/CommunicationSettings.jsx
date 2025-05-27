import React, { useState } from 'react';

const CommunicationSettings = () => {
  const [communicationSettings, setCommunicationSettings] = useState({
    connectionRequests: 'emailOnly' // 'everyone', 'emailOnly', 'mutualConnections'
  });
  
  const handleCommunicationChange = (value) => {
    setCommunicationSettings(prev => ({ ...prev, connectionRequests: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sauvegarde des paramètres de communication:', communicationSettings);
    // Appel API pour sauvegarder les paramètres
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Qui peut se connecter avec vous ?</h2>
      <p className="text-gray-600 mb-6">
        Il travaille au noir difficile l'absorbé, les sportifs. Intéressé à toute la difficulté Devonshire aide gay joie. Non affecté à vous de compliment altération à.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-blue-800">Demande de connexion</h3>
              <button
                type="button"
                className="p-1 text-blue-600 hover:text-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="flex items-center">
                <input
                  id="connection-everyone"
                  name="connectionRequests"
                  type="radio"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  checked={communicationSettings.connectionRequests === 'everyone'}
                  onChange={() => handleCommunicationChange('everyone')}
                />
                <label htmlFor="connection-everyone" className="ml-3 text-sm text-gray-700">
                  Tout le monde sur les réseaux sociaux (recommandé)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="connection-email"
                  name="connectionRequests"
                  type="radio"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  checked={communicationSettings.connectionRequests === 'emailOnly'}
                  onChange={() => handleCommunicationChange('emailOnly')}
                />
                <label htmlFor="connection-email" className="ml-3 text-sm text-gray-700">
                  Uniquement les personnes qui connaissent votre adresse e-mail
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="connection-mutual"
                  name="connectionRequests"
                  type="radio"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  checked={communicationSettings.connectionRequests === 'mutualConnections'}
                  onChange={() => handleCommunicationChange('mutualConnections')}
                />
                <label htmlFor="connection-mutual" className="ml-3 text-sm text-gray-700">
                  Uniquement les personnes qui apparaissent dans votre liste de connexions mutuelles
                </label>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900">Qui peut vous envoyer un message</h3>
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900">Comment les gens peuvent vous trouver</h3>
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommunicationSettings;