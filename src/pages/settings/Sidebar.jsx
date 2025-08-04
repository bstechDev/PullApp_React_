import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4">
        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
              activeTab === 'account' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Compte
          </button>
          
          <button
            onClick={() => setActiveTab('notification')}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
              activeTab === 'notification' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notification
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
              activeTab === 'security' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Confidentialité et sécurité
          </button>
          
          <button
            onClick={() => setActiveTab('communication')}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
              activeTab === 'communication' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Communications
          </button>
          
          <button
            onClick={() => setActiveTab('messaging')}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
              activeTab === 'messaging' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Messagerie
          </button>
          
          <button
            onClick={() => setActiveTab('delete')}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
              activeTab === 'delete' ? 'bg-red-50 text-red-700' : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Fermer le compte
          </button>
        </nav>
      </div>
      
      <div className="border-t border-gray-200 p-4">
        <Link to="/dashboard/profile" className="text-blue-600 text-sm font-medium hover:underline">
          Voir le profil
        </Link>
      </div>
      
      <div className="border-t border-gray-200 p-4 text-xs text-gray-500">
        <div className="flex justify-between">
          <button className="hover:underline">Environ</button>
          <button className="hover:underline">Paramètres</button>
          <button className="hover:underline">Soutien</button>
        </div>
        <div className="flex justify-between mt-2">
          <button className="hover:underline">Docs</button>
          <button className="hover:underline">Aide</button>
        </div>
        <div className="mt-2">
          <button className="hover:underline">Confidentialité et conditions</button>
        </div>
        <div className="mt-2 text-center">
          © Webestica 2024
        </div>
      </div>
    </div>
  );
};

export default Sidebar;