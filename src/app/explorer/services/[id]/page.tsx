// app/explorer/service/[id]/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function ServiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Mock service data (in a real app, this would come from an API based on the ID)
  const service = {
    id: params.id,
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
        <svg
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Breadcrumb navigation */}
      <nav className="flex py-3 text-sm text-gray-600">
        <Link href="/accueil" className="hover:text-gray-900">
          Accueil
        </Link>
        <span className="mx-2">{">"}</span>
        <Link href="/services" className="hover:text-gray-900">
          Services
        </Link>
        <span className="mx-2">{">"}</span>
        <Link href="/services/electricien" className="hover:text-gray-900">
          Electricien
        </Link>
        <span className="mx-2">{">"}</span>
        <span className="text-gray-800">{service.title}</span>
      </nav>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Action buttons at the top right */}
        <div className="flex justify-end space-x-2 mb-4">
          <button className="p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <button className="p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
          <button className="p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </button>
        </div>

        {/* Main content area */}
        <div className="flex flex-col flex-1">
          {/* Main content grid */}
          <div className="flex flex-row gap-6">
            {/* Main image with thumbnails on the left */}
            <div className="w-1/2 flex">
              {/* Thumbnails next to the image */}
              <div className="flex flex-col gap-2 mr-2">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 bg-teal-500 rounded-md"
                  ></div>
                ))}
              </div>

              {/* Main image */}
              <div className="flex-1">
                <div className="relative w-full h-full mx-auto ">
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
            <div className="w-1/2">
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

              {/* User profile section with buttons on same line */}
              <div className="py-2 flex justify-between items-center">
                <div className="flex items-center">
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
                    <div className="font-medium">{service.user.name}</div>
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {renderStars(service.user.rating)}
                      </div>
                      <span className="text-xs text-gray-600">
                        {service.user.announcements} annonces
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons - moved to same line as user name */}
                <div className="flex space-x-2">
                  <button className="border border-teal-500 text-teal-500 py-1 px-3 rounded-full font-medium text-sm">
                    Voir le profil
                  </button>
                  <button className="bg-teal-500 text-white py-1 px-3 rounded-full font-medium text-sm">
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
          <button className="p-2 rounded-full border border-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <button className="p-2 rounded-full border border-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
          <button className="p-2 rounded-full border border-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </button>
        </div>

        {/* Main image with thumbnails beside it */}
        <div className="flex mb-4">
          {/* Thumbnails beside the image */}
          <div className="flex flex-col gap-2 mr-2">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="w-10 h-10 bg-teal-500 rounded-md"
              ></div>
            ))}
          </div>

          {/* Main image */}
          <div className="flex-1">
            <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
              <div className="relative w-full h-full">
                <Image
                  src="/api/placeholder/400/300"
                  alt="Service image"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </div>
          </div>
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

        {/* Mobile user profile with buttons on same line */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 mr-3">
                <Image
                  src="/api/placeholder/40/40"
                  alt="User profile"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div>
                <div className="font-medium">{service.user.name}</div>
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {renderStars(service.user.rating)}
                  </div>
                  <span className="text-xs text-gray-600">
                    {service.user.announcements} annonces
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile action buttons - now on same line as user */}
            <div className="flex flex-col space-y-2">
              <button className="border border-teal-500 text-teal-500 py-1 px-2 rounded-full text-xs">
                Voir profil
              </button>
              <button className="bg-teal-500 text-white py-1 px-2 rounded-full text-xs">
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
