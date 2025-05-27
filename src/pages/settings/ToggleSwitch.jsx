import React from 'react';

const ToggleSwitch = ({ enabled, onChange, name }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(name)}
      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );
};

export default ToggleSwitch;