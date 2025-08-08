// src/features/Feed/feedService.js
import api from "../../services/api";

// Fonction de test pour vérifier le statut des posts
export const testPostStatus = async () => {
  try {
    console.log("🧪 Test de création de post avec statut pending...");

    const testPostData = {
      content:
        "Test post pour vérifier le statut - " + new Date().toISOString(),
      type: "post",
      status: "pending",
      moderation_required: true,
    };

    console.log("📤 Données envoyées:", testPostData);

    const response = await api.post("/posts", testPostData);
    console.log("📥 Réponse reçue:", response.data);

    if (response.data.post) {
      console.log("✅ Statut du post créé:", response.data.post.status);
      return response.data.post.status === "pending";
    }

    return false;
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
    return false;
  }
};

export const createPost = async (postData) => {
  try {
    // Pour déboguer - vérifier le contenu du FormData
    if (postData instanceof FormData) {
      console.log("Envoi d'un FormData avec les entrées:");
      for (let [key, value] of postData.entries()) {
        console.log(
          `${key}: ${
            value instanceof File
              ? `Fichier: ${value.name} (${value.type}, ${value.size} bytes)`
              : value
          }`
        );
      }

      // Créer une configuration spécifique pour cette requête
      const config = {
        headers: {
          // Ne pas définir Content-Type manuellement, laissez Axios le faire
          // Mais vous pouvez ajouter d'autres en-têtes au besoin
          Accept: "application/json",
        },
        // Important: désactiver la transformation automatique des données
        transformRequest: (data) => data,
      };

      // Ajouter le statut "pending" au FormData
      postData.append("status", "pending");
      postData.append("moderation_required", "true");

      console.log("📝 Envoi du post avec statut 'pending' pour modération");

      return await api.post("/posts", postData, config);
    } else {
      // Pour les données non-FormData, ajouter le statut pending
      const dataWithStatus = {
        ...postData,
        status: "pending",
        moderation_required: true,
      };

      console.log(
        "📝 Envoi du post avec statut 'pending' pour modération:",
        dataWithStatus
      );

      return await api.post("/posts", dataWithStatus);
    }
  } catch (error) {
    console.error("Erreur lors de la création du post:", error);
    throw error;
  }
};

// Les autres fonctions restent inchangées
export const getAllPosts = () => {
  return api.get("/posts");
};

export const getPostById = (id) => {
  return api.get(`/posts/${id}`);
};

export const updatePost = (id, postData) => {
  if (postData instanceof FormData) {
    return api.put(`/posts/${id}`, postData);
  } else {
    return api.put(`/posts/${id}`, postData);
  }
};

export const deletePost = (id) => {
  return api.delete(`/posts/${id}`);
};
