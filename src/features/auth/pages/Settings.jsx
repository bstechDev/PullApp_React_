import React from 'react';

const Settings = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Paramètres</h1>
      <div className="bg-white shadow rounded-lg p-4">
        <p className="text-gray-800">Options de configuration de l'application...</p>
        <div className="mt-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">Sauvegarder les modifications</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;