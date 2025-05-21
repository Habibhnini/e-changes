"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IoLocationOutline } from "react-icons/io5";
import { useAuth } from "../contexts/AuthContext";
import ServiceModal from "../components/ServiceModal";
import { Service } from "../api/services/routes";
import { loadStripe } from "@stripe/stripe-js";
import StripeSubscribeButton from "../components/StripeSubscibeButton";
import { useSubscriptionStatus } from "../hooks/useSubscription";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("donnees");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"service" | "bien" | null>(null);
  // États pour les données réelles
  const [userServices, setUserServices] = useState<Service[]>([]);
  const [userBiens, setUserBiens] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { isActive, loading: subscriptionLoading } = useSubscriptionStatus();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Handle showing notification popup
  const showNotification = (message: string, type: string) => {
    setNotification({
      show: true,
      message,
      type,
    });

    // Auto hide notification after 3 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // Add this function for canceling edits
  const handleCancelEdit = () => {
    setIsEditing(false);
    setPassword("");
    setConfirmPassword("");
    setImagePreview(null);
  };

  // Replace your form submission with this improved version
  const handleSubmit = async (e: {
    preventDefault: () => void;
    currentTarget: HTMLFormElement | undefined;
  }) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      showNotification("Les mots de passe ne correspondent pas", "error");
      return;
    }

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/update`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      if (!response.ok) {
        showNotification(result.error || "Erreur serveur", "error");
      } else {
        showNotification("Profil mis à jour avec succès", "success");
        setIsEditing(false);
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      showNotification("Une erreur est survenue", "error");
    }
  };
  // Mock subscription data
  const subscriptionData = {
    price: "20€",
    renewalDate: "05 janvier 2025",
    paymentMethod: "CARTE BANCAIRE",
    paymentHistory: [
      {
        date: "Jan 05 2024",
        description: "Abonnement annuel e-changes",
        amount: "20€",
        echangesReceived: 99,
      },
    ],
  };

  const openModal = (type: "service" | "bien") => {
    setModalType(type);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  // Charger les données réelles au chargement de la page
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Récupérer les services de l'utilisateur
        const servicesResponse = await fetch(
          `/api/service?vendorId=${user?.id || ""}`
        );
        const servicesData = await servicesResponse.json();

        if (servicesData && servicesData.services) {
          // Filtrer les services et les biens
          const services = servicesData.services.filter(
            (s: { type: string }) => s.type === "service"
          );
          const biens = servicesData.services.filter(
            (s: { type: string }) => s.type === "bien"
          );

          setUserServices(services);
          setUserBiens(biens);
        }
      } catch (err) {
        //  console.error("Erreur lors du chargement des données:", err);
        setError(
          "Impossible de charger les données. Veuillez réessayer plus tard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);
  const handleCreated = async () => {
    // Recharger les services/biens au lieu de recharger toute la page
    try {
      const servicesResponse = await fetch(
        `/api/service?vendorId=${user?.id || ""}`
      );
      const servicesData = await servicesResponse.json();

      if (servicesData && servicesData.services) {
        const services = servicesData.services.filter(
          (s: { type: string }) => s.type === "service"
        );
        const biens = servicesData.services.filter(
          (s: { type: string }) => s.type === "bien"
        );

        setUserServices(services);
        setUserBiens(biens);
      }
    } catch (err) {
      //  console.error("Erreur lors du rechargement des services:", err);
    }
  };
  return (
    <div className="max-w-[90%] mx-auto p-4 font-assistant">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 sm:gap-2 mb-6">
        <button
          className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium cursor-pointer ${
            activeTab === "donnees"
              ? "bg-[#38AC8E] text-white hover:bg-teal-600"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("donnees")}
        >
          Données Personnelles
        </button>
        <button
          className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium cursor-pointer ${
            activeTab === "services"
              ? "bg-[#38AC8E] text-white hover:bg-teal-600"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("services")}
        >
          Mes Services
        </button>
        <button
          className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hidden ${
            activeTab === "avis"
              ? "bg-[#38AC8E] text-white hover:bg-teal-600"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("avis")}
        >
          Avis
        </button>
        <button
          className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium cursor-pointer ${
            activeTab === "adhesion"
              ? "bg-[#38AC8E] text-white hover:bg-teal-600"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("adhesion")}
        >
          Adhésion
        </button>
        <button
          className="px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium bg-red-500 text-white cursor-pointer hover:bg-red-600"
          onClick={async () => {
            await logout();
          }}
        >
          Déconnexion
        </button>
      </div>

      {/* User Profile Card - Always visible */}
      {activeTab === "services" &&
        (subscriptionLoading ? (
          <div className="text-center mt-10 text-gray-500">Chargement...</div>
        ) : isActive ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* User Profile Card - Left Side */}
            <div className="md:w-1/5 md:min-w-[250px] bg-white rounded-xl p-4 border border-gray-200 h-fit">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 relative mb-2">
                  <Image
                    src={
                      user?.userInfo?.photoIdPath
                        ? `${process.env.NEXT_PUBLIC_API_URL}${user.userInfo.photoIdPath}`
                        : "/placeholder.png"
                    }
                    alt="Profile"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <h2 className="text-lg font-semibold">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">energy Balance</p>
                  <p className="text-sm font-semibold">{user?.energyBalance}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Localisation</p>
                  <p className="text-sm font-semibold">
                    {user?.userInfo?.city}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Referal Code</p>
                  <p className="text-sm font-semibold">{user?.referralCode}</p>
                </div>
              </div>
            </div>

            {/* Services and Biens - Right Side with Horizontal Scroll */}
            <div className="md:w-4/5 space-y-8">
              {/* Services */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">Mes services</h2>
                  <button
                    onClick={() => openModal("service")}
                    className="bg-[#38AC8E] text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-600"
                  >
                    Ajouter un service
                  </button>
                </div>

                <div className="overflow-x-auto pb-4">
                  <div className="flex gap-4 min-w-max">
                    {userServices.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-gray-500">
                          Vous n'avez pas encore ajouté de services.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto pb-4">
                        <div className="flex gap-4 min-w-max">
                          {userServices.map((service) => (
                            <div
                              key={service.id}
                              className="w-72 ml-2 group transform transition-transform duration-300 hover:scale-[1.03]"
                            >
                              <div className="w-full h-48 bg-white rounded-lg mb-2 transition-all duration-300 group-hover:shadow-lg relative overflow-hidden border border-gray-200">
                                {/* Placeholder image */}
                                <div className="flex items-center justify-center h-full w-full ">
                                  <Image
                                    src="/logo.jpg"
                                    alt="Logo placeholder"
                                    width={120}
                                    height={120}
                                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                                  />
                                </div>

                                {/* Gradient overlay at the bottom */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent rounded-b-lg">
                                  <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <div className="flex justify-between items-center">
                                      <div className="text-[#fce070] text-lg font-medium flex items-center">
                                        {service.price}
                                        <Image
                                          src="/coin.png"
                                          alt="User profile"
                                          width={40}
                                          height={40}
                                          className="object-cover ml-2 w-5 h-5"
                                        />
                                      </div>
                                      <div className="text-white text-sm flex items-center">
                                        <IoLocationOutline className="mr-1 w-5 h-5" />
                                        {user?.userInfo?.city || "Non spécifié"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-1 ml-4 flex items-center">
                                <div>
                                  <h3 className="font-medium text-gray-800 group-hover:text-[#38AC8E] transition-colors duration-200">
                                    {service.title}
                                  </h3>
                                  <p className="text-xs text-gray-500 line-clamp-2">
                                    {service.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Biens */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-medium">Mes biens</h2>
                  <button
                    onClick={() => openModal("bien")}
                    className="bg-[#DEB887] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#C8A275]"
                  >
                    Ajouter un bien
                  </button>
                </div>

                <div className="overflow-x-auto pb-4">
                  <div className="flex gap-4 min-w-max">
                    {userBiens.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-gray-500">
                          Vous n'avez pas encore ajouté de biens.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto pb-4">
                        <div className="flex gap-4 min-w-max">
                          {userBiens.map((bien) => (
                            <div
                              key={bien.id}
                              className="w-72 ml-2 group transform transition-transform duration-300 hover:scale-[1.03]"
                            >
                              <div className="w-full h-48 bg-white rounded-lg mb-2 transition-all duration-300 group-hover:shadow-lg relative overflow-hidden border border-gray-200">
                                {/* Placeholder image */}
                                <div className="flex items-center justify-center h-full w-full ">
                                  <Image
                                    src="/logo.jpg"
                                    alt="Logo placeholder"
                                    width={120}
                                    height={120}
                                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                                  />
                                </div>

                                {/* Permanent partial gradient overlay at the bottom */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent rounded-b-lg">
                                  {/* Bottom section with price and location */}
                                  <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <div className="flex justify-between items-center">
                                      {/* Price in the bottom left corner */}
                                      <div className="text-[#fce070] text-lg font-medium flex items-center">
                                        {bien.price}
                                        <Image
                                          src="/coin.png"
                                          alt="User profile"
                                          width={40}
                                          height={40}
                                          className="object-cover ml-2 w-5 h-5"
                                        />
                                      </div>

                                      {/* Location in the bottom right corner */}
                                      <div className="text-white text-sm flex items-center">
                                        <IoLocationOutline className="mr-1 w-5 h-5" />
                                        {user?.userInfo?.city || "Non spécifié"}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Additional overlay that appears on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:transition-opacity duration-300 rounded-lg"></div>
                              </div>

                              {/* Bien information below the image */}
                              <div className="mt-1 ml-4 flex items-center">
                                <div>
                                  <h3 className="font-medium text-gray-800 group-hover:text-[#DEB887] transition-colors duration-200">
                                    {bien.title}
                                  </h3>
                                  <p className="text-xs text-gray-500 line-clamp-2">
                                    {bien.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center mt-10 text-red-500">
            Accès réservé aux abonnés actifs
          </div>
        ))}
      {/* Modal */}
      {showModal && modalType && user && (
        <ServiceModal
          type={modalType}
          vendorId={user.id}
          onClose={closeModal}
          onCreated={handleCreated}
        />
      )}
      {notification.show && (
        <div
          className={`fixed top-6 right-6 p-4 rounded-lg shadow-lg max-w-md z-50 transition-all transform ${
            notification.show
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0"
          } ${
            notification.type === "success"
              ? "bg-green-50 border-l-4 border-green-500"
              : "bg-red-50 border-l-4 border-red-500"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.type === "success" ? (
                <svg
                  className="h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  notification.type === "success"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {notification.message}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() =>
                    setNotification((prev) => ({ ...prev, show: false }))
                  }
                  className={`inline-flex rounded-md p-1.5 ${
                    notification.type === "success"
                      ? "text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      : "text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  }`}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Données Personnelles Section */}
      {activeTab === "donnees" && (
        <div className="space-y-6">
          {/* Referral Banner - Keep as is */}
          <div className="mb-6 border-[0.5px] rounded-2xl border-gray-200">
            {/* Yellow Banner */}
            <div className="bg-yellow-300 rounded-2xl overflow-hidden">
              <div className="flex justify-between items-center relative">
                <div className="p-12 md:pl-36">
                  <h2 className="text-3xl font-bold">
                    Parrainer de nouveaux e-changeurs !
                  </h2>
                  <div className="mt-2">
                    <span>Et gagnez</span>{" "}
                    <span className="font-bold">99 e-€</span>/{" "}
                    <span>personnes (jusqu'à 1000 personnes)</span>
                  </div>
                </div>
                <div className="hidden md:flex h-full mr-24">
                  <Image
                    src="/images/referral-illustration.png"
                    alt="Referral illustration"
                    width={380}
                    height={220}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            {/* White Info Card */}
            <div className="bg-white rounded-b-2xl p-6 border border-gray-200 border-t-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">
                    Votre code de parrainage
                  </p>
                  <p>{user?.referralCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Profile Section with View/Edit Toggle */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Mon Profil</h2>
              {!isEditing && (
                <button
                  type="button"
                  className="bg-[#38AC8E] text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  Modifier mon profil
                </button>
              )}
            </div>

            {/* Profile Image - Always Visible */}
            <div className="mb-6">
              <p className="text-gray-600 text-sm mb-2">Image de profil</p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 relative">
                  <Image
                    src={
                      imagePreview
                        ? imagePreview
                        : user?.userInfo?.photoIdPath
                        ? `${process.env.NEXT_PUBLIC_API_URL}${user.userInfo.photoIdPath}`
                        : "/placeholder.png"
                    }
                    alt="Profile"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="bg-[#38AC8E] text-white px-4 py-1 h-10 rounded-lg text-sm cursor-pointer hover:bg-teal-600 transition-colors"
                    >
                      Changer
                    </button>
                    <input
                      type="file"
                      name="photoId"
                      ref={imageInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImagePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </>
                )}
              </div>
            </div>

            {/* View Mode */}
            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      E-mail
                    </h3>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Ville
                    </h3>
                    <p className="text-gray-900">
                      {user?.userInfo?.city || "-"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Prénom
                    </h3>
                    <p className="text-gray-900">{user?.firstName}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Nom
                    </h3>
                    <p className="text-gray-900">{user?.lastName}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-600 text-sm mb-1 block">
                      E-mail
                    </label>
                    <input
                      name="email"
                      defaultValue={user?.email}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm mb-1 block">
                      Ville
                    </label>
                    <input
                      name="city"
                      defaultValue={user?.userInfo?.city}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-600 text-sm mb-1 block">
                      Prénom
                    </label>
                    <input
                      name="firstName"
                      defaultValue={user?.firstName}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm mb-1 block">
                      Nom
                    </label>
                    <input
                      name="lastName"
                      defaultValue={user?.lastName}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-600 text-sm mb-1 block">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full border rounded-lg p-2 transition-colors duration-150 ${
                        password === "" && confirmPassword === ""
                          ? "border-gray-300"
                          : password === confirmPassword
                          ? "border-green-500"
                          : "border-red-500"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm mb-1 block">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full border rounded-lg p-2 transition-colors duration-150 ${
                        password === "" && confirmPassword === ""
                          ? "border-gray-300"
                          : password === confirmPassword
                          ? "border-green-500"
                          : "border-red-500"
                      }`}
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-sm text-red-600 mt-1 col-span-2">
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg text-white bg-[#38AC8E] hover:bg-teal-600 transition-colors"
                  >
                    Sauvegarder
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Adhésion Section */}
      {activeTab === "adhesion" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Information */}
            <div className="bg-white rounded-2xl h-2/3 p-4 pt-2 border border-gray-200">
              <h2 className="text-gray-900 font-medium mb-4 pb-2 border-b border-gray-300">
                Donnée de paiement
              </h2>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">
                  {subscriptionData.paymentMethod}
                </p>
                <button className="bg-[#38AC8E] text-white w-full py-3 rounded-xl hover:bg-teal-600 cursor-pointer">
                  METTRE À JOUR
                </button>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="bg-white rounded-2xl p-4 pt-2 border border-gray-200">
              <h2 className="text-gray-900 font-medium text-base mb-4 pb-2 border-b border-gray-300">
                Statut de l'abonnement
              </h2>
              <div className="text-center mb-4">
                <p className="text-5xl font-bold mb-1 font-assistant">
                  {subscriptionData.price}
                </p>
                <p className="text-sm text-gray-500">
                  Résumé pour Abonnement annuel e-change
                </p>
              </div>
              <StripeSubscribeButton
                buttonText="Souscrire maintenant"
                className="bg-gray-200 text-gray-700 w-full py-2 rounded-xl mb-6 hover:bg-gray-300 cursor-pointer"
              />

              <div className="text-center">
                <p className="text-sm text-gray-700 font-medium mb-1">
                  ÉTAT DE L'ABONNEMENT
                </p>
                <p className="text-sm text-gray-500">
                  Renouvellement prévu le {subscriptionData.renewalDate}
                </p>
              </div>
            </div>
          </div>

          {/* Payment History - Horizontally Scrollable Table */}
          <div className="bg-white rounded-2xl p-4 pt-2 border border-gray-200">
            <h2 className="text-gray-900 font-medium mb-4 pb-2 border-b border-gray-300">
              Historique de paiements
            </h2>

            {/* Desktop view - regular table */}
            <div className="hidden md:block">
              <table className="w-2/5 text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-1 pb-0 text-base text-gray-600 font-medium">
                      DATE
                    </th>
                    <th className="text-left py-1 pb-0 text-base text-gray-600 font-medium">
                      DESCRIPTION
                    </th>
                    <th className="text-left py-1 pb-0 text-base text-gray-600 font-medium">
                      SOMME
                    </th>
                    <th className="text-left py-1 pb-0 text-base text-gray-600 font-medium">
                      E-CHANGES REÇUS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptionData.paymentHistory.map((payment, index) => (
                    <tr key={index}>
                      <td className="py-2 pt-1 pr-6 font-semibold">
                        {payment.date}
                      </td>
                      <td className="py-2 pt-1 pr-6 font-semibold">
                        {payment.description}
                      </td>
                      <td className="py-2 pt-1 pr-6 font-semibold">
                        {payment.amount}
                      </td>
                      <td className="py-2 pt-1 text-[#F4C300] font-semibold">
                        {payment.echangesReceived}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view - horizontally scrollable table */}
            <div className="md:hidden overflow-x-auto pb-2">
              <div className="min-w-[600px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-1 pb-0 text-base text-gray-600 font-medium">
                        DATE
                      </th>
                      <th className="text-left py-1 pb-0 text-base text-gray-600 font-medium">
                        DESCRIPTION
                      </th>
                      <th className="text-left py-1 pb-0 text-base text-gray-600 font-medium">
                        SOMME
                      </th>
                      <th className="text-left py-1 pb-0 text-base text-gray-600 font-medium">
                        E-CHANGES REÇUS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionData.paymentHistory.map((payment, index) => (
                      <tr key={index}>
                        <td className="py-2 pt-1 pr-6 font-semibold">
                          {payment.date}
                        </td>
                        <td className="py-2 pt-1 pr-6 font-semibold">
                          {payment.description}
                        </td>
                        <td className="py-2 pt-1 pr-6 font-semibold">
                          {payment.amount}
                        </td>
                        <td className="py-2 pt-1 text-[#F4C300] font-semibold">
                          {payment.echangesReceived}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
