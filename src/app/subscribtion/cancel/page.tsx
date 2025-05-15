"use client";

import { useEffect } from "react";
import Link from "next/link";
import { IoArrowBack, IoCloseCircle } from "react-icons/io5";

export default function Cancel() {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <IoCloseCircle className="h-16 w-16 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Paiement annulé
          </h1>

          <p className="text-center text-gray-600 mb-8">
            Votre demande d'abonnement n'a pas été complétée. Aucun prélèvement
            n'a été effectué sur votre compte.
          </p>

          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-700">
                Si vous avez rencontré des difficultés lors du processus de
                paiement ou si vous avez des questions, n'hésitez pas à
                contacter notre service client.
              </p>
            </div>

            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <Link
                href="/profile"
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Retour au profil
              </Link>

              <Link
                href="/subscription"
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Réessayer
              </Link>
            </div>
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
