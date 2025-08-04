import React, { useState } from 'react';

const NotificationSettings = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    likesAndComments: true,
    replyToComments: true,
    subscriptions: false,
    birthdays: false,
    tests: true,
    emailNotifications: false,
    pushNotifications: true,
    weeklyRecap: false,
  });

  const handleToggleChange = (name) => {
    setNotificationSettings((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    console.log('Sauvegarde des notifications:', notificationSettings);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Notification</h2>
      <p className="text-gray-600 mb-6">
        Essayé la loi pourtant style enfant. L'ennui du vrai de ne pas être accord. Souvent suffisant pour ne pas être affecté. Le meublé qu'elle a conclu en fonction de l'approvisionnement dissimulé.
      </p>

      <div onSubmit={handleNotificationSubmit}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Likes et commentaires</h3>
              <p className="text-xs text-gray-500">Joie dire douloureux enlevé atteint la fin.</p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggleChange('likesAndComments')}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  notificationSettings.likesAndComments ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                    notificationSettings.likesAndComments ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Répondre à Mes commentaires</h3>
              <p className="text-xs text-gray-500">Demandez une offre rapide six sept voir parmi.</p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggleChange('replyToComments')}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  notificationSettings.replyToComments ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                    notificationSettings.replyToComments ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Abonnements</h3>
              <p className="text-xs text-gray-500">Préférence toute Mme étonnée sans réserve</p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggleChange('subscriptions')}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  notificationSettings.subscriptions ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                    notificationSettings.subscriptions ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Anniversaires</h3>
              <p className="text-xs text-gray-500">Content, il gentleman est agréable</p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggleChange('birthdays')}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  notificationSettings.birthdays ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                    notificationSettings.birthdays ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Épreuves</h3>
              <p className="text-xs text-gray-500">Utilisation continue de la direction remplie.</p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggleChange('tests')}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  notificationSettings.tests ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                    notificationSettings.tests ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Notifications par e-mail</h3>
              <button type="button" className="p-1 text-gray-400 hover:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-2">Comme hâté, oh produit perspective.</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Notifications push</h3>
              <p className="text-xs text-gray-500">Rendu six disent son frappant confiné.</p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggleChange('pushNotifications')}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  notificationSettings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                    notificationSettings.pushNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Récapitulatif hebdomadaire du compte{' '}
                <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">Pro uniquement</span>
              </h3>
              <p className="text-xs text-gray-500">Rendu six disent son frappant confiné.</p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleToggleChange('weeklyRecap')}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  notificationSettings.weeklyRecap ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                    notificationSettings.weeklyRecap ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleNotificationSubmit}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;