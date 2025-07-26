import api from "../../../services/api";

export const callsService = {
  // Test de connectivité avec le backend
  async testConnection() {
    try {
      const response = await api.get("/health");

      // Gérer la structure de réponse de votre API
      const responseData = response.data;
      const actualData = responseData?.data || responseData;

      return actualData;
    } catch (error) {
      console.error("Test de connectivité échoué:", error);
      throw new Error("Impossible de se connecter au serveur backend");
    }
  },

  // Créer une nouvelle salle d'appel
  async createRoom() {
    try {
      console.log("Tentative de création de salle...");

      const response = await api.post("/call/create-room", {
        type: "video",
      });

      console.log("Réponse complète du backend:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      });

      // Vérifier si la réponse contient room_url ou une structure alternative
      const responseData = response.data;

      // Log de la structure complète pour debug
      console.log(
        "Structure de la réponse:",
        JSON.stringify(responseData, null, 2)
      );

      // Vérifier la structure de réponse de votre API
      // Votre API retourne: { success: true, data: { room_url: "...", ... } }
      const actualData = responseData?.data || responseData;

      // Vérifier différentes possibilités de nommage
      const roomUrl =
        actualData?.room_url ||
        actualData?.url ||
        actualData?.roomUrl ||
        actualData?.meeting_url ||
        actualData?.call_url;

      if (!roomUrl) {
        console.error(
          "Aucune URL de salle trouvée dans la réponse. Structure disponible:",
          Object.keys(actualData || {})
        );
        throw new Error(
          `URL de la salle manquante dans la réponse. Structure reçue: ${JSON.stringify(
            actualData
          )}`
        );
      }

      // Retourner la réponse avec l'URL normalisée
      return {
        ...actualData,
        room_url: roomUrl,
      };
    } catch (error) {
      console.error("Erreur createRoom détaillée:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        },
      });

      // Gestion spécifique des erreurs
      if (error.response?.status === 500) {
        throw new Error(
          "Erreur serveur (500). Vérifiez que le backend est démarré et que l'endpoint /call/create-room existe."
        );
      }

      if (error.response?.status === 404) {
        throw new Error(
          "Endpoint /call/create-room non trouvé sur le backend."
        );
      }

      if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
        throw new Error(
          "Impossible de se connecter au serveur backend. Vérifiez qu'il est démarré sur http://192.168.1.4:8000"
        );
      }

      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erreur lors de la création de la salle"
      );
    }
  },

  // Initier un appel avec un ami
  async initiateCall(friendId) {
    if (!friendId) throw new Error("ID de l'ami requis");

    try {
      console.log("Tentative d'initiation d'appel avec friendId:", friendId);

      const requestData = {
        type: "video",
        friend_id: friendId, // Ajouter explicitement l'ID de l'ami
        timestamp: new Date().toISOString(), // Ajouter un timestamp pour le debug
      };

      console.log("Données envoyées au backend:", requestData);

      const response = await api.post(
        `/call/initiate/${friendId}`,
        requestData
      );

      console.log("Réponse du backend:", response.data);

      // Gérer la structure de réponse de votre API
      const responseData = response.data;
      const actualData = responseData?.data || responseData;

      if (!actualData?.room_url) {
        console.error("Réponse invalide du backend:", actualData);
        throw new Error("URL de la salle manquante dans la réponse");
      }

      return actualData;
    } catch (error) {
      console.error("Erreur initiateCall:", {
        friendId,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        response: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
      });

      // Gestion spéciale pour l'erreur 500 - vérifier si l'appel a quand même été créé
      if (error.response?.status === 500) {
        console.log(
          "Erreur 500 détectée, vérification si l'appel a été créé..."
        );

        try {
          // Attendre un peu pour laisser le temps au backend de traiter
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Vérifier si l'appel existe maintenant dans l'historique
          const historyResponse = await this.getCallHistory();
          const recentCalls = historyResponse?.calls || historyResponse || [];

          // Chercher un appel récent pour cet ami
          const recentCall = recentCalls.find(
            (call) =>
              call.participant?.id === friendId || call.caller?.id === friendId
          );

          if (recentCall && recentCall.status === "created") {
            console.log("Appel trouvé malgré l'erreur 500:", recentCall);
            return {
              room_url: recentCall.room_url || recentCall.url,
              call_id: recentCall.id,
              status: recentCall.status,
              message: "Appel créé avec succès (malgré l'erreur de réponse)",
            };
          }
        } catch (checkError) {
          console.error(
            "Erreur lors de la vérification de l'appel:",
            checkError
          );
        }

        throw new Error(
          "Erreur serveur lors de l'initiation de l'appel. Veuillez réessayer."
        );
      }

      // Gérer les autres erreurs spécifiques
      if (error.response?.status === 404) {
        throw new Error("Ami non trouvé ou endpoint inexistant");
      }

      if (error.response?.status === 422) {
        throw new Error("Données invalides pour l'initiation de l'appel");
      }

      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Erreur lors de l'initiation de l'appel"
      );
    }
  },

  // Rejoindre  appel existant
  async joinCall(callId) {
    if (!callId) throw new Error("ID de l'appel requis");

    try {
      const response = await api.post(`/call/join/${callId}`);

      // Gérer la structure de réponse de votre API
      const responseData = response.data;
      const actualData = responseData?.data || responseData;

      if (actualData?.status === "ended") {
        throw new Error("Cet appel est déjà terminé");
      }

      return actualData;
    } catch (error) {
      console.error("Erreur joinCall:", {
        callId,
        message: error.message,
        response: error.response?.data,
      });

      // Gérer les erreurs spécifiques
      if (error.response?.status === 404) {
        throw new Error("Cette salle n'existe plus ou a été supprimée");
      }

      if (error.response?.status === 410) {
        throw new Error("Cet appel est déjà terminé");
      }

      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la tentative de rejoindre l'appel"
      );
    }
  },

  // Vérifier le statut d'une salle spécifique
  async checkRoomStatus(roomId) {
    if (!roomId) throw new Error("ID de la salle requis");

    try {
      const response = await api.get(`/call/status/${roomId}`);

      // Gérer la structure de réponse de votre API
      const responseData = response.data;
      const actualData = responseData?.data || responseData;

      return actualData;
    } catch (error) {
      console.error("Erreur checkRoomStatus:", {
        roomId,
        message: error.message,
        response: error.response?.data,
      });

      if (error.response?.status === 404) {
        throw new Error("Cette salle n'existe plus");
      }

      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la vérification du statut de la salle"
      );
    }
  },

  // Terminer un appel
  async endCall(callId) {
    if (!callId) throw new Error("ID de l'appel requis");

    try {
      const response = await api.post(`/call/end/${callId}`);

      // Gérer la structure de réponse de votre API
      const responseData = response.data;
      const actualData = responseData?.data || responseData;

      return actualData;
    } catch (error) {
      console.error("Erreur endCall:", {
        callId,
        message: error.message,
        response: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la terminaison de l'appel"
      );
    }
  },

  // Récupérer l'historique des appels
  async getCallHistory(page = 1) {
    try {
      const response = await api.get(`/call/history?page=${page}`);

      // Gérer la structure de réponse de votre API
      const responseData = response.data;
      const actualData = responseData?.data || responseData;

      console.log("📋 Historique des appels récupéré:", actualData);

      // Améliorer les données utilisateur si nécessaire
      if (Array.isArray(actualData)) {
        const enhancedData = await Promise.all(
          actualData.map(async (call) => {
            // Améliorer les données du créateur
            if (
              call.creator &&
              (!call.creator.first_name || !call.creator.last_name)
            ) {
              console.log(
                "⚠️ Données créateur incomplètes pour l'appel:",
                call.id
              );

              // Essayer de récupérer depuis le localStorage
              try {
                const currentUser = JSON.parse(
                  localStorage.getItem("user_data")
                );
                if (currentUser && call.creator.id === currentUser.id) {
                  console.log(
                    "✅ Amélioration des données créateur avec les données locales"
                  );
                  call.creator = {
                    ...call.creator,
                    first_name:
                      currentUser.first_name || call.creator.first_name,
                    last_name: currentUser.last_name || call.creator.last_name,
                    email: currentUser.email || call.creator.email,
                  };
                } else {
                  // Essayer de récupérer depuis l'API
                  console.log(
                    "🔄 Tentative de récupération des données créateur depuis l'API..."
                  );
                  const userData = await this.getUserData(call.creator.id);
                  if (userData) {
                    console.log(
                      "✅ Amélioration des données créateur avec les données API"
                    );
                    call.creator = {
                      ...call.creator,
                      first_name:
                        userData.first_name || call.creator.first_name,
                      last_name: userData.last_name || call.creator.last_name,
                      email: userData.email || call.creator.email,
                    };
                  }
                }
              } catch (e) {
                console.error(
                  "Erreur lors de l'amélioration des données créateur:",
                  e
                );
              }
            }

            // Améliorer les données du participant si présent
            if (
              call.participant &&
              (!call.participant.first_name || !call.participant.last_name)
            ) {
              console.log(
                "⚠️ Données participant incomplètes pour l'appel:",
                call.id
              );

              // Essayer de récupérer depuis la liste d'amis
              try {
                const friendsList = JSON.parse(
                  localStorage.getItem("friends_list") || "[]"
                );
                const friend = friendsList.find(
                  (f) => f.id === call.participant.id
                );
                if (friend) {
                  console.log(
                    "✅ Amélioration des données participant avec les données d'amis"
                  );
                  call.participant = {
                    ...call.participant,
                    first_name:
                      friend.first_name || call.participant.first_name,
                    last_name: friend.last_name || call.participant.last_name,
                    email: friend.email || call.participant.email,
                  };
                }
              } catch (e) {
                console.error(
                  "Erreur lors de l'amélioration des données participant:",
                  e
                );
              }
            }

            return call;
          })
        );

        console.log("🎯 Données améliorées:", enhancedData);
        return enhancedData;
      }

      return actualData;
    } catch (error) {
      console.error("Erreur getCallHistory:", {
        page,
        message: error.message,
        response: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la récupération de l'historique"
      );
    }
  },

  // Vérifier les appels entrants
  async checkIncomingCalls() {
    try {
      const response = await api.get("/calls/incoming");

      // Gérer la structure de réponse de votre API
      const responseData = response.data;
      const actualData = responseData?.data || responseData;

      return actualData;
    } catch (error) {
      console.error("Erreur checkIncomingCalls:", {
        message: error.message,
        response: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de la vérification des appels entrants"
      );
    }
  },

  // Accepter un appel entrant
  async acceptCall(callId) {
    if (!callId) throw new Error("ID de l'appel requis");

    try {
      const response = await api.post(`/call/accept/${callId}`);

      // Gérer la structure de réponse de votre API
      const responseData = response.data;
      const actualData = responseData?.data || responseData;

      return actualData;
    } catch (error) {
      console.error("Erreur acceptCall:", {
        callId,
        message: error.message,
        response: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message ||
          "Erreur lors de l'acceptation de l'appel"
      );
    }
  },

  // Rejeter un appel entrant
  async rejectCall(callId) {
    if (!callId) throw new Error("ID de l'appel requis");

    try {
      const response = await api.post(`/call/reject/${callId}`);

      // Gérer la structure de réponse de votre API
      const responseData = response.data;
      const actualData = responseData?.data || responseData;

      return actualData;
    } catch (error) {
      console.error("Erreur rejectCall:", {
        callId,
        message: error.message,
        response: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message || "Erreur lors du rejet de l'appel"
      );
    }
  },

  // Récupérer les données utilisateur depuis l'API
  async getUserData(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      const userData = response.data?.data || response.data;
      console.log("👤 Données utilisateur récupérées:", userData);
      return userData;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données utilisateur:",
        error
      );
      return null;
    }
  },

  // Fonction de diagnostic pour les erreurs 500
  async diagnoseCallCreation(friendId) {
    try {
      console.log("🔍 Diagnostic de création d'appel pour friendId:", friendId);

      // 1. Vérifier la connectivité
      const healthCheck = await this.testConnection();
      console.log("✅ Connectivité:", healthCheck);

      // 2. Vérifier l'historique avant création
      const beforeHistory = await this.getCallHistory();
      console.log("📋 Historique avant création:", beforeHistory);

      // 3. Tenter la création
      console.log("🚀 Tentative de création d'appel...");
      const createResult = await this.initiateCall(friendId);
      console.log("✅ Résultat création:", createResult);

      return { success: true, data: createResult };
    } catch (error) {
      console.log("❌ Erreur lors du diagnostic:", error);

      // 4. Vérifier l'historique après erreur
      try {
        const afterHistory = await this.getCallHistory();
        console.log("📋 Historique après erreur:", afterHistory);

        // Chercher un appel récent pour cet ami
        const recentCalls = afterHistory?.calls || afterHistory || [];
        const recentCall = recentCalls.find(
          (call) =>
            call.participant?.id === friendId || call.caller?.id === friendId
        );

        if (recentCall) {
          console.log("🎯 Appel trouvé malgré l'erreur:", recentCall);
          return {
            success: true,
            recovered: true,
            data: recentCall,
            error: error.message,
          };
        }
      } catch (historyError) {
        console.error(
          "❌ Erreur lors de la vérification de l'historique:",
          historyError
        );
      }

      return { success: false, error: error.message };
    }
  },
};
