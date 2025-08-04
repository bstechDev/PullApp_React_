import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserStatus } from '../../../hooks/useUserStatus';
import { toast } from 'react-toastify';

export default function LogoutButton() {
  const { logout } = useAuth();
  const { setOffline } = useUserStatus();

  const handleLogout = async () => {
    try {
      // Marquer comme hors ligne
      await setOffline();
      
      // Déconnexion via AuthContext
      await logout();
      
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Se déconnecter
    </button>
  );
} 