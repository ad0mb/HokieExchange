"use client";

import { useState } from "react";
import { Sidebar } from "@/components/marketplace/sidebar";
import { LocationBadge } from "@/components/marketplace/location-badge";
import { ServiceCard } from "@/components/marketplace/service-card";
import { categories } from "@/lib/categories";
import { services } from "@/lib/services";

export function MarketplaceView() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const heading =
    categories.find((c) => c.slug === selectedCategory)?.label ?? "Recommended";
  const visibleServices = selectedCategory
    ? services.filter((s) => s.categorySlug === selectedCategory)
    : services;

  return (
    <div className="flex flex-1">
      <aside className="w-80 shrink-0 bg-background">
        <div className="sticky top-16 p-6">
          <Sidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-secondary px-6 py-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold">{heading}</h1>
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
