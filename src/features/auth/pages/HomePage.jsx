// src/pages/HomePage.jsx
import React, { useState } from 'react';
import CreatePostForm from '../../Feed/CreatePostForm';
import FeedList from '../../Feed/FeedList';
import { useAuth } from '../../auth/contexts/AuthContext';
import { Link } from 'react-router-dom';
import MainLayout from '../../../layouts/MainLayout';

const HomePage = () => {
  const { user } = useAuth();
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
    <MainLayout>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar - Profil utilisateur */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="p-4 flex items-center">
              <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-lg">
                {user?.firstname?.[0]}{user?.lastname?.[0]}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstname} {user?.lastname}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email}
                </p>
              </div>
            </div>
            
            {/* Menu latéral */}
            <div className="border-t border-gray-100">
              <Link to="/home" className="block px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 flex items-center">
                <svg className="h-5 w-5 mr-3 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4v12H8V4h12m0-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7.53 12L9 10.5l1.4-1.41 2.07 2.08L17.6 6 19 7.41 12.47 14zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"></path>
                </svg>
                Fil d'actualité
              </Link>
              
              <Link to="/groups" className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center">
                <svg className="h-5 w-5 mr-3 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58C.48 14.9 0 15.62 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58-.73.32-1.22 1.04-1.22 1.85V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"></path>
                </svg>
                Groupes
              </Link>
              
              <Link to="/favorites" className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center">
                <svg className="h-5 w-5 mr-3 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path>
                </svg>
                Favoris
              </Link>
              
              <Link to="/events" className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center">
                <svg className="h-5 w-5 mr-3 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zM5 7V5h14v2H5zm2 4h10v2H7zm0 4h7v2H7z"></path>
                </svg>
                Événements
              </Link>
            </div>
          </div>
        </div>
        
        {/* Contenu principal - Feed */}
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
                onClick={openCreatePost}
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
          
          {/* Événements à venir */}
          {/* <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Événements à venir</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 text-blue-800 rounded p-2 text-center w-12">
                  <span className="block text-xs font-medium">MAI</span>
                  <span className="block text-lg font-bold">15</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Réunion d'équipe mensuelle</p>
                  <p className="text-xs text-gray-500">10:00 - 11:30 • Salle Jupiter</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-blue-100 text-blue-800 rounded p-2 text-center w-12">
                  <span className="block text-xs font-medium">MAI</span>
                  <span className="block text-lg font-bold">22</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Webinaire: Nouvelles technologies</p>
                  <p className="text-xs text-gray-500">14:00 - 15:30 • En ligne</p>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;