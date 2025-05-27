// app/transactions/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "../api/apiClient";
import ConfirmCompleteModal from "../components/ConfirmCompleteModal";
import TransactionStatusModal from "./TransactionStatusModal";
import ProgressTimeline from "./ProgressTimeline";

// Define TypeScript interfaces
interface Transaction {
  id: number;
  serviceTitle: string;
  serviceId?: number;
  serviceStatus?: string;
  energyAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  role: "buyer" | "seller";
  type: string;
  otherParty: string;
  buyerValidated: boolean;
  sellerValidated: boolean;
}

type FilterType = "all" | "buyer" | "seller";

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "created":
        return "bg-blue-100 text-blue-800";
      case "negotiation":
        return "bg-purple-100 text-purple-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "delivery":
        return "bg-yellow-100 text-yellow-800";
      case "validation":
        return "bg-indigo-100 text-indigo-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failure":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusName = (status: string): string => {
    switch (status) {
      case "created":
        return "Créé";
      case "negotiation":
        return "Négociation";
      case "success":
        return "Accepté";
      case "delivery":
        return "Livré";
      case "validation":
        return "Validé";
      case "completed":
        return "Terminé";
      case "failure":
        return "Échoué";
      case "cancelled":
        return "Annulé";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
        status
      )}`}
    >
      {getStatusName(status)}
    </span>
  );
};

// Error notification component
const ErrorNotification: React.FC<{
  message: string;
  isVisible: boolean;
  onClose: () => void;
}> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-100 max-w-md">
      <div className="bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Success notification component
const SuccessNotification: React.FC<{
  message: string;
  isVisible: boolean;
  onClose: () => void;
}> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortField, setSortField] = useState<
    "createdAt" | "updatedAt" | "energyAmount" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Depublish confirmation state
  const [showDepublishConfirm, setShowDepublishConfirm] = useState(false);
  const [serviceToDepublish, setServiceToDepublish] = useState<{
    id: number;
    title: string;
  } | null>(null);

  // New state for notifications
  const [errorNotification, setErrorNotification] = useState<{
    message: string;
    isVisible: boolean;
  }>({
    message: "",
    isVisible: false,
  });
  const [successNotification, setSuccessNotification] = useState<{
    message: string;
    isVisible: boolean;
  }>({
    message: "",
    isVisible: false,
  });

  const selectedTransaction =
    filteredTransactions.find((tx) => tx.id === selectedTxId) || null;

  // Helper functions for notifications
  const showError = (message: string) => {
    setErrorNotification({ message, isVisible: true });
  };

  const showSuccess = (message: string) => {
    setSuccessNotification({ message, isVisible: true });
  };

  const openModal = (txId: number) => {
    setSelectedTxId(txId);
    setIsModalOpen(true);
  };

  const handleComplete = async () => {
    if (!selectedTxId) return;

    try {
      await apiClient.post(`/api/transactions/${selectedTxId}/complete`, {});
      await loadTransactions();
      setIsModalOpen(false);
      showSuccess("Transaction complétée avec succès!");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Erreur lors de la complétion de la transaction.";
      showError(errorMessage);
    }
  };

  // Depublish service handler
  const handleDepublishService = (serviceId: number, serviceTitle: string) => {
    setServiceToDepublish({ id: serviceId, title: serviceTitle });
    setShowDepublishConfirm(true);
  };

  const confirmDepublish = async () => {
    if (!serviceToDepublish) return;

    try {
      const response = await fetch(
        `/api/service/${serviceToDepublish.id}/depublish`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la dépublication");
      }

      // Update local transaction state to reflect service status change
      const updatedTransactions = transactions.map((transaction) =>
        transaction.serviceId === serviceToDepublish.id
          ? { ...transaction, serviceStatus: "unpublished" }
          : transaction
      );

      setTransactions(updatedTransactions);
      showSuccess(
        `Service "${serviceToDepublish.title}" dépublié avec succès!`
      );
    } catch (error: any) {
      showError(error.message || "Erreur lors de la dépublication du service");
    } finally {
      setShowDepublishConfirm(false);
      setServiceToDepublish(null);
    }
  };

  useEffect(() => {
    let sorted = [...filteredTransactions];
    if (sortField) {
      sorted.sort((a, b) => {
        const aVal =
          sortField === "energyAmount"
            ? a[sortField]
            : new Date(a[sortField] ?? 0).getTime();
        const bVal =
          sortField === "energyAmount"
            ? b[sortField]
            : new Date(b[sortField] ?? 0).getTime();
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      });
    }
    setFilteredTransactions(sorted);
  }, [sortField, sortOrder]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get("/api/transactions");
      setTransactions(data as Transaction[]);
      setFilteredTransactions(data as Transaction[]);
      setError(null);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Erreur lors du chargement des transactions. Veuillez réessayer plus tard.";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // Apply filter when active filter changes
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(
        transactions.filter((transaction) => transaction.role === activeFilter)
      );
    }
  }, [activeFilter, transactions]);

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Action handlers with better error handling
  const handleUpdateStatus = async (
    transactionId: number,
    newStatus: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    try {
      if (newStatus === "validate") {
        const data: any = await apiClient.post(
          `/api/transactions/${transactionId}/validate`,
          ""
        );

        const updatedTransactions = transactions.map((transaction) =>
          transaction.id === transactionId
            ? {
                ...transaction,
                status: data.status,
                buyerValidated: data.buyerValidated,
                sellerValidated: data.sellerValidated,
              }
            : transaction
        );
        setTransactions(updatedTransactions);
        showSuccess("Transaction validée avec succès!");
        return;
      } else if (newStatus === "complete") {
        await apiClient.post(`/api/transactions/${transactionId}/complete`, {});
        showSuccess("Transaction complétée avec succès!");
      } else if (newStatus === "delivery") {
        await apiClient.put(`/api/transactions/${transactionId}/status`, {
          status: newStatus,
        });
        showSuccess("Transaction marquée comme livrée!");
      } else if (newStatus === "failure") {
        await apiClient.put(`/api/transactions/${transactionId}/status`, {
          status: newStatus,
        });
        showSuccess("Transaction marquée comme échouée.");
      } else {
        await apiClient.put(`/api/transactions/${transactionId}/status`, {
          status: newStatus,
        });
        showSuccess("Statut de la transaction mis à jour!");
      }

      // Update local state
      const updatedTransactions = transactions.map((transaction) =>
        transaction.id === transactionId
          ? { ...transaction, status: newStatus }
          : transaction
      );

      setTransactions(updatedTransactions);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        `Échec de la mise à jour du statut. Veuillez réessayer.`;
      showError(errorMessage);
    }
  };

  const handleCancel = async (transactionId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (
      window.confirm("Êtes-vous sûr de vouloir annuler cette transaction ?")
    ) {
      try {
        await apiClient.put(`/api/transactions/${transactionId}/cancel`, {});

        // Update local state
        const updatedTransactions = transactions.map((transaction) =>
          transaction.id === transactionId
            ? { ...transaction, status: "cancelled" }
            : transaction
        );

        setTransactions(updatedTransactions);
        showSuccess("Transaction annulée avec succès.");
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Échec de l'annulation de la transaction. Veuillez réessayer.";
        showError(errorMessage);
      }
    }
  };

  // Get counts for the filter tabs
  const buyerCount = transactions.filter((t) => t.role === "buyer").length;
  const sellerCount = transactions.filter((t) => t.role === "seller").length;

  // Handle wallet energy used (refresh transactions)
  const handleEnergyUsed = () => {
    loadTransactions();
  };

  const toggleSort = (field: "createdAt" | "updatedAt" | "energyAmount") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <>
      {/* Notifications */}
      <ErrorNotification
        message={errorNotification.message}
        isVisible={errorNotification.isVisible}
        onClose={() => setErrorNotification({ message: "", isVisible: false })}
      />
      <SuccessNotification
        message={successNotification.message}
        isVisible={successNotification.isVisible}
        onClose={() =>
          setSuccessNotification({ message: "", isVisible: false })
        }
      />

      {/* Depublish Confirmation Modal */}
      {showDepublishConfirm && serviceToDepublish && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Confirmer la dépublication
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir dépublier le service{" "}
              <span className="font-semibold">
                "{serviceToDepublish.title}"
              </span>{" "}
              ? Il ne sera plus visible par les autres utilisateurs.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDepublishConfirm(false);
                  setServiceToDepublish(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDepublish}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
              >
                Dépublier
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mes Transactions</h1>
          <p className="text-gray-600 mt-1">
            Consultez et gérez toutes vos transactions d'énergie
          </p>
        </div>

        {/* Filter tabs */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-3 px-6 border-b-2 font-medium text-sm ${
                activeFilter === "all"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveFilter("all")}
            >
              Toutes ({transactions.length})
            </button>
            <button
              className={`py-3 px-6 border-b-2 font-medium text-sm ${
                activeFilter === "buyer"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveFilter("buyer")}
            >
              Acheteur ({buyerCount})
            </button>
            <button
              className={`py-3 px-6 border-b-2 font-medium text-sm ${
                activeFilter === "seller"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveFilter("seller")}
            >
              Vendeur ({sellerCount})
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-600">
              {activeFilter === "all"
                ? "Vous n'avez aucune transaction."
                : activeFilter === "buyer"
                ? "Vous n'avez aucune transaction en tant qu'acheteur."
                : "Vous n'avez aucune transaction en tant que vendeur."}
            </p>
            <Link href="/services">
              <button className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                Parcourir les Services
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Service
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Rôle
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Autre Partie
                    </th>
                    <th
                      onClick={() => toggleSort("energyAmount")}
                      className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Énergie
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Statut
                    </th>
                    <th
                      onClick={() => toggleSort("createdAt")}
                      className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Créé le
                    </th>
                    <th
                      onClick={() => toggleSort("updatedAt")}
                      className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Dernière mise à jour
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.serviceTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${
                            transaction.role === "buyer"
                              ? "text-blue-600"
                              : "text-green-600"
                          }`}
                        >
                          {transaction.role === "buyer"
                            ? "Acheteur"
                            : "Vendeur"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.otherParty}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.energyAmount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={transaction.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {transaction.updatedAt
                            ? formatDate(transaction.updatedAt)
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {/* VALIDER */}
                          {!(transaction.role === "buyer"
                            ? transaction.buyerValidated
                            : transaction.sellerValidated) && (
                            <button
                              onClick={(e) =>
                                handleUpdateStatus(
                                  transaction.id,
                                  "validate",
                                  e
                                )
                              }
                              title="Cliquez pour valider cette transaction"
                              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            >
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Valider
                            </button>
                          )}

                          {/* LIVRER */}
                          {transaction.role === "seller" &&
                            transaction.status === "completed" &&
                            transaction.type === "bien" &&
                            transaction.buyerValidated &&
                            transaction.sellerValidated && (
                              <button
                                onClick={(e) => {
                                  if (
                                    confirm(
                                      "Confirmez-vous la livraison de cette transaction ?"
                                    )
                                  ) {
                                    handleUpdateStatus(
                                      transaction.id,
                                      "delivery",
                                      e
                                    );
                                  }
                                }}
                                title="Marquer comme livré"
                                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              >
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                                </svg>
                                Livrer
                              </button>
                            )}

                          {/* COMPLETER */}
                          {transaction.role === "buyer" &&
                            ["validation"].includes(transaction.status) && (
                              <button
                                onClick={() => openModal(transaction.id)}
                                title="Finaliser la transaction"
                                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
                              >
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Payer la transaction
                              </button>
                            )}

                          {/* DÉPUBLIER SERVICE */}
                          {transaction.role === "seller" &&
                            transaction.serviceId &&
                            transaction.serviceStatus == "published" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDepublishService(
                                    transaction.serviceId!,
                                    transaction.serviceTitle
                                  );
                                }}
                                title="Dépublier ce service"
                                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                              >
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Dépublier
                              </button>
                            )}

                          {/* ANNULER */}
                          {["created", "negotiation"].includes(
                            transaction.status
                          ) && (
                            <button
                              onClick={(e) => handleCancel(transaction.id, e)}
                              title="Annuler la transaction"
                              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
                            >
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Annuler
                            </button>
                          )}

                          {/* DÉTAILS */}
                          <button
                            onClick={() => {
                              setSelectedStatus(transaction.status);
                              setShowStatusModal(true);
                              setSelectedTxId(transaction.id);
                            }}
                            title="Voir les détails de la transaction"
                            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Détails
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TransactionStatusModal
              isOpen={showStatusModal}
              onClose={() => setShowStatusModal(false)}
              transaction={selectedTransaction}
            />
          </div>
        )}
        <ConfirmCompleteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleComplete}
        />
      </div>
    </>
  );
}
