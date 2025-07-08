// src/features/friends/pages/Friends.jsx
import React, { useState } from 'react';
import { Users, UserPlus, UserCheck, UserX, Search, Bell, RefreshCw, Clock, Trash2, AlertCircle, CheckCircle, X, Filter } from 'lucide-react';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useFriends } from '../../../hooks/useFriends';

// Composant Modal élégant
const Modal = ({ isOpen, onClose, children, size = 'sm' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className={`relative bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full transform transition-all animate-in fade-in-0 zoom-in-95 duration-200`}>
        {children}
      </div>
    </div>
  );
};

// Composant Toast/Notification
const Toast = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-500'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    }
  };

  const config = typeConfig[type] || typeConfig.error;
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all animate-in slide-in-from-top-2 duration-300">
      <div className={`${config.bgColor} ${config.borderColor} border rounded-xl p-4 shadow-lg max-w-sm`}>
        <div className="flex items-start space-x-3">
          <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${config.textColor}`}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`${config.textColor} hover:opacity-70 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Friends = () => {
  const { user } = useAuth();
  const {
    users,
    pendingRequests,
    loading,
    error,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    cancelFriendRequest,
    reload
  } = useFriends();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // États pour les modales et notifications
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null, type: '' });
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  // Fonction pour afficher les toasts
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 4000);
  };

  // Fonction pour afficher les modales de confirmation
  const showConfirmModal = (message, onConfirm, type = 'danger') => {
    setConfirmModal({ isOpen: true, message, onConfirm, type });
  };

  // Fonctions avec gestion d'erreur et feedback utilisateur améliorées
  const handleSendFriendRequest = async (userId, userName) => {
    try {
      await sendFriendRequest(userId);
      showToast(`Demande d'ami envoyée à ${userName}`, 'success');
    } catch (err) {
      showToast(`Erreur lors de l'envoi de la demande à ${userName}: ${err.message}`, 'error');
    }
  };

  const handleAcceptRequest = async (userId, userName) => {
    try {
      await acceptFriendRequest(userId);
      showToast(`${userName} est maintenant votre ami !`, 'success');
    } catch (err) {
      showToast(`Erreur lors de l'acceptation de la demande de ${userName}: ${err.message}`, 'error');
    }
  };

  const handleRejectRequest = async (userId, userName) => {
    showConfirmModal(
      `Êtes-vous sûr de vouloir refuser la demande d'ami de ${userName} ?`,
      async () => {
        try {
          await rejectFriendRequest(userId);
          showToast(`Demande de ${userName} refusée`, 'success');
        } catch (err) {
          showToast(`Erreur lors du refus de la demande de ${userName}: ${err.message}`, 'error');
        }
      }
    );
  };

  const handleRemoveFriend = async (userId, userName) => {
    showConfirmModal(
      `Êtes-vous sûr de vouloir supprimer ${userName} de vos amis ?`,
      async () => {
        try {
          await removeFriend(userId);
          showToast(`${userName} a été supprimé de vos amis`, 'success');
        } catch (err) {
          showToast(`Erreur lors de la suppression de ${userName}: ${err.message}`, 'error');
        }
      }
    );
  };

  const handleCancelRequest = async (userId, userName) => {
    showConfirmModal(
      `Annuler la demande d'ami envoyée à ${userName} ?`,
      async () => {
        try {
          await cancelFriendRequest(userId);
          showToast(`Demande à ${userName} annulée`, 'success');
        } catch (err) {
          showToast(`Erreur lors de l'annulation de la demande à ${userName}: ${err.message}`, 'error');
        }
      }
    );
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'friends') return matchesSearch && u.friendship_status === 'friends';
    if (activeTab === 'pending') return matchesSearch && u.friendship_status === 'pending';
    return matchesSearch && (!u.friendship_status || u.friendship_status === 'none');
  });

  // Fonction pour générer un avatar basé sur les initiales
  const getAvatar = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Fonction pour obtenir une couleur d'avatar basée sur le nom
  const getAvatarColor = (firstName, lastName) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
    ];
    const nameHash = (firstName + lastName).length;
    return colors[nameHash % colors.length];
  };

  // Fonction pour obtenir la configuration du statut
  const getStatusConfig = (status) => {
    switch (status) {
      case 'friends':
        return {
          icon: UserCheck,
          color: 'bg-green-500',
          text: 'Ami',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'bg-amber-500',
          text: 'En attente',
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200'
        };
      default:
        return {
          icon: UserPlus,
          color: 'bg-blue-500',
          text: 'Disponible',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Chargement des utilisateurs...</p>
          <p className="text-gray-400 text-sm mt-2">Veuillez patienter</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Une erreur est survenue</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={reload}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header compact avec améliorations */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6">
              {/* Titre et actions - responsive */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Gestion des Amis
                    </h1>
                    <p className="text-sm text-gray-600">
                      {users.length} utilisateur{users.length > 1 ? 's' : ''} • {users.filter(u => u.friendship_status === 'friends').length} ami{users.filter(u => u.friendship_status === 'friends').length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                {/* Actions header - responsive */}
                <div className="flex items-center space-x-3 self-start sm:self-auto">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                      showNotifications 
                        ? 'bg-blue-50 border-blue-200 text-blue-600' 
                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    {pendingRequests.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium animate-pulse">
                        {pendingRequests.length}
                      </div>
                    )}
                  </button>
                  <button 
                    onClick={reload}
                    className="p-2 sm:p-3 bg-gray-100 rounded-lg border border-gray-200 hover:bg-gray-200 transition-all duration-200 group"
                    title="Actualiser"
                  >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                </div>
              </div>

              {/* Barre de recherche améliorée */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Onglets avec indicateurs améliorés */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { id: 'all', label: 'Tous', count: users.length, icon: Users },
                  { id: 'friends', label: 'Amis', count: users.filter(u => u.friendship_status === 'friends').length, icon: UserCheck },
                  { id: 'pending', label: 'En attente', count: users.filter(u => u.friendship_status === 'pending').length, icon: Clock },
                  { id: 'available', label: 'Disponibles', count: users.filter(u => !u.friendship_status || u.friendship_status === 'none').length, icon: UserPlus }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm ${
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white shadow-sm scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Résultats de recherche */}
              {searchTerm && (
                <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <Filter className="w-4 h-4 inline mr-2" />
                  {filteredUsers.length} résultat{filteredUsers.length > 1 ? 's' : ''} pour "{searchTerm}"
                </div>
              )}
            </div>

            {/* Panel des notifications amélioré */}
            {showNotifications && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-6 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-blue-500" />
                    Demandes d'amitié reçues
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {pendingRequests.length}
                  </span>
                </div>
                
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">Aucune demande en attente</h4>
                    <p className="text-gray-500 text-sm">Les nouvelles demandes d'amitié apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((req) => (
                      <div key={req.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 gap-3 hover:shadow-sm transition-shadow duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className={`w-12 h-12 ${getAvatarColor(req.user.first_name, req.user.last_name)} rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm`}>
                              {getAvatar(req.user.first_name, req.user.last_name)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900">{req.user.first_name} {req.user.last_name}</h4>
                            <p className="text-sm text-gray-600 truncate">{req.user.email}</p>
                            <p className="text-xs text-blue-600 mt-1">Souhaite vous ajouter comme ami</p>
                          </div>
                        </div>
                        <div className="flex space-x-2 sm:ml-3">
                          <button 
                            onClick={() => handleAcceptRequest(req.user.id, `${req.user.first_name} ${req.user.last_name}`)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-1 text-sm shadow-sm"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>Accepter</span>
                          </button>
                          <button 
                            onClick={() => handleRejectRequest(req.user.id, `${req.user.first_name} ${req.user.last_name}`)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-1 text-sm shadow-sm"
                          >
                            <UserX className="w-4 h-4" />
                            <span>Refuser</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Grille d'utilisateurs avec améliorations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUsers.map((u) => {
                const statusConfig = getStatusConfig(u.friendship_status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={u.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:shadow-md hover:scale-105 transition-all duration-200 group"
                  >
                    <div className="relative mb-3">
                      <div className={`w-16 h-16 ${getAvatarColor(u.first_name, u.last_name)} rounded-xl flex items-center justify-center text-lg font-bold text-white mx-auto shadow-sm group-hover:shadow-md transition-shadow duration-200`}>
                        {getAvatar(u.first_name, u.last_name)}
                      </div>
                      {/* Indicateur en ligne */}
                      {/* <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm">
                        <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75"></div>
                      </div> */}
                    </div>
                    
                    <div className="text-center mb-3">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                        {u.first_name} {u.last_name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-3 truncate" title={u.email}>{u.email}</p>
                      
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.text}
                      </div>
                    </div>
                    
                    {/* Actions selon le statut */}
                    {u.id !== user?.id && (
                      <div className="space-y-2">
                        {/* Statut "none" ou undefined */}
                        {(!u.friendship_status || u.friendship_status === 'none') && (
                          <button 
                            onClick={() => handleSendFriendRequest(u.id, `${u.first_name} ${u.last_name}`)}
                            className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-1 text-sm shadow-sm"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Ajouter</span>
                          </button>
                        )}
                        
                        {/* Statut "pending" */}
                        {u.friendship_status === 'pending' && (
                          <div className="space-y-2">
                            <div className="w-full py-2 bg-amber-50 text-amber-700 rounded-lg font-medium border border-amber-200 flex items-center justify-center space-x-1 text-sm">
                              <Clock className="w-4 h-4" />
                              <span>En attente</span>
                            </div>
                            <button 
                              onClick={() => handleCancelRequest(u.id, `${u.first_name} ${u.last_name}`)}
                              className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 hover:scale-105 transition-all duration-200 text-sm flex items-center justify-center space-x-1"
                            >
                              <UserX className="w-3 h-3" />
                              <span>Annuler</span>
                            </button>
                          </div>
                        )}
                        
                        {/* Statut "friends" */}
                        {u.friendship_status === 'friends' && (
                          <div className="space-y-2">
                            <div className="w-full py-2 bg-green-50 text-green-700 rounded-lg font-medium border border-green-200 flex items-center justify-center space-x-1 text-sm">
                              <UserCheck className="w-4 h-4" />
                              <span>Ami</span>
                            </div>
                            <button 
                              onClick={() => handleRemoveFriend(u.id, `${u.first_name} ${u.last_name}`)}
                              className="w-full py-2 bg-red-50 text-red-700 rounded-lg font-medium border border-red-200 hover:bg-red-100 hover:scale-105 transition-all duration-200 text-sm flex items-center justify-center space-x-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        )}

                        {/* Fallback */}
                        {u.friendship_status && !['none', 'pending', 'friends'].includes(u.friendship_status) && (
                          <button 
                            onClick={() => handleSendFriendRequest(u.id, `${u.first_name} ${u.last_name}`)}
                            className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-1 text-sm shadow-sm"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>Ajouter</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Message si aucun résultat */}
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? `Aucun résultat pour "${searchTerm}"`
                    : `Aucun utilisateur dans la catégorie "${activeTab}"`
                  }
                </p>
              </div>
            )}

            {/* Statistiques améliorées */}
            <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total utilisateurs', value: users.length, icon: Users, color: 'bg-blue-100 text-blue-600' },
                  { label: 'Amis connectés', value: users.filter(u => u.friendship_status === 'friends').length, icon: UserCheck, color: 'bg-green-100 text-green-600' },
                  { label: 'Demandes envoyées', value: users.filter(u => u.friendship_status === 'pending').length, icon: Clock, color: 'bg-amber-100 text-amber-600' },
                  { label: 'Demandes reçues', value: pendingRequests.length, icon: Bell, color: 'bg-red-100 text-red-600' }
                ].map((stat, index) => (
                  <div key={index} className="text-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation élégant */}
      <Modal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        size="sm"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Confirmation</h3>
          </div>
          
          <p className="text-gray-600 mb-6">{confirmModal.message}</p>
          
          <div className="flex space-x-3 justify-end">
            <button
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                confirmModal.onConfirm();
                setConfirmModal({ ...confirmModal, isOpen: false });
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium flex items-center space-x-2"
            >
              <span>Confirmer</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast notification */}
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </>
  );
};

export default Friends;