// RegistrationStep4.tsx
import React from "react";
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
}) => {
  return (
    <form className="p-6 space-y-4" onSubmit={handleRegistrationFinish}>
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Résumé pour abonnement annuel e-change
        </h3>
        <p className="text-3xl font-bold">20€</p>
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
          Adresse ligne 1
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
          {isLoading ? "Traitement..." : "PAYER ET ADHÉRER →"}
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

      <div className="flex justify-center mt-2">
        <Image
          src="/stripe-logo.png"
          alt="Powered by Stripe"
          width={50}
          height={20}
        />
      </div>
    </form>
  );
};

export default RegistrationStep4;
