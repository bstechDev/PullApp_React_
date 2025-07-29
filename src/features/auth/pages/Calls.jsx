import React, { useState, useEffect } from "react";
import { useVideoCall } from "../../../hooks/useVideoCall";
import { useFriends } from "../../../hooks/useFriends";
import { callsService } from "../services/callsService";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

// Composants
import CreateCallModal from "../components/CreateCallModal";
import UserStatusManager from "../components/UserStatusManager";


export default function CallsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeRooms, setActiveRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Utiliser le hook useFriends pour récupérer la liste des amis
  const { friendsList, loading: friendsLoading, reload: reloadFriends } = useFriends();
  const { initiateCall } = useVideoCall();
  const { user } = useAuth();

  // Charger les salles actives
  const loadActiveRooms = async () => {
    try {
      const response = await callsService.getCallHistory();
      
      // Gérer la structure de réponse de votre API
      const responseData = response?.data || response;
      console.log('📋 Données brutes de l\'historique des appels:', responseData);
      
      const activeRooms = Array.isArray(responseData) 
        ? responseData.filter(call => call.status === 'created' || call.status === 'ongoing')
        : [];
      
      // Améliorer les données utilisateur pour chaque salle
      const enhancedRooms = activeRooms.map(room => {
        console.log('🔍 Données de la salle:', room);
        console.log('👤 Données du créateur:', room.creator);
        
        // Si les données utilisateur sont incomplètes, essayer de les récupérer
        if (room.creator && (!room.creator.first_name || !room.creator.last_name)) {
          console.log('⚠️ Données utilisateur incomplètes, tentative de récupération...');
          
          // Essayer de récupérer les données utilisateur depuis le localStorage
          try {
            const currentUser = JSON.parse(localStorage.getItem('user_data'));
            if (currentUser && room.creator.id === currentUser.id) {
              console.log('✅ Utilisation des données utilisateur locales');
              return {
                ...room,
                creator: {
                  ...room.creator,
                  first_name: currentUser.first_name || room.creator.first_name,
                  last_name: currentUser.last_name || room.creator.last_name,
                  email: currentUser.email || room.creator.email
                }
              };
            }
          } catch (e) {
            console.error('Erreur lors de la récupération des données locales:', e);
          }
        }
        
        return room;
      });
      
      console.log('🎯 Salles actives améliorées:', enhancedRooms);
      setActiveRooms(enhancedRooms);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des salles:', error);
      toast.error('Erreur lors du chargement des salles actives');
    } finally {
      setLoading(false);
    }
  };

  // Polling pour mettre à jour les salles actives
  useEffect(() => {
    loadActiveRooms();
    reloadFriends(); // Charger la liste des amis au montage

    // Mettre à jour les salles actives toutes les 10 secondes
    const interval = setInterval(() => {
      loadActiveRooms();
    }, 10000); // 10 secondes

    return () => clearInterval(interval);
  }, [reloadFriends]);

  const handleDirectCall = async (friendId) => {
    try {
      const result = await initiateCall(friendId);
      
      // Vérifier si c'est un succès malgré une erreur 500
      if (result?.message?.includes("malgré l'erreur")) {
        toast.success("Appel initié avec succès ! (Récupéré après erreur serveur)");
      } else {
        toast.success("Appel initié avec succès");
      }
      
      // Recharger les salles actives après avoir initié un appel
      setTimeout(() => {
        loadActiveRooms();
      }, 2000);
    } catch (error) {
      // Vérifier si l'erreur contient des informations sur un appel récupéré
      if (error.message?.includes("malgré l'erreur")) {
        toast.success("Appel initié avec succès ! (Récupéré après erreur serveur)");
        // Recharger quand même les salles actives
        setTimeout(() => {
          loadActiveRooms();
        }, 2000);
      } else {
        toast.error(error.message || "Erreur lors de l'initiation de l'appel");
      }
    }
  };

  

  // Fonction pour rejoindre une salle avec vérification
  const handleJoinRoom = async (room) => {
    try {
      // Vérifier d'abord si la salle existe encore
      const response = await callsService.joinCall(room.id);
      
      if (response?.room_url) {
        // Ouvrir la salle dans un nouvel onglet
        window.open(response.room_url, '_blank');
      } else {
        toast.error("Impossible de rejoindre cette salle");
        // Recharger les salles actives pour mettre à jour la liste
        loadActiveRooms();
      }
    } catch (error) {
      console.error('Erreur lors de la tentative de rejoindre la salle:', error);
      
      // Si l'erreur indique que la salle n'existe plus, la retirer de la liste
      if (error.message?.includes('terminé') || error.message?.includes('n\'existe pas') || error.message?.includes('supprimée')) {
        toast.error("Cette salle n'est plus disponible");
        setActiveRooms(prev => prev.filter(r => r.id !== room.id));
      } else {
        toast.error(error.message || "Erreur lors de la tentative de rejoindre la salle");
      }
    }
  };

  // Fonction pour formater la date de dernière mise à jour
  const formatLastUpdate = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // différence en secondes
    
    if (diff < 60) return `Il y a ${diff}s`;
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
    return `Il y a ${Math.floor(diff / 3600)}h`;
  };


  console.log('Liste des amis:', friendsList); // Debug

  return (
    <div className="container mx-auto p-6">
      {/* Gestionnaire de statut utilisateur */}
      <UserStatusManager isEnabled={!!user?.id} />

      
      <h1 className="text-2xl font-bold mb-8">Appels</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Créer une salle de réunion */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-2">Créer une salle de réunion</h2>
          <p className="text-gray-600 text-sm mb-4">
            Créez une salle et invitez plusieurs amis pour une réunion de groupe
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Créer une salle
          </button>
        </div>

        {/* Appel direct */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Appel direct</h2>
            <button
              onClick={reloadFriends}
              className="text-blue-500 hover:text-blue-600 p-1"
              title="Rafraîchir la liste"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Démarrer un appel vidéo avec un ami
          </p>
          {friendsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : !friendsList.length ? (
            <div>
              <p className="text-center text-gray-500 py-4">Aucun ami disponible</p>
              <p className="text-xs text-gray-400 text-center">
                Total amis: {friendsList.length}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {friendsList.map(friend => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-blue-500">
                      {friend.first_name?.[0]}{friend.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {friend.first_name} {friend.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Ami
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDirectCall(friend.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      Appeler
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Salles actives */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Salles actives</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {formatLastUpdate(lastUpdate)}
              </span>
              <button
                onClick={loadActiveRooms}
                className="text-blue-500 hover:text-blue-600 p-1"
                title="Rafraîchir les salles"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Rejoindre une salle d'appel existante
          </p>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : !activeRooms.length ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500">Aucune salle active</p>
              <p className="text-xs text-gray-400 mt-1">Les salles se mettent à jour automatiquement</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeRooms.map(room => {
                // Fonction pour obtenir le nom complet de l'utilisateur
                const getCreatorName = (creator) => {
                  if (!creator) return 'Utilisateur inconnu';
                  
                  const firstName = creator.first_name || '';
                  const lastName = creator.last_name || '';
                  
                  if (firstName && lastName) {
                    return `${firstName} ${lastName}`;
                  } else if (firstName) {
                    return firstName;
                  } else if (lastName) {
                    return lastName;
                  } else {
                    return 'Utilisateur inconnu';
                  }
                };

                // Fonction pour obtenir les initiales
                const getInitials = (creator) => {
                  if (!creator) return 'UI';
                  
                  const firstInitial = creator.first_name?.[0] || '';
                  const lastInitial = creator.last_name?.[0] || '';
                  
                  return (firstInitial + lastInitial).toUpperCase() || 'UI';
                };

                const creatorName = getCreatorName(room.creator);
                const creatorInitials = getInitials(room.creator);

                return (
                  <div key={room.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {/* Avatar avec initiales */}
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-blue-500 text-sm font-medium">
                          {creatorInitials}
                        </div>
                        
                        {/* Informations de la salle */}
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            Appel de {creatorName}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              room.status === 'created' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {room.status === 'created' ? '📞 Appel en cours' : '🟢 En cours'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleJoinRoom(room)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Rejoindre
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateCallModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
}
