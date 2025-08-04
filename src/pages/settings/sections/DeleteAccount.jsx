import React, { useState } from 'react';

const DeleteAccount = () => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const handleDeleteAccount = () => {
    if (confirmDelete) {
      console.log('Compte supprimé');
      // Appel API pour supprimer le compte
    } else {
      alert('Veuillez cocher la case de confirmation avant de supprimer votre compte.');
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Supprimer le compte</h2>
      <p className="text-gray-600 mb-6">
        Il travaille au noir difficile l'absorbé, les sportifs. Intéressé à toute la difficulté Devonshire aide gay joie. Non affecté à vous de compliment altération à.
      </p>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Avant de partir...</h3>
        <ul className="list-disc pl-5 text-gray-600 space-y-2">
          <li>Faites une sauvegarde de vos données <a href="#" className="text-blue-600 hover:underline">ici</a></li>
          <li>Si vous supprimez votre compte, vous perdrez toutes vos données.</li>
        </ul>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <input
            id="deleteConfirm"
            name="deleteConfirm"
            type="checkbox"
            checked={confirmDelete}
            onChange={() => setConfirmDelete(!confirmDelete)}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="deleteConfirm" className="ml-2 text-sm text-gray-700">
            Oui, je souhaite supprimer mon compte
          </label>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          type="button"
          className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Conserver mon compte
        </button>
        
        <button
          type="button"
          onClick={handleDeleteAccount}
          className={`px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
            !confirmDelete && 'opacity-50 cursor-not-allowed'
          }`}
          disabled={!confirmDelete}
        >
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
};

export default DeleteAccount;