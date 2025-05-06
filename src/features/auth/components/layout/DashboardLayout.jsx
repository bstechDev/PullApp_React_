// src/features/auth/components/layout/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fonction pour récupérer et analyser les données utilisateur
    const getUserData = () => {
      try {
        const storedUserData = localStorage.getItem('user_data');
        if (storedUserData) {
          try {
            const parsedData = JSON.parse(storedUserData);
            setUserData(parsedData);
          } catch (parseError) {
            console.error('Erreur de parsing JSON:', parseError);
          }
        }
      } catch (e) {
        console.error('Erreur lors de la récupération des données utilisateur:', e);
      }
    };
    
    getUserData();
    
    if (user) {
      setUserData(user);
    }
  }, [user]);
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  // Utiliser userData qui combine les données de user et du localStorage
  const displayUser = userData || user || {};
  
  // Extraire first_name et last_name sans valeurs par défaut
  const firstName = displayUser.first_name || '';
  const lastName = displayUser.last_name || '';
  
  // Fonction pour fermer le menu profil si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar moderne style Workplace */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex justify-between items-center h-14">
            {/* Logo et recherche */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <NavLink to="/dashboard" className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
                  RS
                </NavLink>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="bg-gray-100 rounded-full py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-2.5 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Navigation centrale */}
            <nav className="hidden md:flex items-center justify-center flex-1">
              <div className="flex space-x-1">
                <NavLink 
                  to="/dashboard" 
                  className={({ isActive }) => 
                    isActive 
                      ? "px-3 py-2 text-blue-600 border-b-2 border-blue-600 font-medium" 
                      : "px-3 py-2 text-gray-500 hover:text-gray-700"
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </NavLink>
                <NavLink 
                  to="/messages" 
                  className={({ isActive }) => 
                    isActive 
                      ? "px-3 py-2 text-blue-600 border-b-2 border-blue-600 font-medium" 
                      : "px-3 py-2 text-gray-500 hover:text-gray-700"
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </NavLink>
                <NavLink 
                  to="/notifications" 
                  className={({ isActive }) => 
                    isActive 
                      ? "px-3 py-2 text-blue-600 border-b-2 border-blue-600 font-medium" 
                      : "px-3 py-2 text-gray-500 hover:text-gray-700"
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </NavLink>
              </div>
            </nav>

            {/* Menu utilisateur */}
            <div className="flex items-center space-x-4">
              <div className="relative profile-menu-container">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="h-9 w-9 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
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
                </button>
                
                {/* Menu déroulant du profil */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {firstName} {lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {displayUser.email || 'Utilisateur'}
                      </p>
                    </div>
                    <NavLink to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Voir mon profil
                    </NavLink>
                    <NavLink to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Paramètres
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Contenu principal - Outlet pour les routes enfants */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;