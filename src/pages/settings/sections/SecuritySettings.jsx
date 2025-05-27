import React, { useState } from 'react';

const SecuritySettings = () => {
  // eslint-disable-next-line no-unused-vars
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    dataManagement: false,
    searchHistory: false,
    authorizedServices: false
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sauvegarde des paramètres de sécurité:', securitySettings);
    // Appel API pour sauvegarder les paramètres
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Confidentialité et sécurité</h2>
      <p className="text-gray-600 mb-6">
        Consultez les informations relatives à votre compte, téléchargez une archive de vos données ou découvrez les options de désactivation de votre compte
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Utiliser l'identification à deux facteurs</h3>
              <p className="text-xs text-gray-500">Non affecté, occasionnellement, complètement. Adieu, ce n'est pas étonnant les maisons d'esprit.</p>
            </div>
            <button
              type="button"
              className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Changement
            </button>
          </div>
          
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Activité de connexion</h3>
              <p className="text-xs text-gray-500">Sélectionnez la langue que vous utilisez sur les réseaux sociaux</p>
            </div>
            <button
              type="button"
              className="flex items-center text-sm text-blue-600 hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Vue
            </button>
          </div>
          
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Gérez vos données et votre activité</h3>
              <p className="text-xs text-gray-500">Sélectionnez une langue pour la traduction</p>
            </div>
            <button
              type="button"
              className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Changement
            </button>
          </div>
          
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Historique de recherche</h3>
              <p className="text-xs text-gray-500">Choisissez de lire automatiquement les vidéos sur les réseaux sociaux</p>
            </div>
            <button
              type="button"
              className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Changement
            </button>
          </div>
          
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Services autorisés</h3>
              <p className="text-xs text-gray-500">Choisissez si cette fonctionnalité apparait sur votre profil</p>
            </div>
            <button
              type="button"
              className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              Changement
            </button>
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

export default SecuritySettings;