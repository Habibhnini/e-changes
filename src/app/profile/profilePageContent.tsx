"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IoLocationOutline } from "react-icons/io5";
import { useAuth } from "../contexts/AuthContext";
import ServiceModal from "../components/ServiceModal";
import { Service as OriginalService } from "../api/services/routes";
import { useSearchParams } from "next/navigation";

// Extend Service type to include primaryImageUrl for UI mapping
type Service = OriginalService & {
  primaryImageUrl?: string;
};
import { loadStripe } from "@stripe/stripe-js";
import StripeSubscribeButton from "../components/StripeSubscibeButton";
import { useSubscriptionStatus } from "../hooks/useSubscription";
import SubscriptionRequired from "../components/SubscriptionRequired";

export default function ProfilePageContent() {
  const [activeTab, setActiveTab] = useState("donnees");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"service" | "bien" | null>(null);
  // États pour les données réelles
  const [userServices, setUserServices] = useState<Service[]>([]);
  const [userBiens, setUserBiens] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    logout,
    user,
    refreshUserProfile,
    isAuthenticated,
    makeAuthenticatedRequest,
  } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { isActive, loading: subscriptionLoading } = useSubscriptionStatus();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [subscription, setSubscription] = useState<any | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "view" | "edit">(
    "create"
  );
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const searchParams = useSearchParams();
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["donnees", "services", "adhesion"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  const getFullImageUrl = (url: string): string => {
    if (!url) return "/logo.jpg";
    if (url.startsWith("http")) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    return url.startsWith("/uploads/")
      ? `${apiUrl}${url}`
      : `${apiUrl}/uploads/services/${url}`;
  };

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

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Enhanced image validation
  const validateImageFile = (
    file: File
  ): { isValid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];

    if (
      !validTypes.includes(file.type) &&
      !file.name.toLowerCase().endsWith(".heic")
    ) {
      return {
        isValid: false,
        error: `Format de fichier non supporté. Formats autorisés: JPG, PNG, WebP, HEIC. Votre fichier: ${
          file.type || "inconnu"
        }`,
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `Image trop volumineuse. Taille maximum: 10MB. Votre fichier: ${formatFileSize(
          file.size
        )}`,
      };
    }

    return { isValid: true };
  };

  // Add this function for canceling edits
  const handleCancelEdit = () => {
    setIsEditing(false);
    setPassword("");
    setConfirmPassword("");
    setImagePreview(null);
  };

  // Enhanced form submission with better validation and token handling
  const handleSubmit = async (e: {
    preventDefault: () => void;
    currentTarget: HTMLFormElement | undefined;
  }) => {
    e.preventDefault();

    // Password validation
    if (password || confirmPassword) {
      if (!password) {
        showNotification("Veuillez saisir un nouveau mot de passe", "error");
        return;
      }

      if (password.length < 6) {
        showNotification(
          "Le mot de passe doit contenir au moins 6 caractères",
          "error"
        );
        return;
      }

      if (password !== confirmPassword) {
        showNotification("Les mots de passe ne correspondent pas", "error");
        return;
      }
    }

    const formData = new FormData(e.currentTarget);
    const fileInput = imageInputRef.current;

    // Enhanced image validation
    if (fileInput?.files?.[0]) {
      const file = fileInput.files[0];
      const validation = validateImageFile(file);

      if (!validation.isValid) {
        showNotification(validation.error!, "error");
        return;
      }

      formData.append("photoId", file);
    }

    try {
      // Use the enhanced authenticated request method
      const response = await makeAuthenticatedRequest(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/update`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      if (!response.ok) {
        showNotification(result.error || "Erreur serveur", "error");
      } else {
        showNotification("Profil mis à jour avec succès", "success");
        await refreshUserProfile();

        setIsEditing(false);
        setPassword("");
        setConfirmPassword("");
        setImagePreview(null);
      }
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as any).message === "string" &&
        (error as any).message === "Token expired"
      ) {
        // Token expired, user will be redirected by AuthContext
        return;
      }
      showNotification("Une erreur réseau est survenue", "error");
    }
  };

  // Enhanced subscription fetch with token handling
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user?.id) return;
      try {
        const res = await makeAuthenticatedRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/user/${user.id}`
        );

        if (!res.ok) {
          throw new Error("Aucune souscription trouvée");
        }

        const data = await res.json();
        setSubscription(data);
      } catch (err) {
        if (
          typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as any).message === "string" &&
          (err as any).message === "Token expired"
        ) {
          // Token expired, user will be redirected by AuthContext
          return;
        }
        setSubscription(null);
      }
    };

    fetchSubscription();
  }, [user, makeAuthenticatedRequest]);

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

  const openModal = (
    type: "service" | "bien",
    mode: "create" | "view" | "edit" = "create",
    service?: Service
  ) => {
    setModalType(type);
    setModalMode(mode);
    setSelectedService(service || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setModalMode("create");
  };

  const handleServiceClick = (service: Service) => {
    const serviceType = service.type as "service" | "bien";
    openModal(serviceType, "view", service);
  };

  const handleDepublished = async () => {
    // Refresh the services list
    await handleCreated();
  };

  const handleUpdated = async () => {
    console.log("=== PROFILE PAGE UPDATE CALLBACK ===");
    // Refresh the services/biens data
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

        console.log("Updated services count:", services.length);
        console.log("Updated biens count:", biens.length);

        setUserServices(mapWithImages(services));
        setUserBiens(mapWithImages(biens));
      }
    } catch (err) {
      console.error("Error refreshing services after update:", err);
    }
  };

  const mapWithImages = (items: any[]) =>
    items.map((item) => ({
      ...item,
      primaryImageUrl: item.primaryImageUrl || "", // needed for display
      images: item.images || [],
      location: item.vendor?.city || "Non spécifié",
      rating: 4,
    }));

  // Enhanced profile data loading with token handling
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

          setUserServices(mapWithImages(services));
          setUserBiens(mapWithImages(biens));
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

    if (user?.id) {
      fetchProfileData();
    }
    console.log("User ID:", user);
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
      console.error("Erreur lors du rechargement des services:", err);
    }
  };
  // If user is not authenticated, AuthContext will handle redirect
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#38AC8E]"></div>
      </div>
    );
  }

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

      {/* Services Tab - Now with proper authentication check */}
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
                              onClick={() => handleServiceClick(service)}
                            >
                              <div className="w-full h-48 bg-white rounded-lg mb-2 transition-all duration-300 group-hover:shadow-lg relative overflow-hidden border border-gray-200">
                                {/* Service display content */}
                                <div className="flex items-center justify-center h-full w-full ">
                                  {service.primaryImageUrl ? (
                                    <Image
                                      src={getFullImageUrl(
                                        service.primaryImageUrl
                                      )}
                                      alt={service.title}
                                      fill
                                      className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full w-full bg-gray-100">
                                      <Image
                                        src="/logo.jpg"
                                        alt="Logo placeholder"
                                        width={120}
                                        height={120}
                                        className="object-contain"
                                      />
                                    </div>
                                  )}
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
                                          className="object-cover ml-2 w-6 h-5"
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
                              onClick={() => handleServiceClick(bien)}
                            >
                              <div className="w-full h-48 bg-white rounded-lg mb-2 transition-all duration-300 group-hover:shadow-lg relative overflow-hidden border border-gray-200">
                                {/* Bien display content */}
                                <div className="flex items-center justify-center h-full w-full ">
                                  {bien.primaryImageUrl ? (
                                    <Image
                                      src={getFullImageUrl(
                                        bien.primaryImageUrl
                                      )}
                                      alt={bien.title}
                                      fill
                                      className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full w-full bg-gray-100">
                                      <Image
                                        src="/logo.jpg"
                                        alt="Logo placeholder"
                                        width={120}
                                        height={120}
                                        className="object-contain"
                                      />
                                    </div>
                                  )}
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
                                          className="object-cover ml-2 w-6 h-5"
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
          <SubscriptionRequired />
        ))}

      {/* Modal */}
      {showModal && modalType && user && (
        <ServiceModal
          type={modalType}
          vendorId={user.id}
          onClose={closeModal}
          onCreated={handleCreated}
          onUpdated={handleUpdated}
          onDepublished={handleDepublished}
          mode={modalMode}
          serviceData={selectedService}
        />
      )}

      {/* Notification Component */}
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
          {/* Referral Banner */}
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
                    <span>personnes (jusqu'à 100 personnes)</span>
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
                <div>
                  <p className="text-gray-600 text-sm mb-1">
                    Nombre de parrainage
                  </p>
                  <p>{user?.userInfo?.nombreDeParrainage}</p>
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
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // Enhanced validation
                        const validation = validateImageFile(file);
                        if (!validation.isValid) {
                          showNotification(validation.error!, "error");
                          // Clear the input
                          if (imageInputRef.current) {
                            imageInputRef.current.value = "";
                          }
                          return;
                        }

                        let finalFile = file;

                        // Handle HEIC conversion
                        if (
                          file.type === "image/heic" ||
                          file.type === "image/heif" ||
                          file.name.toLowerCase().endsWith(".heic")
                        ) {
                          try {
                            const heic2any = (await import("heic2any")).default;
                            const convertedBlob = await heic2any({
                              blob: file,
                              toType: "image/jpeg",
                              quality: 0.8,
                            });

                            finalFile = new File(
                              [convertedBlob as BlobPart],
                              file.name.replace(/\.heic$/, ".jpg"),
                              { type: "image/jpeg" }
                            );

                            showNotification(
                              "Image HEIC convertie avec succès",
                              "success"
                            );
                          } catch (err) {
                            console.error("Erreur de conversion HEIC :", err);
                            showNotification(
                              "Erreur lors de la conversion HEIC. Veuillez utiliser un autre format.",
                              "error"
                            );
                            if (imageInputRef.current) {
                              imageInputRef.current.value = "";
                            }
                            return;
                          }
                        }

                        // Validate the final file size after conversion
                        const finalValidation = validateImageFile(finalFile);
                        if (!finalValidation.isValid) {
                          showNotification(finalValidation.error!, "error");
                          if (imageInputRef.current) {
                            imageInputRef.current.value = "";
                          }
                          return;
                        }

                        setImagePreview(URL.createObjectURL(finalFile));

                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(finalFile);
                        if (imageInputRef.current) {
                          imageInputRef.current.files = dataTransfer.files;
                        }
                      }}
                    />
                  </>
                )}
              </div>
              {isEditing && (
                <p className="text-xs text-gray-500 mt-2">
                  Formats supportés: JPG, PNG, WebP, HEIC • Taille maximum: 10MB
                </p>
              )}
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
                      type="email"
                      defaultValue={user?.email}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#38AC8E] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm mb-1 block">
                      Ville
                    </label>
                    <input
                      name="city"
                      defaultValue={user?.userInfo?.city}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#38AC8E] focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#38AC8E] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm mb-1 block">
                      Nom
                    </label>
                    <input
                      name="lastName"
                      defaultValue={user?.lastName}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#38AC8E] focus:border-transparent"
                      required
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
                      className={`w-full border rounded-lg p-2 transition-colors duration-150 focus:ring-2 focus:ring-[#38AC8E] focus:border-transparent ${
                        password === "" && confirmPassword === ""
                          ? "border-gray-300"
                          : password === confirmPassword && password.length >= 6
                          ? "border-green-500"
                          : "border-red-500"
                      }`}
                      placeholder="Laissez vide pour ne pas changer"
                    />
                    {password && password.length < 6 && (
                      <p className="text-xs text-red-600 mt-1">
                        Le mot de passe doit contenir au moins 6 caractères
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm mb-1 block">
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full border rounded-lg p-2 transition-colors duration-150 focus:ring-2 focus:ring-[#38AC8E] focus:border-transparent ${
                        password === "" && confirmPassword === ""
                          ? "border-gray-300"
                          : password === confirmPassword && password.length >= 6
                          ? "border-green-500"
                          : "border-red-500"
                      }`}
                      placeholder="Confirmez le nouveau mot de passe"
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-sm text-red-600 mt-1 col-span-2">
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                  {password &&
                    confirmPassword &&
                    password === confirmPassword &&
                    password.length >= 6 && (
                      <p className="text-sm text-green-600 mt-1 col-span-2">
                        Les mots de passe correspondent
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
              {isActive ? (
                <button
                  disabled
                  className="w-full py-2 rounded-xl mb-6 bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  Déjà abonné
                </button>
              ) : (
                <StripeSubscribeButton
                  buttonText="Souscrire maintenant"
                  className="w-full py-2 rounded-xl mb-6 bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                />
              )}

              <div className="text-center">
                <p className="text-sm text-gray-700 font-medium mb-1">
                  ÉTAT DE L'ABONNEMENT
                </p>
                {subscription ? (
                  <p className="text-sm text-gray-500">
                    Renouvellement prévu le{" "}
                    {new Date(subscription.endDate).toLocaleDateString("fr-FR")}
                  </p>
                ) : (
                  <p className="text-red-500">Aucune souscription active</p>
                )}
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-2xl p-4 pt-2 border border-gray-200">
              <h2 className="text-gray-900 font-medium mb-4 pb-2 border-b border-gray-300">
                Historique de paiements
              </h2>
              <table className="text-sm">
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
                  </tr>
                </thead>
                <tbody>
                  {subscription ? (
                    <tr>
                      <td className="py-2 pt-1 pr-6 font-semibold">
                        {new Date(subscription.startDate).toLocaleDateString(
                          "fr-FR"
                        )}
                      </td>
                      <td className="py-2 pt-1 pr-6 font-semibold">
                        Abonnement annuel e-change
                      </td>
                      <td className="py-2 pt-1 pr-6 font-semibold">20 €</td>
                    </tr>
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center text-gray-500 py-4"
                      >
                        Aucune souscription trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
