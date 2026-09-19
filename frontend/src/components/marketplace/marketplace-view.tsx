"use client";

import { useState } from "react";
import { Sidebar } from "@/components/marketplace/sidebar";
import { LocationBadge } from "@/components/marketplace/location-badge";
import { ServiceCard } from "@/components/marketplace/service-card";
import { categories } from "@/lib/categories";
import { services } from "@/lib/services";

export function MarketplaceView() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const heading =
    categories.find((c) => c.slug === selectedCategory)?.label ?? "Recommended";
  const visibleServices = services.filter(
    (s) =>
      (!selectedCategory || s.categorySlug === selectedCategory) &&
      (!selectedLocation || s.location === selectedLocation)
  );

  return (
    <div className="flex flex-1">
      <aside className="w-80 shrink-0 bg-background">
        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-6">
          <Sidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
          />
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-secondary px-6 py-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-brand-orange">{heading}</h1>
          <LocationBadge />
        </div>

        <div className="grid grid-cols-4 gap-3">
          {visibleServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </main>
    </div>
  );
}
