// RegistrationStep2.tsx
import React from "react";

interface RegistrationStep2Props {
  acceptTerms: boolean;
  setAcceptTerms: (accept: boolean) => void;
  handleRegistrationNext: (e: React.FormEvent) => void;
  handleRegistrationBack: () => void;
  error: string;
  setActiveTab: (tab: string) => void;
}

const RegistrationStep2: React.FC<RegistrationStep2Props> = ({
  acceptTerms,
  setAcceptTerms,
  handleRegistrationNext,
  handleRegistrationBack,
  error,
  setActiveTab,
}) => {
  return (
    <form className="p-6 space-y-4" onSubmit={handleRegistrationNext}>
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <p className="text-sm text-center font-medium text-gray-700 mb-4">
        Afin de continuer, veuillez lire et accepter le règlement intérieur
      </p>

      <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 h-56 overflow-y-auto">
        <p className="mb-4">
          Règlement intérieur de l'association E-change pour faciliter les
          échanges et les partages entre les membres de l'association via la
          bonne utilisation de l'application e-change.com
        </p>
        <p className="mb-2">Adopté par l'assemblée générale du 20/01/2024</p>

        <p className="font-medium mt-4 mb-2">
          Article 1 - Adhésion à l'association
        </p>
        <p>
          Pour devenir membre de l'association et pouvoir utiliser l'application
          e-change.com, tout membre doit adhérer au projet de l'association (à
          savoir l'échange des savoirs).
        </p>

        <p className="font-medium mt-4 mb-2">
          Article 2 - Adhésion à la philosophie de l'application
        </p>
        <p>
          L'application e-change a pour ambition de permettre à ses usagers des
          échanges fiables, équitables, bienveillants, possibles et
          responsables, entre les membres de cette application et des
          associations adhérentes, à l'exception de tout produit ou service
          prohibé.
        </p>
      </div>

      <div className="flex items-center mt-4">
        <input
          id="accept-terms"
          name="accept-terms"
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="h-4 w-4 text-teal-500 focus:ring-teal-400 border-gray-300 rounded"
        />
        <label
          htmlFor="accept-terms"
          className="ml-2 block text-sm text-gray-700"
        >
          J'accepte le règlement intérieur
        </label>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          onClick={handleRegistrationBack}
          className="py-2 px-4 text-sm font-medium text-gray-700 focus:outline-none"
        >
          RETOUR
        </button>
        <button
          type="submit"
          className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          CONTINUER <span className="ml-2">→</span>
        </button>
      </div>

      <div className="text-center text-sm mt-4">
        <p>
          Déjà un compte ?{" "}
          <a
            href="#"
            className="font-medium text-teal-500 hover:text-teal-400 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("login");
            }}
          >
            Connectez-vous
          </a>
        </p>
      </div>
    </form>
  );
};

export default RegistrationStep2;
