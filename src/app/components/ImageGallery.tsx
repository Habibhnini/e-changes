import Image from "next/image";
import { useState } from "react";

interface ServiceImage {
  id: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

const ImageGallery: React.FC<{
  images: ServiceImage[];
  title: string;
  isMobile?: boolean;
}> = ({ images, title, isMobile = false }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const sortedImages = [...images].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return a.sortOrder - b.sortOrder;
  });

  const getFullImageUrl = (url: string): string => {
    if (!url) {
      return "/logo.jpg";
    }
    if (url.startsWith("http")) {
      return url;
    }
    // Get the API URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    if (url.startsWith("/uploads/")) {
      const fullUrl = `${apiUrl}${url}`;
      return fullUrl;
    }

    const fullUrl = `${apiUrl}/uploads/services/${url}`;
    return fullUrl;
  };
  if (!images || images.length === 0) {
    return (
      <div
        className={`${
          isMobile ? "w-full h-48" : "w-full h-full"
        } bg-gray-200 rounded-lg flex items-center justify-center`}
      >
        <Image
          src="/logo.jpg"
          alt="No image available"
          width={isMobile ? 100 : 120}
          height={isMobile ? 100 : 120}
          className="object-contain opacity-50"
        />
      </div>
    );
  }

  const currentImage = sortedImages[selectedImageIndex];

  if (isMobile) {
    return (
      <div className="w-full">
        {/* Main image */}
        <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-2 relative">
          <Image
            src={getFullImageUrl(currentImage.url)}
            alt={title}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/logo.png";
            }}
          />
          {images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 ${
                  index === selectedImageIndex
                    ? "border-[#38AC8E]"
                    : "border-gray-300"
                }`}
              >
                <Image
                  src={getFullImageUrl(image.url)}
                  alt={`${title} - Image ${index + 1}`}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/logo.png";
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div className="w-full flex">
      {/* Thumbnails column */}
      {images.length > 1 && (
        <div className="flex flex-col gap-2 mr-2 max-h-80 overflow-y-auto">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`w-16 h-16 rounded-md overflow-hidden border-2 hover:opacity-80 transition-all ${
                index === selectedImageIndex
                  ? "border-[#38AC8E] scale-105"
                  : "border-gray-300"
              }`}
            >
              <Image
                src={getFullImageUrl(image.url)}
                alt={`${title} - Thumbnail ${index + 1}`}
                width={64}
                height={64}
                className="object-cover w-full h-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/logo.png";
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="flex-1">
        <div className="relative w-full h-80 cursor-pointer hover:opacity-95 transition-opacity">
          <Image
            src={getFullImageUrl(currentImage.url)}
            alt={title}
            fill
            className="object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/logo.png";
            }}
          />
          {images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
