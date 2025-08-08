import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';
import CreateAdminModal from '../components/CreateAdminModal';
import EditUserModal from '../components/EditUserModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';

const UsersManagement = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    role: 'all'
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);

  useEffect(() => {
    console.log('UsersManagement - User connecté:', user);
    console.log('UsersManagement - isAdmin:', isAdmin);
    console.log('UsersManagement - User role:', user?.role);
    
    if (user && isAdmin) {
      loadUsers();
    } else if (user && !isAdmin) {
      toast.error('Vous devez être administrateur pour accéder à cette page');
    }
  }, [filters, currentPage, user, isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Préparer les paramètres pour l'API
      const apiParams = {
        page: currentPage
      };
      
      // Ajouter les filtres seulement s'ils ne sont pas "all"
      if (filters.search) {
        apiParams.search = filters.search;
      }
      if (filters.status !== 'all') {
        apiParams.status = filters.status;
      }
      if (filters.role !== 'all') {
        apiParams.role = filters.role;
      }
      
      const response = await adminService.getAllUsers(apiParams);
      
      if (response.success) {
        setUsers(response.users.data);
        setTotalPages(response.users.last_page);
        setTotalUsers(response.users.total);
      } else {
        toast.error('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (userId) => {
    try {
      setUserDetailsLoading(true);
      const response = await adminService.getUserById(userId);
      
      if (response.success) {
        setSelectedUserDetails(response);
        setShowUserDetailsModal(true);
      } else {
        toast.error('Erreur lors du chargement des détails utilisateur');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des détails utilisateur');
      console.error('Erreur:', error);
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const handleUserAction = async (userId, action, reason = '') => {
    try {
      // Vérifier si l'utilisateur essaie de se bannir/supprimer lui-même
      if (userId === user?.id) {
        toast.error('Vous ne pouvez pas effectuer cette action sur votre propre compte');
        return;
      }

      switch (action) {
        case 'toggle-ban':
          await adminService.toggleBanUser(userId);
          toast.success('Statut de bannissement modifié avec succès');
          break;
        case 'delete':
          if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
            await adminService.deleteUser(userId);
            toast.success('Utilisateur supprimé avec succès');
          }
          break;
        default:
          break;
      }
      loadUsers(); // Recharger la liste
    } catch (error) {
      console.error('Erreur détaillée:', error);
      
      if (error.response?.status === 403) {
        toast.error('Vous n\'avez pas les permissions nécessaires pour effectuer cette action');
      } else if (error.response?.status === 404) {
        toast.error('Utilisateur non trouvé');
      } else {
        toast.error(`Erreur lors de l'action: ${error.message || 'Erreur inconnue'}`);
      }
    }
  };

  const handleEditUser = (user) => {
    setSelectedUserForEdit(user);
    setShowEditUserModal(true);
  };

  const handleChangePassword = (user) => {
    setSelectedUserForEdit(user);
    setShowChangePasswordModal(true);
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.warning('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    try {
      for (const userId of selectedUsers) {
        await handleUserAction(userId, action);
      }
      setSelectedUsers([]);
    } catch (error) {
      toast.error('Erreur lors de l\'action en lot');
    }
  };

  const getStatusBadge = (user) => {
    if (user.banned_at) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Banni
        </span>
      );
    }
    
    if (user.user_status?.is_online) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          En ligne
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Hors ligne
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-800',
      user: 'bg-blue-100 text-blue-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[role] || badges.user}`}>
        {role === 'admin' ? 'Administrateur' : 'Utilisateur'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
            <p className="mt-1 text-sm text-gray-500">
              {totalUsers} utilisateur(s) au total
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateAdminModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Créer Admin
            </button>
            <button
              onClick={loadUsers}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recherche
            </label>
            <input
              type="text"
              placeholder="Nom, email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="online">En ligne</option>
              <option value="offline">Hors ligne</option>
              <option value="banned">Bannis</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle
            </label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="user">Utilisateurs</option>
              <option value="admin">Administrateurs</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: 'all', search: '', role: 'all' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Actions en lot */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedUsers.length} utilisateur(s) sélectionné(s)
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('toggle-ban')}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
              >
                Bannir/Débannir
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des utilisateurs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
               {users.map((userItem) => (
                                 <tr key={userItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                                             checked={selectedUsers.includes(userItem.id)}
                      onChange={(e) => {
                                                 if (e.target.checked) {
                           setSelectedUsers([...selectedUsers, userItem.id]);
                         } else {
                           setSelectedUsers(selectedUsers.filter(id => id !== userItem.id));
                         }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                                                 <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                           {userItem.first_name?.[0]}{userItem.last_name?.[0]}
                         </div>
                      </div>
                      <div className="ml-4">
                                                 <div className="text-sm font-medium text-gray-900">
                           {userItem.first_name} {userItem.last_name}
                         </div>
                         <div className="text-sm text-gray-500">
                           {userItem.email}
                         </div>
                         {userItem.username && (
                           <div className="text-xs text-gray-400">
                             @{userItem.username}
                           </div>
                         )}
                      </div>
                    </div>
                  </td>
                                     <td className="px-6 py-4 whitespace-nowrap">
                     {getStatusBadge(userItem)}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap">
                     {getRoleBadge(userItem.role)}
                   </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     {formatDate(userItem.created_at)}
                   </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                     <div className="flex space-x-2">
                       <button
                         onClick={() => loadUserDetails(userItem.id)}
                         className="text-blue-600 hover:text-blue-900 text-sm"
                       >
                         Détails
                       </button>
                       <button
                         onClick={() => handleEditUser(userItem)}
                         className="text-green-600 hover:text-green-900 text-sm"
                       >
                         Modifier
                       </button>
                       <button
                         onClick={() => handleChangePassword(userItem)}
                         className="text-orange-600 hover:text-orange-900 text-sm"
                       >
                         Mot de passe
                       </button>
                       {userItem.id !== user?.id ? (
                         <>
                           <button
                             onClick={() => handleUserAction(userItem.id, 'toggle-ban')}
                             className={`text-sm ${userItem.banned_at ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
                           >
                             {userItem.banned_at ? 'Débannir' : 'Bannir'}
                           </button>
                           <button
                             onClick={() => handleUserAction(userItem.id, 'delete')}
                             className="text-red-600 hover:text-red-900 text-sm"
                           >
                             Supprimer
                           </button>
                         </>
                       ) : (
                         <span className="text-gray-400 text-xs">Votre compte</span>
                       )}
                     </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Précédent
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Suivant
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
              {' '}({totalUsers} utilisateur(s) au total)
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                Suivant
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Modal Détails Utilisateur */}
      {showUserDetailsModal && selectedUserDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Détails de l'utilisateur
                </h3>
                <button
                  onClick={() => setShowUserDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {userDetailsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Informations de base */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Informations de base</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Nom:</span> {selectedUserDetails.user.first_name} {selectedUserDetails.user.last_name}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {selectedUserDetails.user.email}
                      </div>
                      <div>
                        <span className="font-medium">Rôle:</span> {getRoleBadge(selectedUserDetails.user.role)}
                      </div>
                      <div>
                        <span className="font-medium">Statut:</span> {getStatusBadge(selectedUserDetails.user)}
                      </div>
                      {selectedUserDetails.user.bio && (
                        <div className="col-span-2">
                          <span className="font-medium">Bio:</span> {selectedUserDetails.user.bio}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Statistiques */}
                  {selectedUserDetails.stats && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Statistiques</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Posts:</span> {selectedUserDetails.stats.posts_count}
                        </div>
                        <div>
                          <span className="font-medium">Amis:</span> {selectedUserDetails.stats.friends_count}
                        </div>
                        <div>
                          <span className="font-medium">Notifications:</span> {selectedUserDetails.stats.notifications_count}
                        </div>
                        <div className="col-span-3">
                          <span className="font-medium">Dernière connexion:</span> {formatDate(selectedUserDetails.stats.last_login)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Posts récents */}
                  {selectedUserDetails.user.posts && selectedUserDetails.user.posts.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Posts récents</h4>
                      <div className="space-y-2">
                        {selectedUserDetails.user.posts.slice(0, 3).map((post) => (
                          <div key={post.id} className="text-sm p-2 bg-white rounded border">
                            <div className="font-medium">{post.content}</div>
                            <div className="text-gray-500 text-xs">
                              {formatDate(post.created_at)} - {post.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

             {/* Modal Création Admin */}
       <CreateAdminModal
         isOpen={showCreateAdminModal}
         onClose={() => setShowCreateAdminModal(false)}
         onSuccess={loadUsers}
       />

       {/* Modal Modification Utilisateur */}
       <EditUserModal
         isOpen={showEditUserModal}
         onClose={() => setShowEditUserModal(false)}
         onSuccess={loadUsers}
         user={selectedUserForEdit}
       />

       {/* Modal Changement Mot de Passe */}
       <ChangePasswordModal
         isOpen={showChangePasswordModal}
         onClose={() => setShowChangePasswordModal(false)}
         onSuccess={loadUsers}
         user={selectedUserForEdit}
       />
     </div>
   );
 };

export default UsersManagement;
