// RegistrationStep3.tsx
import React from "react";
import Image from "next/image";

interface RegistrationStep3Props {
  handleRegistrationNext: (e: React.FormEvent) => void;
  handleRegistrationBack: () => void;
  error: string;
  setActiveTab: (tab: string) => void;
  handleFileUpload: (fileType: string, file: File) => void;
  photoId: File | null;
  idCardFront: File | null;
  idCardBack: File | null;
}

const RegistrationStep3: React.FC<RegistrationStep3Props> = ({
  handleRegistrationNext,
  handleRegistrationBack,
  error,
  setActiveTab,
  handleFileUpload,
  photoId,
  idCardFront,
  idCardBack,
}) => {
  return (
    <form className="p-6 space-y-4" onSubmit={handleRegistrationNext}>
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <p className="text-sm text-gray-700 mb-2">
        Pour garantir un espace sécurisé et bienveillant à tous nos e-changeurs,
        nous avons besoin de confirmer votre identité
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          VOTRE PHOTO*{" "}
          {photoId && (
            <span className="text-green-500 text-xs">(Fichier ajouté)</span>
          )}
        </label>
        <div className="mt-1 flex justify-center px-6 pt-3 pb-3 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-10 w-10 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-teal-500 hover:text-teal-400 focus-within:outline-none"
              >
                <span>Cliquer pour ajouter votre photo</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload("photoId", e.target.files[0]);
                    }
                  }}
                  accept="image/*"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            PIÈCE D'IDENTITÉ (RECTO)*{" "}
            {idCardFront && (
              <span className="text-green-500 text-xs">(Fichier ajouté)</span>
            )}
          </label>
          <div className="mt-1 flex justify-center px-4 pt-3 pb-3 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-8 w-8 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-xs text-gray-600">
                <label
                  htmlFor="id-front-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-teal-500 hover:text-teal-400 focus-within:outline-none"
                >
                  <span>Ajouter (RECTO)</span>
                  <input
                    id="id-front-upload"
                    name="id-front-upload"
                    type="file"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload("idCardFront", e.target.files[0]);
                      }
                    }}
                    accept="image/*"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            PIÈCE D'IDENTITÉ (VERSO)*{" "}
            {idCardBack && (
              <span className="text-green-500 text-xs">(Fichier ajouté)</span>
            )}
          </label>
          <div className="mt-1 flex justify-center px-4 pt-3 pb-3 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-8 w-8 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-xs text-gray-600">
                <label
                  htmlFor="id-back-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-teal-500 hover:text-teal-400 focus-within:outline-none"
                >
                  <span>Ajouter (VERSO)</span>
                  <input
                    id="id-back-upload"
                    name="id-back-upload"
                    type="file"
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload("idCardBack", e.target.files[0]);
                      }
                    }}
                    accept="image/*"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Ces données seront automatiquement supprimées après vérification.
      </p>

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
          FINALISATION <span className="ml-2">→</span>
        </button>
      </div>

      <div className="text-center text-sm mt-2">
        <p>
          Déjà un compte ?{" "}
          <a
            href="#"
            className="font-medium text-teal-500 hover:text-teal-400"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("login");
            }}
          >
            Connectez-vous
          </a>
        </p>
      </div>

      <div className="flex justify-center">
        <Image src="/veriff-logo.png" alt="Veriff" width={40} height={16} />
      </div>
    </form>
  );
};

export default RegistrationStep3;
