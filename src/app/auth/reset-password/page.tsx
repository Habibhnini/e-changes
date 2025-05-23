"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import apiClient from "../../api/apiClient";
const PasswordResetPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch = newPassword === confirmPassword;
  const isFormValid =
    newPassword.length >= 6 && passwordsMatch && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await apiClient.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la réinitialisation.");
    } finally {
      setIsLoading(false);
    }
  };

  const onBackToLogin = () => router.push("/auth");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-600 italic">e-changes</h1>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Nouveau mot de passe
              </h2>
              <p className="text-sm text-gray-600">
                Choisissez un nouveau mot de passe sécurisé pour votre compte.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success ? (
              <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
                <div className="text-center space-y-3">
                  <div className="text-4xl">✅</div>
                  <h3 className="font-medium">Mot de passe mis à jour !</h3>
                  <p className="text-sm">
                    Votre mot de passe a été modifié avec succès. Vous pouvez
                    maintenant vous connecter avec votre nouveau mot de passe.
                  </p>
                  <button
                    onClick={onBackToLogin}
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Se connecter →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    NOUVEAU MOT DE PASSE*
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="new-password"
                      name="new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                      placeholder="Minimum 6 caractères"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="text-gray-400 text-sm">
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </span>
                    </button>
                  </div>
                  {newPassword.length > 0 && newPassword.length < 6 && (
                    <p className="mt-1 text-sm text-red-600">
                      Le mot de passe doit contenir au moins 6 caractères.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    CONFIRMER LE MOT DE PASSE*
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${
                        confirmPassword.length > 0 && !passwordsMatch
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Confirmez votre mot de passe"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <span className="text-gray-400 text-sm">
                        {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                      </span>
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="mt-1 text-sm text-red-600">
                      Les mots de passe ne correspondent pas.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    "Mise à jour en cours..."
                  ) : (
                    <>
                      METTRE À JOUR LE MOT DE PASSE{" "}
                      <span className="ml-2">→</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="text-center text-sm">
              <p>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onBackToLogin();
                  }}
                  className="font-medium text-teal-500 hover:text-teal-400"
                >
                  ← Retour à la connexion
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
