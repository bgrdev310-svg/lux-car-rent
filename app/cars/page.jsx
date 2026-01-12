import React from "react";
import CarsClient from "@/app/components/cars/CarsClient";

// 1. Static Metadata for SEO
export const metadata = {
  title: "Luxury Fleet | Noble Car Rental Dubai",
  description: "Browse our exclusive collection of premium supercars, SUVs, and luxury sedans available for rent in Dubai. Lamborghini, Ferrari, Rolls Royce, and more.",
  openGraph: {
    title: "Noble Luxury Car Rental Fleet",
    description: "Experience the thrill of driving the world's finest automobiles in Dubai.",
    images: ['/img/hero-car.jpg'], // Replace with actual hero
  },
};

// 2. Data Fetching (Server Side)
async function getData() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  // Parallel Fetching
  try {
    const [carsRes, brandsRes] = await Promise.all([
      fetch(`${API_URL}/api/cars`, { next: { revalidate: 60 } }), // Cache for 60s
      fetch(`${API_URL}/api/brands`, { next: { revalidate: 3600 } }) // Cache for 1h
    ]);

    const cars = await carsRes.json();
    const brands = await brandsRes.json();

    return { cars: Array.isArray(cars) ? cars : [], brands: Array.isArray(brands) ? brands : [] };
  } catch (err) {
    console.error("Server Fetch Error:", err);
    return { cars: [], brands: [] };
  }
}

export default async function CarsPage() {
  const { cars, brands } = await getData();

  // 3. JSON-LD Schema (Structured Data)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": cars.map((car, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": car.title || `${car.brand} ${car.model}`,
        "image": car.mainImage,
        "description": car.description,
        "offers": {
          "@type": "Offer",
          "price": car.pricing?.daily || car.price,
          "priceCurrency": "AED",
          "availability": "https://schema.org/InStock"
        }
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CarsClient initialCars={cars} brands={brands} />
    </>
  );
}