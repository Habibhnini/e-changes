// app/explorer/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import ServiceCard from "./ServiceCard"; // Import the ServiceCard component
import { useSearchParams } from "next/navigation";

// Define types for our data structure
interface Service {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl?: string; // optional legacy
  primaryImageUrl?: string | null;
  images?: Array<{
    id: number;
    url: string;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  price: number;
  rating: number;
  location: string;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function ExplorerPageContent() {
  const didInitFromURL = useRef(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [showPopulaireDropdown, setShowPopulaireDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string>("");

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  // Service categories
  const serviceTypes = ["service", "bien"];
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (didInitFromURL.current || categories.length === 0) return;

    const rawCategory = searchParams.get("category");

    if (rawCategory) {
      const decodedCategory = decodeURIComponent(rawCategory)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const matched = categories.find((cat) =>
        cat.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(decodedCategory)
      );

      if (matched) {
        setSelectedCategories([String(matched.id)]);
      }
    }

    didInitFromURL.current = true;
    fetchServices();
  }, [categories, searchParams]);

  useEffect(() => {
    if (!didInitFromURL.current) return;

    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to page 1 when filters change
      fetchServices(1); // Start from page 1
    }, 300);
    return () => clearTimeout(timer);
  }, [areaFilter]);

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/service/categories");
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      } catch (err) {
        //  console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
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

  // Function to fetch services from API with pagination
  const fetchServices = async (page: number = pagination.currentPage) => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters based on filters
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedService) params.append("type", selectedService);
      if (areaFilter) params.append("location", areaFilter);
      if (selectedCategories.length > 0) {
        selectedCategories.forEach((catId) =>
          params.append("category[]", catId)
        );
      }

      // Add pagination parameters
      params.append("page", page.toString());
      params.append("limit", pagination.itemsPerPage.toString());

      // Add status filter to only show published services
      params.append("status", "published");

      // Sort mapping
      if (selectedSort) {
        params.append("sort", selectedSort);
      }

      const queryString = params.toString() ? `?${params.toString()}` : "";
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
          category: apiService.category.name,
          primaryImageUrl:
            apiService.primaryImageUrl || "/placeholder-service.jpg",
          images: apiService.images || [],
          price: apiService.price,
          rating: 4,
          location: apiService.vendor.city,
          createdAt: apiService.createdAt,
        })
      );

      setServices(mappedServices);

      // Update pagination info from API response
      setPagination({
        currentPage: data.pagination?.currentPage || page,
        totalPages: data.pagination?.totalPages || 1,
        totalItems: data.pagination?.totalItems || data.count,
        itemsPerPage: data.pagination?.itemsPerPage || pagination.itemsPerPage,
      });
    } catch (err) {
      setError("Failed to load services. Please try again.");
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
      setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to page 1
      fetchServices(1);
    }, 300);
  };

  // Fetch data when component mounts or when filters change
  useEffect(() => {
    if (!didInitFromURL.current) return;
    const timer = setTimeout(() => {
      setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to page 1
      fetchServices(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedService, selectedCategories]);

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedSort("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchServices(1);
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    fetchServices(newPage);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = isMobile ? 5 : 7;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, pagination.currentPage - halfVisible);
    let endPage = Math.min(
      pagination.totalPages,
      startPage + maxVisiblePages - 1
    );

    // Adjust startPage if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={pagination.currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Précédent
      </button>
    );

    // First page + ellipsis if needed
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
        >
          1
        </button>
      );

      if (startPage > 2) {
        pages.push(
          <span
            key="ellipsis1"
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300"
          >
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium border ${
            i === pagination.currentPage
              ? "bg-[#38AC8E] text-white border-[#38AC8E]"
              : "text-gray-500 bg-white border-gray-300 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page + ellipsis if needed
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        pages.push(
          <span
            key="ellipsis2"
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300"
          >
            ...
          </span>
        );
      }

      pages.push(
        <button
          key={pagination.totalPages}
          onClick={() => handlePageChange(pagination.totalPages)}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
        >
          {pagination.totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={pagination.currentPage === pagination.totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Suivant
      </button>
    );

    return (
      <div className="flex flex-col items-center space-y-4 mt-8">
        {/* Pagination info */}

        {/* Pagination buttons */}
        <div className="flex">{pages}</div>
      </div>
    );
  };

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
          Explorez des centaines de services et d&#39;offres autour de chez
          vous, en France et dans le Bénélux.
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
                <option value="">Type</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}{" "}
                    {/* Capitalize */}
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
              className="min-w-0 w-full bg-transparent focus:outline-none text-gray-700 text-xs"
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
              <option value="">Type</option>
              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}{" "}
                  {/* Capitalize */}
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
            onChange={(e) => setAreaFilter(e.target.value)}
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
        <div className="relative inline-block">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm"
          >
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

          {showCategoryDropdown && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 p-2">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox mr-2 text-[#38AC8E] rounded"
                    checked={selectedCategories.includes(String(cat.id))}
                    onChange={(e) => {
                      const id = String(cat.id);
                      if (e.target.checked) {
                        setSelectedCategories((prev) => [...prev, id]);
                      } else {
                        setSelectedCategories((prev) =>
                          prev.filter((c) => c !== id)
                        );
                      }
                    }}
                  />
                  {cat.name}
                </label>
              ))}

              {/* Clear all / Apply buttons */}
              <div className="flex justify-between mt-3 px-2">
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setShowCategoryDropdown(false);
                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                    fetchServices(1);
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======= MOBILE FILTER SECTION ======= */}
      <div className="sm:hidden flex justify-between mb-6">
        {/* Populaire dropdown */}
        <div className="relative"></div>

        {/* Filtres button */}
        <div className="relative inline-block">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm"
          >
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

          {showCategoryDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 p-2">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox mr-2 text-[#38AC8E] rounded"
                    checked={selectedCategories.includes(String(cat.id))}
                    onChange={(e) => {
                      const id = String(cat.id);
                      if (e.target.checked) {
                        setSelectedCategories((prev) => [...prev, id]);
                      } else {
                        setSelectedCategories((prev) =>
                          prev.filter((c) => c !== id)
                        );
                      }
                    }}
                  />
                  {cat.name}
                </label>
              ))}

              {/* Clear all / Apply buttons */}
              <div className="flex justify-between mt-3 px-2">
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setShowCategoryDropdown(false);
                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                    fetchServices(1);
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#38AC8E]"></div>
        </div>
      )}

      {!loading && services.length === 0 && (
        <div className="text-center text-gray-500 text-sm mt-8">
          Aucun service trouvé.
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

      {/* Pagination Component */}
      {!loading && renderPagination()}
    </div>
  );
}
