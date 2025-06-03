import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CreatePostForm from '../../../Feed/CreatePostForm';
import FeedList from '../../../Feed/FeedList';
// import { Link } from 'react-router-dom';
// import MainLayout from '../../../../layouts/MainLayout';


const DashboardHome = () => {
  const { user } = useAuth();
  const displayUser = user || {};
  const firstName = displayUser.first_name || '';
  const lastName = displayUser.last_name || '';

  
  const [newPost, setNewPost] = useState(null);
  const [isCreatePostVisible, setIsCreatePostVisible] = useState(false);

  const handlePostCreated = (post) => {
    console.log("Nouveau post créé dans HomePage:", post);
    
    // Si le post est un objet contenant une propriété post, extrayez-la
    const newPostData = post.post || post;
    
    setNewPost(newPostData);
    setIsCreatePostVisible(false);
    
    // Attendre que le state soit mis à jour, puis réinitialiser newPost
    setTimeout(() => setNewPost(null), 500);
  };

  const openCreatePost = () => {
    setIsCreatePostVisible(true);
  };

  const closeCreatePost = () => {
    setIsCreatePostVisible(false);
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar gauche */}
      <div className="lg:col-span-3">
        <div className="bg-white shadow rounded-lg p-4 sticky top-20">
          <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-gray-200">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              {firstName && lastName ? (
                <span className="text-sm font-medium text-gray-700">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {firstName} {lastName}
              </p>
              <p className="text-sm text-gray-500">
                {displayUser.email || 'Utilisateur'}
              </p>
            </div>
          </div>
          
          <nav className="space-y-1">
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Fil d'actualité
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Groupes
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Favoris
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Événements
            </a>
          </nav>
        </div>
      </div>
      
      {/* Flux central */}
      <div className="md:col-span-6">
          {/* Zone de création de post */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative group">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-md ring-2 ring-white">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              
              <div 
                className="flex-1 bg-gray-50 hover:bg-gray-100 rounded-2xl px-6 py-4 text-gray-500 cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-blue-200 hover:shadow-sm"
                onClick={openCreatePost}
              >
                <span className="text-base font-medium">
                  Quoi de neuf, {user?.first_name || 'utilisateur'} ?
                </span>
              </div>
            </div>

            {/* Séparateur avec gradient */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6"></div>


            
            {/* Boutons d'action redesignés */}
            <div className="flex justify-around">
              {/* Photo */}
              <button 
                className="group relative overflow-hidden flex items-center justify-center space-x-3 px-4 py-3.5 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 border border-transparent hover:border-green-200"
                onClick={openCreatePost}
              >
                <div className="relative">
                  <div className="p-2 rounded-xl bg-green-100 group-hover:bg-green-200 transition-all duration-300 group-hover:scale-110">
                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/>
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                </div>
                <span className="text-gray-700 font-medium text-sm group-hover:text-green-700 transition-colors duration-300">
                  Photo
                </span>
              </button>
              
              {/* Vidéo */}
              <button 
                className="group relative overflow-hidden flex items-center justify-center space-x-3 px-4 py-3.5 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 border border-transparent hover:border-red-200"
                onClick={openCreatePost}
              >
                <div className="relative">
                  <div className="p-2 rounded-xl bg-red-100 group-hover:bg-red-200 transition-all duration-300 group-hover:scale-110">
                    <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                </div>
                <span className="text-gray-700 font-medium text-sm group-hover:text-red-700 transition-colors duration-300">
                  Vidéo
                </span>
              </button>
              
              {/* Événement */}
              <button 
                className="group relative overflow-hidden flex items-center justify-center space-x-3 px-4 py-3.5 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-300 border border-transparent hover:border-orange-200"
                onClick={openCreatePost}
              >
                <div className="relative">
                  <div className="p-2 rounded-xl bg-orange-100 group-hover:bg-orange-200 transition-all duration-300 group-hover:scale-110">
                    <svg className="h-5 w-5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                </div>
                <span className="text-gray-700 font-medium text-sm group-hover:text-orange-700 transition-colors duration-300">
                  Événement
                </span>
              </button>
              
              {/* Sentiment/Activité */}
              <button 
                className="group relative overflow-hidden flex items-center justify-center space-x-3 px-4 py-3.5 rounded-xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-amber-50 transition-all duration-300 border border-transparent hover:border-yellow-200"
                onClick={openCreatePost}
              >
                <div className="relative">
                  <div className="p-2 rounded-xl bg-yellow-100 group-hover:bg-yellow-200 transition-all duration-300 group-hover:scale-110">
                    <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                    </svg>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                </div>
                <span className="text-gray-700 font-medium text-sm group-hover:text-yellow-700 transition-colors duration-300 hidden sm:inline">
                  Sentiment
                </span>
                <span className="text-gray-700 font-medium text-sm group-hover:text-yellow-700 transition-colors duration-300 sm:hidden">
                  Humeur
                </span>
              </button>
            </div>
          </div>
        
          
          {/* Formulaire de création de post */}
          <CreatePostForm 
            onPostCreated={handlePostCreated} 
            onCancel={closeCreatePost}
            isVisible={isCreatePostVisible}
          />
          
          {/* Liste des posts */}
          <FeedList newPost={newPost} />
        </div>
      
      {/* Sidebar droite */}
        <div className="hidden lg:block md:col-span-3">
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Suggestions</h3>
            <div className="space-y-4">
              {/* Suggestions d'amis/collègues */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                    JD
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Jean Dupont</p>
                    <p className="text-xs text-gray-500">Marketing</p>
                  </div>
                </div>
                <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                  + Suivre
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                    ML
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Marie Leroy</p>
                    <p className="text-xs text-gray-500">Design</p>
                  </div>
                </div>
                <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                  + Suivre
                </button>
                </div>
            </div>
          </div>
        </div>
      
      
      </div>
  );
};

export default DashboardHome;