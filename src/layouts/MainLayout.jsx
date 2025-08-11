// src/layouts/MainLayout.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/contexts/AuthContext';

const MainLayout = ({ children }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  if (!auth) {
    return <div>Loading...</div>; // or handle the error appropriately
  }

  const { user, logout } = auth;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Ferme le dropdown quand on clique ailleurs
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo et barre de recherche */}
            <div className="flex items-center">
              <Link to="/home" className="flex-shrink-0 flex items-center">
                <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
              </Link>
              <div className="ml-6 relative flex-1 max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Rechercher..."
                  type="search"
                />
              </div>
            </div>
            
            {/* Icônes de navigation et profil */}
            <div className="flex items-center">
              <div className="flex space-x-4">
                {/* Accueil */}
                <Link
                  to="/home"
                  className="flex items-center justify-center h-full px-3 text-blue-500 border-b-2 border-blue-500"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
                  </svg>
                </Link>
                
                {/* Contacts/Amis */}
                <Link
                  to="/contacts"
                  className="flex items-center justify-center h-full px-3 text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 17V19H2V17S2 13 9 13 16 17 16 17M12.5 7.5A3.5 3.5 0 1 0 9 11A3.5 3.5 0 0 0 12.5 7.5M15.94 13A5.32 5.32 0 0 1 18 17V19H22V17S22 13.37 15.94 13M15 4A3.39 3.39 0 0 0 13.07 4.59A5 5 0 0 1 13.07 10.41A3.39 3.39 0 0 0 15 11A3.5 3.5 0 0 0 15 4Z" />
                  </svg>
                </Link>
                
                {/* Messages */}
                <Link
                  to="/messages"
                  className="flex items-center justify-center h-full px-3 text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"></path>
                  </svg>
                </Link>
                
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="flex items-center justify-center h-full px-3 text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19v1H3v-1l2-2v-6c0-3.1 2.03-5.83 5-6.71V4a2 2 0 012-2 2 2 0 012 2v.29c2.97.88 5 3.61 5 6.71v6l2 2zm-7 2a2 2 0 01-2 2 2 2 0 01-2-2"></path>
                  </svg>
                </Link>
              </div>
              
              {/* Profil dropdown */}
              <div className="ml-4 relative" ref={dropdownRef}>
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center text-sm focus:outline-none"
                  >
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                        {user?.firstname?.[0]}{user?.lastname?.[0]}
                      </div>
                      <span className="ml-2 hidden md:block">{user?.firstname} {user?.lastname}</span>
                    </div>
                  </button>
                </div>
                
                {userDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-2 px-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.firstname} {user?.lastname}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <div className="py-1" role="menu">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        Voir mon profil
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        Paramètres
                      </Link>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;