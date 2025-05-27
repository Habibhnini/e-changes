"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IoCheckmarkCircle, IoArrowBack } from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import { useAuth } from "@/app/contexts/AuthContext";

export default function Success() {
  const { token, refreshUserProfile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [energyAdded, setEnergyAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validPayment, setValidPayment] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Wait for auth to be ready
    if (authLoading) return; // Don't proceed if auth is still loading

    // Check if this is a valid payment success
    const sessionId = searchParams.get("session_id");
    const paymentToken = searchParams.get("payment_token");

    console.log("Auth state:", { token: !!token, sessionId, paymentToken });

    if (sessionId && paymentToken) {
      processPaymentSuccess(sessionId, paymentToken);
    } else {
      // No valid payment parameters - just show success without adding energy
      setLoading(false);
      setValidPayment(false);
    }
  }, [token]); // Add token as dependency

  const processPaymentSuccess = async (
    sessionId: string,
    paymentToken: string
  ) => {
    if (!token) {
      console.error("No token available for API call");
      setError("Authentication required - please log in");
      setLoading(false);
      return;
    }

    console.log("Making API call with token:", token.substring(0, 20) + "...");

    try {
      setLoading(true);

      // Verify payment and add energy in one secure call
      const response = await fetch("/api/stripe/process-success", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          payment_token: paymentToken,
        }),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error:", errorData);
        throw new Error(errorData.error || "Failed to process payment success");
      }

      const data = await response.json();
      console.log("API success:", data);

      if (data.success) {
        setEnergyAdded(true);
        setValidPayment(true);
        await refreshUserProfile();

        // Clean URL to prevent reuse
        window.history.replaceState({}, "", "/subscribtion/success");
      } else {
        throw new Error(data.message || "Invalid payment verification");
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            {loading ? (
              <FaSpinner className="h-16 w-16 text-blue-500 animate-spin" />
            ) : (
              <IoCheckmarkCircle className="h-16 w-16 text-green-500" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            {loading ? "Vérification du paiement..." : "Abonnement réussi !"}
          </h1>

          <p className="text-center text-gray-600 mb-6">
            {loading
              ? "Nous vérifions votre paiement et activons votre abonnement..."
              : "Votre abonnement annuel a été activé avec succès. Merci pour votre confiance !"}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!validPayment && !loading && !error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-700">
                Cette page est destinée aux paiements réussis. Veuillez
                effectuer un nouveau paiement si nécessaire.
              </p>
            </div>
          )}

          {energyAdded && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-green-700 font-medium text-center">
                ✅ 99 e-changes ajoutés à votre compte !
              </p>
            </div>
          )}

          <div className="bg-green-50 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">
                  Détails de votre abonnement
                </h3>
                <div className="mt-2 text-sm text-green-700 space-y-1">
                  <p>Abonnement Annuel Energies</p>
                  <p>
                    Vous recevez :{" "}
                    <span className="font-semibold">99 e-changes</span>
                    {energyAdded && (
                      <span className="text-green-600 ml-1">✓</span>
                    )}
                  </p>
                  <p>
                    Période : <span className="font-semibold">1 an</span>
                  </p>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 flex items-start">
                <p className="text-xl font-bold text-green-800">20€</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Link
              href="/profile"
              className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Voir mon profil
            </Link>

            <Link
              href="/wallet"
              className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Mon portefeuille
            </Link>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Link
            href="/"
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <IoArrowBack className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
