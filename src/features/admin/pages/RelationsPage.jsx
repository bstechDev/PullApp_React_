import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { adminService } from '../services/adminService';
import RelationsDashboard from './RelationsDashboard';
import CreateBlockModal from '../components/CreateBlockModal';
import UserStatsModal from '../components/UserStatsModal';

const StatusBadge = ({ status }) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };
  const label = {
    pending: 'En attente',
    accepted: 'Acceptée',
    rejected: 'Rejetée',
  }[status] || status;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-800'}`}>
      {label}
    </span>
  );
};

const RelationsPage = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'friendships' | 'blocks' | 'suggestions'

  // Friendships state
  const [friendships, setFriendships] = useState([]);
  const [fsPage, setFsPage] = useState(1);
  const [fsTotalPages, setFsTotalPages] = useState(1);
  const [fsLoading, setFsLoading] = useState(false);
  const [fsFilters, setFsFilters] = useState({ status: 'all', search: '' });
  const [fsSelected, setFsSelected] = useState([]);
  const fsAllSelected = friendships.length > 0 && fsSelected.length === friendships.length;

  // Blocks state
  const [blocks, setBlocks] = useState([]);
  const [blPage, setBlPage] = useState(1);
  const [blTotalPages, setBlTotalPages] = useState(1);
  const [blLoading, setBlLoading] = useState(false);
  const [blFilters, setBlFilters] = useState({ search: '' });
  const [blSelected, setBlSelected] = useState([]);
  const blAllSelected = blocks.length > 0 && blSelected.length === blocks.length;

  // Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [sugPage, setSugPage] = useState(1);
  const [sugTotalPages, setSugTotalPages] = useState(1);
  const [sugLoading, setSugLoading] = useState(false);
  const [sugFilters, setSugFilters] = useState({ search: '' });

  // Modals
  const [showCreateBlock, setShowCreateBlock] = useState(false);
  const [showUserStats, setShowUserStats] = useState(false);
  const [statsUserId, setStatsUserId] = useState(null);

  const fsParams = useMemo(() => {
    const params = { page: fsPage };
    if (fsFilters.search) params.search = fsFilters.search;
    if (fsFilters.status && fsFilters.status !== 'all') params.status = fsFilters.status;
    return params;
  }, [fsPage, fsFilters]);

  const blParams = useMemo(() => {
    const params = { page: blPage };
    if (blFilters.search) params.search = blFilters.search;
    return params;
  }, [blPage, blFilters]);

  const sugParams = useMemo(() => {
    const params = { page: sugPage };
    if (sugFilters.search) params.search = sugFilters.search;
    return params;
  }, [sugPage, sugFilters]);

  const loadFriendships = async () => {
    try {
      setFsLoading(true);
      const res = await adminService.getFriendshipsList(fsParams);
      if (res.success) {
        setFriendships(res.friendships.data);
        setFsTotalPages(res.friendships.last_page || 1);
        setFsSelected([]);
      }
    } catch (e) {
      toast.error("Erreur lors du chargement des amitiés");
      console.error(e);
    } finally {
      setFsLoading(false);
    }
  };

  const loadBlocks = async () => {
    try {
      setBlLoading(true);
      const res = await adminService.getBlocksList(blParams);
      if (res.success) {
        setBlocks(res.blocks.data);
        setBlTotalPages(res.blocks.last_page || 1);
        setBlSelected([]);
      }
    } catch (e) {
      toast.error("Erreur lors du chargement des blocages");
      console.error(e);
    } finally {
      setBlLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      setSugLoading(true);
      const res = await adminService.getFriendSuggestions(sugParams);
      // On supporte plusieurs formes de réponse potentielle
      const list = res?.suggestions?.data || res?.suggestions || res?.data || [];
      const lastPage = res?.suggestions?.last_page || res?.last_page || 1;
      setSuggestions(Array.isArray(list) ? list : []);
      setSugTotalPages(lastPage || 1);
    } catch (e) {
      toast.error("Erreur lors du chargement des suggestions");
    } finally {
      setSugLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) return;
    if (activeTab === 'friendships') loadFriendships();
    if (activeTab === 'blocks') loadBlocks();
    if (activeTab === 'suggestions') loadSuggestions();
  }, [user, isAdmin, activeTab, fsParams, blParams, sugParams]);

  const moderateFriendship = async (friendshipId, action) => {
    try {
      const res = await adminService.moderateFriendship(friendshipId, action);
      if (res.success) {
        toast.success(res.message || `Amitié ${action === 'approve' ? 'approuvée' : 'rejetée'}`);
        await loadFriendships();
      } else {
        throw new Error(res.message || 'Opération échouée');
      }
    } catch (e) {
      toast.error(e.message || "Erreur lors de la modération de l'amitié");
    }
  };

  const bulkModerateFriendships = async (action) => {
    if (fsSelected.length === 0) return;
    try {
      const res = await adminService.performMassActions({
        type: 'friendships',
        action,
        ids: fsSelected,
      });
      if (res.success) {
        toast.success(res.message || 'Actions en masse effectuées');
        await loadFriendships();
      } else {
        throw new Error(res.message || 'Échec des actions en masse');
      }
    } catch (e) {
      toast.error(e.message || 'Erreur lors des actions en masse');
    }
  };

  const moderateBlock = async (blockId, action = 'deactivate') => {
    try {
      const res = await adminService.moderateBlock(blockId, action);
      if (res.success) {
        toast.success(res.message || 'Blocage désactivé');
        await loadBlocks();
      } else {
        throw new Error(res.message || 'Opération échouée');
      }
    } catch (e) {
      toast.error(e.message || 'Erreur lors de la modération du blocage');
    }
  };

  const bulkModerateBlocks = async (action = 'deactivate') => {
    if (blSelected.length === 0) return;
    try {
      const res = await adminService.performMassActions({
        type: 'blocks',
        action,
        ids: blSelected,
      });
      if (res.success) {
        toast.success(res.message || 'Blocages désactivés');
        await loadBlocks();
      } else {
        throw new Error(res.message || 'Échec des actions en masse');
      }
    } catch (e) {
      toast.error(e.message || 'Erreur lors des actions en masse');
    }
  };

  const createBlock = async (payload) => {
    try {
      const res = await adminService.createBlock(payload);
      if (res.success) {
        toast.success('Blocage créé');
        setShowCreateBlock(false);
        await loadBlocks();
      } else {
        throw new Error(res.message || 'Création échouée');
      }
    } catch (e) {
      toast.error(e.message || 'Erreur lors de la création du blocage');
    }
  };

  const openUserStats = (id) => {
    setStatsUserId(id);
    setShowUserStats(true);
  };

  const toggleFsRow = (id) => {
    setFsSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  const toggleFsAll = () => {
    setFsSelected(fsAllSelected ? [] : friendships.map((f) => f.id));
  };

  const toggleBlRow = (id) => {
    setBlSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  const toggleBlAll = () => {
    setBlSelected(blAllSelected ? [] : blocks.map((b) => b.id));
  };

  return (
    <div className="space-y-6">
      {/* Header + Onglets */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des relations</h1>
            <p className="mt-1 text-sm text-gray-500">Amitiés, blocages et insights</p>
          </div>
          <div className="flex items-center space-x-2">
            {activeTab === 'blocks' && (
              <button onClick={() => setShowCreateBlock(true)} className="inline-flex items-center px-3 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 text-sm">+ Créer un blocage</button>
            )}
            {activeTab !== 'dashboard' && (
              <button
                onClick={() => (activeTab === 'friendships' ? loadFriendships() : activeTab === 'blocks' ? loadBlocks() : loadSuggestions())}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
              >
                Actualiser
              </button>
            )}
          </div>
        </div>
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('friendships')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'friendships'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Amitiés
              {friendships.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {friendships.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('blocks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'blocks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Blocages
              {blocks.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {blocks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'suggestions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Suggestions
              {suggestions.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {suggestions.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu par onglet */}
      {activeTab === 'dashboard' && (
        <RelationsDashboard />
      )}

      {activeTab === 'friendships' && (
        <div className="space-y-4">
          {/* Actions en masse */}
          <div className="bg-white shadow rounded-lg p-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {fsSelected.length} sélectionné(s)
            </div>
            <div className="space-x-2">
              <button disabled={fsSelected.length === 0} onClick={() => bulkModerateFriendships('approve')} className="px-3 py-1.5 bg-green-600 text-white rounded disabled:opacity-50 text-xs">Approuver sélection</button>
              <button disabled={fsSelected.length === 0} onClick={() => bulkModerateFriendships('reject')} className="px-3 py-1.5 bg-red-600 text-white rounded disabled:opacity-50 text-xs">Rejeter sélection</button>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <input
                  value={fsFilters.search}
                  onChange={(e) => { setFsPage(1); setFsFilters({ ...fsFilters, search: e.target.value }); }}
                  placeholder="Rechercher par nom/email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                  </svg>
                </div>
              </div>
              <div>
                <select
                  value={fsFilters.status}
                  onChange={(e) => { setFsPage(1); setFsFilters({ ...fsFilters, status: e.target.value }); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="accepted">Acceptée</option>
                  <option value="rejected">Rejetée</option>
                </select>
              </div>
              <div className="flex items-center">
                <button onClick={loadFriendships} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Filtrer</button>
              </div>
            </div>
          </div>

          {/* Liste */}
          <div className="bg-white shadow rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">
                      <input type="checkbox" checked={fsAllSelected} onChange={toggleFsAll} />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demandeur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ami</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fsLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-500">Chargement...</td>
                    </tr>
                  ) : friendships.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-500">Aucune amitié trouvée</td>
                    </tr>
                  ) : (
                    friendships.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">
                          <input type="checkbox" checked={fsSelected.includes(f.id)} onChange={() => toggleFsRow(f.id)} />
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center">
                            <button onClick={() => openUserStats(f.user?.id)} className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold mr-3 hover:opacity-90">
                              {f.user?.first_name?.[0]}{f.user?.last_name?.[0]}
                            </button>
                            <div>
                              <p className="font-medium text-gray-900">{f.user?.first_name} {f.user?.last_name}</p>
                              <p className="text-xs text-gray-500">{f.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center">
                            <button onClick={() => openUserStats(f.friend?.id)} className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-semibold mr-3 hover:bg-gray-300">
                              {f.friend?.first_name?.[0]}{f.friend?.last_name?.[0]}
                            </button>
                            <div>
                              <p className="font-medium text-gray-900">{f.friend?.first_name} {f.friend?.last_name}</p>
                              <p className="text-xs text-gray-500">{f.friend?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm"><StatusBadge status={f.status} /></td>
                        <td className="px-6 py-4 text-right text-sm">
                          {f.status === 'pending' ? (
                            <div className="flex space-x-2 justify-end">
                              <button onClick={() => moderateFriendship(f.id, 'approve')} className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs">✓ Approuver</button>
                              <button onClick={() => moderateFriendship(f.id, 'reject')} className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-xs">✗ Rejeter</button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Aucune action</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {fsTotalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <button disabled={fsPage === 1} onClick={() => setFsPage(Math.max(1, fsPage - 1))} className="px-3 py-1.5 text-sm rounded border disabled:opacity-50">Précédent</button>
                <p className="text-sm text-gray-600">Page {fsPage} / {fsTotalPages}</p>
                <button disabled={fsPage === fsTotalPages} onClick={() => setFsPage(Math.min(fsTotalPages, fsPage + 1))} className="px-3 py-1.5 text-sm rounded border disabled:opacity-50">Suivant</button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'blocks' && (
        <div className="space-y-4">
          {/* Actions en masse */}
          <div className="bg-white shadow rounded-lg p-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {blSelected.length} sélectionné(s)
            </div>
            <div className="space-x-2">
              <button disabled={blSelected.length === 0} onClick={() => bulkModerateBlocks('deactivate')} className="px-3 py-1.5 bg-gray-700 text-white rounded disabled:opacity-50 text-xs">Désactiver sélection</button>
            </div>
          </div>

          {/* Filtres */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <input
                  value={blFilters.search}
                  onChange={(e) => { setBlPage(1); setBlFilters({ ...blFilters, search: e.target.value }); }}
                  placeholder="Rechercher par nom/email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center">
                <button onClick={loadBlocks} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Filtrer</button>
              </div>
            </div>
          </div>

          {/* Liste */}
          <div className="bg-white shadow rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">
                      <input type="checkbox" checked={blAllSelected} onChange={toggleBlAll} />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bloqueur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bloqué</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-500">Chargement...</td>
                    </tr>
                  ) : blocks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-500">Aucun blocage trouvé</td>
                    </tr>
                  ) : (
                    blocks.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">
                          <input type="checkbox" checked={blSelected.includes(b.id)} onChange={() => toggleBlRow(b.id)} />
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center">
                            <button onClick={() => openUserStats(b.blocker?.id)} className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold mr-3 hover:opacity-90">
                              {b.blocker?.first_name?.[0]}{b.blocker?.last_name?.[0]}
                            </button>
                            <div>
                              <p className="font-medium text-gray-900">{b.blocker?.first_name} {b.blocker?.last_name}</p>
                              <p className="text-xs text-gray-500">{b.blocker?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center">
                            <button onClick={() => openUserStats(b.blocked?.id)} className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-semibold mr-3 hover:bg-gray-300">
                              {b.blocked?.first_name?.[0]}{b.blocked?.last_name?.[0]}
                            </button>
                            <div>
                              <p className="font-medium text-gray-900">{b.blocked?.first_name} {b.blocked?.last_name}</p>
                              <p className="text-xs text-gray-500">{b.blocked?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(b.created_at).toLocaleString('fr-FR')}</td>
                        <td className="px-6 py-4 text-right text-sm">
                          <button onClick={() => moderateBlock(b.id, 'deactivate')} className="px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs">Désactiver</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {blTotalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <button disabled={blPage === 1} onClick={() => setBlPage(Math.max(1, blPage - 1))} className="px-3 py-1.5 text-sm rounded border disabled:opacity-50">Précédent</button>
                <p className="text-sm text-gray-600">Page {blPage} / {blTotalPages}</p>
                <button disabled={blPage === blTotalPages} onClick={() => setBlPage(Math.min(blTotalPages, blPage + 1))} className="px-3 py-1.5 text-sm rounded border disabled:opacity-50">Suivant</button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          {/* Filtres */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <input
                  value={sugFilters.search}
                  onChange={(e) => { setSugPage(1); setSugFilters({ ...sugFilters, search: e.target.value }); }}
                  placeholder="Rechercher par nom/email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center">
                <button onClick={loadSuggestions} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Filtrer</button>
              </div>
            </div>
          </div>

          {/* Liste */}
          {sugLoading ? (
            <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">Chargement...</div>
          ) : suggestions.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">Aucune suggestion</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((u) => (
                <div key={u.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold mr-3">
                        {u.first_name?.[0]}{u.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <button onClick={() => openUserStats(u.id)} className="text-xs px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200">Stats</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {sugTotalPages > 1 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 bg-white rounded-lg">
              <button disabled={sugPage === 1} onClick={() => setSugPage(Math.max(1, sugPage - 1))} className="px-3 py-1.5 text-sm rounded border disabled:opacity-50">Précédent</button>
              <p className="text-sm text-gray-600">Page {sugPage} / {sugTotalPages}</p>
              <button disabled={sugPage === sugTotalPages} onClick={() => setSugPage(Math.min(sugTotalPages, sugPage + 1))} className="px-3 py-1.5 text-sm rounded border disabled:opacity-50">Suivant</button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateBlockModal isOpen={showCreateBlock} onClose={() => setShowCreateBlock(false)} onCreate={createBlock} />
      <UserStatsModal isOpen={showUserStats} onClose={() => setShowUserStats(false)} userId={statsUserId} />
    </div>
  );
};

export default RelationsPage;
