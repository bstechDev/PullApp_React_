import React, { useState } from 'react';
import ToggleSwitch from '../ToggleSwitch';

const MessagingSettings = () => {
  const [messagingSettings, setMessagingSettings] = useState({
    messageRequests: true,
    networkInvitations: true,
    addToGroup: false,
    commentReplies: false,
    pageActivity: true,
    pageAdvice: true
  });
  
  const handleToggleChange = (name) => {
    setMessagingSettings(prev => ({ ...prev, [name]: !prev[name] }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sauvegarde des paramètres de messagerie:', messagingSettings);
    // Appel API pour sauvegarder les paramètres
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Paramètres de confidentialité de la messagerie</h2>
        <p className="text-gray-600 mb-6">
          Comme jeune vous espérez qu'il n'y a pas de lieu. La partialité la diminution gaie et pourtant supplie l'admiration. Dans la mention peut-être tentative pointue supposer. Inconnu, la chambre du mandat de Norland est arrivée.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Activer les notifications de demande de message</h3>
              </div>
              <ToggleSwitch 
                enabled={messagingSettings.messageRequests} 
                onChange={handleToggleChange} 
                name="messageRequests" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Invitations de votre réseau</h3>
              </div>
              <ToggleSwitch 
                enabled={messagingSettings.networkInvitations} 
                onChange={handleToggleChange} 
                name="networkInvitations" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Autoriser les connexions à vous ajouter au groupe</h3>
              </div>
              <ToggleSwitch 
                enabled={messagingSettings.addToGroup} 
                onChange={handleToggleChange} 
                name="addToGroup" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Répondre aux commentaires</h3>
              </div>
              <ToggleSwitch 
                enabled={messagingSettings.commentReplies} 
                onChange={handleToggleChange} 
                name="commentReplies" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Messages provenant de l'activité sur ma page ou mon canal</h3>
              </div>
              <ToggleSwitch 
                enabled={messagingSettings.pageActivity} 
                onChange={handleToggleChange} 
                name="pageActivity" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Personnaliser les conseils pour ma page</h3>
              </div>
              <ToggleSwitch 
                enabled={messagingSettings.pageAdvice} 
                onChange={handleToggleChange} 
                name="pageAdvice" 
              />
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
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Expérience de messagerie</h2>
        <p className="text-gray-600 mb-6">
          Arrivé au large, elle âgée l'aimait fixé plus bruyant encore.
        </p>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Confirmations de lecture et indicateurs de saisie</h3>
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
              <h3 className="text-sm font-medium text-gray-900">Suggestions de messages</h3>
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
              <h3 className="text-sm font-medium text-gray-900">Coups de pouce de message</h3>
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
            type="button"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagingSettings;