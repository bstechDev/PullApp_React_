// src/routes/index.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/contexts/AuthContext';

// Layouts
import AuthLayout from '../features/auth/components/layout/AuthLayout';

// Pages
import LoginPage from '../features/auth/pages/auth/LoginPage';
import EmailVerificationPage from '../features/auth/pages/auth/EmailVerificationPage';
import RegisterPage from '../features/auth/pages/auth/RegisterPage';
import Dashboard from '../features/auth/pages/Dashboard';
import VerifyTokenPage from '../features/auth/pages/auth/VerifyTokenPage';
import EmailVerifiedPage from '../features/auth/pages/auth/EmailVerifiedPage';

// Composants du Dashboard
import DashboardHome from '../features/auth/pages/dashboard/DashboardHome';
import Messages from '../features/auth/pages/Messages';
import Notifications from '../features/auth/pages/Notifications';
import Groups from '../features/auth/pages/Groups';
import Profile from '../features/auth/pages/Profile';
import Settings from '../features/auth/pages/Settings';

// Route protégée qui vérifie si l'utilisateur est connecté
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tokenCheckComplete, setTokenCheckComplete] = useState(false);
  
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/', { replace: true });
        setTokenCheckComplete(true);
        return;
      }
      
      // Si le chargement est terminé, on a soit un utilisateur, soit une erreur
      if (!loading) {
        setTokenCheckComplete(true);
        if (!user) {
          // Si pas d'utilisateur après chargement, rediriger vers login
          navigate('/', { replace: true });
        }
      }
    };
    
    checkToken();
  }, [user, loading, navigate]);

  // Afficher le spinner seulement pendant la vérification initiale
  if (loading && !tokenCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si on a un utilisateur ou si le token est valide, afficher les enfants
  if (user) {
    return children;
  }

  // Redirection gérée dans l'effet, on retourne null en attendant
  return null;
};

// Route publique
const PublicRoute = ({ children }) => {
  const auth = useAuth();
  const { user, loading } = auth || { user: null, loading: true };
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  if (user) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/verify-email" element={
            <PublicRoute>
              <EmailVerificationPage />
            </PublicRoute>
          } />
          <Route path="/verify-token" element={
            <PublicRoute>
              <VerifyTokenPage />
            </PublicRoute>
          } />
          <Route path="/email-verified" element={
            <PublicRoute>
              <EmailVerifiedPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
        </Route>
        
        {/* Routes protégées avec sous-routes pour le Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }>
          {/* Route par défaut du Dashboard */}
          <Route index element={<DashboardHome />} />
          
          {/* Sous-routes du Dashboard */}
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="groups" element={<Groups />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Redirection pour les routes inconnues */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;