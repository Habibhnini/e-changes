"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";
import { Service } from "@/app/api/services/routes";
import ServiceCard from "../../explorer/ServiceCard";

interface Vendor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  referralCode?: string;
  energyBalance?: number;
  userInfo: {
    city?: string;
    photoIdPath?: string;
  };
}

export default function VendorProfilePage() {
  const { id } = useParams();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const token = localStorage.getItem("token"); // Or however you store your JWT
        const headers = {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        };

        const [userRes, serviceRes] = await Promise.all([
          fetch(`/api/user/${id}`, { headers }),
          fetch(`/api/service?vendorId=${id}`, { headers }),
        ]);

        const userData = await userRes.json();
        const serviceData = await serviceRes.json();

        setVendor(userData);
        console.log("Vendor Data:", userData);
        setServices(serviceData.services || []);
      } catch (err) {
        // console.error("Erreur lors du chargement du profil vendeur:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVendorData();
  }, [id]);

  const getFullImageUrl = (path?: string) => {
    if (!path) return "/placeholder.png";
    return path.startsWith("http")
      ? path
      : `${process.env.NEXT_PUBLIC_API_URL}${path}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#38AC8E]" />
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-gray-50 z-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Connexion requise
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Vous devez être connecté pour accéder aux profils des vendeurs.
                Veuillez vous connecter ou créer un compte pour continuer.
              </p>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => (window.location.href = "/auth")}
                  className="w-full bg-[#38AC8E] hover:bg-teal-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => (window.location.href = "/auth")}
                  className="w-full bg-white hover:bg-gray-50 text-[#38AC8E] font-medium py-3 px-6 rounded-lg border-2 border-[#38AC8E] transition-colors duration-200"
                >
                  Créer un compte
                </button>
              </div>

              {/* Back link */}
              <div className="mt-4">
                <button
                  onClick={() => window.history.back()}
                  className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                >
                  Retour à la page précédente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="text-center text-gray-500 mt-20">Vendeur non trouvé.</div>
    );
  }

  const vendorServices = services.filter((s) => s.type === "service");
  const vendorBiens = services.filter((s) => s.type === "bien");

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Vendor Info */}
        <div className="w-full sm:w-72 bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow self-start">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 relative mb-4">
              <Image
                src={getFullImageUrl(vendor.userInfo?.photoIdPath)}
                alt="Profil"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {vendor.firstName} {vendor.lastName}
            </h2>

            <div className="w-full space-y-2 mt-2">
              <div className="flex items-center text-sm">
                <span className="text-gray-500 font-medium w-24">E-mail :</span>
                <span className="text-gray-700">{vendor.email}</span>
              </div>

              <div className="flex items-center text-sm">
                <span className="text-gray-500 font-medium w-24">
                  Localisation :
                </span>
                <span className="text-gray-700">
                  {vendor.userInfo?.city || "Non spécifié"}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <span className="text-gray-500 font-medium w-24">
                  Code de parrainage :
                </span>
                <span className="text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded">
                  {vendor.referralCode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Services and Biens */}
        <div className="sm:w-2/3 space-y-10">
          <div>
            <h3 className="text-xl font-semibold mb-3">Services</h3>
            {vendorServices.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun service trouvé.</p>
            ) : (
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-4 min-w-max">
                  {vendorServices.map((service) => (
                    <div key={service.id} className="w-72 flex-shrink-0">
                      <ServiceCard service={service} isMobile={false} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3">Biens</h3>
            {vendorBiens.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun bien trouvé.</p>
            ) : (
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-4 min-w-max">
                  {vendorBiens.map((service) => (
                    <div key={service.id} className="w-72 flex-shrink-0">
                      <ServiceCard service={service} isMobile={false} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
