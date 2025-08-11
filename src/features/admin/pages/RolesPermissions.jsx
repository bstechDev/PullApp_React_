import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';

const RolesPermissions = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // États pour les données
  const [dashboardData, setDashboardData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  
  // États pour les modales
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showUserRolesModal, setShowUserRolesModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingPermission, setEditingPermission] = useState(null);
  
  // États pour les formulaires
  const [roleForm, setRoleForm] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: []
  });
  
  const [permissionForm, setPermissionForm] = useState({
    name: '',
    display_name: '',
    description: '',
    module: '',
    action: '',
    resource: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger le dashboard des rôles
      const dashboardResponse = await adminService.getRolesDashboard();
      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse);
      }
      
      // Charger les rôles
      const rolesResponse = await adminService.getAllRoles();
      if (rolesResponse.success) {
        setRoles(rolesResponse.roles.data || []);
      }
      
      // Charger les permissions
      const permissionsResponse = await adminService.getAllPermissions();
      if (permissionsResponse.success) {
        setPermissions(permissionsResponse.permissions.data || []);
      }
      
      // Charger les statistiques
      const statsResponse = await adminService.getRolesStatistics();
      if (statsResponse.success) {
        setStatistics(statsResponse);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Gestion des rôles
  const handleRoleSubmit = async () => {
    try {
      if (editingRole) {
        await adminService.updateRole(editingRole.id, roleForm);
        toast.success('Rôle mis à jour avec succès');
      } else {
        await adminService.createRole(roleForm);
        toast.success('Rôle créé avec succès');
      }
      await loadData();
      setShowRoleModal(false);
      setEditingRole(null);
      setRoleForm({
        name: '',
        display_name: '',
        description: '',
        permissions: []
      });
    } catch (error) {
      if (error.response?.data?.errors) {
        toast.error('Erreur de validation: ' + Object.values(error.response.data.errors).flat().join(', '));
      } else {
        toast.error('Erreur lors de la sauvegarde du rôle');
      }
    }
  };

  const handleRoleDelete = async (roleId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      try {
        await adminService.deleteRole(roleId);
        toast.success('Rôle supprimé avec succès');
        await loadData();
      } catch (error) {
        toast.error('Erreur lors de la suppression du rôle');
      }
    }
  };

  // Gestion des permissions
  const handlePermissionSubmit = async () => {
    try {
      if (editingPermission) {
        toast.error('La modification des permissions n\'est pas encore implémentée');
        return;
      } else {
        await adminService.createPermission(permissionForm);
        toast.success('Permission créée avec succès');
      }
      await loadData();
      setShowPermissionModal(false);
      setEditingPermission(null);
      setPermissionForm({
        name: '',
        display_name: '',
        description: '',
        module: '',
        action: '',
        resource: ''
      });
    } catch (error) {
      if (error.response?.data?.errors) {
        toast.error('Erreur de validation: ' + Object.values(error.response.data.errors).flat().join(', '));
      } else {
        toast.error('Erreur lors de la sauvegarde de la permission');
      }
    }
  };

  const handlePermissionDelete = async (permissionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette permission ?')) {
      toast.error('La suppression des permissions n\'est pas encore implémentée');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la gestion des rôles et permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Rôles et Permissions</h1>
          <p className="mt-2 text-gray-600">
            Gérez les rôles, permissions et attributions des utilisateurs
          </p>
        </div>

        {/* Navigation des onglets */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <nav className="flex flex-wrap gap-2">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z', color: 'blue' },
                { id: 'roles', name: 'Rôles', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'green' },
                { id: 'permissions', name: 'Permissions', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', color: 'purple' },
                { id: 'users', name: 'Utilisateurs', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', color: 'indigo' },
                { id: 'statistics', name: 'Statistiques', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'orange' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex flex-col items-center space-y-1 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-${tab.color}-100 text-${tab.color}-700 border-2 border-${tab.color}-200 shadow-md`
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    activeTab === tab.id 
                      ? `bg-${tab.color}-200 text-${tab.color}-700` 
                      : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                  }`}>
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="font-medium leading-tight">{tab.name.split(' ')[0]}</div>
                    {tab.name.includes(' ') && (
                      <div className="text-xs leading-tight opacity-75">{tab.name.split(' ').slice(1).join(' ')}</div>
                    )}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl">
          <div className="px-6 py-6">
            {/* Dashboard des Rôles */}
            {activeTab === 'dashboard' && dashboardData && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard des Rôles et Permissions</h2>
                
                {/* Statistiques principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">Total Rôles</p>
                        <p className="text-2xl font-bold text-blue-900">{dashboardData.stats.total_roles}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">Total Permissions</p>
                        <p className="text-2xl font-bold text-green-900">{dashboardData.stats.total_permissions}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600">Utilisateurs avec Rôles</p>
                        <p className="text-2xl font-bold text-purple-900">{dashboardData.stats.users_with_roles}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-orange-600">Utilisateurs sans Rôles</p>
                        <p className="text-2xl font-bold text-orange-900">{dashboardData.stats.users_without_roles}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rôles récents */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Rôles Récents</h3>
                    {dashboardData.recent_roles && dashboardData.recent_roles.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.recent_roles.map((role) => (
                          <div key={role.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div>
                              <h4 className="font-medium text-gray-900">{role.display_name}</h4>
                              <p className="text-sm text-gray-600">{role.name}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              role.is_system ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {role.is_system ? 'Système' : 'Personnalisé'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Aucun rôle récent</p>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions Récentes</h3>
                    {dashboardData.recent_permissions && dashboardData.recent_permissions.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.recent_permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div>
                              <h4 className="font-medium text-gray-900">{permission.display_name}</h4>
                              <p className="text-sm text-gray-600">{permission.name}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              permission.is_system ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {permission.is_system ? 'Système' : 'Personnalisé'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Aucune permission récente</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Gestion des Rôles */}
            {activeTab === 'roles' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Gestion des Rôles</h2>
                  <button
                    onClick={() => {
                      setEditingRole(null);
                      setRoleForm({
                        name: '',
                        display_name: '',
                        description: '',
                        permissions: []
                      });
                      setShowRoleModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Créer un rôle
                  </button>
                </div>

                {/* Liste des rôles */}
                <div className="space-y-4">
                  {roles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🔐</div>
                      <p>Aucun rôle configuré</p>
                    </div>
                  ) : (
                    roles.map((role) => (
                      <div key={role.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-medium text-gray-900">{role.display_name}</h4>
                              <span className="text-sm text-gray-600 font-mono">{role.name}</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                role.is_system ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {role.is_system ? 'Système' : 'Personnalisé'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{role.description}</p>
                            {role.permissions && role.permissions.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {role.permissions.map((permission, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                    {permission}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingRole(role);
                                setRoleForm({
                                  name: role.name,
                                  display_name: role.display_name,
                                  description: role.description,
                                  permissions: role.permissions || []
                                });
                                setShowRoleModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleRoleDelete(role.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Gestion des Permissions */}
            {activeTab === 'permissions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Gestion des Permissions</h2>
                  <button
                    onClick={() => {
                      setEditingPermission(null);
                      setPermissionForm({
                        name: '',
                        display_name: '',
                        description: '',
                        module: '',
                        action: '',
                        resource: ''
                      });
                      setShowPermissionModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Créer une permission
                  </button>
                </div>

                {/* Liste des permissions */}
                <div className="space-y-4">
                  {permissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🔑</div>
                      <p>Aucune permission configurée</p>
                    </div>
                  ) : (
                    permissions.map((permission) => (
                      <div key={permission.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-medium text-gray-900">{permission.display_name}</h4>
                              <span className="text-sm text-gray-600 font-mono">{permission.name}</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                permission.is_system ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {permission.is_system ? 'Système' : 'Personnalisé'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{permission.description}</p>
                            <div className="flex space-x-4 text-sm text-gray-500">
                              <span>Module: {permission.module}</span>
                              <span>Action: {permission.action}</span>
                              <span>Ressource: {permission.resource}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingPermission(permission);
                                setPermissionForm({
                                  name: permission.name,
                                  display_name: permission.display_name,
                                  description: permission.description,
                                  module: permission.module,
                                  action: permission.action,
                                  resource: permission.resource
                                });
                                setShowPermissionModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handlePermissionDelete(permission.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Gestion des Utilisateurs */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Gestion des Rôles Utilisateurs</h2>
                  <button
                    onClick={() => setShowUserRolesModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    Attribuer des rôles
                  </button>
                </div>

                {/* Informations sur la gestion des utilisateurs */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Gestion des Rôles Utilisateurs</h3>
                  <p className="text-blue-700 mb-4">
                    Cette section vous permet de gérer les rôles et permissions attribués aux utilisateurs de votre plateforme.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-600">
                    <div>
                      <h4 className="font-medium mb-2">Fonctionnalités disponibles :</h4>
                      <ul className="space-y-1">
                        <li>• Attribution de rôles aux utilisateurs</li>
                        <li>• Retrait de rôles des utilisateurs</li>
                        <li>• Attribution de permissions personnalisées</li>
                        <li>• Consultation des permissions utilisateur</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Actions possibles :</h4>
                      <ul className="space-y-1">
                        <li>• Créer des rôles personnalisés</li>
                        <li>• Modifier les permissions des rôles</li>
                        <li>• Gérer les accès par utilisateur</li>
                        <li>• Suivre les attributions de rôles</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Statistiques des utilisateurs */}
                {statistics && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
                          <p className="text-2xl font-bold text-gray-900">{statistics.user_stats?.total || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Avec Rôles</p>
                          <p className="text-2xl font-bold text-gray-900">{statistics.user_stats?.with_roles || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Sans Rôles</p>
                          <p className="text-2xl font-bold text-gray-900">{statistics.user_stats?.without_roles || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Statistiques Détaillées */}
            {activeTab === 'statistics' && statistics && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Statistiques Détaillées</h2>
                
                {/* Statistiques des rôles */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques des Rôles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{statistics.role_stats?.total || 0}</div>
                      <div className="text-sm text-gray-600">Total Rôles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{statistics.role_stats?.active || 0}</div>
                      <div className="text-sm text-gray-600">Rôles Actifs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{statistics.role_stats?.custom || 0}</div>
                      <div className="text-sm text-gray-600">Rôles Personnalisés</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{statistics.role_stats?.with_users || 0}</div>
                      <div className="text-sm text-gray-600">Rôles avec Utilisateurs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{statistics.role_stats?.without_users || 0}</div>
                      <div className="text-sm text-gray-600">Rôles sans Utilisateurs</div>
                    </div>
                  </div>
                </div>

                {/* Statistiques des permissions */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques des Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{statistics.permission_stats?.total || 0}</div>
                      <div className="text-sm text-gray-600">Total Permissions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{statistics.permission_stats?.active || 0}</div>
                      <div className="text-sm text-gray-600">Permissions Actives</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{statistics.permission_stats?.custom || 0}</div>
                      <div className="text-sm text-gray-600">Permissions Personnalisées</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">{statistics.permission_stats?.with_roles || 0}</div>
                      <div className="text-sm text-gray-600">Permissions avec Rôles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{statistics.permission_stats?.without_roles || 0}</div>
                      <div className="text-sm text-gray-600">Permissions sans Rôles</div>
                    </div>
                  </div>
                </div>

                {/* Statistiques des modules */}
                {statistics.module_stats && statistics.module_stats.length > 0 && (
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Module</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {statistics.module_stats.map((module, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{module.count}</div>
                            <div className="text-sm text-gray-600 capitalize">{module.module}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Graphique de répartition */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Utilisateurs</h3>
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-400">📊</div>
                      <p className="text-gray-500 mt-2">Graphiques en cours de développement</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modale Rôle */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingRole ? 'Modifier le rôle' : 'Créer un nouveau rôle'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du rôle
                  </label>
                  <input
                    type="text"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="editor"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom d'affichage
                  </label>
                  <input
                    type="text"
                    value={roleForm.display_name}
                    onChange={(e) => setRoleForm({...roleForm, display_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Éditeur"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Description du rôle..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Permissions
                  </label>
                  <select
                    multiple
                    value={roleForm.permissions}
                    onChange={(e) => setRoleForm({...roleForm, permissions: Array.from(e.target.selectedOptions, option => option.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    size="4"
                  >
                    {permissions.map((permission) => (
                      <option key={permission.id} value={permission.name}>
                        {permission.display_name} ({permission.name})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs permissions</p>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleRoleSubmit}
                  className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  {editingRole ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale Permission */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPermission ? 'Modifier la permission' : 'Créer une nouvelle permission'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la permission
                  </label>
                  <input
                    type="text"
                    value={permissionForm.name}
                    onChange={(e) => setPermissionForm({...permissionForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="custom_action"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom d'affichage
                  </label>
                  <input
                    type="text"
                    value={permissionForm.display_name}
                    onChange={(e) => setPermissionForm({...permissionForm, display_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Action Personnalisée"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={permissionForm.description}
                    onChange={(e) => setPermissionForm({...permissionForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Description de la permission..."
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Module
                    </label>
                    <input
                      type="text"
                      value={permissionForm.module}
                      onChange={(e) => setPermissionForm({...permissionForm, module: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="custom"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action
                    </label>
                    <input
                      type="text"
                      value={permissionForm.action}
                      onChange={(e) => setPermissionForm({...permissionForm, action: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="execute"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ressource
                    </label>
                    <input
                      type="text"
                      value={permissionForm.resource}
                      onChange={(e) => setPermissionForm({...permissionForm, resource: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="feature"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handlePermissionSubmit}
                  className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  {editingPermission ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale Attribution des Rôles Utilisateurs */}
      {showUserRolesModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Attribution des Rôles Utilisateurs
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID de l'utilisateur
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rôles à attribuer
                  </label>
                  <select
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    size="4"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.display_name} ({role.name})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs rôles</p>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowUserRolesModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    toast.info('Fonctionnalité en cours de développement');
                    setShowUserRolesModal(false);
                  }}
                  className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Attribuer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissions;
