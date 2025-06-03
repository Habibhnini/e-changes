"use client";

import React, { useState } from "react";

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
  const [isCompleting, setIsCompleting] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/10 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Confirmer l'e-change
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Êtes-vous sûr d’avoir reçu le bien ou le service attendu ?
          <br />
          Si oui, cela transférera l’énergie à l’offrant.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm"
          >
            Annuler
          </button>
          <button
            onClick={async () => {
              if (isCompleting) return; // Prevent double submission
              setIsCompleting(true);
              await onConfirm(); // Make sure `onConfirm` is async
              setIsCompleting(false);
            }}
            disabled={isCompleting}
            className={`px-4 py-2 rounded-md text-white text-sm ${
              isCompleting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isCompleting ? "Traitement en cours..." : "Compléter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCompleteModal;
