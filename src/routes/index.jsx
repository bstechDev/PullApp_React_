import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import Profile from '../features/auth/pages/Profile';
import Settings from '../features/auth/pages/Settings';
import Friends from '../features/auth/pages/Friends';
import Calls from '../features/auth/pages/Calls'; 

// Route protégée simplifiée
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Route publique simplifiée
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Afficher un spinner pendant le chargement initial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Si l'utilisateur est connecté, rediriger vers le dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Si pas d'utilisateur et pas de chargement, afficher la page publique
  return children;
};

// Composant de routage principal
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={
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
          <Route path="messages/:receiverId" element={<Messages />} />
          <Route path="calls" element={<Calls />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="friends" element={<Friends />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Redirection pour les routes inconnues */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}