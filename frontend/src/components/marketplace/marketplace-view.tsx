"use client";

import { useState } from "react";
import { Sidebar } from "@/components/marketplace/sidebar";
import { LocationBadge } from "@/components/marketplace/location-badge";
import { ServiceCard } from "@/components/marketplace/service-card";
import { categories } from "@/lib/categories";
import { services as initialServices, type Service } from "@/lib/services";

export function MarketplaceView() {
  const [services, setServices] = useState<Service[]>(initialServices);
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
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="w-full shrink-0 bg-background lg:w-80">
        <div className="p-6 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto">
          <Sidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedLocation={selectedLocation}
            onSelectLocation={setSelectedLocation}
            onCreateListing={(service) =>
              setServices((prev) => [service, ...prev])
            }
          />
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-secondary px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-brand-orange">{heading}</h1>
          <LocationBadge />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {visibleServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </main>
    </div>
  );
}
