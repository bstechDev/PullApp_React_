// src/components/layout/AuthLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Réseau Social Interne</h1>
          <p className="text-gray-600">Connectez-vous avec vos collègues</p>
        </div>
        
        {/* Le composant Outlet permet d'afficher les composants enfants définis dans les routes */}
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;