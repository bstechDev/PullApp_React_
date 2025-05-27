// src/features/auth/pages/EmailVerifiedPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const EmailVerifiedPage = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const emailFromState = location.state?.email;
    const storedEmail = localStorage.getItem('verifiedEmail');
    
    if (emailFromState) {
      setEmail(emailFromState);
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      navigate('/verify-email');
    }
  }, [location, navigate]);

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md relative">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-green-100 rounded-full p-3">
          <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-6 text-center">Email Envoyé</h2>
      
      <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
        <p className="text-center">
          <span className="font-medium">Félicitations!</span> le lien de verification a bien été envoyé à <span className="font-medium">{email}</span>.
        </p>
      </div>
    </div>
  );
};

export default EmailVerifiedPage;