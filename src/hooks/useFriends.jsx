// src/features/friends/hooks/useFriends.jsx
import { useState, useEffect, useCallback } from 'react';
import { friendsService } from '../features/auth/services/friendsService'; 
import { useAuth } from '../features/auth/contexts/AuthContext';

export const useFriends = () => {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  const loadUsers = useCallback(async (page = 1) => {
    // ✅ Vérifier l'authentification avant de faire les requêtes
    if (authLoading || !user) {
      console.log('🔒 Authentification en cours ou utilisateur non connecté, requêtes annulées');
      return;
    }

    // ✅ Vérifier que le token existe
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('🔒 Aucun token d\'authentification trouvé');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Chargement des données utilisateurs...');
      
      // Charger les données en parallèle
      const [userData, pendingRequestsData] = await Promise.all([
        friendsService.getAllUsers(page),
        friendsService.getPendingFriendRequests()
      ]);

      console.log('📊 Données utilisateurs reçues:', userData);
      console.log('📋 Demandes en attente reçues:', pendingRequestsData);

      // ✅ Validation des données reçues
      if (!Array.isArray(pendingRequestsData)) {
        console.warn('⚠️ pendingRequestsData n\'est pas un tableau:', pendingRequestsData);
        setPendingRequests([]);
      } else {
        // Mettre à jour les demandes en attente
        setPendingRequests(pendingRequestsData);
        console.log('✅ Demandes en attente mises à jour:', pendingRequestsData.length);
      }

      if (userData?.users?.data) {
        // Mettre à jour les utilisateurs avec distinction des demandes envoyées/reçues
        const updatedUsers = userData.users.data.map(user => {
          // Vérifier si on a envoyé une demande à cet utilisateur
          const sentRequest = pendingRequestsData.find(req => 
            req.requester_id === userData.current_user_id && req.user.id === user.id
          );

          // Vérifier si on a reçu une demande de cet utilisateur
          const receivedRequest = pendingRequestsData.find(req => 
            req.requester_id === user.id && req.user.id === userData.current_user_id
          );

          return {
            ...user,
            friendship_status: sentRequest ? 'pending' :
                             receivedRequest ? 'pending' :
                             user.friendship_status || 'none',
            request_type: sentRequest ? 'sent' :
                         receivedRequest ? 'received' : null,
            request_id: sentRequest?.id || receivedRequest?.id
          };
        });

        setUsers(updatedUsers);
        console.log('✅ Utilisateurs mis à jour:', updatedUsers.length);
        
        // Mettre à jour la liste des amis
        const friends = updatedUsers.filter(user => user.friendship_status === 'friends');
        setFriendsList(friends);
        
        // Sauvegarder la liste d'amis dans le localStorage pour récupération ultérieure
        try {
          localStorage.setItem('friends_list', JSON.stringify(friends));
          console.log('💾 Liste d\'amis sauvegardée dans localStorage:', friends.length, 'amis');
        } catch (e) {
          console.error('Erreur lors de la sauvegarde de la liste d\'amis:', e);
        }

        setPagination({
          current_page: userData.users.current_page,
          last_page: userData.users.last_page,
          per_page: userData.users.per_page,
          total: userData.users.total
        });
      }
    } catch (err) {
      console.error('❌ Error loading users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadFriendsList = useCallback(async () => {
    try {
      const friends = await friendsService.getFriendsList();
      setFriendsList(friends);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const sendFriendRequest = useCallback(async (userId) => {
    try {
      const res = await friendsService.sendFriendRequest(userId);
      
      // Mettre à jour le statut local à "pending"
      setUsers(prevUsers => 
        prevUsers.map(user =>
          user.id === userId ? { ...user, friendship_status: 'pending' } : user
        )
      );
      
      return res;
    } catch (err) {
      console.error('Erreur dans sendFriendRequest:', err);
      setError('Erreur lors de l\'envoi de la demande d\'ami');
      throw err;
    }
  }, []);

  const acceptFriendRequest = useCallback(async (userId) => {
    try {
      const res = await friendsService.acceptFriendRequest(userId);
      
      // ✅ CORRECTION: Mettre à jour le statut à "friends" pour l'utilisateur accepté
      // Ne pas essayer d'accéder à res.data.requesterId qui n'existe pas
      setUsers(prevUsers => 
        prevUsers.map(user =>
          user.id === userId 
            ? { ...user, friendship_status: 'friends' }
            : user
        )
      );
      
      // Supprimer de la liste des demandes en attente
      setPendingRequests(prev => prev.filter(req => req.user.id !== userId));
      
      // Recharger la liste d'amis
      await loadFriendsList();
      
      // Recharger tous les utilisateurs pour s'assurer de la synchronisation
      await loadUsers();
      
      return res;
    } catch (err) {
      console.error('Erreur dans acceptFriendRequest:', err);
      setError('Erreur lors de l\'acceptation de la demande');
      throw err;
    }
  }, [loadFriendsList, loadUsers]);

  const rejectFriendRequest = useCallback(async (userId) => {
    try {
      const res = await friendsService.rejectFriendRequest(userId);

      // Supprimer la demande des "pendingRequests"
      setPendingRequests(prev => prev.filter(req => req.user.id !== userId));

      // ✅ IMPORTANT: Remettre le statut à "none" pour permettre de relancer une demande
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, friendship_status: 'none' } : user
        )
      );

      // ✅ AJOUT: Recharger les données pour s'assurer de la synchronisation
      setTimeout(() => {
        loadUsers();
      }, 500);

      return res;
    } catch (err) {
      console.error('Erreur dans rejectFriendRequest:', err);
      setError('Erreur lors du refus de la demande');
      throw err;
    }
  }, [loadUsers]);

  const removeFriend = useCallback(async (userId) => {
    try {
      const res = await friendsService.removeFriend(userId);
      
      // ✅ Remettre le statut à "none" pour que chacun puisse relancer une invitation
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, friendship_status: 'none' } : user
        )
      );

      // Mettre à jour la liste d'amis pour refléter le changement
      await loadFriendsList();

      // ✅ AJOUT: Recharger les données pour s'assurer de la synchronisation
      setTimeout(() => {
        loadUsers();
      }, 500);
      
      return res;
    } catch (err) {
      console.error('Erreur dans removeFriend:', err);
      setError('Erreur lors de la suppression de l\'ami');
      throw err;
    }
  }, [loadFriendsList, loadUsers]);

  const cancelFriendRequest = useCallback(async (userId) => {
    try {
      const res = await friendsService.cancelFriendRequest(userId);
      
      // Remettre le statut à "none" pour pouvoir relancer plus tard
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, friendship_status: 'none' } : user
        )
      );

      // ✅ AJOUT: Recharger les données pour s'assurer de la synchronisation
      setTimeout(() => {
        loadUsers();
      }, 500);
      
      return res;
    } catch (err) {
      console.error('Erreur dans cancelFriendRequest:', err);
      setError('Erreur lors de l\'annulation de la demande');
      throw err;
    }
  }, [loadUsers]);

  const reload = useCallback(() => {
    loadUsers();
  }, [loadUsers]);

  // ✅ Modifier le useEffect pour ne charger que quand l'utilisateur est authentifié
  useEffect(() => {
    // Ne charger les données que si l'utilisateur est connecté et que l'auth n'est plus en cours de chargement
    if (user && !authLoading) {
      console.log('🔄 Chargement des données utilisateurs - utilisateur authentifié');
      reload();
    }
  }, [user, authLoading, reload]);

  return {
    users,
    pendingRequests,
    friendsList,
    loading,
    error,
    pagination,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    cancelFriendRequest,
    reload,
    searchUsers: (term) => friendsService.searchUsers(users, term),
    filterByStatus: (status) => friendsService.filterUsersByFriendshipStatus(users, status),
    hasNextPage: pagination.current_page < pagination.last_page,
    hasPrevPage: pagination.current_page > 1,
  };
};