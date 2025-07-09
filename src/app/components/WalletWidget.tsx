// components/WalletWidget.tsx
"use client";

import { useState, useEffect } from "react";
import { getWalletInfo, useEnergy } from "../api/walletApi";
import type { Wallet } from "../api/walletApi";
import TransferModal from "./TransferEnergyModal"; // adjust the path if needed
import Image from "next/image";

interface WalletWidgetProps {
  onEnergyUsed?: () => void; // Optional callback for when energy is used
}

export default function WalletWidget({ onEnergyUsed }: WalletWidgetProps) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Use energy modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [energyAmount, setEnergyAmount] = useState("");
  const [energyDescription, setEnergyDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Load wallet data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const walletData = await getWalletInfo();
      setWallet(walletData);
    } catch (err) {
      // console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Échec du chargement du portefeuille"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Use energy handler
  const handleUseEnergy = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      const amount = parseInt(energyAmount, 10);

      if (isNaN(amount) || amount <= 0) {
        setError("Veuillez entrer un montant valide");
        return;
      }

      if (!energyDescription.trim()) {
        setError("Veuillez entrer une description");
        return;
      }

      const result = await useEnergy(amount, energyDescription);

      setWallet(result.wallet);
      setSuccessMessage(`${amount} E-nergie utilisée avec succès`);
      closeModal();

      // Call the callback if provided
      if (onEnergyUsed) {
        onEnergyUsed();
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      //   console.error(err);
      setError(err.message || "Échec de l'utilisation de l'E-nergie");
    } finally {
      setSubmitting(false);
    }
  };

  // Modal helpers
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEnergyAmount("");
    setEnergyDescription("");
    setError(null);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Impossible de charger le portefeuille: {error}
            </p>
            <button
              onClick={loadData}
              className="mt-2 text-sm text-red-700 underline"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Error and success messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Balance Card */}
      {wallet && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center mb-1">
                  <svg
                    className="h-5 w-5 text-blue-500 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z" />
                  </svg>
                  <p className="text-sm text-gray-500">Mon portefeuille</p>
                </div>
                <div className="flex items-baseline">
                  <h2 className="text-3xl font-bold text-gray-900 mr-2">
                    {wallet.balance}
                  </h2>
                  <Image
                    src="/coin.png"
                    alt="Energy coin"
                    width={50}
                    height={40}
                    className="object-cover w-8 h-6"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Créé le {formatDate(wallet.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Use Energy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleUseEnergy}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Utiliser Énergie
                  </h3>

                  <div className="mb-4">
                    <label
                      htmlFor="energy-amount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Montant
                    </label>
                    <input
                      type="number"
                      id="energy-amount"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Entrer le montant"
                      value={energyAmount}
                      onChange={(e) => setEnergyAmount(e.target.value)}
                      min="1"
                      max={wallet?.balance}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="energy-description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="energy-description"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Pour quoi utilisez-vous cette énergie?"
                      value={energyDescription}
                      onChange={(e) => setEnergyDescription(e.target.value)}
                      rows={3}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full inline-flex cursor-pointer justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                      submitting
                        ? "bg-blue-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm`}
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Traitement...
                      </>
                    ) : (
                      "Confirmer"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={() => {
          setIsTransferModalOpen(false); // CLOSE modal instantly
          setShowConfirmationModal(true); // THEN show confirmation
          loadData(); // reload wallet info
        }}
      />
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/10 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold text-green-600 mb-2">
              ✅ Transfert Réussi
            </h2>
            <p className="text-gray-700 mb-4">
              Énergie transférée avec succès !
            </p>
            <button
              onClick={() => setShowConfirmationModal(false)}
              className="px-4 py-2 bg-[#38AC8E] text-white rounded hover:bg-[#2e8d76]"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
