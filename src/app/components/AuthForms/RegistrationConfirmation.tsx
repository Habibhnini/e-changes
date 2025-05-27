// components/AuthForms/RegistrationConfirmation.tsx
import React from "react";

interface RegistrationConfirmationProps {
  email: string;
  setActiveTab: (tab: string) => void;
}

const RegistrationConfirmation: React.FC<RegistrationConfirmationProps> = ({
  email,
  setActiveTab,
}) => {
  return (
    <div className="p-6 space-y-6 text-center">
      {/* Success Icon */}
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Inscription réussie !
        </h2>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-center mb-2">
            <svg
              className="w-5 h-5 text-blue-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm font-medium text-blue-800">
              E-mail de confirmation envoyé
            </p>
          </div>
          <p className="text-sm text-blue-700">
            Un e-mail de confirmation a été envoyé à :
          </p>
          <p className="text-sm font-semibold text-blue-800 mt-1">{email}</p>
        </div>

        <div className="text-left bg-gray-50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-gray-800 text-sm">
            Prochaines étapes :
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="w-5 h-5 bg-teal-500 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                1
              </span>
              Vérifiez votre boîte e-mail (et le dossier spam)
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 bg-teal-500 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                2
              </span>
              Cliquez sur le lien de confirmation dans l'e-mail
            </li>
            <li className="flex items-start">
              <span className="w-5 h-5 bg-teal-500 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                3
              </span>
              Connectez-vous avec vos identifiants
            </li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4">
        <button
          onClick={() => setActiveTab("login")}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Aller à la connexion
        </button>

        <button
          onClick={() => setActiveTab("register")}
          className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors duration-200"
        >
          Créer un autre compte
        </button>
      </div>
    </div>
  );
};

export default RegistrationConfirmation;
