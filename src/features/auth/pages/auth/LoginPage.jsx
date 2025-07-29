// src/features/auth/pages/LoginPage.jsx
import React from 'react';
import LoginForm from '../../components/LoginForm';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const { user, loading } = useAuth();
  
  console.log('🔍 LoginPage - user:', user);
  console.log('🔍 LoginPage - loading:', loading);
  console.log('🔍 LoginPage - localStorage token:', localStorage.getItem('auth_token'));

  return (
    <div>
      {/* Composant de débogage temporaire */}
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        background: 'white', 
        border: '1px solid #ccc', 
        padding: '10px', 
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div><strong>Debug LoginPage:</strong></div>
        <div>User: {user ? 'Connecté' : 'Non connecté'}</div>
        <div>Loading: {loading ? 'Oui' : 'Non'}</div>
        <div>Token: {localStorage.getItem('auth_token') ? 'Présent' : 'Absent'}</div>
      </div>
      
      <LoginForm />
    </div>
  );
};

export default LoginPage;