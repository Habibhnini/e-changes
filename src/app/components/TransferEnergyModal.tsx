"use client";

import React, { useState } from "react";
import { transferEnergy } from "../api/walletApi";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmStep, setConfirmStep] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseInt(amount, 10);
    if (!recipientEmail || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Email ou montant invalide");
      return;
    }

    setConfirmStep(true);
  };

  const executeTransfer = async () => {
    setLoading(true);
    setError(null);

    try {
      const parsedAmount = parseInt(amount, 10);
      await transferEnergy(recipientEmail, parsedAmount);
      if (onSuccess) onSuccess();
      setRecipientEmail("");
      setAmount("");
      setConfirmStep(false);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors du transfert");
    } finally {
      setLoading(false);
    }
  };

  const cancelConfirm = () => {
    setConfirmStep(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/10 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6">
        {confirmStep ? (
          <>
            <h2 className="text-lg font-bold mb-4 text-center text-gray-800">
              Confirmer le transfert
            </h2>
            <p className="text-center text-sm text-gray-700 mb-6">
              Êtes-vous sûr de vouloir transférer{" "}
              <strong>{amount} énergie</strong> à{" "}
              <strong>{recipientEmail}</strong> ?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelConfirm}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Retour
              </button>
              <button
                onClick={executeTransfer}
                disabled={loading}
                className={`px-4 py-2 text-white rounded ${
                  loading
                    ? "bg-[#38AC8E]/60"
                    : "bg-[#38AC8E] hover:bg-[#2e8d76]"
                }`}
              >
                {loading ? "Transfert..." : "Confirmer"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-4">Transférer de l'énergie</h2>
            <form onSubmit={handleSubmit}>
              {error && <p className="text-red-600 mb-2 text-sm">{error}</p>}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email du destinataire
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#38AC8E] text-white rounded hover:bg-[#2e8d76]"
                >
                  Suivant
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default TransferModal;
