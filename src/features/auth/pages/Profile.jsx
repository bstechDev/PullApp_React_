import React from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const displayUser = user || {};
  const firstName = displayUser.first_name || '';
  const lastName = displayUser.last_name || '';

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profil de l'utilisateur</h1>
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
            {firstName && lastName ? (
              <span className="text-sm font-medium text-gray-700">
                {firstName.charAt(0)}{lastName.charAt(0)}
              </span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {firstName} {lastName}
            </p>
            <p className="text-sm text-gray-500">
              {displayUser.email || 'Utilisateur'}
            </p>
          </div>
        </div>
        <p className="text-gray-800">Informations supplémentaires sur l'utilisateur...</p>
      </div>
    </div>
  );
};

export default Profile;