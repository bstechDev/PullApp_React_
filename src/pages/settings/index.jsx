import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AccountSettings from './sections/AccountSettings';
import NotificationSettings from './sections/NotificationSettings';
import SecuritySettings from './sections/SecuritySettings';
import CommunicationSettings from './sections/CommunicationSettings';
import MessagingSettings from './sections/MessagingSettings';
import DeleteAccount from './sections/DeleteAccount';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('account');

  // Fonction pour afficher la section active
  const renderActiveTab = () => {
    switch(activeTab) {
      case 'account':
        return <AccountSettings />;
      case 'notification':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'communication':
        return <CommunicationSettings />;
      case 'messaging':
        return <MessagingSettings />;
      case 'delete':
        return <DeleteAccount />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          
          {/* Contenu principal */}
          <div className="w-full md:w-3/4">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;