// src/features/friends/hooks/useFriends.jsx
import { useState, useEffect, useCallback } from 'react';
import { friendsService } from '../features/auth/services/friendsService'; 

export const useFriends = () => {
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
    setLoading(true);
    try {
      const data = await friendsService.getAllUsers(page);
      setUsers(data.users.data);
      setPagination({
        current_page: data.users.current_page,
        last_page: data.users.last_page,
        per_page: data.users.per_page,
        total: data.users.total
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPendingRequests = useCallback(async () => {
    try {
      const requests = await friendsService.getPendingFriendRequests();
      setPendingRequests(requests);
    } catch (err) {
      setError(err.message);
    }
  }, []);

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
      
      // Mettre à jour le statut à "friends"
      setUsers(prevUsers => 
        prevUsers.map(user =>
          user.id === userId ? { ...user, friendship_status: 'friends' } : user
        )
      );
      
      // Supprimer de la liste des demandes en attente
      setPendingRequests(prev => prev.filter(req => req.user.id !== userId));
      
      // Recharger la liste d'amis
      await loadFriendsList();
      
      return res;
    } catch (err) {
      console.error('Erreur dans acceptFriendRequest:', err);
      setError('Erreur lors de l\'acceptation de la demande');
      throw err;
    }
  }, [loadFriendsList]);

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
    loadPendingRequests();
    loadFriendsList();
  }, [loadUsers, loadPendingRequests, loadFriendsList]);

  useEffect(() => {
    reload();
  }, [reload]);

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
    removeFriend, // ✅ Nouvelle fonction
    cancelFriendRequest, // ✅ Nouvelle fonction
    reload,
    searchUsers: (term) => friendsService.searchUsers(users, term),
    filterByStatus: (status) => friendsService.filterUsersByFriendshipStatus(users, status),
    hasNextPage: pagination.current_page < pagination.last_page,
    hasPrevPage: pagination.current_page > 1,
  };
};