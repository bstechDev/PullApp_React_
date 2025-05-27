// src/features/auth/pages/VerifyTokenPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';

const VerifyTokenPage = () => {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyRedirectToken = async () => {
      const redirectToken = searchParams.get('redirect_token');
      
      if (!redirectToken) {
        setError('Lien de vérification invalide. Veuillez réessayer.');
        setVerifying(false);
        return;
      }
      
      try {
        // Vérification des données avec l'API
        const response = await authService.verifyRedirectData(redirectToken);
        const { email, token, verified } = response.data;
        
        if (verified) {
          // Stockage temporaire des données pour l'inscription
          sessionStorage.setItem('registrationData', JSON.stringify({
            email,
            token,
            verified
          }));
          
          // Redirection vers l'inscription
          navigate('/register');
        } else {
          setError('La vérification a échoué. Veuillez réessayer.');
          setVerifying(false);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError("Ce lien n'est plus valide ou a expiré (15 minutes maximum). Veuillez demander un nouveau lien de vérification.");
        setVerifying(false);
      }
    };
    
    verifyRedirectToken();
  }, [searchParams, navigate]);
  
  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Vérification de l'email</h2>
      
      {verifying ? (
        <div className="text-center">
          <p className="mb-4">Vérification de votre email en cours...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      ) : error ? (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          <p>{error}</p>
          <div className="mt-4">
            <button
              onClick={() => navigate('/verify-email')}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Retour à la vérification d'email
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default VerifyTokenPage;