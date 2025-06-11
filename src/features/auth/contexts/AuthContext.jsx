// src/features/auth/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import api from '../../../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          const response = await authService.getCurrentUser();
          if (response.data) {
            console.log('Données utilisateur récupérées dans AuthContext:', response.data);
            setUser(response.data);
            localStorage.setItem('user_data', JSON.stringify(response.data));
          } else {
            localStorage.removeItem('auth_token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'utilisateur:', error);
          if (error.response?.status === 401 || error.response?.status === 404) {
            localStorage.removeItem('auth_token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      const token = response.data?.token;
      const userData = response.data?.user;

      if (!token) {
        throw new Error('Token manquant dans la réponse');
      }

      localStorage.setItem('auth_token', token);
      if (userData) {
        console.log('Stockage des données utilisateur lors du login:', userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(userData);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Une erreur est survenue lors de la connexion';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      await authService.logout();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      api.defaults.headers.common['Authorization'] = '';
      setUser(null);
      window.location.href = '/';
    } catch (err) {
      console.error('Erreur de déconnexion:', err);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      api.defaults.headers.common['Authorization'] = '';
      setUser(null);
      window.location.href = '/';
    }
  };

  const verifyEmail = async (email) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.verifyEmail(email);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la vérification');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmEmailVerification = async (token, email) => {
    setLoading(true);
    setError(null);

    try {
      await authService.confirmEmailToken(token, email);
      return true;
    } catch (err) {
      setError("Impossible de vérifier votre email. Veuillez réessayer.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register(userData);
      // setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      error,
      login,
      logout,
      confirmEmailVerification,
      verifyEmail,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};