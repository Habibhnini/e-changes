"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FaStar } from "react-icons/fa";
import {
  IoWarningOutline,
  IoHeartOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoAlertCircleOutline,
} from "react-icons/io5";
import { PiShareFat } from "react-icons/pi";
import { useAuth } from "../../../contexts/AuthContext";
import apiClient from "../../../api/apiClient";
import ImageGallery from "@/app/components/ImageGallery";

interface ServiceImage {
  id: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface ServiceDetail {
  id: number;
  title: string;
  description: string;
  price: number;
  budget?: number; // For announcements
  type: string;
  status: string;
  createdAt: string;
  images?: ServiceImage[];
  primaryImageUrl?: string;
  // Announcement-specific fields
  deadline?: string;
  location?: string;
  urgency?: "low" | "medium" | "high" | "urgent";
  requirements?: string;
  isNegotiable?: boolean;
  category: {
    id: number;
    name: string;
  };
  vendor: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    rating: number;
  };
  requester?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    rating: number;
  };
  transaction?: {
    id: number;
    status: string;
    createdAt: string;
  } | null;
  isOwner?: boolean;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch service data when component mounts
  useEffect(() => {
    const fetchServiceDetail = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getServiceDetail(id);

        // Log each image in the array
        if (data.images && data.images.length > 0) {
          data.images.forEach((img, index) => {});
        } else {
        }

        setService(data);
      } catch (err) {
        setError("Failed to load service details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchServiceDetail();
    }
  }, [id]);

  const getFullImageUrl = (path: string): string => {
    if (!path) return "/placeholder.png"; // fallback
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  };

  const handleInterestClick = async () => {
    if (!isAuthenticated) {
      router.push(
        `/auth?redirect=${encodeURIComponent(`/explorer/service/${id}`)}`
      );
      return;
    }

    if (service?.isOwner) {
      const itemType =
        service.type === "announcement"
          ? "annonce"
          : service.type === "bien"
          ? "bien"
          : "service";
      alert(
        `Vous ne pouvez pas démarrer une transaction pour votre propre ${itemType}.`
      );
      return;
    }

    setLoading(true);
    try {
      if (service?.transaction) {
        // If transaction already exists, redirect to the chat page with transaction ID
        router.push(`/chat?transaction=${service.transaction.id}`);
      } else {
        // Create a new transaction
        const token = localStorage.getItem("token");

        const response = await fetch(`/api/messages/new/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(
            `Failed to create transaction: ${response.status} ${responseText}`
          );
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          throw new Error(`Invalid JSON response: ${responseText}`);
        }

        if (data.redirect && data.transactionId) {
          router.push(`/chat?transaction=${data.transactionId}`);
        } else if (data.transaction && data.transaction.id) {
          router.push(`/chat?transaction=${data.transaction.id}`);
        } else {
          throw new Error(`Invalid response format: ${JSON.stringify(data)}`);
        }
      }
    } catch (err) {
      setError(`Failed to start transaction: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  // Get the appropriate user object based on service type
  const getServiceUser = () => {
    if (service?.type === "announcement") {
      return service.requester || service.vendor; // Fallback to vendor if requester not available
    }
    return service?.vendor;
  };

  // Get display text based on service type
  const getServiceTypeText = () => {
    switch (service?.type) {
      case "announcement":
        return "Demande";
      case "bien":
        return "Bien";
      case "service":
        return "Service";
      default:
        return service?.type || "Service";
    }
  };

  // Get price display based on service type
  const getPriceDisplay = () => {
    if (service?.type === "announcement") {
      return service.budget || service.price || 0;
    }
    return service?.price || 0;
  };

  // Get price label based on service type
  const getPriceLabel = () => {
    return service?.type === "announcement" ? "Budget maximum" : "Prix";
  };

  // Get button text based on service type
  const getButtonText = () => {
    if (service?.type === "announcement") {
      return service.transaction
        ? "Continuer la conversation"
        : "Répondre à la demande";
    }
    return service?.transaction
      ? "Continuer la conversation"
      : "Je suis intéressé";
  };

  // Get urgency badge color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get urgency label
  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "Urgent";
      case "high":
        return "Priorité haute";
      case "medium":
        return "Priorité moyenne";
      case "low":
        return "Priorité basse";
      default:
        return urgency;
    }
  };

  // Get type badge color and styling
  const getTypeBadge = () => {
    switch (service?.type) {
      case "announcement":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "bien":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "service":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#38AC8E]"></div>
      </div>
    );
  }

  // Show error state
  if (error || !service) {
    return (
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || "Service not found"}
        </div>
        <div className="mt-4">
          <Link href="/explorer" className="text-[#38AC8E] hover:underline">
            &larr; Back to services
          </Link>
        </div>
      </div>
    );
  }

  // Format date to relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "il y a quelques secondes";
    if (diffInSeconds < 3600)
      return `il y a ${Math.floor(diffInSeconds / 60)} minutes`;
    if (diffInSeconds < 86400)
      return `il y a ${Math.floor(diffInSeconds / 3600)} heures`;
    return `il y a ${Math.floor(diffInSeconds / 86400)} jours`;
  };

  // Format transaction status
  const formatTransactionStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      created: "Créée",
      negotiation: "En négociation",
      success: "Acceptée",
      delivery: "En livraison",
      validation: "En validation",
      completed: "Terminée",
      failure: "Échouée",
      cancelled: "Annulée",
    };

    return statusMap[status] || status;
  };

  const serviceUser = getServiceUser();

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Breadcrumb navigation */}
      <nav className="flex py-3 text-sm text-gray-600">
        <Link
          href="/accueil"
          className="hover:text-gray-900 transition-colors duration-200 ease-in-out cursor-pointer"
        >
          Accueil
        </Link>
        <span className="mx-2">{">"}</span>
        <Link
          href="/explorer"
          className="hover:text-gray-900 transition-colors duration-200 ease-in-out cursor-pointer"
        >
          {service.type === "announcement"
            ? "Annonces"
            : service.type === "bien"
            ? "Biens"
            : "Services"}
        </Link>
        <span className="mx-2">{">"}</span>
        <Link
          href={`/explorer?category=${service.category.id}`}
          className="hover:text-gray-900 transition-colors duration-200 ease-in-out cursor-pointer"
        >
          {service.category.name}
        </Link>
        <span className="mx-2">{">"}</span>
        <span className="text-gray-800">{service.title}</span>
      </nav>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Main content area */}
        <div className="flex flex-col flex-1">
          {/* Type indicator banner */}
          <div className="mb-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeBadge()}`}
            >
              {getServiceTypeText()}
            </span>
          </div>

          {/* Main content grid */}
          <div className="flex flex-row gap-6">
            {/* Main image with thumbnails on the left */}
            <div className="w-1/3 flex">
              <ImageGallery
                images={service.images || []}
                title={service.title}
                isMobile={false}
              />
            </div>

            {/* Service summary */}
            <div className="w-2/3">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-medium">{service.title}</h1>
                  {service.type === "announcement" && service.urgency && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                        service.urgency
                      )}`}
                    >
                      {getUrgencyLabel(service.urgency)}
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <h2 className="text-xl font-medium text-yellow-500">
                    {getPriceDisplay()}{" "}
                  </h2>
                  <Image
                    src="/coin.png"
                    alt="Energy coins"
                    width={40}
                    height={40}
                    className="object-cover ml-2 w-6 h-5"
                  />
                  {service.type === "announcement" && service.isNegotiable && (
                    <span className="ml-2 text-sm text-gray-600">
                      (négociable)
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">
                  Posté {formatRelativeTime(service.createdAt)}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Résumé</h3>
                <dl className="text-sm">
                  <div className="flex mb-1">
                    <dt className="text-gray-600 w-1/5">Type</dt>
                    <dd className="w-4/5">{getServiceTypeText()}</dd>
                  </div>
                  <div className="flex mb-1">
                    <dt className="text-gray-600 w-1/5">Catégorie</dt>
                    <dd className="w-4/5">{service.category.name}</dd>
                  </div>
                  <div className="flex mb-1">
                    <dt className="text-gray-600 w-1/5">{getPriceLabel()}</dt>
                    <dd className="w-4/5 flex items-center">
                      {getPriceDisplay()}
                      <Image
                        src="/coin.png"
                        alt="Energy coins"
                        width={20}
                        height={16}
                        className="ml-1"
                      />
                      {service.type === "announcement" &&
                        service.isNegotiable && (
                          <span className="ml-2 text-gray-600">
                            (négociable)
                          </span>
                        )}
                    </dd>
                  </div>
                  <div className="flex mb-1">
                    <dt className="text-gray-600 w-1/5">Statut</dt>
                    <dd className="w-4/5 capitalize">{service.status}</dd>
                  </div>
                  {service.type === "announcement" && (
                    <>
                      {service.location && (
                        <div className="flex mb-1">
                          <dt className="text-gray-600 w-1/5">Localisation</dt>
                          <dd className="w-4/5 flex items-center">
                            <IoLocationOutline className="mr-1" />
                            {service.location}
                          </dd>
                        </div>
                      )}
                      {service.deadline && (
                        <div className="flex mb-1">
                          <dt className="text-gray-600 w-1/5">Échéance</dt>
                          <dd className="w-4/5 flex items-center">
                            <IoCalendarOutline className="mr-1" />
                            {new Date(service.deadline).toLocaleDateString(
                              "fr-FR"
                            )}
                          </dd>
                        </div>
                      )}
                      {service.urgency && (
                        <div className="flex mb-1">
                          <dt className="text-gray-600 w-1/5">Urgence</dt>
                          <dd className="w-4/5">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                                service.urgency
                              )}`}
                            >
                              {getUrgencyLabel(service.urgency)}
                            </span>
                          </dd>
                        </div>
                      )}
                    </>
                  )}
                </dl>
              </div>

              {/* Show announcement requirements if exists */}
              {service.type === "announcement" && service.requirements && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium mb-2 flex items-center">
                    <IoAlertCircleOutline className="mr-2 text-blue-600" />
                    Exigences particulières
                  </h3>
                  <p className="text-sm text-gray-700">
                    {service.requirements}
                  </p>
                </div>
              )}

              {/* Show transaction info if exists */}
              {service.transaction && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-medium mb-2">Transaction en cours</h3>
                  <div className="flex items-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.transaction.status === "created"
                          ? "bg-blue-100 text-blue-800"
                          : service.transaction.status === "negotiation"
                          ? "bg-purple-100 text-purple-800"
                          : service.transaction.status === "success"
                          ? "bg-green-100 text-green-800"
                          : service.transaction.status === "delivery"
                          ? "bg-orange-100 text-orange-800"
                          : service.transaction.status === "validation"
                          ? "bg-yellow-100 text-yellow-800"
                          : service.transaction.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {formatTransactionStatus(service.transaction.status)}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatRelativeTime(service.transaction.createdAt)}
                    </span>
                  </div>
                </div>
              )}

              {/* User profile section with buttons on same line */}
              <div className="py-2 flex justify-between items-center">
                <div className="flex items-center cursor-pointer hover:opacity-90 transition-opacity duration-200">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 mr-3">
                    <Image
                      src={getFullImageUrl(serviceUser?.profileImage || "")}
                      alt="User profile"
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <div className="font-medium mr-2">
                        {serviceUser?.firstName} {serviceUser?.lastName}
                      </div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {serviceUser?.email}
                    </span>
                  </div>
                </div>

                {/* Action buttons - Keep same styling for all types */}
                <div className="flex space-x-3">
                  {user?.id !== serviceUser?.id && (
                    <div className="flex space-x-3">
                      <Link href={`/profile/${serviceUser?.id}`}>
                        <button className="border border-[#38AC8E] text-[#38AC8E] py-2 px-4 rounded-full font-medium text-sm cursor-pointer hover:bg-[#38AC8E] hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95">
                          Voir le profil
                        </button>
                      </Link>

                      <button
                        onClick={handleInterestClick}
                        className="bg-[#38AC8E] text-white py-2 px-4 rounded-full font-medium text-sm cursor-pointer hover:bg-[#2D8A70] transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
                      >
                        {getButtonText()}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Service details section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-lg mb-3">
              {service.type === "announcement"
                ? "Description de la demande"
                : service.type === "bien"
                ? "Description du bien"
                : "Détails du service"}
            </h3>
            <p className="text-gray-700">{service.description}</p>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden">
        {/* Type indicator banner */}
        <div className="mb-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeBadge()}`}
          >
            {getServiceTypeText()}
          </span>
        </div>

        {/* Main image */}
        <div className="mb-4">
          <ImageGallery
            images={service.images || []}
            title={service.title}
            isMobile={true}
          />
        </div>

        {/* Title and category */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl font-medium">{service.title}</h1>
            {service.type === "announcement" && service.urgency && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                  service.urgency
                )}`}
              >
                {getUrgencyLabel(service.urgency)}
              </span>
            )}
          </div>
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-yellow-500">
              {getPriceDisplay()}
            </h2>
            <Image
              src="/coin.png"
              alt="Energy coins"
              width={24}
              height={20}
              className="ml-1"
            />
            {service.type === "announcement" && service.isNegotiable && (
              <span className="ml-2 text-sm text-gray-600">(négociable)</span>
            )}
          </div>
          <p className="text-gray-500 text-sm">
            Posté {formatRelativeTime(service.createdAt)}
          </p>
        </div>

        {/* Show announcement requirements if exists */}
        {service.type === "announcement" && service.requirements && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium mb-2 flex items-center">
              <IoAlertCircleOutline className="mr-2 text-blue-600" />
              Exigences particulières
            </h3>
            <p className="text-sm text-gray-700">{service.requirements}</p>
          </div>
        )}

        {/* Show transaction info if exists */}
        {service.transaction && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-2">Transaction en cours</h3>
            <div className="flex items-center">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  service.transaction.status === "created"
                    ? "bg-blue-100 text-blue-800"
                    : service.transaction.status === "negotiation"
                    ? "bg-purple-100 text-purple-800"
                    : service.transaction.status === "success"
                    ? "bg-green-100 text-green-800"
                    : service.transaction.status === "delivery"
                    ? "bg-orange-100 text-orange-800"
                    : service.transaction.status === "validation"
                    ? "bg-yellow-100 text-yellow-800"
                    : service.transaction.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {formatTransactionStatus(service.transaction.status)}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {formatRelativeTime(service.transaction.createdAt)}
              </span>
            </div>
          </div>
        )}

        {/* Mobile resume section - Expanded for announcements */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Résumé</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-gray-600">Type</div>
            <div>{getServiceTypeText()}</div>
            <div className="text-gray-600">Catégorie</div>
            <div>{service.category.name}</div>
            <div className="text-gray-600">{getPriceLabel()}</div>
            <div className="flex items-center">
              {getPriceDisplay()}
              <Image
                src="/coin.png"
                alt="Energy coins"
                width={16}
                height={14}
                className="ml-1"
              />
              {service.type === "announcement" && service.isNegotiable && (
                <span className="ml-1 text-xs text-gray-600">(négociable)</span>
              )}
            </div>
            <div className="text-gray-600">Statut</div>
            <div className="capitalize">{service.status}</div>
            {service.type === "announcement" && (
              <>
                {service.location && (
                  <>
                    <div className="text-gray-600">Localisation</div>
                    <div className="flex items-center">
                      <IoLocationOutline className="mr-1" />
                      {service.location}
                    </div>
                  </>
                )}
                {service.deadline && (
                  <>
                    <div className="text-gray-600">Échéance</div>
                    <div className="flex items-center">
                      <IoCalendarOutline className="mr-1" />
                      {new Date(service.deadline).toLocaleDateString("fr-FR")}
                    </div>
                  </>
                )}
                {service.urgency && (
                  <>
                    <div className="text-gray-600">Urgence</div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                          service.urgency
                        )}`}
                      >
                        {getUrgencyLabel(service.urgency)}
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile user profile with buttons below user info */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="flex flex-col">
            <div className="flex items-center mb-3 cursor-pointer hover:opacity-90 transition-opacity duration-200">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 mr-3">
                <Image
                  src={getFullImageUrl(serviceUser?.profileImage || "")}
                  alt="User profile"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center">
                  <div className="font-medium mr-2">
                    {serviceUser?.firstName} {serviceUser?.lastName}
                  </div>
                  <div className="flex">
                    {renderStars(serviceUser?.rating || 0)}
                  </div>
                </div>
                <span className="text-xs text-gray-600">
                  {serviceUser?.email}
                </span>
              </div>
            </div>

            {/* Mobile action buttons - Keep same styling for all types */}
            <div className="flex space-x-3 w-full">
              <Link href={`/profile/${serviceUser?.id}`} className="flex-1">
                <button className="border border-[#38AC8E] text-[#38AC8E] py-2 px-4 rounded-full text-sm w-full cursor-pointer hover:bg-[#38AC8E] hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95">
                  Voir profil
                </button>
              </Link>

              {!service.isOwner && (
                <button
                  onClick={handleInterestClick}
                  className="bg-[#38AC8E] text-white py-2 px-4 rounded-full text-sm flex-1 w-full cursor-pointer hover:bg-[#2D8A70] transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
                >
                  {service.transaction
                    ? "Continuer"
                    : service.type === "announcement"
                    ? "Répondre"
                    : "Intéressé"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile details section */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-medium mb-3">
            {service.type === "announcement"
              ? "Description de la demande"
              : service.type === "bien"
              ? "Description du bien"
              : "Détails du service"}
          </h3>
          <p className="text-gray-700 text-sm">{service.description}</p>
        </div>
      </div>
    </div>
  );
}
