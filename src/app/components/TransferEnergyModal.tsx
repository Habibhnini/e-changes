// TransferModal.tsx
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
  const [success, setSuccess] = useState<string | null>(null);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const parsedAmount = parseInt(amount, 10);
    if (!recipientEmail || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Email ou montant invalide");
      setLoading(false);
      return;
    }

    try {
      const result = await transferEnergy(recipientEmail, parsedAmount);
      setSuccess(result.message);
      setRecipientEmail("");
      setAmount("");
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Erreur lors du transfert");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/10 px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto p-6">
        <h2 className="text-lg font-bold mb-4">Transférer de l'énergie</h2>
        <form onSubmit={handleTransfer}>
          {error && <p className="text-red-600 mb-2 text-sm">{error}</p>}
          {success && <p className="text-green-600 mb-2 text-sm">{success}</p>}

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
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-white rounded cursor-pointer ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Transfert..." : "Transférer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferModal;
