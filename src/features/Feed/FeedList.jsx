import React, { useState, useEffect } from 'react';
import PostItem from './PostItem';
import { getAllPosts } from './feedService';

const FeedList = ({ newPost, onPostUpdate, onPostDelete }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  
  useEffect(() => {
    console.log("FeedList monté, chargement des posts");
    fetchPosts();
  }, []);
  
  useEffect(() => {
    if (newPost) {
      console.log("Nouveau post reçu dans FeedList:", newPost);
      setPosts(currentPosts => {
        const postId = newPost.id || newPost.post?.id;
        const exists = currentPosts.some(p => {
          const pId = p.id || p.post?.id;
          return pId === postId;
        });
        
        if (exists) {
          console.log("Le post existe déjà dans la liste");
          return currentPosts;
        }
        
        return [newPost, ...currentPosts];
      });
    }
  }, [newPost]);
  
  const fetchPosts = async () => {
    setLoading(true);
    setError(''); // Réinitialiser l'erreur
    
    try {
      console.log("Tentative de récupération des posts...");
      const response = await getAllPosts();
      console.log('Réponse API getAllPosts:', response);
      
      setDebugInfo({
        responseReceived: true,
        responseData: response.data,
        responseType: typeof response.data,
        isArray: Array.isArray(response.data),
        hasDataProperty: response.data && response.data.data ? true : false
      });
      
      let postsData = [];
      
      // Gérer la structure de réponse paginée de Laravel
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        postsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        postsData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Essayer d'extraire les posts d'un objet
        const postsArray = [];
        for (const key in response.data) {
          if (response.data[key] && typeof response.data[key] === 'object' && response.data[key].id) {
            postsArray.push(response.data[key]);
          }
        }
        postsData = postsArray;
      }
      
      console.log('Posts extraits:', postsData);
      
      // Si postsData est un tableau vide, c'est normal - pas d'erreur
      if (Array.isArray(postsData)) {
        const sortedPosts = postsData.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        
        setPosts(sortedPosts);
        setError(''); // S'assurer qu'il n'y a pas d'erreur
      } else {
        // Seulement une erreur si la structure est invalide
        setError("Structure de données invalide reçue de l'API.");
        setPosts([]);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(`Erreur lors du chargement des posts: ${err.message || 'Erreur inconnue'}. Veuillez réessayer plus tard.`);
      setDebugInfo({
        error: true,
        message: err.message,
        responseData: err.response?.data,
        status: err.response?.status
      });
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePostUpdated = (updatedPost) => {
    console.log("Post mis à jour:", updatedPost);
    setPosts(currentPosts => {
      const postId = updatedPost.id || updatedPost.post?.id;
      return currentPosts.map(post => {
        const currentPostId = post.id || post.post?.id;
        if (currentPostId === postId) {
          // Vérifier si le post a réellement changé pour éviter les re-rendus inutiles
          if (JSON.stringify(post) !== JSON.stringify(updatedPost)) {
            return updatedPost;
          }
        }
        return post;
      });
    });
    
    if (onPostUpdate) {
      onPostUpdate(updatedPost);
    }
  };
  
  const handlePostDeleted = (postId) => {
    console.log("Post supprimé:", postId);
    setPosts(currentPosts => 
      currentPosts.filter(post => {
        const id = post.id || post.post?.id;
        return id !== postId;
      })
    );
    
    if (onPostDelete) {
      onPostDelete(postId);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-green-500 rounded-full animate-spin" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-700">Chargement de votre fil d'actualité...</p>
        <p className="mt-2 text-sm text-gray-500">Préparation de votre expérience personnalisée</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-lg border border-red-100 p-8 text-center">
        <div className="flex flex-col items-center">
          {/* Illustration d'erreur stylée */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">Oups ! Une petite interruption</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Nous rencontrons quelques difficultés pour charger votre contenu. 
            Pas de panique, c'est temporaire !
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={fetchPosts}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réessayer
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Actualiser la page
            </button>
          </div>
        </div>
        
        {/* Informations de débogage cachées mais accessibles */}
        {debugInfo && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center">
                <svg className="w-4 h-4 mr-2 group-open:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                Informations techniques
              </summary>
              <div className="mt-3 p-3 bg-gray-50 rounded text-xs font-mono overflow-auto max-h-40">
                <pre className="text-gray-700">{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </details>
          </div>
        )}
      </div>
    );
  }
  
  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="flex flex-col items-center">
          {/* Illustration simple et élégante */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-3">Aucun post pour le moment</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Soyez le premier à partager quelque chose ! 
            Créez votre premier post et commencez à interagir avec votre communauté.
          </p>
          
          <button
            onClick={() => {
              // Déclencher l'ouverture du modal de création de post
              const createPostButton = document.querySelector('[onclick*="openCreatePost"]');
              if (createPostButton) {
                createPostButton.click();
              }
            }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-green-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Créer mon premier post
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {posts.map(post => {
        const postId = post.id || post.post?.id;
        
        if (!postId) {
          console.error('Post sans ID:', post);
          return null;
        }
        
        return (
          <PostItem
            key={postId}
            post={post}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
          />
        );
      })}
    </div>
  );
};

export default FeedList;