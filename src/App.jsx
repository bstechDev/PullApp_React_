// src/App.jsx
import React, { useEffect } from 'react';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import AppRoutes from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserStatusProvider } from './contexts';
import GlobalCallWatcher from './components/GlobalCallWatcher';
import { useAuth } from './features/auth/contexts/AuthContext';
import pusherService from './services/pusherService';

function App() {
  return (
    <AuthProvider>
      <UserStatusProvider>
        <AppContent />
      </UserStatusProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user } = useAuth();

  // Initialiser Pusher quand l'utilisateur est connecté
  useEffect(() => {
    if (user?.id) {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        pusherService.initialize();
        console.log('🚀 Pusher initialisé pour l\'utilisateur:', user.id);
      }
    } else {
      // Déconnecter Pusher si l'utilisateur n'est pas connecté
      pusherService.disconnect();
    }

    // Nettoyer à la déconnexion
    return () => {
      pusherService.disconnect();
    };
  }, [user?.id]);

  return (
    <>
      <AppRoutes />
      <GlobalCallWatcher />
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss={true}
        draggable={true}
        pauseOnHover={true}
        limit={3} // ✅ Limiter le nombre de toasts affichés simultanément
        enableMultiContainer={false} // ✅ Désactiver les conteneurs multiples
      />
    </>
  );
}

export default App;