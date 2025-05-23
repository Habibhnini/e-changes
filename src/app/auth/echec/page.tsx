"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function ConfirmationFailedPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/background.png')" }}
      />

      {/* Overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-white text-gray-800 p-8 rounded-xl shadow-md text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Échec de confirmation ❌
          </h1>
          <p className="text-gray-700 mb-6">
            Le lien de confirmation est invalide ou expiré. Veuillez vérifier
            votre email ou contacter le support.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-gray-700 hover:bg-gray-800 text-white font-medium px-6 py-2 rounded-lg"
          >
            Retour à l’accueil
          </button>
        </div>
      </div>
    </div>
  );
}
