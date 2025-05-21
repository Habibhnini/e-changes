// ServiceCard.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IoLocationOutline } from "react-icons/io5";
interface ServiceCardProps {
  service: {
    id: number;
    title: string;
    description: string;
    category: string;
    imageUrl: string | null;
    price: number;
    rating: number;
    location: string;
    createdAt: string;
  };
  isMobile: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, isMobile }) => {
  // Format the category to include # before the number if it's in the format Service1, Service2, etc.
  const formattedCategory =
    typeof service.category === "string"
      ? service.category.replace(/(\d+)$/, "#$1")
      : "";

  // Check if the service has a valid image URL and ensure it's not null
  const hasValidImage =
    service.imageUrl &&
    typeof service.imageUrl === "string" &&
    !service.imageUrl.includes("placeholder");

  // Using the same design for both mobile and desktop
  return (
    <Link
      href={`/explorer/services/${service.id}`}
      className="flex flex-col group transform transition-transform duration-300 hover:scale-[1.03]"
    >
      <div
        className={`w-full ${
          isMobile ? "h-44" : "h-48"
        } bg-white rounded-lg mb-2 transition-all duration-300 group-hover:shadow-lg relative overflow-hidden border border-gray-200`}
      >
        {hasValidImage ? (
          <Image
            src={service.imageUrl as string}
            alt={service.title}
            fill
            className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-white">
            <Image
              src="/logo.jpg"
              alt="Logo placeholder"
              width={isMobile ? 100 : 120}
              height={isMobile ? 100 : 120}
              className="object-contain transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        )}

        {/* Rating at the top right corner */}

        {/* Permanent partial gradient overlay at the bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg">
          {/* Bottom section with price and location */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex justify-between items-center">
              {/* Price in the bottom left corner */}
              <div className="text-[#fce070]  font-medium flex items-center">
                {service.price}{" "}
                <Image
                  src="/coin.png"
                  alt="User profile"
                  width={40}
                  height={40}
                  className=" object-cover ml-2 w-5 h-5"
                />
              </div>

              {/* Location in the bottom right corner */}
              <div className="text-white text-sm flex items-center">
                <IoLocationOutline className="mr-1" />
                {service.location}
              </div>
            </div>
          </div>
        </div>

        {/* Additional overlay that appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:transition-opacity duration-300 rounded-lg">
          {/* This is empty as the content is already shown in the permanent overlay */}
        </div>
      </div>

      {/* Service information below the image */}
      <div className="mt-1">
        <h3 className="font-medium text-gray-800 group-hover:text-[#38AC8E] transition-colors duration-200">
          {service.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
          {service.description}
        </p>
      </div>
    </Link>
  );
};

export default ServiceCard;
