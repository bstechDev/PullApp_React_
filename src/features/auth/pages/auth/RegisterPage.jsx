// src/features/auth/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';


const RegisterPage = () => {
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [verificationToken, setVerificationToken] = useState('');
  
  const { register, error } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const verifyRedirectToken = async () => {
      const redirectToken = searchParams.get('redirect_token');
      
      if (!redirectToken) {
        setLoading(false);
        setFormError('Veuillez vérifier votre email avant de continuer');
        return;
      }
      
      try {
        const response = await authService.verifyRedirectData(redirectToken);
        const { email, token, verified } = response.data;
        
        if (verified) {
          setVerifiedEmail(email);
          setVerificationToken(token);
          setLoading(false);
        } else {
          setFormError('Email non vérifié. Veuillez recommencer la vérification.');
          setLoading(false);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setFormError('Le lien de vérification a expiré. Veuillez recommencer.');
        setLoading(false);
      }
    };
    
    verifyRedirectToken();
  }, [navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!firstName || !lastName || !birthDate || !password || !passwordConfirmation) {
      setFormError('Tous les champs sont requis');
      return;
    }
    
    if (!privacyPolicyAccepted) {
      setFormError('Vous devez accepter la politique de confidentialité');
      return;
    }
    
    if (password !== passwordConfirmation) {
      setFormError('Les mots de passe ne correspondent pas');
      return;
    }
    
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate,
        email: verifiedEmail,
        password,
        password_confirmation: passwordConfirmation,
        privacy_policy_accepted: privacyPolicyAccepted,
        token: verificationToken
      });
      
      // Modification de la redirection vers la page de connexion
      navigate('/', { 
        state: { 
          message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' 
        } 
      });
    } catch (err) {
      setLoading(false);
      console.error('Erreur d\'inscription:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.response?.status === 403) {
        setFormError('Accès non autorisé. Veuillez vérifier votre token de vérification.');
      } else if (err.response?.status === 422) {
        setFormError(err.response.data.message || 'Données invalides. Veuillez vérifier vos informations.');
      } else {
        setFormError('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
      }
    }
  };
  
  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Inscription</h2>
      
      {(error || formError) && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {formError || error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            value={verifiedEmail}
            disabled
          />
          <p className="text-sm text-gray-500 mt-1">Email vérifié</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="firstName">
            Prénom
          </label>
          <input
            id="firstName"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="lastName">
            Nom
          </label>
          <input
            id="lastName"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="birthDate">
            Date de naissance
          </label>
          <input
            id="birthDate"
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password-confirmation">
            Confirmation du mot de passe
          </label>
          <input
            id="password-confirmation"
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-500"
              checked={privacyPolicyAccepted}
              onChange={(e) => setPrivacyPolicyAccepted(e.target.checked)}
              disabled={loading}
            />
            <span className="ml-2 text-gray-700">
              J'accepte la politique de confidentialité
            </span>
          </label>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;