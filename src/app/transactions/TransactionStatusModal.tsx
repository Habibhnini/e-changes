import React from "react";
import ProgressTimeline from "./ProgressTimeline";
interface Transaction {
  id: number;
  serviceTitle: string;
  energyAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  role: "buyer" | "seller" | "payer" | "payee";
  type: string;
  otherParty: string;
  buyerValidated: boolean;
  sellerValidated: boolean;
}

interface TransactionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

const STATUS_LABELS: Record<string, string> = {
  created: "Créé",
  negotiation: "Négociation",
  success: "Accepté",
  validation: "Validé",
  delivery: "Livré",
  completed: "Terminé",
  failure: "Échoué",
  cancelled: "Annulé",
};

const STATUS_DESCRIPTIONS: Record<string, string> = {
  created: "Transaction initialisée par l'acheteur.",
  negotiation: "Les deux parties négocient l'énergie.",
  success: "Prix négocié accepté par le vendeur.",
  validation: "Les deux parties ont validé.",
  delivery: "Le vendeur a livré le bien/service.",
  completed: "L'acheteur a complété la transaction.",
  failure: "La transaction a échoué.",
  cancelled: "La transaction a été annulée.",
};

const TransactionStatusModal: React.FC<TransactionStatusModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!isOpen || !transaction) return null;

  const {
    serviceTitle,
    energyAmount,
    status,
    createdAt,
    updatedAt,
    role,
    type,
    otherParty,
    buyerValidated,
    sellerValidated,
  } = transaction;

  const isBien = type === "bien";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/10 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <ProgressTimeline currentStatus={status} hasDelivery={isBien} />

        <h2 className="text-lg font-semibold mt-6">
          Statut actuel : {STATUS_LABELS[status]}
        </h2>
        <p className="text-sm text-gray-700 mb-4">
          {STATUS_DESCRIPTIONS[status]}
        </p>

        {/* Extra transaction info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-800 mb-6">
          <div>
            <strong>Service :</strong> {serviceTitle}
          </div>
          <div>
            <strong>Énergie :</strong> {energyAmount}
          </div>
          <div>
            <strong>Rôle :</strong> {role === "buyer" ? "Acheteur" : "Vendeur"}
          </div>
          <div>
            <strong>Autre partie :</strong> {otherParty}
          </div>
          <div>
            <strong>Créé le :</strong>{" "}
            {new Date(createdAt).toLocaleString("fr-FR")}
          </div>
          <div>
            <strong>Mis à jour :</strong>{" "}
            {updatedAt ? new Date(updatedAt).toLocaleString("fr-FR") : "-"}
          </div>
          <div>
            <strong>Validé par l'acheteur :</strong>{" "}
            {buyerValidated ? "Oui" : "Non"}
          </div>
          <div>
            <strong>Validé par le vendeur :</strong>{" "}
            {sellerValidated ? "Oui" : "Non"}
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatusModal;
