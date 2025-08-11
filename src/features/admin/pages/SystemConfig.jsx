import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';

const SystemConfig = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // États pour les données système
  const [systemInfo, setSystemInfo] = useState(null);
  const [systemSettings, setSystemSettings] = useState(null);
  const [maintenanceStatus, setMaintenanceStatus] = useState(null);
  const [globalNotifications, setGlobalNotifications] = useState([]);
  const [backups, setBackups] = useState([]);
  
  // États pour les modales
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  
  // États pour les formulaires
  const [maintenanceForm, setMaintenanceForm] = useState({
    message: '',
    retry: 1800,
    secret: ''
  });
  
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info',
    is_active: true,
    expires_at: ''
  });
  
  // État pour les erreurs de validation
  const [notificationErrors, setNotificationErrors] = useState({});

  const [settingsForm, setSettingsForm] = useState({
    app: {
      name: '',
      timezone: '',
      debug: false
    }
  });

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      
      // Charger le dashboard système
      const dashboardResponse = await adminService.getSystemDashboard();
      if (dashboardResponse.success) {
        setSystemInfo(dashboardResponse);
      }
      
      // Charger les paramètres système
      const settingsResponse = await adminService.getSystemSettings();
      if (settingsResponse.success) {
        setSystemSettings(settingsResponse.settings);
      }
      
      // Charger le statut de maintenance
      const maintenanceResponse = await adminService.getMaintenanceStatus();
      if (maintenanceResponse.success) {
        setMaintenanceStatus(maintenanceResponse.status);
      }
      
      // Charger les notifications globales
      const notificationsResponse = await adminService.listGlobalNotifications();
      if (notificationsResponse.success) {
        setGlobalNotifications(notificationsResponse.notifications || []);
      }
      
      // Charger les sauvegardes
      const backupsResponse = await adminService.listBackups();
      if (backupsResponse.success) {
        setBackups(backupsResponse.backups || []);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des données système:', error);
      toast.error('Erreur lors du chargement des données système');
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceToggle = async () => {
    try {
      if (maintenanceStatus?.is_maintenance_mode) {
        await adminService.disableMaintenanceMode();
        toast.success('Mode maintenance désactivé');
      } else {
        await adminService.enableMaintenanceMode(maintenanceForm);
        toast.success('Mode maintenance activé');
      }
      await loadSystemData();
      setShowMaintenanceModal(false);
    } catch (error) {
      toast.error('Erreur lors de la modification du mode maintenance');
    }
  };

  const handleNotificationSubmit = async () => {
    // Réinitialiser les erreurs
    setNotificationErrors({});
    
    // Validation côté client
    if (!validateNotificationForm()) {
      return;
    }
    
    try {
      if (editingNotification) {
        await adminService.updateGlobalNotification({
          id: editingNotification.id,
          ...notificationForm
        });
        toast.success('Notification mise à jour');
      } else {
        await adminService.createGlobalNotification(notificationForm);
        toast.success('Notification créée');
      }
      await loadSystemData();
      setShowNotificationModal(false);
      resetNotificationForm();
    } catch (error) {
      // Gestion des erreurs de validation de l'API
      if (error.response?.data?.errors) {
        setNotificationErrors(error.response.data.errors);
        toast.error('Veuillez corriger les erreurs de validation');
      } else {
        toast.error('Erreur lors de la sauvegarde de la notification');
      }
    }
  };

  const handleBackupCreate = async () => {
    try {
      await adminService.createBackup({
        type: 'database',
        description: 'Sauvegarde manuelle'
      });
      toast.success('Sauvegarde créée avec succès');
      await loadSystemData();
      setShowBackupModal(false);
    } catch (error) {
      toast.error('Erreur lors de la création de la sauvegarde');
    }
  };

  const handleBackupDownload = async (backupId) => {
    try {
      const response = await adminService.downloadBackup(backupId);
      if (response.success && response.download_url) {
        window.open(response.download_url, '_blank');
      }
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleBackupDelete = async (backupId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette sauvegarde ?')) {
      try {
        await adminService.deleteBackup(backupId);
        toast.success('Sauvegarde supprimée');
        await loadSystemData();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleNotificationDelete = async (notificationId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      try {
        await adminService.deleteGlobalNotification(notificationId);
        toast.success('Notification supprimée');
        await loadSystemData();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      await adminService.updateSystemSettings(settingsForm);
      toast.success('Paramètres mis à jour avec succès');
      await loadSystemData();
      setShowSettingsModal(false);
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des paramètres');
    }
  };

  const openSettingsModal = () => {
    if (systemSettings) {
      setSettingsForm({
        app: {
          name: systemSettings.app?.name || '',
          timezone: systemSettings.app?.timezone || '',
          debug: systemSettings.app?.debug || false
        }
      });
    }
    setShowSettingsModal(true);
  };

  // Validation du formulaire de notification
  const validateNotificationForm = () => {
    const errors = {};
    
    // Validation de la date d'expiration
    if (notificationForm.expires_at) {
      const selectedDate = new Date(notificationForm.expires_at);
      const now = new Date();
      
      // Réinitialiser l'heure à minuit pour la comparaison
      selectedDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      
      if (selectedDate <= now) {
        errors.expires_at = 'La date d\'expiration doit être dans le futur';
      }
    }
    
    // Validation des champs requis
    if (!notificationForm.title.trim()) {
      errors.title = 'Le titre est requis';
    }
    
    if (!notificationForm.message.trim()) {
      errors.message = 'Le message est requis';
    }
    
    setNotificationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Réinitialiser le formulaire et les erreurs
  const resetNotificationForm = () => {
    setNotificationForm({
      title: '',
      message: '',
      type: 'info',
      is_active: true,
      expires_at: ''
    });
    setNotificationErrors({});
    setEditingNotification(null);
  };

  // Effacer les erreurs lors de la modification des champs
  const handleNotificationFormChange = (field, value) => {
    setNotificationForm({...notificationForm, [field]: value});
    // Effacer l'erreur du champ modifié
    if (notificationErrors[field]) {
      setNotificationErrors({...notificationErrors, [field]: null});
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la configuration système...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuration Système</h1>
          <p className="mt-2 text-gray-600">
            Gérez la configuration, la maintenance et les paramètres du système
          </p>
        </div>

        {/* Navigation des onglets */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <nav className="flex flex-wrap gap-2">
              {[
                { id: 'dashboard', name: 'Dashboard Système', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z', color: 'blue' },
                { id: 'settings', name: 'Paramètres', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', color: 'green' },
                { id: 'maintenance', name: 'Maintenance', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z', color: 'orange' },
                { id: 'notifications', name: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', color: 'purple' },
                { id: 'backups', name: 'Sauvegardes', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'indigo' }
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
            {/* Dashboard Système */}
            {activeTab === 'dashboard' && systemInfo && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Système</h2>
                
                {/* Informations système */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Système</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Laravel Version:</span>
                        <span className="font-medium">{systemInfo.system_info?.laravel_version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">PHP Version:</span>
                        <span className="font-medium">{systemInfo.system_info?.php_version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Environnement:</span>
                        <span className="font-medium">{systemInfo.system_info?.app_environment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Timezone:</span>
                        <span className="font-medium">{systemInfo.system_info?.timezone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Serveur</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Logiciel:</span>
                        <span className="font-medium">{systemInfo.server_info?.server_software}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mémoire PHP:</span>
                        <span className="font-medium">{systemInfo.server_info?.php_memory_limit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Temps d'exécution:</span>
                        <span className="font-medium">{systemInfo.server_info?.php_max_execution_time}s</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Base de données et Cache */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Base de Données</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Statut:</span>
                        <span className={`font-medium ${systemInfo.database_info?.connection_status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                          {systemInfo.database_info?.connection_status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tables:</span>
                        <span className="font-medium">{systemInfo.database_info?.tables_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taille:</span>
                        <span className="font-medium">{systemInfo.database_info?.database_size} MB</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Statut:</span>
                        <span className={`font-medium ${systemInfo.cache_info?.cache_status === 'working' ? 'text-green-600' : 'text-red-600'}`}>
                          {systemInfo.cache_info?.cache_status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taille:</span>
                        <span className="font-medium">{systemInfo.cache_info?.cache_size || 'Inconnue'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

                         {/* Paramètres Système */}
             {activeTab === 'settings' && systemSettings && (
               <div className="space-y-6">
                 <div className="flex items-center justify-between">
                   <h2 className="text-2xl font-bold text-gray-900">Paramètres Système</h2>
                   <button
                     onClick={openSettingsModal}
                     className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                   >
                     Modifier les paramètres
                   </button>
                 </div>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                   {/* Paramètres de l'application */}
                   <div className="bg-gray-50 p-6 rounded-lg">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4">Application</h3>
                     <div className="space-y-3">
                       <div className="flex justify-between">
                         <span className="text-gray-600">Nom:</span>
                         <span className="font-medium">{systemSettings.app?.name}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">URL:</span>
                         <span className="font-medium">{systemSettings.app?.url}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Debug:</span>
                         <span className={`font-medium ${systemSettings.app?.debug ? 'text-red-600' : 'text-green-600'}`}>
                           {systemSettings.app?.debug ? 'Activé' : 'Désactivé'}
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-gray-600">Maintenance:</span>
                         <span className={`font-medium ${systemSettings.app?.maintenance_mode ? 'text-red-600' : 'text-green-600'}`}>
                           {systemSettings.app?.maintenance_mode ? 'Activé' : 'Désactivé'}
                         </span>
                       </div>
                     </div>
                   </div>

                  {/* Configuration de la base de données */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Base de Données</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Driver par défaut:</span>
                        <span className="font-medium">{systemSettings.database?.default}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Host MySQL:</span>
                        <span className="font-medium">{systemSettings.database?.connections?.mysql?.host}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Port MySQL:</span>
                        <span className="font-medium">{systemSettings.database?.connections?.mysql?.port}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base MySQL:</span>
                        <span className="font-medium">{systemSettings.database?.connections?.mysql?.database}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuration du cache et des files d'attente */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache & Files d'attente</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Driver Cache:</span>
                        <span className="font-medium">{systemSettings.cache?.default}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Driver Queue:</span>
                        <span className="font-medium">{systemSettings.queue?.default}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Session Driver:</span>
                        <span className="font-medium">{systemSettings.session?.driver}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lifetime Session:</span>
                        <span className="font-medium">{systemSettings.session?.lifetime} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Configuration des emails */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Email</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Driver par défaut:</span>
                        <span className="font-medium">{systemSettings.mail?.default}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Host SMTP:</span>
                        <span className="font-medium">{systemSettings.mail?.mailers?.smtp?.host}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Port SMTP:</span>
                        <span className="font-medium">{systemSettings.mail?.mailers?.smtp?.port}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Chiffrement:</span>
                        <span className="font-medium">{systemSettings.mail?.mailers?.smtp?.encryption}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mode Maintenance */}
            {activeTab === 'maintenance' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Mode Maintenance</h2>
                  <button
                    onClick={() => setShowMaintenanceModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {maintenanceStatus?.is_maintenance_mode ? 'Modifier' : 'Activer'}
                  </button>
                </div>

                {/* Statut actuel */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut Actuel</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${maintenanceStatus?.is_maintenance_mode ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <span className="text-gray-700">
                        Mode maintenance: {maintenanceStatus?.is_maintenance_mode ? 'Activé' : 'Désactivé'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${maintenanceStatus?.maintenance_file_exists ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                      <span className="text-gray-700">
                        Fichier maintenance: {maintenanceStatus?.maintenance_file_exists ? 'Présent' : 'Absent'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleMaintenanceToggle}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                      maintenanceStatus?.is_maintenance_mode
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {maintenanceStatus?.is_maintenance_mode ? 'Désactiver la maintenance' : 'Activer la maintenance'}
                  </button>
                  
                  <button
                    onClick={loadSystemData}
                    className="w-full px-4 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Actualiser le statut
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Globales */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Notifications Globales</h2>
                  <button
                    onClick={() => {
                      resetNotificationForm();
                      setShowNotificationModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    Créer une notification
                  </button>
                </div>

                {/* Liste des notifications */}
                <div className="space-y-4">
                  {globalNotifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🔔</div>
                      <p>Aucune notification globale configurée</p>
                    </div>
                  ) : (
                    globalNotifications.map((notification) => (
                      <div key={notification.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-medium text-gray-900">{notification.title}</h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                notification.type === 'error' ? 'bg-red-100 text-red-800' :
                                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                notification.type === 'success' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {notification.type}
                              </span>
                              {notification.is_active && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mb-2">{notification.message}</p>
                            {notification.expires_at && (
                              <p className="text-sm text-gray-500">
                                Expire le: {new Date(notification.expires_at).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingNotification(notification);
                                setNotificationForm({
                                  title: notification.title,
                                  message: notification.message,
                                  type: notification.type,
                                  is_active: notification.is_active,
                                  expires_at: notification.expires_at ? notification.expires_at.split('T')[0] : ''
                                });
                                setNotificationErrors({});
                                setShowNotificationModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleNotificationDelete(notification.id)}
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

            {/* Sauvegardes */}
            {activeTab === 'backups' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Sauvegardes Système</h2>
                  <button
                    onClick={() => setShowBackupModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Créer une sauvegarde
                  </button>
                </div>

                {/* Liste des sauvegardes */}
                <div className="space-y-4">
                  {backups.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">💾</div>
                      <p>Aucune sauvegarde disponible</p>
                    </div>
                  ) : (
                    backups.map((backup) => (
                      <div key={backup.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-900">{backup.description || 'Sauvegarde système'}</h4>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <span>Type: {backup.type}</span>
                              <span>Créée le: {new Date(backup.created_at).toLocaleDateString('fr-FR')}</span>
                              {backup.size && <span>Taille: {backup.size}</span>}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleBackupDownload(backup.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Télécharger
                            </button>
                            <button
                              onClick={() => handleBackupDelete(backup.id)}
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
          </div>
        </div>

        {/* Modale Maintenance */}
        {showMaintenanceModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {maintenanceStatus?.is_maintenance_mode ? 'Modifier la maintenance' : 'Activer le mode maintenance'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message de maintenance
                    </label>
                    <textarea
                      value={maintenanceForm.message}
                      onChange={(e) => setMaintenanceForm({...maintenanceForm, message: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Le système est en maintenance..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Délai de retry (secondes)
                    </label>
                    <input
                      type="number"
                      value={maintenanceForm.retry}
                      onChange={(e) => setMaintenanceForm({...maintenanceForm, retry: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Clé secrète
                    </label>
                    <input
                      type="text"
                      value={maintenanceForm.secret}
                      onChange={(e) => setMaintenanceForm({...maintenanceForm, secret: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="secret123"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowMaintenanceModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleMaintenanceToggle}
                    className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {maintenanceStatus?.is_maintenance_mode ? 'Mettre à jour' : 'Activer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modale Notification */}
        {showNotificationModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingNotification ? 'Modifier la notification' : 'Créer une notification'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={notificationForm.title}
                      onChange={(e) => handleNotificationFormChange('title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        notificationErrors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Titre de la notification"
                    />
                    {notificationErrors.title && (
                      <p className="mt-1 text-sm text-red-600">{notificationErrors.title}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      value={notificationForm.message}
                      onChange={(e) => handleNotificationFormChange('message', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        notificationErrors.message ? 'border-red-500' : 'border-gray-300'
                      }`}
                      rows="3"
                      placeholder="Contenu de la notification..."
                    />
                    {notificationErrors.message && (
                      <p className="mt-1 text-sm text-red-600">{notificationErrors.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={notificationForm.type}
                        onChange={(e) => handleNotificationFormChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="info">Info</option>
                        <option value="warning">Avertissement</option>
                        <option value="error">Erreur</option>
                        <option value="success">Succès</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date d'expiration
                      </label>
                      <input
                        type="date"
                        value={notificationForm.expires_at}
                        onChange={(e) => handleNotificationFormChange('expires_at', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          notificationErrors.expires_at ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <p className="mt-1 text-xs text-gray-500">Sélectionnez une date future</p>
                      {notificationErrors.expires_at && (
                        <p className="mt-1 text-sm text-red-600">{notificationErrors.expires_at}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={notificationForm.is_active}
                      onChange={(e) => handleNotificationFormChange('is_active', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Notification active
                    </label>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowNotificationModal(false);
                      resetNotificationForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleNotificationSubmit}
                    className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                  >
                    {editingNotification ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modale Sauvegarde */}
        {showBackupModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Créer une sauvegarde</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de sauvegarde
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="database">Base de données</option>
                      <option value="files">Fichiers</option>
                      <option value="full">Complète</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Description de la sauvegarde..."
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowBackupModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleBackupCreate}
                    className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Créer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modale Paramètres Système */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Modifier les paramètres</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'application
                    </label>
                    <input
                      type="text"
                      value={settingsForm.app.name}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        app: { ...settingsForm.app, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="PullApp"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select
                      value={settingsForm.app.timezone}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        app: { ...settingsForm.app, timezone: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="debug_mode"
                      checked={settingsForm.app.debug}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        app: { ...settingsForm.app, debug: e.target.checked }
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="debug_mode" className="ml-2 block text-sm text-gray-900">
                      Mode debug
                    </label>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSettingsUpdate}
                    className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Mettre à jour
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemConfig;
