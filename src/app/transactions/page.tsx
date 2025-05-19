// app/transactions/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "../api/apiClient";
import WalletWidget from "../components/WalletWidget";
import ConfirmCompleteModal from "../components/ConfirmCompleteModal";
// Define TypeScript interfaces
interface Transaction {
  id: number;
  serviceTitle: string;
  energyAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  role: "buyer" | "seller";
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
    } catch (err) {
      alert("Erreur lors de la complétion.");
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
    } catch (err) {
      setError(
        "Erreur lors du chargement des transactions. Veuillez réessayer plus tard."
      );
      console.error("Error fetching transactions:", err);
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

  // Action handlers
  const handleUpdateStatus = async (
    transactionId: number,
    newStatus: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    try {
      if (newStatus === "validate") {
        var data: any;
        data = await apiClient.post(
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

        return;
      } else if (newStatus === "complete") {
        await apiClient.post(`/api/transactions/${transactionId}/complete`);
      } else {
        await apiClient.put(`/api/transactions/${transactionId}/status`, {
          status: newStatus,
        });
      }

      // Update local
      const updatedTransactions = transactions.map((transaction) =>
        transaction.id === transactionId
          ? { ...transaction, status: newStatus }
          : transaction
      );

      setTransactions(updatedTransactions);
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Échec de la mise à jour du statut. Veuillez réessayer.");
    }
  };

  const handleCancel = async (transactionId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (
      window.confirm("Êtes-vous sûr de vouloir annuler cette transaction ?")
    ) {
      try {
        await apiClient.put(`/api/transactions/${transactionId}/cancel`);

        // Update local state
        const updatedTransactions = transactions.map((transaction) =>
          transaction.id === transactionId
            ? { ...transaction, status: "cancelled" }
            : transaction
        );

        setTransactions(updatedTransactions);
      } catch (error) {
        console.error("Error cancelling transaction:", error);
        alert("Échec de l'annulation de la transaction. Veuillez réessayer.");
      }
    }
  };

  // Get counts for the filter tabs
  const buyerCount = transactions.filter((t) => t.role === "buyer").length;
  const sellerCount = transactions.filter((t) => t.role === "seller").length;

  // Handle wallet energy used (refresh transactions)
  const handleEnergyUsed = () => {
    // Reload transactions after energy is used
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
                        {transaction.role === "buyer" ? "Acheteur" : "Vendeur"}
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {/* VALIDER */}
                      {!(transaction.role === "buyer"
                        ? transaction.buyerValidated
                        : transaction.sellerValidated) && (
                        <button
                          onClick={(e) =>
                            handleUpdateStatus(transaction.id, "validate", e)
                          }
                          className="inline-block px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Valider
                        </button>
                      )}

                      {/* LIVRER (only seller) */}
                      {transaction.role === "seller" &&
                        transaction.status === "validation" && (
                          <button
                            onClick={(e) =>
                              handleUpdateStatus(transaction.id, "delivery", e)
                            }
                            className="inline-block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Livrer
                          </button>
                        )}

                      {/* COMPLETER (only buyer) */}
                      {transaction.role === "buyer" &&
                        transaction.status === "validation" && (
                          <button
                            onClick={() => openModal(transaction.id)}
                            className="inline-block px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                          >
                            Compléter
                          </button>
                        )}

                      {/* ÉCHOUER (both roles, certain statuses) */}
                      {["success", "delivery"].includes(transaction.status) && (
                        <button
                          onClick={(e) =>
                            handleUpdateStatus(transaction.id, "failure", e)
                          }
                          className="inline-block px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Échouer
                        </button>
                      )}

                      {/* ANNULER (both roles, early statuses) */}
                      {["created", "negotiation"].includes(
                        transaction.status
                      ) && (
                        <button
                          onClick={(e) => handleCancel(transaction.id, e)}
                          className="inline-block px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                        >
                          Annuler
                        </button>
                      )}

                      {/* No Actions */}
                      {![
                        "created",
                        "negotiation",
                        "success",
                        "delivery",
                        "validation",
                      ].includes(transaction.status) &&
                        transaction.buyerValidated &&
                        transaction.sellerValidated && (
                          <span className="text-gray-400">Aucune action</span>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ConfirmCompleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleComplete}
      />
    </div>
  );
}
