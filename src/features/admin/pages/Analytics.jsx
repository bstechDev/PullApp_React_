import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});

  // États pour les différents onglets
  const [dashboardData, setDashboardData] = useState(null);
  const [userEvolution, setUserEvolution] = useState([]);
  const [activityCharts, setActivityCharts] = useState({});
  const [demographics, setDemographics] = useState({});
  const [contentStats, setContentStats] = useState({});
  const [moderationStats, setModerationStats] = useState({});
  const [periodicReports, setPeriodicReports] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({});

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Charger le dashboard principal
      try {
        const dashboard = await adminService.getAnalyticsDashboard();
        if (dashboard.success) {
          setDashboardData(dashboard);
        }
      } catch (error) {
        console.error('Erreur dashboard:', error);
      }

      // Charger l'évolution des utilisateurs
      try {
        const evolution = await adminService.getUserEvolution(30);
        if (evolution.success) {
          setUserEvolution(evolution.data);
        }
      } catch (error) {
        console.error('Erreur évolution:', error);
      }

      // Charger les graphiques d'activité
      try {
        const activity = await adminService.getActivityCharts(7);
        if (activity.success) {
          setActivityCharts(activity.charts);
        }
      } catch (error) {
        console.error('Erreur activité:', error);
      }

      // Charger les démographiques
      try {
        const demo = await adminService.getDemographics();
        if (demo.success) {
          setDemographics(demo.demographics);
        }
      } catch (error) {
        console.error('Erreur démographiques:', error);
      }

      // Charger les stats de contenu
      try {
        const content = await adminService.getContentStats();
        if (content.success) {
          setContentStats(content.content_stats);
        }
      } catch (error) {
        console.error('Erreur contenu:', error);
      }

      // Charger les stats de modération
      try {
        const moderation = await adminService.getAnalyticsModerationStats();
        if (moderation.success) {
          setModerationStats(moderation.moderation_stats);
        }
      } catch (error) {
        console.error('Erreur modération:', error);
      }

      // Charger les rapports périodiques
      try {
        // Utiliser la date actuelle pour éviter l'erreur 422
        const today = new Date().toISOString().split('T')[0];
        const reports = await adminService.getPeriodicReports('weekly', today);
        if (reports.success) {
          setPeriodicReports(reports.report);
        }
      } catch (error) {
        console.error('Erreur rapports:', error);
      }

      // Charger les métriques de performance
      try {
        const performance = await adminService.getPerformanceMetrics();
        if (performance.success) {
          setPerformanceMetrics(performance.metrics);
        }
      } catch (error) {
        console.error('Erreur performance:', error);
      }

    } catch (error) {
      toast.error('Erreur lors du chargement des analytics');
      console.error('Erreur générale:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // Ajouter des paramètres pour éviter l'erreur 422
      const exportData = await adminService.exportAnalyticsData({
        type: 'users',
        format: 'csv',
        date: new Date().toISOString().split('T')[0]
      });
      if (exportData.success) {
        // Créer un lien de téléchargement
        const link = document.createElement('a');
        link.href = exportData.download_url;
        link.download = exportData.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Export téléchargé avec succès');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'export');
      console.error('Erreur export:', error);
    }
  };

  const StatCard = ({ title, value, change, icon, color, description }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${color}`}>
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
            </div>
            <div className="ml-4">
              <dt className="text-sm font-medium text-gray-500">{title}</dt>
              <dd className="flex items-center mt-1">
                <span className="text-2xl font-semibold text-gray-900">{value}</span>
                {change !== undefined && (
                  <span className={`ml-2 inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5 ${
                    change > 0 ? 'bg-green-50 text-green-700' : change < 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'
                  }`}>
                    {change > 0 ? '+' : ''}{change}%
                  </span>
                )}
              </dd>
              {description && (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">Analyse approfondie de votre plateforme</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadAnalyticsData}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              📊 Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Navigation des onglets */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex flex-wrap gap-2">
            {[
              { id: 'dashboard', name: 'Dashboard Principal', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z', color: 'blue' },
              { id: 'evolution', name: 'Évolution Utilisateurs', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'green' },
              { id: 'activity', name: 'Graphiques Activité', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'purple' },
              { id: 'demographics', name: 'Statistiques Démographiques', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'indigo' },
              { id: 'content', name: 'Statistiques Contenu', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'pink' },
              { id: 'moderation', name: 'Statistiques Modération', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'red' },
              { id: 'reports', name: 'Rapports Périodiques', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'yellow' },
              { id: 'performance', name: 'Métriques Performance', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'emerald' }
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
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Principal</h2>
              <div className="text-sm text-gray-500">
                Dernière mise à jour: {new Date().toLocaleDateString('fr-FR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            
            {dashboardData && (
              <>
                {/* KPIs Principaux */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard 
                    title="Utilisateurs totaux" 
                    value={dashboardData.kpis?.total_users || 0} 
                    change={dashboardData.growth_rates?.users_growth_month || 0}
                    icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                    description="Tous les utilisateurs inscrits"
                  />
                  <StatCard 
                    title="Posts totaux" 
                    value={dashboardData.kpis?.total_posts || 0} 
                    change={dashboardData.growth_rates?.posts_growth_month || 0}
                    icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                    description="Toutes les publications"
                  />
                  <StatCard 
                    title="Taux d'engagement" 
                    value={`${dashboardData.growth_rates?.engagement_rate || 0}%`} 
                    icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    color="bg-gradient-to-br from-green-500 to-green-600"
                    description="Taux d'engagement global"
                  />
                  <StatCard 
                    title="Utilisateurs actifs" 
                    value={dashboardData.kpis?.active_users_today || 0} 
                    icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    color="bg-gradient-to-br from-yellow-500 to-yellow-600"
                    description="Connectés aujourd'hui"
                  />
                </div>

                {/* Statistiques détaillées */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Activité récente */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Activité Récente
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">📝</span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Posts cette semaine</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">{dashboardData.kpis?.posts_this_week || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-sm">💬</span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Commentaires totaux</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">{dashboardData.kpis?.total_comments || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-sm">👥</span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">Amitiés totales</span>
                        </div>
                        <span className="text-lg font-bold text-purple-600">{dashboardData.kpis?.total_friendships || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notifications et alertes */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      Notifications & Alertes
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-semibold text-sm">🔔</span>
                          </div>
                          <span className="text-sm font-medium text-orange-700">Notifications non lues</span>
                        </div>
                        <span className="text-lg font-bold text-orange-600">{dashboardData.kpis?.unread_notifications || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 font-semibold text-sm">⚠️</span>
                          </div>
                          <span className="text-sm font-medium text-red-700">Posts en attente</span>
                        </div>
                        <span className="text-lg font-bold text-red-600">{dashboardData.kpis?.posts_pending_moderation || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600 font-semibold text-sm">📊</span>
                          </div>
                          <span className="text-sm font-medium text-yellow-700">Signalements totaux</span>
                        </div>
                        <span className="text-lg font-bold text-yellow-600">{dashboardData.kpis?.total_reports || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'evolution' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Évolution des Utilisateurs</h2>
            
            {/* Informations générales */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">
                    Évolution sur 30 jours - {userEvolution.length} points de données
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => loadAnalyticsData()}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Actualiser
                  </button>
                </div>
              </div>
            </div>

            {/* Graphique d'évolution */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-medium mb-4 text-lg text-gray-900">Tendance des Inscriptions</h3>
              <div className="grid grid-cols-6 gap-4">
                {userEvolution.slice(-6).map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">{item.date}</div>
                      <div className="text-2xl font-bold text-blue-600">{item.count}</div>
                      <div className="text-xs text-gray-400">utilisateurs</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistiques détaillées */}
            {userEvolution.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userEvolution.reduce((sum, item) => sum + item.count, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total sur la période</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.max(...userEvolution.map(item => item.count))}
                  </div>
                  <div className="text-sm text-gray-600">Pic d'inscriptions</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(userEvolution.reduce((sum, item) => sum + item.count, 0) / userEvolution.length)}
                  </div>
                  <div className="text-sm text-gray-600">Moyenne quotidienne</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Graphiques d'Activité</h2>
            
            {/* Informations de la période */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">
                    Activité sur les 7 derniers jours
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Données mises à jour en temps réel
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => loadAnalyticsData()}
                    className="text-sm text-green-600 hover:text-green-800 underline"
                  >
                    Actualiser
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activité des Posts */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-medium mb-4 text-lg text-gray-900 flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  Activité des Posts
                </h3>
                <div className="space-y-3">
                  {activityCharts.posts_activity?.length > 0 ? (
                    activityCharts.posts_activity.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-semibold">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{item.date}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-blue-600">{item.count}</span>
                          <div className="text-xs text-gray-500">posts</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📝</div>
                      <p>Aucune activité de posts sur cette période</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Activité des Commentaires */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-medium mb-4 text-lg text-gray-900 flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Activité des Commentaires
                </h3>
                <div className="space-y-3">
                  {activityCharts.comments_activity?.length > 0 ? (
                    activityCharts.comments_activity.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-semibold">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{item.date}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">{item.count}</span>
                          <div className="text-xs text-gray-500">commentaires</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">💬</div>
                      <p>Aucune activité de commentaires sur cette période</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Activités supplémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Messages */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-medium mb-3 text-gray-900">Messages</h4>
                {activityCharts.messages_activity?.length > 0 ? (
                  <div className="space-y-2">
                    {activityCharts.messages_activity.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{item.date}</span>
                        <span className="font-semibold text-purple-600">{item.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucune activité</p>
                )}
              </div>

              {/* Amitiés */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-medium mb-3 text-gray-900">Amitiés</h4>
                {activityCharts.friendships_activity?.length > 0 ? (
                  <div className="space-y-2">
                    {activityCharts.friendships_activity.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{item.date}</span>
                        <span className="font-semibold text-pink-600">{item.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucune activité</p>
                )}
              </div>

              {/* Signalements */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="font-medium mb-3 text-gray-900">Signalements</h4>
                {activityCharts.reports_activity?.length > 0 ? (
                  <div className="space-y-2">
                    {activityCharts.reports_activity.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{item.date}</span>
                        <span className="font-semibold text-red-600">{item.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucun signalement</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'demographics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Statistiques Démographiques</h2>
              <div className="text-sm text-gray-500">
                Analyse de la population utilisateur
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Groupes d'âge */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  Répartition par Âge
                </h3>
                {demographics.age_groups?.length > 0 ? (
                  <div className="space-y-4">
                    {demographics.age_groups.map((group, index) => {
                      const total = demographics.age_groups.reduce((sum, g) => sum + g.count, 0);
                      const percentage = total > 0 ? Math.round((group.count / total) * 100) : 0;
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'];
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{group.age_group} ans</span>
                            <span className="text-sm text-gray-500">{group.count} utilisateurs</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <p>Aucune donnée démographique disponible</p>
                  </div>
                )}
              </div>

              {/* Rôles Utilisateurs */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  Répartition par Rôles
                </h3>
                {demographics.user_roles?.length > 0 ? (
                  <div className="space-y-4">
                    {demographics.user_roles.map((role, index) => {
                      const total = demographics.user_roles.reduce((sum, r) => sum + r.count, 0);
                      const percentage = total > 0 ? Math.round((role.count / total) * 100) : 0;
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500'];
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
                            <span className="text-sm font-medium text-gray-700 capitalize">{role.role}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{role.count}</div>
                            <div className="text-xs text-gray-500">{percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">👥</div>
                    <p>Aucune donnée de rôles disponible</p>
                  </div>
                )}
              </div>
            </div>

            {/* Statut de vérification */}
            {demographics.verification_status && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  Statut de Vérification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600">{demographics.verification_status.verified || 0}</div>
                    <div className="text-sm text-green-700 mt-1">Utilisateurs vérifiés</div>
                    <div className="text-xs text-green-600 mt-1">✅ Email confirmé</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-3xl font-bold text-yellow-600">{demographics.verification_status.unverified || 0}</div>
                    <div className="text-sm text-yellow-700 mt-1">En attente de vérification</div>
                    <div className="text-xs text-yellow-600 mt-1">⏳ Email non confirmé</div>
                  </div>
                </div>
              </div>
            )}

            {/* Top pays (si disponible) */}
            {demographics.top_countries && demographics.top_countries.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                  Top Pays
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {demographics.top_countries.slice(0, 6).map((country, index) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-indigo-600">{country.count}</div>
                      <div className="text-sm text-gray-600 mt-1">{country.country}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Statistiques du Contenu</h2>
              <div className="text-sm text-gray-500">
                Analyse de l'engagement et de la création de contenu
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Posts par Type */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  Posts par Type
                </h3>
                {contentStats.posts_by_type?.length > 0 ? (
                  <div className="space-y-4">
                    {contentStats.posts_by_type.map((type, index) => {
                      const total = contentStats.posts_by_type.reduce((sum, t) => sum + t.count, 0);
                      const percentage = total > 0 ? Math.round((type.count / total) * 100) : 0;
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'];
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 capitalize">{type.type}</span>
                            <span className="text-sm text-gray-500">{type.count} posts</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${colors[index % colors.length]}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📝</div>
                    <p>Aucune donnée de posts disponible</p>
                  </div>
                )}
              </div>

              {/* Posts par Statut */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  Posts par Statut
                </h3>
                {contentStats.posts_by_status?.length > 0 ? (
                  <div className="space-y-4">
                    {contentStats.posts_by_status.map((status, index) => {
                      const total = contentStats.posts_by_status.reduce((sum, s) => sum + s.count, 0);
                      const percentage = total > 0 ? Math.round((status.count / total) * 100) : 0;
                      const statusColors = {
                        'approved': 'bg-green-500',
                        'rejected': 'bg-red-500',
                        'pending': 'bg-yellow-500',
                        'draft': 'bg-gray-500'
                      };
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${statusColors[status.status] || 'bg-gray-500'}`}></div>
                            <span className="text-sm font-medium text-gray-700 capitalize">{status.status}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{status.count}</div>
                            <div className="text-xs text-gray-500">{percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📊</div>
                    <p>Aucune donnée de statut disponible</p>
                  </div>
                )}
              </div>
            </div>

            {/* Engagement du Contenu */}
            {contentStats.content_engagement && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  Métriques d'Engagement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600">{contentStats.content_engagement.engagement_rate || 0}%</div>
                    <div className="text-sm text-blue-700 mt-1">Taux d'engagement</div>
                    <div className="text-xs text-blue-600 mt-1">📈 Performance globale</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{contentStats.content_engagement.avg_comments_per_post || 0}</div>
                    <div className="text-sm text-green-700 mt-1">Moy. commentaires/post</div>
                    <div className="text-xs text-green-600 mt-1">💬 Interaction moyenne</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-600">{contentStats.content_engagement.avg_likes_per_post || 0}</div>
                    <div className="text-sm text-purple-700 mt-1">Moy. likes/post</div>
                    <div className="text-xs text-purple-600 mt-1">👍 Appréciation</div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Créateurs de Contenu */}
            {contentStats.top_content_creators && contentStats.top_content_creators.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  Top Créateurs de Contenu
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contentStats.top_content_creators.slice(0, 6).map((creator, index) => (
                    <div key={creator.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {creator.first_name} {creator.last_name}
                          </div>
                          <div className="text-xs text-gray-500">{creator.email}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-white p-2 rounded border">
                          <div className="text-lg font-bold text-blue-600">{creator.posts_count}</div>
                          <div className="text-xs text-gray-500">Posts</div>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <div className="text-lg font-bold text-green-600">{creator.comments_count}</div>
                          <div className="text-xs text-gray-500">Commentaires</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Statistiques de Modération</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Actions de Modération</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Posts approuvés</span>
                    <span className="font-medium">{moderationStats.moderation_actions?.posts_approved || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Posts rejetés</span>
                    <span className="font-medium">{moderationStats.moderation_actions?.posts_rejected || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Commentaires approuvés</span>
                    <span className="font-medium">{moderationStats.moderation_actions?.comments_approved || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Rapports Périodiques</h2>
            
            {/* Informations de la période */}
            {periodicReports.period && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900">Période: {periodicReports.period}</h3>
                    {periodicReports.date_range && (
                      <p className="text-sm text-blue-700 mt-1">
                        Du {new Date(periodicReports.date_range.start).toLocaleDateString('fr-FR')} 
                        au {new Date(periodicReports.date_range.end).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => {
                        const today = new Date().toISOString().split('T')[0];
                        loadAnalyticsData();
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Actualiser
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Résumé de la période */}
            {periodicReports.summary && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium mb-4 text-lg">Résumé de la Période</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <div className="text-center bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-blue-600">{periodicReports.summary.new_users || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Nouveaux utilisateurs</div>
                  </div>
                  <div className="text-center bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-green-600">{periodicReports.summary.new_posts || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Nouveaux posts</div>
                  </div>
                  <div className="text-center bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-purple-600">{periodicReports.summary.new_comments || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Nouveaux commentaires</div>
                  </div>
                  <div className="text-center bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-yellow-600">{periodicReports.summary.new_friendships || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Nouvelles amitiés</div>
                  </div>
                  <div className="text-center bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-red-600">{periodicReports.summary.new_reports || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Nouveaux signalements</div>
                  </div>
                </div>
              </div>
            )}

            {/* Top performers */}
            {periodicReports.top_performers && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Utilisateurs les plus actifs */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-medium mb-4 text-lg text-gray-900">Utilisateurs les Plus Actifs</h3>
                  <div className="space-y-3">
                    {periodicReports.top_performers.most_active_users?.slice(0, 5).map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-blue-600">{user.posts_count}</div>
                          <div className="text-xs text-gray-500">posts</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Utilisateurs les plus engagés */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="font-medium mb-4 text-lg text-gray-900">Utilisateurs les Plus Engagés</h3>
                  <div className="space-y-3">
                    {periodicReports.top_performers.most_engaged_users?.slice(0, 5).map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{user.comments_count}</div>
                          <div className="text-xs text-gray-500">commentaires</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Problèmes identifiés */}
            {periodicReports.issues && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-medium mb-4 text-lg text-red-900">Problèmes Identifiés</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-red-600">{periodicReports.issues.reported_content || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Contenu signalé</div>
                  </div>
                  <div className="text-center bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-orange-600">{periodicReports.issues.banned_users || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">Utilisateurs bannis</div>
                  </div>
                  <div className="text-center bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-yellow-600">{periodicReports.issues.pending_moderation || 0}</div>
                    <div className="text-sm text-gray-600 mt-1">En attente modération</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Métriques de Performance</h2>
              <div className="text-sm text-gray-500">
                Surveillance des performances système
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Temps de Réponse */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  Temps de Réponse API
                </h3>
                {performanceMetrics.response_times ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">{performanceMetrics.response_times.average_response_time || 0}</div>
                        <div className="text-sm text-blue-700 mt-1">Moyenne (ms)</div>
                        <div className="text-xs text-blue-600 mt-1">⚡ Performance</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-600">{performanceMetrics.response_times.p95_response_time || 0}</div>
                        <div className="text-sm text-green-700 mt-1">P95 (ms)</div>
                        <div className="text-xs text-green-600 mt-1">📊 95% des requêtes</div>
                      </div>
                    </div>
                    
                    {/* Graphique de performance */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Performance relative</span>
                        <span className="text-xs text-gray-500">Objectif: &lt;200ms</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            (performanceMetrics.response_times.average_response_time || 0) < 100 ? 'bg-green-500' :
                            (performanceMetrics.response_times.average_response_time || 0) < 200 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, ((performanceMetrics.response_times.average_response_time || 0) / 200) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">⚡</div>
                    <p>Aucune donnée de performance disponible</p>
                  </div>
                )}
              </div>

              {/* Stockage */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  Utilisation du Stockage
                </h3>
                {performanceMetrics.storage_usage ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-xl font-bold text-green-600">{performanceMetrics.storage_usage.used_space || '0 GB'}</div>
                        <div className="text-sm text-green-700 mt-1">Espace utilisé</div>
                        <div className="text-xs text-green-600 mt-1">💾 Stockage actuel</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-xl font-bold text-blue-600">{performanceMetrics.storage_usage.usage_percentage || 0}%</div>
                        <div className="text-sm text-blue-700 mt-1">Taux d'utilisation</div>
                        <div className="text-xs text-blue-600 mt-1">📈 Occupation</div>
                      </div>
                    </div>
                    
                    {/* Barre de progression du stockage */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Capacité utilisée</span>
                        <span className="text-xs text-gray-500">{performanceMetrics.storage_usage.used_space || '0 GB'} / {performanceMetrics.storage_usage.total_space || '100 GB'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            (performanceMetrics.storage_usage.usage_percentage || 0) < 70 ? 'bg-green-500' :
                            (performanceMetrics.storage_usage.usage_percentage || 0) < 90 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${performanceMetrics.storage_usage.usage_percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">💾</div>
                    <p>Aucune donnée de stockage disponible</p>
                  </div>
                )}
              </div>
            </div>

            {/* Métriques système avancées */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CPU */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-medium mb-3 text-gray-900 flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  CPU
                </h4>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{performanceMetrics.system_metrics?.cpu_usage || 0}%</div>
                  <div className="text-sm text-gray-600 mt-1">Utilisation</div>
                  <div className="text-xs text-gray-500 mt-1">🖥️ Processeur</div>
                </div>
              </div>

              {/* Mémoire */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-medium mb-3 text-gray-900 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Mémoire
                </h4>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{performanceMetrics.system_metrics?.memory_usage || 0}%</div>
                  <div className="text-sm text-gray-600 mt-1">Utilisation</div>
                  <div className="text-xs text-gray-500 mt-1">🧠 RAM</div>
                </div>
              </div>

              {/* Réseau */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h4 className="font-medium mb-3 text-gray-900 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Réseau
                </h4>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{performanceMetrics.system_metrics?.network_requests || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Requêtes/min</div>
                  <div className="text-xs text-gray-500 mt-1">🌐 Trafic</div>
                </div>
              </div>
            </div>

            {/* Alertes de performance */}
            {performanceMetrics.alerts && performanceMetrics.alerts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  Alertes de Performance
                </h3>
                <div className="space-y-3">
                  {performanceMetrics.alerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 text-sm">⚠️</span>
                        </div>
                        <span className="text-sm font-medium text-red-700">{alert.message}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-red-600">{alert.severity}</span>
                        <div className="text-xs text-red-500">{alert.timestamp}</div>
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
  );
};

export default Analytics;
