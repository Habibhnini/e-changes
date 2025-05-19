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
  const { user } = useAuth();

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const [userRes, serviceRes] = await Promise.all([
          fetch(`/api/user/${id}`),
          fetch(`/api/service?vendorId=${id}`),
        ]);

        const userData = await userRes.json();
        const serviceData = await serviceRes.json();

        setVendor(userData);
        setServices(serviceData.services || []);
      } catch (err) {
        console.error("Erreur lors du chargement du profil vendeur:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVendorData();
  }, [id]);

  const getFullImageUrl = (path?: string) => {
    if (!path) return "/placeholder.png";
    return path.startsWith("http") ? path : `http://localhost:8096${path}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#38AC8E]" />
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
                <span className="text-gray-500 font-medium w-24">Email:</span>
                <span className="text-gray-700">{vendor.email}</span>
              </div>

              <div className="flex items-center text-sm">
                <span className="text-gray-500 font-medium w-24">
                  Location:
                </span>
                <span className="text-gray-700">
                  {vendor.userInfo?.city || "Not specified"}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <span className="text-gray-500 font-medium w-24">
                  Referral Code:
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
                    <ServiceCard
                      key={service.id}
                      service={service}
                      isMobile={false}
                    />
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
                    <ServiceCard
                      key={service.id}
                      service={service}
                      isMobile={false}
                    />
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
