// src/App.jsx
import React, { useEffect } from 'react';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import AppRoutes from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserStatusProvider } from './contexts';
import GlobalCallWatcher from './components/GlobalCallWatcher';
import { usePusher } from './hooks/usePusher';
import { useAuth } from './features/auth/contexts/AuthContext';

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
  const { listenToPosts, listenToUserStatus } = usePusher(user?.id);

  // Écouter les nouveaux posts
  useEffect(() => {
    if (!user?.id) return;

    listenToPosts((post) => {
      console.log('📝 Nouveau post reçu via Pusher:', post);
      // Ici vous pouvez dispatcher une action ou mettre à jour le state
    });
  }, [user?.id, listenToPosts]);

  // Écouter le statut des utilisateurs
  useEffect(() => {
    if (!user?.id) return;

    listenToUserStatus((data) => {
      console.log('👤 Statut utilisateur mis à jour via Pusher:', data);
      // Ici vous pouvez mettre à jour le statut des utilisateurs
    });
  }, [user?.id, listenToUserStatus]);

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