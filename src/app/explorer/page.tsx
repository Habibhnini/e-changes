// app/explorer/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import ServiceCard from "./ServiceCard"; // Import the ServiceCard component

// Define types for our data structure
interface Service {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  price: number;
  rating: number;
  location: string;
  createdAt: string;
}

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showPopulaireDropdown, setShowPopulaireDropdown] = useState(false);
  const [selectedPopulaire, setSelectedPopulaire] = useState("Populaire");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  // Service categories
  const serviceCategories = ["Service1", "Service2", "Service3", "Service4"];

  // API URL - internal Next.js API route
  const API_URL = "/api/services";

  // Mock data as fallback
  const mockServices: Service[] = Array.from({ length: 16 }, (_, i) => ({
    id: i + 1,
    title: `Service ${i + 1}`,
    description: `Description for service ${
      i + 1
    }. This is a placeholder text that describes what this service offers to customers.`,
    category: `Service${Math.floor(i / 4) + 1}`,
    imageUrl: i % 3 === 0 ? "/placeholder-service.jpg" : "", // Mix of images and empty strings for testing
    price: Math.floor(Math.random() * 100) + 10, // Random price between 10 and 109
    rating: Math.floor(Math.random() * 3) + 3, // Random rating between 3 and 5
    location: ["Paris", "Lyon", "Bordeaux", "Vichy", "Marseille"][
      Math.floor(Math.random() * 5)
    ], // Random location
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    ).toISOString(), // Random date within last 30 days
  }));

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint in Tailwind
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add this effect to handle clicks outside of the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowPopulaireDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);
  // Function to fetch services from API
  const fetchServices = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters based on filters
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedService) params.append("type", selectedService); // Changed to match your API
      if (areaFilter) params.append("location", areaFilter); // You might need to add this field to your API
      if (selectedCategory) params.append("category", selectedCategory);

      // Sort mapping
      if (selectedPopulaire !== "Populaire") {
        const sortMapping: Record<string, string> = {
          Récent: "created_at_desc",
          "Mieux noté": "rating_desc", // You'll need to add rating to your model
          "Prix bas": "price_asc",
        };
        params.append("sort", sortMapping[selectedPopulaire] || "popular");
      }

      const queryString = params.toString() ? `?${params.toString()}` : "";

      // Use your Symfony API endpoint
      const response = await fetch(`/api/service${queryString}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Map the Symfony API response to your frontend Service interface
      const mappedServices: Service[] = data.services.map(
        (apiService: any) => ({
          id: apiService.id,
          title: apiService.title,
          description: apiService.description,
          category: apiService.category.name, // Access nested category name
          imageUrl: "/placeholder-service.jpg", // You'll need to add image URLs to your API
          price: apiService.price,
          rating: 4, // You'll need to add this to your API model
          location: "Vichy", // You'll need to add location to your model
          createdAt: apiService.createdAt,
        })
      );

      setServices(mappedServices);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError("Failed to load services. Using mock data instead.");
      // Fallback to mock data
      setServices(mockServices);
    } finally {
      setLoading(false);
    }
  };

  // Handle search button click
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear any pending timeout to avoid multiple requests
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set a new timeout to delay the API call
    searchTimeout.current = setTimeout(() => {
      fetchServices();
    }, 300);
  };

  // Handle enter key press in search inputs

  // Fetch data when component mounts or when filters change
  useEffect(() => {
    // Use a debounce for automatic filtering
    const debounceTimer = setTimeout(() => {
      fetchServices();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [selectedService, selectedCategory, selectedPopulaire]);

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero section with Georgia font */}
      <div className="hidden sm:block text-center mb-10">
        <h1 className="text-[62px] font-medium font-georgia mb-0">
          Découvrez les offres
        </h1>
        <h2 className="text-[62px] font-medium font-georgia mt-[-20px]">
          des e-changeurs
        </h2>
        <p className="text-gray-900">
          Explorez des centaines de services et d'offres autour de chez vous
        </p>
      </div>
      {/* ======= DESKTOP SEARCH SECTION ======= */}
      <div className="hidden sm:block mb-24 max-w-2xl mx-auto">
        <div className="flex flex-wrap justify-between gap-2">
          {/* Search input with services dropdown - left section */}
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-3 flex-grow">
            <input
              type="text"
              placeholder="Que recherchez vous?"
              className="w-full bg-transparent focus:outline-none text-gray-700 text-sm"
              value={searchQuery}
              onChange={handleSearchChange}
            />

            {/* Services dropdown - no border */}
            <div className="relative flex items-center pl-2 ml-1">
              <select
                className="appearance-none bg-transparent text-gray-700 pr-6 focus:outline-none font-medium text-sm"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
              >
                <option value="">Services</option>
                {serviceCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-0 text-gray-700">
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            {/* Search button - perfectly circular */}
            <button className="flex items-center justify-center bg-[#38AC8E] rounded-full p-1.5 ml-2 text-white hover:bg-[#2d9377] transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          {/* Location input - right section */}
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
            <input
              type="text"
              placeholder="Vichy"
              className="bg-transparent focus:outline-none text-gray-700 w-18 text-sm"
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#38AC8E] ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>
      </div>
      {/* ======= MOBILE SEARCH SECTION ======= */}
      <div className="sm:hidden mb-3">
        {/* Search bar with services dropdown - fixed design */}
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 mb-3">
          <input
            type="text"
            placeholder="Que recherchez vous?"
            className="min-w-0 w-full flex-shrink bg-transparent focus:outline-none text-gray-700 text-xs"
            value={searchQuery}
            onChange={handleSearchChange}
          />

          {/* Services dropdown - reduced width */}
          <div className="relative flex items-center pl-1">
            <select
              className="appearance-none bg-transparent text-gray-700 pr-6 focus:outline-none text-xs font-medium w-20 flex-shrink-0"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              <option value="">Services</option>
              {serviceCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-0 text-gray-700">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Search button - inside the container */}
          <button className="bg-[#38AC8E] rounded-full p-1 ml-1 text-white flex-shrink-0 hover:bg-[#2d9377] active:bg-[#227a61] transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        {/* Location input - separate line in mobile */}
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
          <input
            type="text"
            placeholder="Vichy"
            className="min-w-0 w-full bg-transparent focus:outline-none text-gray-700 text-xs"
            value={areaFilter}
            onChange={handleSearchChange}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-[#38AC8E] ml-1 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
      </div>
      {/* ======= DESKTOP CATEGORY FILTERS ======= */}
      <div className="hidden sm:flex justify-between mb-8 items-center">
        <div className="flex">
          <div className="relative inline-block mr-2" ref={dropdownRef}>
            <button
              onClick={() => setShowPopulaireDropdown(!showPopulaireDropdown)}
              className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-xl text-sm font-medium flex items-center transition-colors duration-200 ease-in-out cursor-pointer hover:bg-gray-50"
            >
              {selectedPopulaire}
              <svg
                className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                  showPopulaireDropdown ? "transform rotate-180" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showPopulaireDropdown && (
              <div className="absolute mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10 transition-opacity duration-200 animate-fadeIn">
                {["Populaire", "Récent", "Mieux noté", "Prix bas"].map(
                  (option) => (
                    <button
                      key={option}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
                      onClick={() => {
                        setSelectedPopulaire(option);
                        setShowPopulaireDropdown(false);
                      }}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          {serviceCategories.map((category, index) => {
            // Format category to include # before the number
            const formattedCategory = category.replace(/(\d+)$/, "#$1");

            return (
              <button
                key={category}
                className={`text-gray-800 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-105 cursor-pointer ${
                  selectedCategory === category
                    ? "bg-gray-200 shadow-sm"
                    : "bg-white hover:bg-gray-50"
                }`}
                onClick={() =>
                  setSelectedCategory(
                    category === selectedCategory ? "" : category
                  )
                }
              >
                {formattedCategory}
              </button>
            );
          })}
        </div>

        <button className="flex items-center text-gray-700 px-4 py-2 rounded-xl border border-gray-300 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm">
          <span>Filtres</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </button>
      </div>
      {/* ======= MOBILE FILTER SECTION ======= */}
      <div className="sm:hidden flex justify-between mb-6">
        {/* Populaire dropdown */}
        <div className="relative">
          <div className="relative inline-block mr-2" ref={dropdownRef}>
            <button
              onClick={() => setShowPopulaireDropdown(!showPopulaireDropdown)}
              className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200 ease-in-out cursor-pointer hover:bg-gray-50"
            >
              {selectedPopulaire}
              <svg
                className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                  showPopulaireDropdown ? "transform rotate-180" : ""
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showPopulaireDropdown && (
              <div className="absolute mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10 transition-opacity duration-200 animate-fadeIn">
                {["Populaire", "Récent", "Mieux noté", "Prix bas"].map(
                  (option) => (
                    <button
                      key={option}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
                      onClick={() => {
                        setSelectedPopulaire(option);
                        setShowPopulaireDropdown(false);
                      }}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filtres button */}
        <button className="flex items-center bg-white border border-gray-300 rounded-md px-4 py-2 text-sm">
          <span>Filtres</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </button>
      </div>

      {/* Mobile category tabs horizontal scrolling */}
      <div className="sm:hidden overflow-x-auto whitespace-nowrap pb-2 mb-4 -mx-4 px-4 scrollbar-hide">
        {serviceCategories.map((category) => {
          const formattedCategory = category.replace(/(\d+)$/, "#$1");
          return (
            <button
              key={category}
              className={`text-gray-800 px-4 py-2 rounded-full text-sm font-medium mr-2 transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-gray-200 shadow-sm"
                  : "bg-white border border-gray-200"
              }`}
              onClick={() =>
                setSelectedCategory(
                  category === selectedCategory ? "" : category
                )
              }
            >
              {formattedCategory}
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#38AC8E]"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* ======= DESKTOP SERVICES GRID ======= */}
      {!loading && (
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} isMobile={false} />
          ))}
        </div>
      )}

      {/* ======= MOBILE SERVICES GRID ======= */}
      {!loading && (
        <div className="sm:hidden grid grid-cols-1 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} isMobile={true} />
          ))}
        </div>
      )}
    </div>
  );
}
