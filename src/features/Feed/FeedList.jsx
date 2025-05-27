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
      
      if (Array.isArray(response.data)) {
        postsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        postsData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        const postsArray = [];
        for (const key in response.data) {
          if (response.data[key] && typeof response.data[key] === 'object' && response.data[key].id) {
            postsArray.push(response.data[key]);
          }
        }
        postsData = postsArray;
      }
      
      console.log('Posts extraits:', postsData);
      
      if (!postsData || postsData.length === 0) {
        console.log("Aucun post trouvé dans la réponse API");
        setError("Aucun post n'a été trouvé dans la réponse de l'API.");
        setPosts([]);
        setLoading(false);
        return;
      }
      
      const sortedPosts = Array.isArray(postsData) ? postsData.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      }) : [];
      
      setPosts(sortedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(`Erreur lors du chargement des posts: ${err.message || 'Erreur inconnue'}. Veuillez réessayer plus tard.`);
      setDebugInfo({
        error: true,
        message: err.message,
        responseData: err.response?.data,
        status: err.response?.status
      });
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
      <div className="flex justify-center items-center py-8">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-2 text-gray-700">Chargement des posts...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <div className="mt-2">
              <button
                onClick={fetchPosts}
                className="text-sm font-medium text-red-800 hover:text-red-900"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
        
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto">
            <details>
              <summary className="cursor-pointer">Informations de débogage</summary>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    );
  }
  
  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">
          Aucun post pour le moment. Soyez le premier à publier quelque chose !
        </p>
        
        {debugInfo && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto">
            <details>
              <summary className="cursor-pointer">Informations de débogage</summary>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </details>
          </div>
        )}
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