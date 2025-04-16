// app/explorer/service/[id]/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { IoWarningOutline, IoHeartOutline } from "react-icons/io5";
import { PiShareFat } from "react-icons/pi";

export default function ServiceDetailPage() {
  // Use the useParams hook to get the id parameter
  const params = useParams();
  const id = params?.id as string;

  // Mock service data (in a real app, this would come from an API based on the ID)
  const service = {
    id: id,
    title: "Titre de l'annonce",
    category: "100 énergies",
    postedTime: "il y a 15 heures",
    details: {
      type: "Vélo",
      quantity: "1 PCE",
      material: "Non défini",
      condition: "Comme neuf",
      location: "Vichy",
    },
    fullDescription:
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga",
    user: {
      name: "Julie A",
      profileImage: "/profile-placeholder.jpg",
      announcements: 2,
      rating: 4,
    },
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
          href="/services"
          className="hover:text-gray-900 transition-colors duration-200 ease-in-out cursor-pointer"
        >
          Services
        </Link>
        <span className="mx-2">{">"}</span>
        <Link
          href="/services/electricien"
          className="hover:text-gray-900 transition-colors duration-200 ease-in-out cursor-pointer"
        >
          Electricien
        </Link>
        <span className="mx-2">{">"}</span>
        <span className="text-gray-800">{service.title}</span>
      </nav>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Action buttons at the top right */}
        <div className="flex justify-end space-x-2 mb-4">
          <button className="p-1 cursor-pointer hover:scale-110 transition-transform duration-200 ease-in-out">
            <IoHeartOutline className="h-6 w-6 text-gray-500 hover:text-red-500 transition-colors duration-200" />
          </button>
          <button className="p-1 cursor-pointer hover:scale-110 transition-transform duration-200 ease-in-out">
            <PiShareFat className="h-6 w-6 text-gray-500 hover:text-blue-500 transition-colors duration-200" />
          </button>
          <button className="p-1 cursor-pointer hover:scale-110 transition-transform duration-200 ease-in-out">
            <IoWarningOutline className="h-6 w-6 text-gray-500 hover:text-yellow-500 transition-colors duration-200" />
          </button>
        </div>

        {/* Main content area */}
        <div className="flex flex-col flex-1">
          {/* Main content grid */}
          <div className="flex flex-row gap-6">
            {/* Main image with thumbnails on the left */}
            <div className="w-1/3 flex">
              {/* Thumbnails next to the image */}
              <div className="flex flex-col gap-2 mr-2">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 bg-[#38AC8E] rounded-md cursor-pointer hover:opacity-80 transition-opacity duration-200 hover:scale-105 ease-in-out"
                  ></div>
                ))}
              </div>

              {/* Main image */}
              <div className="flex-1">
                <div className="relative w-full h-full cursor-pointer hover:opacity-95 transition-opacity duration-200">
                  <Image
                    src="/service-placeholder.png"
                    alt="Service image"
                    width={422}
                    height={282}
                    layout="responsive"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Service summary */}
            <div className="w-2/3">
              <div className="mb-4">
                <h1 className="text-2xl font-medium">{service.title}</h1>
                <h2 className="text-xl font-medium text-yellow-500">
                  {service.category}
                </h2>
                <p className="text-gray-500 text-sm">
                  Posté {service.postedTime}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2">Résumé</h3>
                <dl className="text-sm">
                  <div className="flex mb-1">
                    <dt className="text-gray-600 w-1/5">Type de bien</dt>
                    <dd className="w-4/5">{service.details.type}</dd>
                  </div>
                  <div className="flex mb-1">
                    <dt className="text-gray-600 w-1/5">Quantité</dt>
                    <dd className="w-4/5">{service.details.quantity}</dd>
                  </div>
                  <div className="flex mb-1">
                    <dt className="text-gray-600 w-1/5">Matière du bien</dt>
                    <dd className="w-4/5">{service.details.material}</dd>
                  </div>
                  <div className="flex mb-1">
                    <dt className="text-gray-600 w-1/5">Condition</dt>
                    <dd className="w-4/5">{service.details.condition}</dd>
                  </div>
                  <div className="flex mb-1">
                    <dt className="text-gray-600 w-1/5">Localisation</dt>
                    <dd className="w-4/5">{service.details.location}</dd>
                  </div>
                </dl>
              </div>

              {/* User profile section with buttons on same line */}
              <div className="py-2 flex justify-between items-center">
                <div className="flex items-center cursor-pointer hover:opacity-90 transition-opacity duration-200">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 mr-3">
                    <Image
                      src="/placeholder.png"
                      alt="User profile"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <div className="font-medium mr-2">
                        {service.user.name}
                      </div>
                      <div className="flex">
                        {renderStars(service.user.rating)}
                      </div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {service.user.announcements} annonces
                    </span>
                  </div>
                </div>

                {/* Action buttons - moved to same line as user name */}
                <div className="flex space-x-3">
                  <button className="border border-[#38AC8E] text-[#38AC8E] py-2 px-4 rounded-full font-medium text-sm cursor-pointer hover:bg-[#38AC8E] hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95">
                    Voir le profil
                  </button>
                  <button className="bg-[#38AC8E] text-white py-2 px-4 rounded-full font-medium text-sm cursor-pointer hover:bg-[#2D8A70] transition-colors duration-300 ease-in-out transform hover:scale-105 active:scale-95">
                    Je suis intéressé
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Service details section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-lg mb-3">Détails</h3>
            <p className="text-gray-700">{service.fullDescription}</p>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden">
        {/* Mobile action buttons */}
        <div className="flex justify-end space-x-3 mb-4">
          <button className="p-2 rounded-full  cursor-pointer transform hover:scale-110 active:scale-90 transition-transform duration-200 ease-in-out">
            <IoHeartOutline className="h-5 w-5 text-gray-500 hover:text-red-500 transition-colors duration-200" />
          </button>
          <button className="p-2 rounded-full cursor-pointer transform hover:scale-110 active:scale-90 transition-transform duration-200 ease-in-out">
            <PiShareFat className="h-5 w-5 text-gray-500 hover:text-blue-500 transition-colors duration-200" />
          </button>
          <button className="p-2 rounded-full  cursor-pointer transform hover:scale-110 active:scale-90 transition-transform duration-200 ease-in-out">
            <IoWarningOutline className="h-5 w-5 text-gray-500 hover:text-yellow-500 transition-colors duration-200" />
          </button>
        </div>

        {/* Main image */}
        <div className="mb-4">
          <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden cursor-pointer">
            <div className="relative w-full h-full hover:opacity-90 transition-opacity duration-200">
              <Image
                src="/service-placeholder.png"
                alt="Service image"
                layout="fill"
                objectFit="cover"
              />
            </div>
          </div>
        </div>

        {/* Thumbnails below the image */}
        <div className="flex justify-start gap-2 mb-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="w-10 h-10 bg-[#38AC8E] rounded-md cursor-pointer hover:opacity-80 transition-opacity duration-200 hover:scale-105 ease-in-out"
            ></div>
          ))}
        </div>

        {/* Title and category - moved right above resume */}
        <div className="mb-4">
          <h1 className="text-xl font-medium">{service.title}</h1>
          <h2 className="text-lg font-medium text-yellow-500">
            {service.category}
          </h2>
          <p className="text-gray-500 text-sm">Posté {service.postedTime}</p>
        </div>

        {/* Mobile resume section */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Résumé</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-gray-600">Type de bien</div>
            <div>{service.details.type}</div>
            <div className="text-gray-600">Quantité</div>
            <div>{service.details.quantity}</div>
            <div className="text-gray-600">Matière du bien</div>
            <div>{service.details.material}</div>
            <div className="text-gray-600">Condition</div>
            <div>{service.details.condition}</div>
            <div className="text-gray-600">Localisation</div>
            <div>{service.details.location}</div>
          </div>
        </div>

        {/* Mobile user profile with buttons below user info */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="flex flex-col">
            <div className="flex items-center mb-3 cursor-pointer hover:opacity-90 transition-opacity duration-200">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 mr-3">
                <Image
                  src="/placeholder.png"
                  alt="User profile"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div>
                <div className="flex items-center">
                  <div className="font-medium mr-2">{service.user.name}</div>
                  <div className="flex">{renderStars(service.user.rating)}</div>
                </div>
                <span className="text-xs text-gray-600">
                  {service.user.announcements} annonces
                </span>
              </div>
            </div>

            {/* Mobile action buttons - now below user info with bigger size */}
            <div className="flex space-x-3 w-full">
              <button className="border border-teal-500 text-teal-500 py-2 px-4 rounded-full text-sm flex-1 cursor-pointer hover:bg-teal-500 hover:text-white transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95">
                Voir profil
              </button>
              <button className="bg-[#38AC8E] text-white py-2 px-4 rounded-full text-sm flex-1 cursor-pointer hover:bg-[#2D8A70] transition-colors duration-300 ease-in-out transform hover:scale-105 active:scale-95">
                Intéressé
              </button>
            </div>
          </div>
        </div>

        {/* Mobile details section */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-medium mb-3">Détails</h3>
          <p className="text-gray-700 text-sm">{service.fullDescription}</p>
        </div>
      </div>
    </div>
  );
}
