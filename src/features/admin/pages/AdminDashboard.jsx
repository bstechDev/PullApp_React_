import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { loadAdminStats, adminStats } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    // Auth & Users
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    bannedUsers: 0,
    
    // Posts & Content
    totalPosts: 0,
    reportedPosts: 0,
    pendingModeration: 0,
    pendingComments: 0,
    
    // Relations
    totalFriendships: 0,
    pendingFriendships: 0,
    activeBlocks: 0,
    
    // Analytics & System
    totalReports: 0,
    systemAlerts: 0,
    activeSessions: 0,
    apiRequests: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🚀 Chargement des données du dashboard...');
      
      // Log des statistiques initiales
      console.log('📈 Stats initiales:', stats);
      try {
        const statsResponse = await adminService.getDashboardStats();
        if (statsResponse.success) {
          console.log('👥 Stats utilisateurs reçues:', statsResponse);
          setStats((prev) => ({
            ...prev,
            totalUsers: statsResponse.stats.total_users,
            activeUsers: statsResponse.stats.active_users,
            newUsersToday: statsResponse.stats.recent_users,
          }));
        }
      } catch (error) {
        console.log('⚠️ Erreur stats utilisateurs:', error);
        setStats((prev) => ({ ...prev, totalUsers: 0, activeUsers: 0, newUsersToday: 0 }));
      }

      // Charger les statistiques de modération
      try {
        // Essayer d'abord l'endpoint dashboard de modération
        const moderationDashboardResponse = await adminService.getModerationDashboard();
        if (moderationDashboardResponse.success) {
          console.log('📊 Dashboard modération reçu:', moderationDashboardResponse);
          setStats((prevStats) => ({
            ...prevStats,
            totalPosts: moderationDashboardResponse.stats?.total_posts || 0,
            reportedPosts: moderationDashboardResponse.stats?.reported_posts || 0,
            pendingModeration: moderationDashboardResponse.stats?.pending_posts || 0,
            pendingComments: moderationDashboardResponse.stats?.pending_comments || 0,
            totalReports: moderationDashboardResponse.stats?.total_reports || 0,
          }));
        }
      } catch (error) {
        console.log('⚠️ Erreur dashboard modération, essai avec stats:', error);
        
        try {
          // Fallback: essayer l'endpoint stats de modération
          const moderationStatsResponse = await adminService.getModerationStats();
          if (moderationStatsResponse.success) {
            console.log('📊 Stats modération reçues:', moderationStatsResponse);
            setStats((prevStats) => ({
              ...prevStats,
              totalPosts: moderationStatsResponse.stats?.total_posts || 0,
              reportedPosts: moderationStatsResponse.stats?.reported_posts || 0,
              pendingModeration: moderationStatsResponse.stats?.pending_posts || 0,
              pendingComments: moderationStatsResponse.stats?.pending_comments || 0,
              totalReports: moderationStatsResponse.stats?.total_reports || 0,
            }));
          }
        } catch (statsError) {
          console.log('⚠️ Erreur stats modération, essai avec posts:', statsError);
          
          try {
            // Fallback final: essayer de récupérer les posts directement
            const postsResponse = await adminService.getModerationPosts({ page: 1, limit: 100 });
            if (postsResponse.success) {
              console.log('📊 Posts récupérés:', postsResponse);
              const posts = postsResponse.posts?.data || postsResponse.data || [];
              const totalPosts = postsResponse.posts?.total || postsResponse.total || posts.length;
              const pendingPosts = posts.filter((p) => p.status === 'pending').length;
              const reportedPosts = posts.filter((p) => p.reports_count > 0).length;
              
              setStats((prevStats) => ({
                ...prevStats,
                totalPosts,
                reportedPosts,
                pendingModeration: pendingPosts,
              }));
            }
          } catch (postsError) {
            console.error('❌ Erreur lors de la récupération des posts:', postsError);
            // Garder les valeurs par défaut
          }
        }
      }

      // Charger les statistiques des relations
      try {
        const relationsResponse = await adminService.getRelationsDashboard();
        if (relationsResponse.success) {
          setStats((prevStats) => ({
            ...prevStats,
            totalFriendships: relationsResponse.stats?.total_friendships || 0,
            pendingFriendships: relationsResponse.stats?.pending_friendships || 0,
            activeBlocks: relationsResponse.stats?.active_blocks || 0,
          }));
        }
      } catch (error) {
        console.log('Erreur lors du chargement des stats relations:', error);
      }

      // Charger les statistiques système (placeholder pour l'instant)
      setStats((prevStats) => ({
        ...prevStats,
        systemAlerts: 0, // À remplacer par l'API quand disponible
        activeSessions: 0, // À remplacer par l'API quand disponible
        apiRequests: 0, // À remplacer par l'API quand disponible
      }));

      setRecentActivity([
        { id: 1, type: 'user_registration', message: 'Nouvel utilisateur inscrit: Jean Dupont', time: '2 minutes', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
        { id: 2, type: 'post_reported', message: 'Post signalé par 3 utilisateurs', time: '5 minutes', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' },
        { id: 3, type: 'user_banned', message: 'Utilisateur banni: spam détecté', time: '10 minutes', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728' },
      ]);
    } catch (error) {
      toast.error('Erreur lors du chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  const Trend = ({ value }) => (
    <span className={`ml-2 inline-flex items-center text-xs font-medium rounded-full px-2 py-0.5 ${
      value > 0 ? 'bg-green-50 text-green-700' : value < 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'
    }`}>
      {value > 0 ? (
        <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M5 10l4-4 6 6"/></svg>
      ) : value < 0 ? (
        <svg className="w-3.5 h-3.5 mr-1 rotate-180" viewBox="0 0 20 20" fill="currentColor"><path d="M5 10l4-4 6 6"/></svg>
      ) : (
        <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="10" r="3"/></svg>
      )}
      {value > 0 ? `+${value}%` : `${value}%`}
    </span>
  );

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
                {change !== undefined && <Trend value={change} />}
              </dd>
              {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrateur</h1>
            <p className="mt-1 text-sm text-gray-500">Vue d'ensemble de votre plateforme PullApp</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={loadDashboardData} className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
            
            {/* Bouton de test temporaire */}
            <button
              onClick={async () => {
                console.log('🧪 Test des endpoints...');
                try {
                  console.log('📡 Test /admin/moderation/dashboard');
                  const dashboard = await adminService.getModerationDashboard();
                  console.log('✅ Dashboard:', dashboard);
                } catch (e) {
                  console.log('❌ Dashboard error:', e);
                }
                
                try {
                  console.log('📡 Test /admin/moderation/posts');
                  const posts = await adminService.getModerationPosts({ page: 1 });
                  console.log('✅ Posts:', posts);
                } catch (e) {
                  console.log('❌ Posts error:', e);
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              🧪 Tester Endpoints
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques principales - Auth & Users */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Utilisateurs totaux" value={stats.totalUsers} change={12} icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" color="bg-blue-600" description="Tous les utilisateurs inscrits" />
        <StatCard title="Utilisateurs actifs" value={stats.activeUsers} change={8} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" color="bg-green-600" description="Connectés aujourd'hui" />
        <StatCard title="Nouveaux aujourd'hui" value={stats.newUsersToday} change={-3} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="bg-yellow-500" description="Nouvelles inscriptions" />
        <StatCard title="Utilisateurs bannis" value={stats.bannedUsers} change={0} icon="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" color="bg-red-600" description="Comptes suspendus" />
      </div>

      {/* Statistiques secondaires - Posts & Content */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Posts totaux" value={stats.totalPosts} change={15} icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" color="bg-purple-600" description="Toutes les publications" />
        <StatCard title="Posts signalés" value={stats.reportedPosts} change={-5} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" color="bg-orange-600" description="Contenu signalé" />
        <StatCard title="En attente modération" value={stats.pendingModeration} change={2} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="bg-indigo-600" description="Posts en attente" />
        <StatCard title="Commentaires en attente" value={stats.pendingComments} change={3} icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" color="bg-teal-600" description="Commentaires à modérer" />
      </div>

      {/* Statistiques tertiaires - Relations & System */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Relations d'amitié" value={stats.totalFriendships} change={7} icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" color="bg-pink-600" description="Connexions établies" />
        <StatCard title="Amitiés en attente" value={stats.pendingFriendships} change={-2} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="bg-amber-600" description="Demandes d'amitié" />
        <StatCard title="Blocages actifs" value={stats.activeBlocks} change={1} icon="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" color="bg-gray-600" description="Blocages en cours" />
        <StatCard title="Signalements totaux" value={stats.totalReports} change={-8} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" color="bg-red-500" description="Tous les signalements" />
      </div>

      {/* Statistiques système - Analytics & Config */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Alertes système" value={stats.systemAlerts} change={0} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" color="bg-yellow-400" description="Alertes actives" />
        <StatCard title="Sessions actives" value={stats.activeSessions} change={5} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" color="bg-emerald-600" description="Sessions ouvertes" />
        <StatCard title="Requêtes API" value={stats.apiRequests} change={12} icon="M13 10V3L4 14h7v7l9-11h-7z" color="bg-blue-500" description="Requêtes aujourd'hui" />
        <StatCard title="Performance" value="98%" change={2} icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" color="bg-green-500" description="Score global" />
      </div>

      {/* Activité récente et actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Activité récente</h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivity.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activity.icon} />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-600">{activity.message}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time>{activity.time}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-xl">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Actions rapides</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <a href="/admin/auth" className="inline-flex items-center px-4 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700">
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Gérer Auth
              </a>
              <a href="/admin/user" className="inline-flex items-center px-4 py-3 rounded-lg text-white bg-green-600 hover:bg-green-700">
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Gérer Users
              </a>
              <a href="/admin/post" className="inline-flex items-center px-4 py-3 rounded-lg text-white bg-purple-600 hover:bg-purple-700">
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Gérer Posts
              </a>
              <a href="/admin/relations" className="inline-flex items-center px-4 py-3 rounded-lg text-white bg-pink-600 hover:bg-pink-700">
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Gérer Relations
              </a>
              <a href="/admin/analytics" className="inline-flex items-center px-4 py-3 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Voir Analytics
              </a>
              <a href="/admin/config" className="inline-flex items-center px-4 py-3 rounded-lg text-white bg-orange-600 hover:bg-orange-700">
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                Config Système
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
