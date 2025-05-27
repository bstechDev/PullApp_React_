// src/features/auth/settings/sections/AccountSettings.jsx
import React, { useState } from 'react';
import { useAuth } from '../../../features/auth/contexts/AuthContext';
import api from '../../../services/api';

const AccountSettings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
  const [passwordUpdateError, setPasswordUpdateError] = useState(null);
  
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    bio: user?.bio || '',
    allowConnection: false
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  
  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setUpdateSuccess(false);
    setUpdateError(null);
    
    try {
      // Préparer les données à envoyer à l'API
      const profileUpdateData = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        username: profileData.username,
        phone_number: profileData.phone_number,
        bio: profileData.bio,
        email: profileData.email
      };
      
      // Appel à l'API pour mettre à jour les informations utilisateur
      const response = await api.patch('/user/settings', profileUpdateData);
      
      if (response.data?.user) {
        setUpdateSuccess(true);
        // Mettre à jour les données utilisateur dans localStorage
        const userData = response.data.user;
        localStorage.setItem('user_data', JSON.stringify(userData));
        // Afficher un message de succès pendant 3 secondes
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error.response?.data || error);
      setUpdateError(error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setPasswordUpdateSuccess(false);
    setPasswordUpdateError(null);
    
    try {
      // Vérification des mots de passe
      if (passwordData.new_password !== passwordData.new_password_confirmation) {
        setPasswordUpdateError('Les mots de passe ne correspondent pas');
        setIsLoading(false);
        return;
      }
      
      // Appel à l'API pour changer le mot de passe
      const response = await api.patch('/user/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.new_password_confirmation
      });
      
      if (response.data?.message) {
        setPasswordUpdateSuccess(true);
        // Réinitialiser le formulaire
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
        // Afficher un message de succès pendant 3 secondes
        setTimeout(() => {
          setPasswordUpdateSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur de mise à jour du mot de passe:', error.response?.data || error);
      setPasswordUpdateError(error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du mot de passe');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Paramètres du compte</h2>
        <p className="text-gray-600 mb-6">
          Il travaille au noir difficile l'absorbé, les sportifs. Intéressé à toute la difficulté Devonshire aide gay joie. Non affecté à vous de compliment altération à.
        </p>
        
        {updateSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
            Informations mises à jour avec succès!
          </div>
        )}
        
        {updateError && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {updateError}
          </div>
        )}
        
        <form onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input
                type="text"
                id="firstName"
                name="first_name"
                value={profileData.first_name}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Sam"
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                id="lastName"
                name="last_name"
                value={profileData.last_name}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Lanson"
              />
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur</label>
              <input
                type="text"
                id="username"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="@samlanson"
              />
            </div>
            
            <div className="md:col-span-3">
              <div className="flex items-center">
                <input
                  id="allowConnection"
                  name="allowConnection"
                  type="checkbox"
                  checked={profileData.allowConnection}
                  onChange={handleProfileChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowConnection" className="ml-2 text-sm text-gray-700">
                  Permettez à n'importe qui de vous ajouter à son équipe
                </label>
              </div>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
              <input
                type="text"
                id="phone"
                name="phone_number"
                value={profileData.phone_number}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="(678) 324-1251"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Messagerie électronique</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="sam@webestica.com"
                readOnly // L'email ne devrait généralement pas être modifiable
              />
            </div>
            
            <div className="md:col-span-3">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Aperçu</label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={profileData.bio}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Parlez-nous de vous..."
              />
              <p className="text-sm text-gray-500 mt-1">Limite de caractères : 300</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Modifier votre mot de passe</h2>
        <p className="text-gray-600 mb-6">
          Voir résolu bonté félicité timide civilité domestique avait mais.
        </p>
        
        {passwordUpdateSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
            Mot de passe mis à jour avec succès!
          </div>
        )}
        
        {passwordUpdateError && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {passwordUpdateError}
          </div>
        )}
        
        <form onSubmit={handlePasswordSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
              <input
                type="password"
                id="currentPassword"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type="password"
                  id="newPassword"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Entrez un nouveau mot de passe"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Écrivez votre mot de passe...</p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="new_password_confirmation"
                value={passwordData.new_password_confirmation}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;