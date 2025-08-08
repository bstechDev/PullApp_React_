import React from 'react';

const filterOptions = {
  status: [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'pending', label: 'En attente' },
    { value: 'approved', label: 'Approuvés' },
    { value: 'rejected', label: 'Rejetés' }
  ],
  type: [
    { value: 'all', label: 'Tous les types' },
    { value: 'post', label: 'Posts simples' },
    { value: 'event', label: 'Événements' },
    { value: 'video', label: 'Vidéos' }
  ]
};

const ModerationFilters = ({ filters, setFilters, posts, contentType = 'posts' }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Recherche */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recherche
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un post..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filtre par statut */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              {filterOptions.status.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filtre par type - seulement pour les posts */}
        {contentType === 'posts' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de contenu
            </label>
            <div className="relative">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {filterOptions.type.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Bouton de réinitialisation */}
        <div className="flex items-end">
          <button
            onClick={() => setFilters({ status: 'pending', search: '', type: 'all' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réinitialiser
            </span>
          </button>
        </div>
      </div>

              {/* Statistiques des filtres */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex space-x-4">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>
                {posts.filter(p => p.status === 'pending').length} en attente
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                {posts.filter(p => p.status === 'approved').length} approuvés
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-400 mr-2"></span>
                {posts.filter(p => p.status === 'rejected').length} rejetés
              </span>
            </div>
            <span className="text-gray-500">
              {posts.length} {contentType === 'posts' ? 'posts' : 'commentaires'} au total
            </span>
          </div>
        </div>
    </div>
  );
};

export default ModerationFilters;
