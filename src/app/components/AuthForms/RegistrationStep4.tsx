// RegistrationStep4.tsx (UPDATED WITH IMAGE SIZE VALIDATION)
import React, { useState } from "react";
import Image from "next/image";

interface RegistrationStep4Props {
  country: string;
  setCountry: (country: string) => void;
  addressLine1: string;
  setAddressLine1: (address: string) => void;
  addressLine2: string;
  setAddressLine2: (address: string) => void;
  city: string;
  setCity: (city: string) => void;
  postalCode: string;
  setPostalCode: (code: string) => void;
  region: string;
  setRegion: (region: string) => void;
  handleRegistrationFinish: (e: React.FormEvent) => void;
  handleRegistrationBack: () => void;
  isLoading: boolean;
  error: string;
  setActiveTab: (tab: string) => void;
  photoId: File | null;
  handleFileUpload: (fileType: string, file: File) => void;
}

const RegistrationStep4: React.FC<RegistrationStep4Props> = ({
  country,
  setCountry,
  addressLine1,
  setAddressLine1,
  addressLine2,
  setAddressLine2,
  city,
  setCity,
  postalCode,
  setPostalCode,
  region,
  setRegion,
  handleRegistrationFinish,
  handleRegistrationBack,
  isLoading,
  error,
  setActiveTab,
  photoId,
  handleFileUpload,
}) => {
  const [imageError, setImageError] = useState("");

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    setImageError("");

    if (file.size > maxSize) {
      setImageError(
        `Image trop volumineuse. Taille maximum: 10MB. Votre fichier: ${formatFileSize(
          file.size
        )}`
      );
      e.target.value = "";
      return;
    }

    handleFileUpload("photoId", file);
  };

  return (
    <form className="p-6 space-y-4" onSubmit={handleRegistrationFinish}>
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Information suplementaire
        </h3>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700">
          Adresse de facturation
        </h4>
        <div className="mt-2">
          <select
            id="country"
            name="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          >
            <option>France</option>
            <option>Belgique</option>
            <option>Suisse</option>
            <option>Canada</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="address-line-1"
          className="block text-sm font-medium text-gray-700"
        >
          Adresse ligne 1*
        </label>
        <input
          type="text"
          name="address-line-1"
          id="address-line-1"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="address-line-2"
          className="block text-sm font-medium text-gray-700"
        >
          Adresse ligne 2
        </label>
        <input
          type="text"
          name="address-line-2"
          id="address-line-2"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="city-billing"
            className="block text-sm font-medium text-gray-700"
          >
            Ville
          </label>
          <input
            type="text"
            name="city-billing"
            id="city-billing"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="postal-code"
            className="block text-sm font-medium text-gray-700"
          >
            Code postal
          </label>
          <input
            type="text"
            name="postal-code"
            id="postal-code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="region"
          className="block text-sm font-medium text-gray-700"
        >
          Région
        </label>
        <input
          type="text"
          name="region"
          id="region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          VOTRE PHOTO
          {photoId && (
            <span className="text-green-500 text-xs ml-1">
              (Fichier ajouté)
            </span>
          )}
        </label>
        <div className="mt-1 flex justify-center px-6 pt-3 pb-3 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {!photoId ? (
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
            ) : (
              <img
                src={URL.createObjectURL(photoId)}
                alt="Aperçu"
                className="mx-auto w-20 h-20 object-cover rounded shadow"
              />
            )}

            <div className="flex flex-col items-center text-sm text-gray-600 space-y-2">
              <label
                htmlFor="photoId"
                className="relative cursor-pointer bg-white rounded-md font-medium text-teal-500 hover:text-teal-400 focus-within:outline-none"
              >
                <span>
                  {photoId
                    ? "Changer la photo"
                    : "Cliquer pour ajouter votre photo"}
                </span>
                <input
                  id="photoId"
                  name="photoId"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
              <p className="text-xs text-gray-500">Taille maximum: 10MB</p>
            </div>
          </div>
        </div>
        {imageError && (
          <div className="mt-2 bg-red-50 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
            {imageError}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          onClick={handleRegistrationBack}
          className="py-2 px-4 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
        >
          RETOUR
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 cursor-pointer"
        >
          {isLoading ? "Traitement..." : "S'inscrire →"}
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
    </form>
  );
};

export default RegistrationStep4;
