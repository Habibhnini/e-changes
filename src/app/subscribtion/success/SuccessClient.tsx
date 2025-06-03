"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IoCheckmarkCircle, IoArrowBack } from "react-icons/io5";
import { useAuth } from "@/app/contexts/AuthContext";

export default function Success() {
  const { refreshUserProfile } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <IoCheckmarkCircle className="h-16 w-16 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Abonnement réussi !
          </h1>

          <p className="text-center text-gray-600 mb-6">
            Votre abonnement annuel a été activé avec succès. Merci pour votre
            confiance !
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-green-700 font-medium text-center">
              ✅ Félicitations ! Votre compte est maintenant actif
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">
                  Détails de votre abonnement
                </h3>
                <div className="mt-2 text-sm text-green-700 space-y-1">
                  <p>
                    Abonnement Annuel E-nergies (
                    <span className="inline-flex items-center justify-center  p-1 mx-1">
                      <img
                        src="/coin.png"
                        alt="Energy coin"
                        className="w-4 h-3 object-cover"
                      />
                    </span>
                    )
                  </p>
                  <p>
                    Accès complet à la plateforme :{" "}
                    <span className="font-semibold">✓ Activé</span>
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

          {/* What's Next Section */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Prochaines étapes
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Explorez les services disponibles</p>
              <p>• Créez vos propres services</p>
              <p>• Commencez à échanger avec la communauté</p>
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
              href="/explorer"
              className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Explorer les services
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
