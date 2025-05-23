"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import LoginForm from "../components/AuthForms/LoginForm";
import RegistrationStep1 from "../components/AuthForms/RegistrationStep1";
import RegistrationStep2 from "../components/AuthForms/RegistrationStep2";
import RegistrationStep3 from "../components/AuthForms/RegistrationStep3";
import RegistrationStep4 from "../components/AuthForms/RegistrationStep4";
import ForgotPasswordForm from "../components/AuthForms/ForgotPasswordForm"; // Add this import
import apiClient from "../api/apiClient";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [registrationStep, setRegistrationStep] = useState(1);
  const [error, setError] = useState("");

  // Remember me state for login
  const [rememberMe, setRememberMe] = useState(true);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password state
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Registration state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [country, setCountry] = useState("France");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [region, setRegion] = useState("");

  // Files for identity verification
  const [photoId, setPhotoId] = useState<File | null>(null);

  const { login, register, uploadIdentityDocuments, completeSubscription } =
    useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      setError("Veuillez saisir votre email et votre mot de passe");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Pass the rememberMe flag to the login function
      await login(loginEmail, loginPassword, rememberMe);
      router.push("/explorer");
    } catch (err) {
      // console.error("Login error:", err);
      setError("Email ou mot de passe invalide");
    } finally {
      setIsLoading(false);
    }
  };

  // Add forgot password handler
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail) {
      setError("Veuillez saisir votre adresse e-mail");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call your API to send reset email
      await apiClient.forgotPassword(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de l'envoi de l'e-mail"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reset states when switching tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setError("");
    setResetSuccess(false);
    if (tab === "login") {
      setResetEmail("");
    }
  };

  const handleRegistrationNext = (e: React.FormEvent) => {
    e.preventDefault();

    if (registrationStep === 1) {
      if (!email || !password || !firstName || !lastName || !city) {
        setError("Veuillez remplir tous les champs obligatoires");
        return;
      }
      setRegistrationStep(2);
    } else if (registrationStep === 2) {
      if (!acceptTerms) {
        setError("Vous devez accepter le règlement intérieur");
        return;
      }
      setRegistrationStep(3);
    } else if (registrationStep === 3) {
      // Verify that we have all the required files
      if (!photoId) {
        setError("Veuillez télécharger tous les documents requis");
        return;
      }
      setRegistrationStep(4);
    }
  };

  const handleRegistrationBack = () => {
    if (registrationStep > 1) {
      setRegistrationStep(registrationStep - 1);
    }
  };

  const handleFileUpload = (fileType: string, file: File) => {
    if (fileType === "photoId") {
      setPhotoId(file);
    }
  };

  const handleRegistrationFinish = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addressLine1 || !city || !postalCode) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Create FormData object for sending both text data and files
      const formData = new FormData();

      // Add all user registration data
      formData.append("email", email);
      formData.append("password", password);
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("city", city);
      formData.append("referralCode", referralCode || "");
      formData.append("acceptedTerms", acceptTerms.toString());

      // Add address information
      formData.append("country", country);
      formData.append("addressLine1", addressLine1);
      formData.append("addressLine2", addressLine2 || "");
      formData.append("postalCode", postalCode);
      formData.append("region", region || "");

      // Add identity verification files
      if (photoId) {
        formData.append("photoId", photoId);
      }

      // Use the API client instead of direct fetch
      const result = await apiClient.registerWithFormData(formData);

      // Handle successful registration
      if (result.token) {
        localStorage.setItem("token", result.token);
        window.location.href = "/explorer";
      } else {
        throw new Error("No token received");
      }
    } catch (err) {
      // console.error("Registration error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de l'inscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-[92.9vh] flex items-center bg-teal-500  px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between md:items-start gap-10">
        {/* Left side - Welcome text */}
        <div className="md:w-1/2 text-white md:mt-32  max-w-md">
          <h1 className="text-3xl font-bold">Bienvenue !</h1>
          <h2 className="text-2xl mt-2">Avant toute chose...</h2>
          <p className="text-lg mt-4">
            Créez votre profil pour personnaliser comment vous apparaîtrez
          </p>
        </div>

        {/* Right side - Form */}
        <div className="md:w-1/2 w-full  max-w-md">
          <div className="bg-white shadow-md rounded-xl overflow-hidden">
            {/* Redesigned Tabs - Only show for login/register, hide for forgot password */}
            {activeTab !== "forgot-password" && (
              <div className="flex p-6 bg-gray-50">
                <button
                  className={`flex-1 py-2 px-4 rounded-md text-center font-medium transition-colors duration-200 cursor-pointer ${
                    activeTab === "register"
                      ? "text-white bg-teal-500"
                      : "text-teal-600 bg-white border border-teal-500 hover:bg-teal-50"
                  }`}
                  onClick={() => handleTabChange("register")}
                >
                  INSCRIPTION
                </button>
                <button
                  className={`flex-1 py-2 px-4 rounded-md text-center font-medium ml-2 transition-colors duration-200 cursor-pointer ${
                    activeTab === "login"
                      ? "text-white bg-teal-500"
                      : "text-teal-600 bg-white border border-teal-500 hover:bg-teal-50"
                  }`}
                  onClick={() => handleTabChange("login")}
                >
                  CONNEXION
                </button>
              </div>
            )}

            {/* Login Form */}
            {activeTab === "login" && (
              <LoginForm
                loginEmail={loginEmail}
                setLoginEmail={setLoginEmail}
                loginPassword={loginPassword}
                setLoginPassword={setLoginPassword}
                handleLoginSubmit={handleLoginSubmit}
                isLoading={isLoading}
                error={error}
                setActiveTab={handleTabChange}
                rememberMe={rememberMe}
                setRememberMe={setRememberMe}
              />
            )}

            {/* Forgot Password Form */}
            {activeTab === "forgot-password" && (
              <ForgotPasswordForm
                email={resetEmail}
                setEmail={setResetEmail}
                handleSubmit={handleForgotPasswordSubmit}
                isLoading={isLoading}
                error={error}
                success={resetSuccess}
                setActiveTab={handleTabChange}
              />
            )}

            {/* Registration Steps */}
            {activeTab === "register" && registrationStep === 1 && (
              <RegistrationStep1
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                city={city}
                setCity={setCity}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                referralCode={referralCode}
                setReferralCode={setReferralCode}
                handleRegistrationNext={handleRegistrationNext}
                error={error}
                setActiveTab={handleTabChange}
              />
            )}

            {activeTab === "register" && registrationStep === 2 && (
              <RegistrationStep2
                acceptTerms={acceptTerms}
                setAcceptTerms={setAcceptTerms}
                handleRegistrationNext={handleRegistrationNext}
                handleRegistrationBack={handleRegistrationBack}
                error={error}
                setActiveTab={handleTabChange}
              />
            )}

            {activeTab === "register" && registrationStep === 3 && (
              <RegistrationStep4
                country={country}
                setCountry={setCountry}
                addressLine1={addressLine1}
                setAddressLine1={setAddressLine1}
                addressLine2={addressLine2}
                setAddressLine2={setAddressLine2}
                city={city}
                setCity={setCity}
                postalCode={postalCode}
                setPostalCode={setPostalCode}
                region={region}
                setRegion={setRegion}
                handleRegistrationFinish={handleRegistrationFinish}
                handleRegistrationBack={handleRegistrationBack}
                isLoading={isLoading}
                error={error}
                setActiveTab={handleTabChange}
                photoId={photoId}
                handleFileUpload={handleFileUpload}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
