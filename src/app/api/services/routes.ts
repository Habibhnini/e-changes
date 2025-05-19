// app/api/services/route.ts
import { NextResponse } from "next/server";

export interface Service {
  type: string;
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

// Generate 40 mock services with realistic data
const generateMockServices = (): Service[] => {
  const categories = ["Service#1", "Service#2", "Service#3", "Service#4"];
  const locations = [
    "Vichy",
    "Paris",
    "Lyon",
    "Marseille",
    "Bordeaux",
    "Toulouse",
  ];
  const descriptions = [
    "Service professionnel avec garantie de satisfaction",
    "Offre exceptionnelle disponible ce mois-ci",
    "Service personnalisé selon vos besoins",
    "Expertise confirmée dans le domaine",
  ];

  return Array.from({ length: 40 }, (_, i) => {
    // Generate a date between now and 60 days ago
    const daysAgo = Math.floor(Math.random() * 60);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    return {
      id: i + 1,
      title: `Service ${i + 1}`,
      description:
        descriptions[Math.floor(Math.random() * descriptions.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      imageUrl: "/placeholder-service.jpg",
      price: Math.floor(Math.random() * 100) + 10,
      rating: Math.random() * 3 + 2, // Rating between 2 and 5
      location: locations[Math.floor(Math.random() * locations.length)],
      createdAt: date.toISOString(),
      type: i % 2 === 0 ? "service" : "bien",
    };
  });
};

// Create mock data once
const mockServices = generateMockServices();

export async function GET(request: Request) {
  // Extract query parameters from the URL
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const service = searchParams.get("service") || "";
  const area = searchParams.get("area") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "popular";

  // Filter services based on query parameters
  let filteredServices = [...mockServices];

  // Apply search filter
  if (search) {
    filteredServices = filteredServices.filter(
      (s) =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Apply service type filter
  if (service) {
    filteredServices = filteredServices.filter((s) =>
      s.category.toLowerCase().includes(service.toLowerCase())
    );
  }

  // Apply area filter
  if (area) {
    filteredServices = filteredServices.filter((s) =>
      s.location.toLowerCase().includes(area.toLowerCase())
    );
  }

  // Apply category filter
  if (category) {
    filteredServices = filteredServices.filter((s) => s.category === category);
  }

  // Apply sorting
  switch (sort) {
    case "recent":
      filteredServices.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "rating":
      filteredServices.sort((a, b) => b.rating - a.rating);
      break;
    case "price_asc":
      filteredServices.sort((a, b) => a.price - b.price);
      break;
    case "popular":
    default:
      // Sort by a combination of rating and recency
      filteredServices.sort((a, b) => {
        const aScore =
          a.rating * 10 -
          (Date.now() - new Date(a.createdAt).getTime()) / 86400000;
        const bScore =
          b.rating * 10 -
          (Date.now() - new Date(b.createdAt).getTime()) / 86400000;
        return bScore - aScore;
      });
      break;
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json(filteredServices);
}
