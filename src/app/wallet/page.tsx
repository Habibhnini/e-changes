"use client";

import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import WalletWidget from "../components/WalletWidget";
import TransferModal from "../components/TransferEnergyModal";
import { Transaction } from "../api/walletApi";

// Define TypeScript interfaces
interface WalletTransaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

type FilterType = "all" | "deposit" | "withdrawal" | "transfer" | "campaign";

// Transaction type badge component
const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const getTypeColor = (type: string): string => {
    switch (type) {
      case "deposit":
        return "bg-green-100 text-green-800";
      case "withdrawal":
        return "bg-red-100 text-red-800";
      case "transfer":
        return "bg-blue-100 text-blue-800";
      case "campaign":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeName = (type: string): string => {
    switch (type) {
      case "deposit":
        return "Dépôt";
      case "withdrawal":
        return "Retrait";
      case "transfer":
        return "Transfert";
      case "campaign":
        return "Campagne";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
        type
      )}`}
    >
      {getTypeName(type)}
    </span>
  );
};

export default function WalletPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);

  const loadTransactions = async (
    page = 1,
    limit = 10,
    type: FilterType = activeFilter
  ) => {
    try {
      setIsLoading(true);

      let endpoint = `/api/wallet/transactions`;

      // Add type filter if not "all"
      if (type !== "all") {
        endpoint = `/api/wallet/transactions/${type}`;
      }

      const response = await apiClient.get<{
        data: any;
        transactions: Transaction[];
        pagination: { currentPage: number; totalPages: number };
      }>(`${endpoint}?page=${page}&limit=${limit}`);

      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);

      setError(null);
    } catch (err) {
      setError(
        "Erreur lors du chargement des transactions. Veuillez réessayer plus tard."
      );
      console.error("Error fetching wallet transactions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions(pagination.page, pagination.limit, activeFilter);
  }, [activeFilter]);

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

  // Handle wallet energy used (refresh transactions)
  const handleWalletUpdate = () => {
    loadTransactions(1, pagination.limit, activeFilter);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      loadTransactions(newPage, pagination.limit, activeFilter);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    // Re-sort the transactions locally
    setTransactions([...transactions].reverse());
  };

  const setFilter = (filter: FilterType) => {
    setActiveFilter(filter);
    setShowFilterDropdown(false);
  };

  // Filter options for dropdown
  const filterOptions = [
    { value: "all", label: "Toutes" },
    { value: "deposit", label: "Dépôts" },
    { value: "withdrawal", label: "Retraits" },
    { value: "transfer", label: "Transferts" },
    { value: "campaign", label: "Campagnes" },
  ];

  // Get currently selected filter label
  const getCurrentFilterLabel = () => {
    const option = filterOptions.find((opt) => opt.value === activeFilter);
    return option ? option.label : "Toutes";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon Portefeuil</h1>
        <p className="text-gray-600 mt-1">
          Gérez votre portefeuil et consultez l'historique de vos transactions
        </p>
      </div>

      <WalletWidget onEnergyUsed={handleWalletUpdate} />

      <div className="mt-10 mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Historique des Transactions
        </h2>
      </div>

      {/* Mobile Dropdown Filter */}
      <div className="md:hidden mb-6 relative">
        <button
          className="w-full py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setShowFilterDropdown(!showFilterDropdown)}
        >
          <span>{getCurrentFilterLabel()}</span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              showFilterDropdown ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showFilterDropdown && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                className={`w-full text-left px-4 py-2 text-sm ${
                  activeFilter === option.value
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setFilter(option.value as FilterType)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Filter tabs */}
      <div className="hidden md:block mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-3 px-6 border-b-2 font-medium text-sm ${
              activeFilter === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveFilter("all")}
          >
            Toutes
          </button>
          <button
            className={`py-3 px-6 border-b-2 font-medium text-sm ${
              activeFilter === "deposit"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveFilter("deposit")}
          >
            Dépôts
          </button>
          <button
            className={`py-3 px-6 border-b-2 font-medium text-sm ${
              activeFilter === "withdrawal"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveFilter("withdrawal")}
          >
            Retraits
          </button>
          <button
            className={`py-3 px-6 border-b-2 font-medium text-sm ${
              activeFilter === "transfer"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveFilter("transfer")}
          >
            Transferts
          </button>
          <button
            className={`py-3 px-6 border-b-2 font-medium text-sm ${
              activeFilter === "campaign"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveFilter("campaign")}
          >
            Campagnes
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
      ) : transactions.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600">
            {activeFilter === "all"
              ? "Vous n'avez aucune transaction dans votre portefeuil."
              : `Vous n'avez aucune transaction de type "${getCurrentFilterLabel()}".`}
          </p>
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
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Montant
                  </th>
                  <th
                    scope="col"
                    onClick={toggleSortOrder}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer flex items-center"
                  >
                    Date
                    <span className="ml-1">
                      {sortOrder === "desc" ? "▼" : "▲"}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TypeBadge type={transaction.type} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {transaction.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-medium ${
                          transaction.type === "deposit" ||
                          transaction.type === "transfer"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "deposit" ||
                        transaction.type === "transfer"
                          ? `+${transaction.amount}`
                          : `-${transaction.amount}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between items-center">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.page === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Précédent
                </button>
                <div className="text-sm text-gray-700">
                  Page <span className="font-medium">{pagination.page}</span>{" "}
                  sur <span className="font-medium">{pagination.pages}</span>
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.page === pagination.pages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
