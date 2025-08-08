import React, { useState } from 'react';

const CreateBlockModal = ({ isOpen, onClose, onCreate }) => {
  const [blockerId, setBlockerId] = useState('');
  const [blockedId, setBlockedId] = useState('');
  const [reason, setReason] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!blockerId || !blockedId) return;
    setLoading(true);
    try {
      await onCreate({
        blocker_id: Number(blockerId),
        blocked_id: Number(blockedId),
        reason: reason || null,
        is_active: Boolean(isActive),
      });
      onClose();
      setBlockerId('');
      setBlockedId('');
      setReason('');
      setIsActive(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Créer un blocage</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID du bloqueur</label>
              <input type="number" value={blockerId} onChange={(e) => setBlockerId(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID du bloqué</label>
              <input type="number" value={blockedId} onChange={(e) => setBlockedId(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Raison</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows="3" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optionnel" />
          </div>
          <div className="flex items-center space-x-2">
            <input id="isActive" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
            <label htmlFor="isActive" className="text-sm text-gray-700">Activer immédiatement</label>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">{loading ? 'Création...' : 'Créer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlockModal;
