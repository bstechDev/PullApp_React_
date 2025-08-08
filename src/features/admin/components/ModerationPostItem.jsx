import React from 'react';

const ModerationPostItem = ({ post, onAction }) => {
  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'event':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Événement
          </span>
        );
      case 'video':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Vidéo
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Post
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            En attente
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approuvé
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejeté
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* En-tête compact */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              {post.user?.first_name?.[0]}{post.user?.last_name?.[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {post.user?.first_name} {post.user?.last_name}
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                {getPostTypeIcon(post.type)}
              </div>
            </div>
          </div>
          {getStatusBadge(post.status)}
        </div>
      </div>

      {/* Contenu compact */}
      <div className="p-3">
        {/* Contenu texte tronqué */}
        <p className="text-sm text-gray-800 mb-2 line-clamp-3">
          {truncateText(post.content)}
        </p>

        {/* Informations événement compactes */}
        {post.type === 'event' && post.event_date && (
          <div className="mb-2 bg-blue-50 rounded p-2 text-xs">
            <span className="font-medium text-blue-700">📅 {formatDate(post.event_date)}</span>
            {post.event_location && (
              <span className="ml-2 text-blue-600">📍 {post.event_location}</span>
            )}
          </div>
        )}

        {/* Média miniature */}
        {post.image_path && (
          <div className="mb-2">
            <img 
              src={`http://192.168.1.4:8000/storage/${post.image_path}`}
              alt="Post image" 
              className="w-full h-24 object-cover rounded"
            />
          </div>
        )}
        {post.video_path && (
          <div className="mb-2 relative">
            <video
              src={`http://192.168.1.4:8000/storage/${post.video_path}`}
              className="w-full h-24 object-cover rounded"
              poster={post.thumbnail_path ? `http://192.168.1.4:8000/storage/${post.thumbnail_path}` : undefined}
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2-7a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        )}

        {/* Statistiques compactes */}
        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
          <span>💬 {post.comments?.length || 0}</span>
          <span>❤️ {post.likes?.length || 0}</span>
          {post.reports_count > 0 && (
            <span className="text-red-600 font-medium">⚠️ {post.reports_count}</span>
          )}
        </div>

        {/* Boutons d'action compacts */}
        <div className="flex justify-end space-x-2">
          {post.status === 'pending' ? (
            <>
              <button
                onClick={() => onAction('approve', post)}
                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
              >
                ✓ Approuver
              </button>
              <button
                onClick={() => onAction('reject', post)}
                className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
              >
                ✗ Rejeter
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-500 px-3 py-1.5">
              {post.status === 'approved' ? '✅ Approuvé' : '❌ Rejeté'}
            </span>
          )}
          <button
            onClick={() => onAction('delete', post)}
            className="inline-flex items-center px-3 py-1.5 bg-gray-500 text-white text-xs font-medium rounded hover:bg-gray-600 transition-colors"
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModerationPostItem;
