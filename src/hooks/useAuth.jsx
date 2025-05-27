// src/hooks/useAuth.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../features/auth/services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifie si l'utilisateur est connecté au chargement de l'application
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        console.log('Token au chargement:', token);
        
        if (token) {
          try {
            const response = await authService.getCurrentUser();
            console.log('Profil utilisateur récupéré:', response.data);
            
            // Vérifier la structure de la réponse
            if (response.data && response.data.user) {
              setUser(response.data.user);
            } else if (response.data && typeof response.data === 'object') {
              setUser(response.data);
            } else {
              console.error('Format de réponse inattendu pour le profil utilisateur:', response.data);
              // Ne pas supprimer le token automatiquement
              // localStorage.removeItem('auth_token');
            }
          } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            // Ne supprimez pas automatiquement le token en cas d'erreur
            // localStorage.removeItem('auth_token');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      console.log('Réponse de login:', response.data);

      // Extraire le token selon la structure de réponse
      let token, userData;
      
      if (response.data.token) {
        token = response.data.token;
        userData = response.data.user;
      } else if (response.data.access_token) {
        token = response.data.access_token;
        userData = response.data.user;
      } else if (typeof response.data === 'string') {
        // Si le token est directement retourné comme une chaîne
        token = response.data;
        // Dans ce cas, nous devrons faire une requête supplémentaire pour obtenir les données utilisateur
        const profileResponse = await authService.getCurrentUser();
        userData = profileResponse.data.user || profileResponse.data;
      }
      
      if (!token) {
        throw new Error('Token non trouvé dans la réponse');
      }
      
      // Stockage du token avec console.log pour vérification
      console.log('Token stocké:', token);
      localStorage.setItem('auth_token', token);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};