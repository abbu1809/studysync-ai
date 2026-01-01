import React from 'react';
import { FiTrash2, FiX } from 'react-icons/fi';

function DeleteModal({ isOpen, onClose, onConfirm, title, message, itemName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
          <FiTrash2 className="text-2xl text-red-600 dark:text-red-400" />
        </div>
        
        <h2 className="text-xl font-bold text-center mb-2 text-gray-900 dark:text-white">
          {title || 'Delete Item?'}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {message || `Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
