"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { IoWarningOutline, IoHeartOutline } from "react-icons/io5";
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
  type: string;
  status: string;
  createdAt: string;
  images?: ServiceImage[]; // Add this line
  primaryImageUrl?: string; // Add this line
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

  // Enhanced handleInterestClick function with better error handling

  const handleInterestClick = async () => {
    if (!isAuthenticated) {
      router.push(
        `/auth?redirect=${encodeURIComponent(`/explorer/service/${id}`)}`
      );
      return;
    }

    if (service?.isOwner) {
      alert(
        "Vous ne pouvez pas démarrer une transaction pour votre propre service."
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

        const token = localStorage.getItem("token"); // Or however you store your JWT token

        const response = await fetch(`/api/messages/new/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add this line to include the JWT token
          },
        });

        // Get the response text for debugging
        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(
            `Failed to create transaction: ${response.status} ${responseText}`
          );
        }

        // Parse the JSON if it's valid
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          throw new Error(`Invalid JSON response: ${responseText}`);
        }

        if (data.redirect && data.transactionId) {
          // If there's an existing transaction, redirect to it
          router.push(`/chat?transaction=${data.transactionId}`);
        } else if (data.transaction && data.transaction.id) {
          // If a new transaction was created, redirect to chat with new transaction
          router.push(`/chat?transaction=${data.transaction.id}`);
        } else {
          throw new Error(`Invalid response format: ${JSON.stringify(data)}`);
        }
      }
    } catch (err) {
      //  console.error("Error starting transaction:", err);
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

  // Format date to relative time (e.g., "il y a 15 heures")
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
          Services
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
        {/* Action buttons at the top right */}

        {/* Main content area */}
        <div className="flex flex-col flex-1">
          {/* Main content grid */}
          <div className="flex flex-row gap-6">
            {/* Main image with thumbnails on the left */}
            <div className="w-1/3 flex">
              {/* Thumbnails next to the image */}
              <ImageGallery
                images={service.images || []}
                title={service.title}
                isMobile={false}
              />
            </div>

            {/* Service summary */}
            <div className="w-2/3">
              <div className="mb-4">
                <h1 className="text-2xl font-medium">{service.title}</h1>
                <div className="flex items-center">
                  <h2 className="text-xl font-medium text-yellow-500">
                    {service.price}{" "}
                  </h2>
                  <Image
                    src="/coin.png"
                    alt="Energy coins"
                    width={40}
                    height={40}
                    className="object-cover ml-2 w-5 h-5"
                  />
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
                    <dd className="w-4/5">{service.type}</dd>
                  </div>
                  <div className="flex mb-1">
                    <dt className="text-gray-600 w-1/5">Category</dt>
                    <dd className="w-4/5">{service.category.name} </dd>
                  </div>
                  <div className="flex mb-1">
                    <dt className="text-gray-600 w-1/5">Statut</dt>
                    <dd className="w-4/5">{service.status}</dd>
                  </div>
                </dl>
              </div>

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
                      src={getFullImageUrl(service.vendor.profileImage)}
                      alt="User profile"
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <div className="font-medium mr-2">
                        {service.vendor.firstName} {service.vendor.lastName}
                      </div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {service.vendor.email}
                    </span>
                  </div>
                </div>

                {/* Action buttons - moved to same line as user name */}
                <div className="flex space-x-3">
                  {user?.id !== service.vendor.id && (
                    <div className="flex space-x-3">
                      <Link href={`/profile/${service.vendor.id}`}>
                        <button className="border border-[#38AC8E] text-[#38AC8E] py-2 px-4 rounded-full font-medium text-sm cursor-pointer hover:bg-[#38AC8E] hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95">
                          Voir le profil
                        </button>
                      </Link>

                      <button
                        onClick={handleInterestClick}
                        className="bg-[#38AC8E] text-white py-2 px-4 rounded-full font-medium text-sm cursor-pointer hover:bg-[#2D8A70] transition-colors duration-300 ease-in-out transform hover:scale-105 active:scale-95"
                      >
                        {service.transaction
                          ? "Continuer la conversation"
                          : "Je suis intéressé"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Service details section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-lg mb-3">Détails</h3>
            <p className="text-gray-700">{service.description}</p>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden">
        {/* Mobile action buttons */}

        {/* Main image */}
        <div className="mb-4">
          <ImageGallery
            images={service.images || []}
            title={service.title}
            isMobile={true}
          />
        </div>

        {/* Thumbnails below the image */}

        {/* Title and category - moved right above resume */}
        <div className="mb-4">
          <h1 className="text-xl font-medium">{service.title}</h1>
          <div className="flex items-center">
            <h2 className="text-lg font-medium text-yellow-500">
              {service.price}
            </h2>
            <Image
              src="/coin.png"
              alt="Energy coins"
              width={20}
              height={20}
              className="ml-1"
            />
          </div>
          <p className="text-gray-500 text-sm">
            Posté {formatRelativeTime(service.createdAt)}
          </p>
        </div>

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

        {/* Mobile resume section */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Résumé</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-gray-600">Type</div>
            <div>{service.type}</div>
            <div className="text-gray-600">Category</div>
            <div>{service.category.name} </div>
            <div className="text-gray-600">Statut</div>
            <div>{service.status}</div>
          </div>
        </div>

        {/* Mobile user profile with buttons below user info */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="flex flex-col">
            <div className="flex items-center mb-3 cursor-pointer hover:opacity-90 transition-opacity duration-200">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 mr-3">
                <Image
                  src={getFullImageUrl(service.vendor.profileImage)}
                  alt="User profile"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center">
                  <div className="font-medium mr-2">
                    {service.vendor.firstName} {service.vendor.lastName}{" "}
                  </div>
                  <div className="flex">
                    {renderStars(service.vendor.rating)}
                  </div>
                </div>
                <span className="text-xs text-gray-600">
                  {service.vendor.email}
                </span>
              </div>
            </div>

            {/* Mobile action buttons - now below user info with bigger size */}
            <div className="flex space-x-3 w-full">
              <Link href={`/profile/${service.vendor.id}`} className="flex-1">
                <button className="border border-teal-500 text-teal-500 py-2 px-4 rounded-full text-sm w-full cursor-pointer hover:bg-teal-500 hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95">
                  Voir profil
                </button>
              </Link>

              {!service.isOwner && (
                <button
                  onClick={handleInterestClick}
                  className="bg-[#38AC8E] text-white py-2 px-4 rounded-full text-sm flex-1 w-full cursor-pointer hover:bg-[#2D8A70] transition-colors duration-300 ease-in-out transform hover:scale-105 active:scale-95"
                >
                  {service.transaction ? "Continuer" : "Intéressé"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile details section */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-medium mb-3">Détails</h3>
          <p className="text-gray-700 text-sm">{service.description}</p>
        </div>
      </div>
    </div>
  );
}
