import { useState, useEffect } from "react";
import pusherService from "../services/pusherService";

export const usePosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const setupPostsChannel = async () => {
      try {
        // Attendre que Pusher soit initialisé
        await pusherService.waitForInitialization();

        // Se connecter au canal des posts
        const postsChannel = pusherService.subscribeToPublicChannel("posts");

        // Écouter les nouveaux posts
        postsChannel.bind("new-post", (data) => {
          console.log("📝 Nouveau post reçu:", data);
          setPosts((prev) => [data, ...prev]);
        });

        // Nettoyer à la déconnexion
        return () => {
          pusherService.unsubscribeFromChannel("posts");
        };
      } catch (error) {
        console.error("Erreur lors de la connexion aux posts:", error);
      }
    };

    setupPostsChannel();
  }, []);

  const addPost = (post) => {
    setPosts((prev) => [post, ...prev]);
  };

  const updatePost = (postId, updates) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, ...updates } : post))
    );
  };

  const removePost = (postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  return {
    posts,
    addPost,
    updatePost,
    removePost,
  };
};
