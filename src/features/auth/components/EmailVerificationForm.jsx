// src/features/auth/components/EmailVerificationForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const EmailVerificationForm = () => {
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { verifyEmail, loading, error } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!email) {
      setFormError('Email requis');
      return;
    }
    
    try {
      await verifyEmail(email);
      setSuccess(true);
      
      // Store the verified email for the next page
      localStorage.setItem('verifiedEmail', email);
      
      // Automatic redirection after 0,5 seconds
      setTimeout(() => {
        navigate('/email-verified', { state: { email } });
      }, 500);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Error is already handled by the context
    }
  };
  
  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md relative">
      <h2 className="text-2xl font-bold mb-6 text-center">Vérification de l'email</h2>
      
      {(error || formError) && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {formError || error}
        </div>
      )}
      
      {success ? (
        <div className="mb-4 p-5 bg-green-50 text-green-700 rounded-md border border-green-200 shadow-sm animate-pulse">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-medium">Email envoyé avec succès!</p>
              <p className="text-sm">Un lien de vérification a été envoyé à {email}. Veuillez vérifier votre boîte de réception.</p>
              <p className="text-sm mt-2">Redirection automatique dans quelques secondes...</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="votre@email.com"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all transform hover:scale-105"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi en cours...
              </div>
            ) : 'Envoyer le lien de vérification'}
          </button>
        </form>
      )}
    </div>
  );
};

export default EmailVerificationForm;