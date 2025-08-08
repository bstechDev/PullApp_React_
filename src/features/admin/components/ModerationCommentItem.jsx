import React from 'react';

const ModerationCommentItem = ({ comment, onAction }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 100) => {
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

  const getPostStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Post en attente
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Post approuvé
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Post rejeté
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
              {comment.user?.first_name?.[0]}{comment.user?.last_name?.[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {comment.user?.first_name} {comment.user?.last_name}
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  💬 Commentaire
                </span>
              </div>
            </div>
          </div>
          {getStatusBadge(comment.status)}
        </div>
      </div>

      {/* Contenu compact */}
      <div className="p-3">
        {/* Contenu du commentaire */}
        <p className="text-sm text-gray-800 mb-3">
          {truncateText(comment.content)}
        </p>

        {/* Informations sur le post parent */}
        <div className="mb-3 bg-gray-50 rounded p-2 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-gray-700">Post parent:</span>
            {getPostStatusBadge(comment.post?.status)}
          </div>
          <p className="text-gray-600 line-clamp-2">
            "{truncateText(comment.post?.content, 80)}"
          </p>
          {comment.post?.image_path && (
            <div className="mt-2">
              <img 
                src={`http://192.168.1.4:8000/storage/${comment.post.image_path}`}
                alt="Image du post" 
                className="w-full h-16 object-cover rounded"
              />
            </div>
          )}
        </div>

        {/* Statistiques compactes */}
        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
          {comment.reports_count > 0 && (
            <span className="text-red-600 font-medium">⚠️ {comment.reports_count} signalements</span>
          )}
        </div>

        {/* Boutons d'action compacts */}
        <div className="flex justify-end space-x-2">
          {comment.status === 'pending' ? (
            <>
              <button
                onClick={() => onAction('approve', comment)}
                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
              >
                ✓ Approuver
              </button>
              <button
                onClick={() => onAction('reject', comment)}
                className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
              >
                ✗ Rejeter
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-500 px-3 py-1.5">
              {comment.status === 'approved' ? '✅ Approuvé' : '❌ Rejeté'}
            </span>
          )}
          <button
            onClick={() => onAction('delete', comment)}
            className="inline-flex items-center px-3 py-1.5 bg-gray-500 text-white text-xs font-medium rounded hover:bg-gray-600 transition-colors"
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModerationCommentItem;
