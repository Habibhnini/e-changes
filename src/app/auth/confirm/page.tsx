"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function ConfirmedPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/background.png')" }} // put the image in public/images/
      />

      {/* Overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-white text-gray-800 p-8 rounded-xl shadow-md text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-teal-600 mb-4">
            Compte confirmé 🎉
          </h1>
          <p className="text-gray-700 mb-6">
            Votre compte a été confirmé avec succès. Vous pouvez maintenant
            accéder à tous les services de e-changes.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2 rounded-lg"
          >
            Revenir à l’accueil
          </button>
        </div>
      </div>
    </div>
  );
}
