import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/contexts/AuthContext';
import { useAdmin } from '../features/admin/contexts/AdminContext';

// Layouts
import AuthLayout from '../features/auth/components/layout/AuthLayout';
import AdminLayout from '../features/admin/components/layout/AdminLayout';

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

// Pages Admin
import AdminDashboard from '../features/admin/pages/AdminDashboard'; 
import UsersManagement from '../features/admin/pages/UsersManagement';
import ContentModeration from '../features/admin/pages/ContentModeration';
import RelationsPage from '../features/admin/pages/RelationsPage';
import Analytics from '../features/admin/pages/Analytics';
import SystemConfig from '../features/admin/pages/SystemConfig';

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

// Route protégée Admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  
  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
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

        {/* Routes Admin */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          {/* Route par défaut Admin */}
          <Route index element={<AdminDashboard />} />
          
          {/* Sous-routes Admin */}
          <Route path="auth" element={<div>Gestion de l'authentification</div>} />
          <Route path="user" element={<UsersManagement />} />
          <Route path="post" element={<ContentModeration />} />
          <Route path="relations" element={<RelationsPage />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="config" element={<SystemConfig />} />
          <Route path="roles" element={<div>Gestion des rôles et permissions</div>} />
        </Route>
        
        {/* Redirection pour les routes inconnues */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}