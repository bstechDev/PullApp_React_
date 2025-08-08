import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';

const Row = ({ label, value, color }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-sm text-gray-600">{label}</span>
    <span className={`text-sm font-medium ${color || 'text-gray-900'}`}>{value}</span>
  </div>
);

const UserStatsModal = ({ isOpen, onClose, userId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId || !isOpen) return;
      try {
        setLoading(true);
        const res = await adminService.getUserStatistics(userId);
        if (res.success) {
          setStats(res.stats || res.data || res);
        }
      } catch (e) {
        toast.error("Erreur lors du chargement des statistiques utilisateur");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-16 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Statistiques de l'utilisateur</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Chargement...</div>
        ) : !stats ? (
          <div className="py-8 text-center text-gray-500">Aucune donnée</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Réseau</h4>
                <Row label="Amis" value={stats.friends_count ?? 0} color="text-blue-700" />
                <Row label="Demandes en attente" value={stats.pending_friendships ?? 0} />
                <Row label="Blocages actifs (donnés)" value={stats.active_blocks_given ?? 0} color="text-red-700" />
                <Row label="Blocages actifs (reçus)" value={stats.active_blocks_received ?? 0} color="text-orange-700" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Activité</h4>
                <Row label="Posts" value={stats.posts_count ?? 0} />
                <Row label="Commentaires" value={stats.comments_count ?? 0} />
                <Row label="Likes" value={stats.likes_count ?? 0} />
                <Row label="Signalements" value={stats.reports_count ?? 0} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserStatsModal;
