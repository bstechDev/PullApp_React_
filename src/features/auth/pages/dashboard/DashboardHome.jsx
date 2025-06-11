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
      
      {/* Sidebar gauche - Style carte de profil moderne */}
      <div className="lg:col-span-3">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden sticky top-20 transform hover:scale-[1.02] transition-all duration-300">
        
        {/* Photo de couverture avec gradient orange/vert */}
        <div className="relative h-24 bg-gradient-to-br from-orange-500 via-orange-600 to-green-600">
          {/* Pattern décoratif */}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"></div>
          
          {/* Éléments décoratifs flottants */}
          <div className="absolute top-2 right-4 w-3 h-3 bg-white bg-opacity-30 rounded-full"></div>
          <div className="absolute top-6 right-8 w-2 h-2 bg-white bg-opacity-20 rounded-full"></div>
          <div className="absolute bottom-4 left-6 w-4 h-4 bg-white bg-opacity-25 rounded-full"></div>
        </div>
        
        {/* Section profil */}
        <div className="relative px-6 pb-6">
          {/* Avatar avec bordure et badge de statut */}
          <div className="flex justify-center -mt-8 mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-green-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white">
                {firstName && lastName ? (
                  <span>{firstName.charAt(0)}{lastName.charAt(0)}</span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              {/* Badge de statut en ligne */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-white shadow-md">
                <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
          </div>
          
          {/* Informations utilisateur */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {firstName} {lastName}
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              {displayUser.role || 'Web Developer'} • {displayUser.company || 'BSTEC Institut'}
            </p>
            
            {/* Bio/Citation personnalisée */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-600 italic leading-relaxed">
                "{displayUser.bio || "Passionné par l'innovation et les nouvelles technologies. Toujours prêt à relever de nouveaux défis !"}"
              </p>
            </div>
          </div>
          
          {/* Statistiques du profil */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">24</div>
              <div className="text-xs text-gray-500 font-medium">Posts</div>
            </div>
            <div className="text-center border-l border-r border-gray-200">
              <div className="text-2xl font-bold text-orange-600">1.2K</div>
              <div className="text-xs text-gray-500 font-medium">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">180</div>
              <div className="text-xs text-gray-500 font-medium">Following</div>
            </div>
          </div>
          
          {/* Séparateur élégant */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6"></div>
          
          {/* Navigation repensée */}
          <nav className="space-y-2">
            <a href="#" className="group flex items-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-green-600 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200">
              <div className="p-1.5 rounded-lg bg-white bg-opacity-20 mr-3 group-hover:bg-opacity-30 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              Fil d'actualité
              <div className="ml-auto w-2 h-2 bg-white bg-opacity-60 rounded-full"></div>
            </a>
            
            <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-orange-50 rounded-xl transition-all duration-200">
              <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600 mr-3 group-hover:bg-orange-200 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              Groupes
              <div className="ml-auto">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">3</span>
              </div>
            </a>
            
            <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-green-50 rounded-xl transition-all duration-200">
              <div className="p-1.5 rounded-lg bg-green-100 text-green-600 mr-3 group-hover:bg-green-200 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              Favoris
              <div className="ml-auto">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">12</span>
              </div>
            </a>
            
            <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200">
              <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600 mr-3 group-hover:bg-orange-200 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              Événements
              <div className="ml-auto">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">5</span>
              </div>
            </a>
            
            <a href="#" className="group flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200">
              <div className="p-1.5 rounded-lg bg-green-100 text-green-600 mr-3 group-hover:bg-green-200 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Mes documents
            </a>
          </nav>
          
          {/* Bouton d'action principal */}
          <div className="mt-6">
            <button className="w-full bg-gradient-to-r from-orange-500 to-green-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Voir le profil</span>
            </button>
          </div>
        </div>
      </div>
  
      {/* Widget secondaire - Activité récente */}
      <div className="bg-white shadow-md rounded-2xl p-5 mt-6 border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
          Activité récente
        </h4>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">Post publié avec succès</p>
              <p className="text-xs text-gray-500">Il y a 2 heures</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">3 nouveaux followers</p>
              <p className="text-xs text-gray-500">Hier</p>
            </div>
          </div>
        </div>
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
          <div className="sticky top-20 space-y-6">
          
          {/* Widget "Who to follow" */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Amis</h3>
              </div>
        </div>
            
            {/* Liste des suggestions */}
            <div className="divide-y divide-gray-50">
              {/* Suggestion 1 - Judy Nguyen */}
              <div className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=387&q=80" 
                        alt="Judy Nguyen" 
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">Judy Nguyen</p>
                      <p className="text-xs text-gray-500">News anchor</p>
                    </div>
                  </div>
                  <button className="inline-flex items-center justify-center w-10 h-10 border border-transparent rounded-full text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transform hover:scale-110 transition-all duration-200 shadow-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Suggestion 2 - Amanda Reed */}
              <div className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img 
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                        alt="Amanda Reed" 
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">Amanda Reed</p>
                      <p className="text-xs text-gray-500">Web Developer</p>
                    </div>
                  </div>
                  <button className="inline-flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full text-gray-600 bg-white hover:bg-gray-50 hover:border-orange-300 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transform hover:scale-110 transition-all duration-200 shadow-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Suggestion 3 - Billy Vasquez */}
              <div className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img 
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                        alt="Billy Vasquez" 
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">Billy Vasquez</p>
                      <p className="text-xs text-gray-500">News anchor</p>
                    </div>
                  </div>
                  <button className="inline-flex items-center justify-center w-10 h-10 border border-transparent rounded-full text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:scale-110 transition-all duration-200 shadow-md">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Suggestion 4 - Lori Ferguson */}
              <div className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img 
                        src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1061&q=80" 
                        alt="Lori Ferguson" 
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">Lori Ferguson</p>
                      <p className="text-xs text-gray-500">Web Developer at ...</p>
                    </div>
                  </div>
                  <button className="inline-flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full text-gray-600 bg-white hover:bg-gray-50 hover:border-orange-300 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transform hover:scale-110 transition-all duration-200 shadow-md">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>

            {/* Footer avec "View more" */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors duration-200 flex items-center group">
                View more
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

        </div>
  
      </div>
  );
};

export default DashboardHome;