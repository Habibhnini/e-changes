"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import ConfirmCompleteModal from "../components/ConfirmCompleteModal";

// ─── AUTH HELPERS ──────────────────────────────────────────────────────────────
const getAuthToken = (): string | null => localStorage.getItem("token");
const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

export interface TransactionDetailsProps {
  transactionId: string;
  service: any;
  transaction: any;
  currentUser: any;
  screenSize: { width: number; height: number };
  formatMessageDate: (dateString: string) => string;
  formatTransactionStatus: (status: string) => string;
  onUpdateTransaction: (updated: any) => void;
  successMessage?: string | null;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transactionId,
  service,
  transaction,
  currentUser,
  screenSize,
  formatMessageDate,
  formatTransactionStatus,
  onUpdateTransaction,
}) => {
  const [newAmount, setNewAmount] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const isSeller = currentUser?.id === service.vendor.id;
  const isFinalized = transaction.status === "completed";
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const statusColorMap: Record<string, string> = {
    created: "bg-gray-200 text-gray-800",
    negotiation: "bg-yellow-100 text-yellow-700",
    success: "bg-blue-100 text-blue-700",
    delivery: "bg-purple-100 text-purple-700",
    validation: "bg-green-100 text-green-700",
    completed: "bg-green-200 text-green-800",
    failure: "bg-red-100 text-red-700",
    cancelled: "bg-red-200 text-red-800",
  };

  const statusColor =
    statusColorMap[transaction.status] || "bg-gray-100 text-gray-700";

  const hasValidated =
    (isSeller && transaction.sellerValidated) ||
    (!isSeller && transaction.buyerValidated);
  const handleCompleteTransaction = async () => {
    try {
      const res = await fetch(`/api/transactions/${transactionId}/complete`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Erreur lors de la complétion");

      const data = await res.json();
      onUpdateTransaction({
        ...transaction,
        status: data.status,
      });
      setIsCompleteModalOpen(false);
    } catch (err) {
      setError("Impossible de finaliser la transaction");
    }
  };

  useEffect(() => {
    if (transaction?.energyAmount != null) {
      setNewAmount(transaction.energyAmount.toString());
    }
  }, [transaction]);

  const handleValidate = async () => {
    try {
      const res = await fetch(`/api/transactions/${transactionId}/validate`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Erreur de validation");

      const data = await res.json();
      onUpdateTransaction({
        ...transaction,
        status: data.status,
        sellerValidated: data.sellerValidated,
        buyerValidated: data.buyerValidated,
      });
    } catch (err) {
      setError("Impossible de valider la transaction");
    }
  };
  const handleCancel = async () => {
    try {
      const res = await fetch(`/api/transactions/${transactionId}/cancel`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Erreur lors de l'annulation");

      const data = await res.json();
      onUpdateTransaction({
        ...transaction,
        status: data.status,
      });
    } catch (err) {
      setError("Impossible d'annuler la transaction");
    }
  };

  const handleChangeAmount = async () => {
    const amt = +newAmount;
    if (!amt || isNaN(amt) || amt <= 0) {
      setError("Veuillez saisir un montant valide");
      return;
    }
    try {
      const res = await fetch(
        `/api/transactions/${transactionId}/change-amount`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ energyAmount: amt }),
        }
      );
      if (!res.ok) throw new Error(res.statusText);
      // Read updated transaction (includes new status)
      const { transaction: updated } = await res.json();
      // Update parent state with new amount and status
      onUpdateTransaction(updated);
      setError(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      // console.error(err);
      // setError("Impossible de mettre à jour le montant");
    }
  };
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  if (!transaction || !service) {
    return (
      <div className="p-4 text-gray-500 text-center">
        Aucun détail disponible
      </div>
    );
  }

  const { width } = screenSize;
  const isNarrowDesktop = width >= 1024 && width < 1290;

  return (
    <div className="p-4">
      <h2 className="font-medium text-lg mb-3">À propos de cet échange</h2>

      {/* Transaction Status */}
      <div className="mb-4 p-3 rounded-lg border border-gray-200">
        <div className="font-medium mb-2">Statut de la transaction</div>
        <div
          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}
        >
          {formatTransactionStatus(transaction.status)}
        </div>

        <div className="text-sm mt-2">
          <span className="text-gray-600">Ancien montant:</span> {service.price}{" "}
          <Image
            src="/coin.png"
            alt="Energy"
            width={20}
            height={20}
            className="inline-block ml-1 h-4 w-4"
          />
        </div>
        <div className="text-sm mt-1">
          <span className="text-gray-600">Montant actuel:</span>{" "}
          {transaction.energyAmount}{" "}
          <Image
            src="/coin.png"
            alt="Energy"
            width={20}
            height={20}
            className="inline-block ml-1 h-4 w-4"
          />
        </div>
      </div>

      {/* Amount Edit Section */}
      {isSeller && (
        <div
          className={`mb-4 p-3 rounded-lg border border-gray-200 ${
            ["cancelled", "validation", "completed"].includes(
              transaction.status
            )
              ? "opacity-50 pointer-events-none select-none"
              : ""
          }`}
        >
          <div className="font-medium mb-2">Modifier le montant</div>
          {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}

          <div className="flex space-x-2">
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="w-1/2 p-2 border border-gray-300 rounded-lg text-sm"
              disabled={["cancelled", "validation", "completed"].includes(
                transaction.status
              )}
            />
            <button
              onClick={handleChangeAmount}
              disabled={["cancelled", "validation", "completed"].includes(
                transaction.status
              )}
              className={`w-1/2 px-3 py-2 rounded-lg text-sm ${
                ["cancelled", "validation", "completed"].includes(
                  transaction.status
                )
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#38AC8E] text-white hover:bg-teal-600"
              }`}
            >
              Changer
            </button>
          </div>

          {["cancelled", "validation", "completed"].includes(
            transaction.status
          ) && (
            <div className="text-xs text-gray-500 mt-2">
              Cette transaction est terminée ou annulée. Le montant ne peut plus
              être modifié.
            </div>
          )}
        </div>
      )}

      {/* Service Information */}
      <div className="mb-4">
        <h3 className="font-medium">{service.title}</h3>
        <p className="text-sm text-gray-400 mt-1">{service.fullDescription}</p>
      </div>

      {/* Additional Details */}
      <div className="space-y-4 mt-6">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Localisation</span>
          <span className="text-sm font-medium">
            {service.details?.location || "Non spécifié"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Durée</span>
          <span className="text-sm font-medium">
            {service.details?.duration || "Non spécifié"}
          </span>
        </div>
      </div>

      {/* Actions */}
      {/* Actions */}
      <div className="mt-6 border-t pt-4 border-gray-300">
        <div
          className={`flex ${isNarrowDesktop ? "flex-col" : "flex-row"} gap-2 ${
            isNarrowDesktop ? "" : "justify-center"
          }`}
        >
          <button
            disabled={isFinalized}
            className={`px-4 py-2 border text-sm rounded-lg ${
              isFinalized
                ? "border-red-500 text-red-500 hover:bg-red-50 cursor-pointer"
                : "border-red-500 text-red-500 hover:bg-red-50 cursor-pointer"
            }`}
          >
            Signaler
          </button>

          <button
            disabled={isFinalized}
            onClick={handleCancel}
            className={`px-4 py-2 text-sm rounded-lg ${
              isFinalized
                ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
            }`}
          >
            Annuler
          </button>

          {/* VALIDER BUTTON */}
          {!hasValidated &&
            ["created", "negotiation", "success"].includes(
              transaction.status
            ) && (
              <button
                disabled={isFinalized}
                onClick={handleValidate}
                className={`px-4 py-2 text-sm rounded-lg ${
                  isFinalized
                    ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                    : "bg-[#38AC8E] text-white hover:bg-teal-600 cursor-pointer"
                }`}
              >
                Valider
              </button>
            )}

          {/* COMPLETER (PAYER) BUTTON */}

          {transaction.status === "validation" &&
            currentUser?.id === transaction.buyer?.id && (
              <button
                onClick={() => setIsCompleteModalOpen(true)}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Payer la transaction
              </button>
            )}
        </div>
      </div>
      <ConfirmCompleteModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onConfirm={handleCompleteTransaction}
      />
    </div>
  );
};

export default TransactionDetails;
