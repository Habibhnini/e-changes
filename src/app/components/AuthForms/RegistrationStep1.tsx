// RegistrationStep1.tsx
import React, { useState } from "react";

interface RegistrationStep1Props {
  firstName: string;
  setFirstName: (firstName: string) => void;
  lastName: string;
  setLastName: (lastName: string) => void;
  city: string;
  setCity: (city: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  referralCode: string;
  setReferralCode: (code: string) => void;
  handleRegistrationNext: (e: React.FormEvent) => void;
  error: string;
  setActiveTab: (tab: string) => void;
}

const RegistrationStep1: React.FC<RegistrationStep1Props> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  city,
  setCity,
  email,
  setEmail,
  password,
  setPassword,
  referralCode,
  setReferralCode,
  handleRegistrationNext,
  error,
  setActiveTab,
}) => {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset password error
    setPasswordError("");

    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    // Check password strength (optional)
    if (password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    // If validation passes, proceed with registration
    handleRegistrationNext(e);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // Clear password error when user starts typing
    if (passwordError) {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    // Clear password error when user starts typing
    if (passwordError) {
      setPasswordError("");
    }
  };

  return (
    <form className="p-6 space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {passwordError && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {passwordError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            PRÉNOM*
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="Prénom"
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            NOM*
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            placeholder="Nom"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="city"
          className="block text-sm font-medium text-gray-700"
        >
          VILLE*
        </label>
        <input
          id="city"
          name="city"
          type="text"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          placeholder="Ville"
        />
      </div>

      <div>
        <label
          htmlFor="reg-email"
          className="block text-sm font-medium text-gray-700"
        >
          ADRESSE E-MAIL*
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          placeholder="E-mail"
        />
      </div>

      <div>
        <label
          htmlFor="reg-password"
          className="block text-sm font-medium text-gray-700"
        >
          MOT DE PASSE*
        </label>
        <input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${
            passwordError
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
          }`}
          placeholder="Mot de passe"
        />
        {password && password.length > 0 && (
          <div className="mt-1 text-xs">
            <div
              className={`${
                password.length >= 6 ? "text-green-600" : "text-red-600"
              }`}
            >
              {password.length >= 6 ? "✓" : "✗"} Au moins 6 caractères
            </div>
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="confirm-password"
          className="block text-sm font-medium text-gray-700"
        >
          CONFIRMER LE MOT DE PASSE*
        </label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${
            passwordError
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-teal-500 focus:border-teal-500"
          }`}
          placeholder="Confirmer le mot de passe"
        />
        {confirmPassword && confirmPassword.length > 0 && (
          <div className="mt-1 text-xs">
            <div
              className={`${
                password === confirmPassword ? "text-green-600" : "text-red-600"
              }`}
            >
              {password === confirmPassword
                ? "✓ Les mots de passe correspondent"
                : "✗ Les mots de passe ne correspondent pas"}
            </div>
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="referralCode"
          className="block text-sm font-medium text-gray-700"
        >
          PARRAIN
        </label>
        <input
          id="referralCode"
          name="referralCode"
          type="text"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          placeholder="Code parrain"
        />
      </div>

      <div className="flex items-center justify-center mt-4">
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 cursor-pointer"
          disabled={password !== confirmPassword || password.length < 6}
        >
          CONTINUER <span className="ml-2">→</span>
        </button>
      </div>

      <div className="text-center text-sm mt-4">
        <p>
          Déjà un compte ?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("login");
            }}
            className="font-medium text-teal-500 hover:text-teal-400 cursor-pointer"
          >
            Connectez-vous
          </a>
        </p>
      </div>
    </form>
  );
};

export default RegistrationStep1;
