// src/App.jsx
import React from 'react';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import AppRoutes from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserStatusProvider } from './contexts';
import GlobalCallWatcher from './components/GlobalCallWatcher';

function App() {
  return (
    <AuthProvider>
      <UserStatusProvider>
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
      </UserStatusProvider>
    </AuthProvider>
  );
}

export default App;