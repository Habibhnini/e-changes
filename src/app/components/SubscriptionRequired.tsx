// components/SubscriptionRequired.tsx
import React from "react";
import Link from "next/link";

interface SubscriptionRequiredProps {
  title?: string;
  message?: string;
  features?: string[];
  ctaText?: string;
  ctaLink?: string;
  className?: string;
}

const SubscriptionRequired: React.FC<SubscriptionRequiredProps> = ({
  title = "Abonnement requis",
  message = "Cette fonctionnalité est réservée aux membres avec un abonnement actif . Débloquez l'accès complet à notre plateforme.",
  features = [
    "Accès illimité à toutes les fonctionnalités",
    "Création de services et biens",
    "Négocier des services/biens en temp-réel via chat",
  ],
  ctaText = "Découvrir nos offres",
  ctaLink = "/subscription",
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-center min-h-[400px] p-6 ${className}`}
    >
      <div className="max-w-md w-full">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
          <p className="text-gray-600 leading-relaxed mb-6">{message}</p>

          {/* Features list */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              Avantages
            </h3>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center text-sm text-gray-600"
                >
                  <svg
                    className="w-4 h-4 text-green-500 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRequired;
