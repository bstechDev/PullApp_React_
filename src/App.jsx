// src/App.jsx
import React from 'react';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import AppRoutes from './routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserStatusProvider } from './contexts';

function App() {
  return (
    <AuthProvider>
      <UserStatusProvider>
        <AppRoutes />
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </UserStatusProvider>
    </AuthProvider>
  );
}

export default App;