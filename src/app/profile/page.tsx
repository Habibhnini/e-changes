"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { IoLocationOutline } from "react-icons/io5";
import { useAuth } from "../contexts/AuthContext";
import ServiceModal from "../components/ServiceModal";
import { Service } from "../api/services/routes";

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
  // Mock user data
  console.log(user?.userInfo?.photoIdPath);
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
        console.error("Erreur lors du chargement des données:", err);
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
          (s) => s.type === "service"
        );
        const biens = servicesData.services.filter((s) => s.type === "bien");

        setUserServices(services);
        setUserBiens(biens);
      }
    } catch (err) {
      console.error("Erreur lors du rechargement des services:", err);
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
      {activeTab === "services" && (
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
                <p className="text-sm font-semibold">{user?.userInfo?.city}</p>
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
      )}
      {/* Modal */}
      {showModal && modalType && user && (
        <ServiceModal
          type={modalType}
          vendorId={user.id}
          onClose={closeModal}
          onCreated={handleCreated}
        />
      )}

      {/* Données Personnelles Section */}
      {activeTab === "donnees" && (
        <div className="space-y-6">
          {/* Referral Banner */}
          <div className="mb-6 border-[0.5px] rounded-2xl border-gray-200 ">
            {/* Yellow Banner */}
            <div className="bg-yellow-300 rounded-2xl  overflow-hidden">
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
                    Nombre de parrainage actuel
                  </p>
                  <p>{user?.referrals}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">
                    Votre code de parrainage
                  </p>
                  <p>{user?.referralCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Image */}
          <div>
            <p className="text-gray-600 text-sm mb-2">Image de profil</p>
            <div className="flex items-center gap-4">
              <Image
                src={
                  user?.userInfo?.photoIdPath
                    ? `${process.env.NEXT_PUBLIC_API_URL}${user.userInfo.photoIdPath}`
                    : "/placeholder.png"
                }
                alt="Profile"
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
              <button className="bg-[#38AC8E] text-white px-4 py-1 h-12 rounded-xl text-sm cursor-pointer hover:bg-teal-600">
                Changer
              </button>
            </div>
          </div>

          {/* User Form */}
          <form className="space-y-6">
            <div>
              <label className="block text-gray-600 text-sm mb-2">E-mail</label>
              <input
                type="email"
                defaultValue={user?.email}
                className="w-full border border-gray-300 rounded-xl p-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Ancien mot de passe
                </label>
                <input
                  type="password"
                  defaultValue="••••••••••"
                  className="w-full border border-gray-300 rounded-xl p-2"
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  className="w-full border border-gray-300 rounded-xl p-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  defaultValue={user?.firstName}
                  className="w-full border border-gray-300 rounded-xl p-2"
                />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-2">
                  Nom (Uniquement la première lettre est affichée)
                </label>
                <input
                  type="text"
                  defaultValue={user?.lastName}
                  className="w-full border border-gray-300 rounded-xl p-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-2">Ville</label>
              <input
                type="text"
                defaultValue={user?.userInfo?.city}
                placeholder="Écrivez ici..."
                className="w-full border border-gray-300 rounded-xl p-2"
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-2">
                Présentation (maximum 800 caractères)
              </label>
              <textarea
                placeholder="Écrivez ici..."
                className="w-full border border-gray-300 rounded-xl p-2 h-32"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-emerald-500 text-white px-6 py-2 rounded-md"
              >
                Sauvegarder
              </button>
            </div>
          </form>
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
              <button className="bg-gray-200 text-gray-700 w-full py-2 rounded-xl mb-6 hover:bg-gray-300 cursor-pointer">
                Désactiver récurrence
              </button>
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
