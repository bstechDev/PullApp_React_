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
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                {user?.firstname?.[0]}{user?.lastname?.[0]}
              </div>
              <div 
                className="w-full bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2.5 text-gray-500 cursor-pointer transition-colors"
                onClick={openCreatePost}
              >
                Quoi de neuf, {user?.firstname || 'utilisateur'} ?
              </div>
            </div>
            
            <div className="mt-3 flex justify-between border-t pt-3">
              <button 
                className="flex items-center text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-md"
                // onClick={openCreatePost}
              >
                <svg className="h-6 w-6 text-red-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"></path>
                </svg>
                <span className="hidden sm:inline">Vidéo en direct</span>
              </button>
              
              <button 
                className="flex items-center text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-md"
                onClick={openCreatePost}
              >
                <svg className="h-6 w-6 text-green-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"></path>
                </svg>
                <span className="hidden sm:inline">Photo/Vidéo</span>
              </button>
              
              <button 
                className="flex items-center text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-md"
                onClick={openCreatePost}
              >
                <svg className="h-6 w-6 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path>
                </svg>
                <span className="hidden sm:inline">Humeur/Activité</span>
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
      
      
      {/* Statistiques */}
      <div className="lg:col-span-3">
        <div className="bg-white shadow rounded-lg p-4 sticky top-20">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Statistiques</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1 bg-blue-100 p-4 rounded-lg">
              <p className="text-lg font-medium text-blue-700">Posts</p>
              <p className="text-2xl font-bold text-blue-900">123</p>
            </div>
            <div className="flex-1 bg-green-100 p-4 rounded-lg">
              <p className="text-lg font-medium text-green-700">Commentaires</p>
              <p className="text-2xl font-bold text-green-900">4562151</p>
            </div>
          </div>
        </div>
      </div>
      </div>
  );
};

export default DashboardHome;