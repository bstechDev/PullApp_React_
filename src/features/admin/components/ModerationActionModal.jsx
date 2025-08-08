import React, { useState } from 'react';

const ModerationActionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  action, 
  contentType, 
  contentId, 
  contentPreview 
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (action === 'reject' && !reason.trim()) {
      alert('Veuillez fournir une raison pour le rejet');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(contentId, action, reason);
      onClose();
      setReason('');
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionConfig = () => {
    switch (action) {
      case 'approve':
        return {
          title: 'Approuver le contenu',
          message: `Êtes-vous sûr de vouloir approuver ce ${contentType} ?`,
          buttonText: 'Approuver',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          showReason: false,
          description: 'Le contenu sera visible par tous les utilisateurs.'
        };
      case 'reject':
        return {
          title: 'Rejeter le contenu',
          message: `Êtes-vous sûr de vouloir rejeter ce ${contentType} ?`,
          buttonText: 'Rejeter',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          showReason: true,
          reasonPlaceholder: 'Raison du rejet (obligatoire)',
          description: 'Le contenu sera masqué et l\'utilisateur sera notifié de la raison.'
        };
      case 'delete':
        return {
          title: 'Supprimer le contenu',
          message: `Êtes-vous sûr de vouloir supprimer définitivement ce ${contentType} ? Cette action est irréversible.`,
          buttonText: 'Supprimer',
          buttonColor: 'bg-gray-600 hover:bg-gray-700',
          showReason: false,
          description: 'Le contenu sera définitivement supprimé et ne pourra pas être restauré.'
        };
      default:
        return {
          title: 'Action de modération',
          message: 'Confirmer l\'action ?',
          buttonText: 'Confirmer',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          showReason: false
        };
    }
  };

  const config = getActionConfig();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {config.title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {config.message}
              </p>
              {config.description && (
                <p className="text-xs text-gray-500 mb-3">
                  {config.description}
                </p>
              )}
              
              {contentPreview && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>Aperçu du contenu:</strong>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {contentPreview}
                  </p>
                </div>
              )}

              {config.showReason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Raison du rejet *
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={config.reasonPlaceholder}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${config.buttonColor}`}
              >
                {loading ? 'Traitement...' : config.buttonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModerationActionModal;
