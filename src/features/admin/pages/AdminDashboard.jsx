import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { loadAdminStats, adminStats } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    bannedUsers: 0,
    totalPosts: 0,
    reportedPosts: 0,
    pendingModeration: 0,
    totalFriendships: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques du dashboard
      try {
        const statsResponse = await adminService.getDashboardStats();
        if (statsResponse.success) {
          // Mapper les données de l'API vers notre format
          setStats({
            totalUsers: statsResponse.stats.total_users,
            activeUsers: statsResponse.stats.active_users,
            newUsersToday: statsResponse.stats.recent_users,
            bannedUsers: 0, // Pas dans l'API pour l'instant
            totalPosts: 0, // Sera mis à jour avec les stats de modération
            reportedPosts: 0, // Sera mis à jour avec les stats de modération
            pendingModeration: 0, // Sera mis à jour avec les stats de modération
            totalFriendships: 0 // Pas dans l'API pour l'instant
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des stats dashboard:', error);
        // Stats par défaut en cas d'erreur
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          newUsersToday: 0,
          bannedUsers: 0,
          totalPosts: 0,
          reportedPosts: 0,
          pendingModeration: 0,
          totalFriendships: 0
        });
      }

      // Charger les statistiques de modération
      try {
        const moderationStatsResponse = await adminService.getModerationStats();
        if (moderationStatsResponse.success) {
          setStats(prevStats => ({
            ...prevStats,
            totalPosts: moderationStatsResponse.stats.total_posts || 0,
            reportedPosts: moderationStatsResponse.stats.reported_posts || 0,
            pendingModeration: moderationStatsResponse.stats.pending_posts || 0,
            pendingComments: moderationStatsResponse.stats.pending_comments || 0,
            totalReports: moderationStatsResponse.stats.total_reports || 0
          }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des stats de modération:', error);
        
        // Fallback: utiliser l'endpoint des posts pour obtenir les statistiques
        try {
          const postsResponse = await adminService.getModerationPosts({ page: 1 });
          if (postsResponse.success) {
            const posts = postsResponse.posts.data;
            const totalPosts = postsResponse.posts.total;
            const pendingPosts = posts.filter(post => post.status === 'pending').length;
            const reportedPosts = posts.filter(post => post.reports_count > 0).length;
            
            setStats(prevStats => ({
              ...prevStats,
              totalPosts: totalPosts,
              reportedPosts: reportedPosts,
              pendingModeration: pendingPosts
            }));
          }
        } catch (fallbackError) {
          console.error('Erreur lors du fallback des stats de modération:', fallbackError);
        }
      }

      // Charger l'activité récente (pour l'instant simulée)
      setRecentActivity([
        {
          id: 1,
          type: 'user_registration',
          message: 'Nouvel utilisateur inscrit: Jean Dupont',
          time: '2 minutes',
          icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
        },
        {
          id: 2,
          type: 'post_reported',
          message: 'Post signalé par 3 utilisateurs',
          time: '5 minutes',
          icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
          id: 3,
          type: 'user_banned',
          message: 'Utilisateur banni: spam détecté',
          time: '10 minutes',
          icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728'
        }
      ]);

    } catch (error) {
      toast.error('Erreur lors du chargement du dashboard');
      console.error('Erreur dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon, color, description }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${color}`}>
              <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {change !== undefined && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {change > 0 ? '+' : ''}{change}%
                  </div>
                )}
              </dd>
              {description && (
                <dd className="text-sm text-gray-500 mt-1">{description}</dd>
              )}
            </dl>
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
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrateur</h1>
            <p className="mt-1 text-sm text-gray-500">
              Vue d'overview de votre plateforme PullApp
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadDashboardData}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Utilisateurs totaux"
          value={stats.totalUsers}
          change={12}
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          color="bg-blue-500"
          description="Tous les utilisateurs inscrits"
        />
        <StatCard
          title="Utilisateurs actifs"
          value={stats.activeUsers}
          change={8}
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          color="bg-green-500"
          description="Utilisateurs connectés aujourd'hui"
        />
        <StatCard
          title="Nouveaux aujourd'hui"
          value={stats.newUsersToday}
          change={-3}
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          color="bg-yellow-500"
          description="Nouvelles inscriptions"
        />
        <StatCard
          title="Utilisateurs bannis"
          value={stats.bannedUsers}
          change={0}
          icon="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
          color="bg-red-500"
          description="Comptes suspendus"
        />
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Posts totaux"
          value={stats.totalPosts}
          change={15}
          icon="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          color="bg-purple-500"
          description="Toutes les publications"
        />
        <StatCard
          title="Posts signalés"
          value={stats.reportedPosts}
          change={-5}
          icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          color="bg-orange-500"
          description="Contenu signalé"
        />
        <StatCard
          title="En attente modération"
          value={stats.pendingModeration}
          change={2}
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          color="bg-indigo-500"
          description="Posts en attente"
        />
        <StatCard
          title="Relations d'amitié"
          value={stats.totalFriendships}
          change={7}
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          color="bg-pink-500"
          description="Connexions établies"
        />
      </div>

      {/* Activité récente et actions rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité récente */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Activité récente
            </h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivity.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                            <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activity.icon} />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">{activity.message}</p>
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

        {/* Actions rapides */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Actions rapides
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/admin/users"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Gérer utilisateurs
              </a>
              <a
                href="/admin/moderation"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Modérer contenu
              </a>
              <a
                href="/admin/analytics"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Voir analytics
              </a>
              <a
                href="/admin/reports"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Générer rapport
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
