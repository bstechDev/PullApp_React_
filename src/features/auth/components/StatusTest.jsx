// src/features/auth/pages/status/StatusTest.jsx
import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import { useAuth } from '../../auth/contexts/AuthContext';

const StatusTest = () => {
  const { user } = useAuth();
  const [myStatus, setMyStatus] = useState(null);
  const [friendsStatus, setFriendsStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyStatus = async () => {
    try {
      const response = await api.get(`/status/user/${user?.id}`);
      setMyStatus(response.data);
    } catch (err) {
      console.error('Erreur statut utilisateur :', err);
    }
  };

  const fetchFriendsStatuses = async () => {
    try {
      const response = await api.get('/status/friends');
      const data = response.data?.friends_status || [];
      setFriendsStatus(data);
      setError(null);
    } catch (err) {
      console.error('Erreur statuts amis :', err);
      setError("Impossible de récupérer les statuts des amis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchMyStatus();
    fetchFriendsStatuses();

    // Pusher gère maintenant les mises à jour de statut en temps réel
    // Plus besoin de polling toutes les 30 secondes
    console.log('StatusTest: Utilisation de Pusher pour les statuts');
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">🧪 Statut utilisateur et amis</h2>

      {user && myStatus && (
        <div className="mb-6 border p-4 rounded bg-gray-50">
          <h3 className="font-bold mb-2">👤 Moi-même</h3>
          <p className="font-medium text-gray-800">{user.first_name} {user.last_name}</p>
          <p className="text-sm text-gray-500">Email : {user.email}</p>
          <p className="text-sm text-gray-500">
            Statut :{" "}
            {myStatus.is_online ? (
              <span className="text-green-600 font-bold">🟢 En ligne</span>
            ) : (
              <span className="text-red-500 font-bold">🔴 Hors ligne</span>
            )}
          </p>
          <p className="text-sm text-gray-500">
            Dernière activité :{" "}
            {myStatus.last_seen ? new Date(myStatus.last_seen).toLocaleString() : '—'}
          </p>
        </div>
      )}

      <h3 className="font-semibold text-lg mb-2">👥 Amis</h3>

      {loading && <p>Chargement des statuts...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && friendsStatus.length === 0 && (
        <p className="text-gray-600">Aucun ami à afficher.</p>
      )}

      <ul className="space-y-3">
        {friendsStatus.map((friend) => (
          <li key={friend.user_id} className="flex justify-between items-center border-b pb-2">
            <div>
              <p className="font-medium text-gray-800">{friend.first_name} {friend.last_name} <span className="text-gray-500">(@{friend.username})</span></p>
              <p className="text-sm text-gray-500">
                Dernière activité :{" "}
                {friend.last_seen ? new Date(friend.last_seen).toLocaleString() : '—'}
              </p>
            </div>
            <div>
              {friend.is_online ? (
                <span className="text-green-600 font-bold">🟢 En ligne</span>
              ) : (
                <span className="text-red-500 font-bold">🔴 Hors ligne</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusTest;
