"use client";

import React from "react";

interface ConfirmCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmCompleteModal: React.FC<ConfirmCompleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/10 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Confirmer la complétion
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Êtes-vous sûr de vouloir compléter cette transaction ?
          <br />
          Cela transférera l'énergie au vendeur.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm"
          >
            Compléter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCompleteModal;
