// src/features/auth/pages/Messages.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const displayUser = user || {};
  const firstName = displayUser.first_name || '';
  
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
          <p className="text-gray-600">
            Bienvenue {firstName} dans votre boîte de messages. Cette page est en cours de développement.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Messages;