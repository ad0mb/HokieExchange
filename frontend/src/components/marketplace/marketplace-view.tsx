"use client";

import { useState } from "react";
import { Sidebar } from "@/components/marketplace/sidebar";
import { LocationBadge } from "@/components/marketplace/location-badge";
import { ServiceCard } from "@/components/marketplace/service-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { categories } from "@/lib/categories";
import { useListings } from "@/lib/listing-data";

export function MarketplaceView({
  mobileMenuOpen,
  onMobileMenuOpenChange,
}: {
  mobileMenuOpen: boolean;
  onMobileMenuOpenChange: (open: boolean) => void;
}) {
  const { services, loading, refresh } = useListings();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const heading =
    categories.find((c) => c.slug === selectedCategory)?.label ?? "Recommended";

  const locations = [...new Set(services.map((s) => s.location).filter((l): l is string => !!l))];

  const query = search.trim().toLowerCase();
  const visibleServices = services.filter(
    (s) =>
      (!query ||
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)) &&
      (!selectedCategory || s.categorySlug === selectedCategory) &&
      (!selectedLocation || s.location === selectedLocation),
  );

  const sidebar = (
    <Sidebar
      selectedCategory={selectedCategory}
      onSelectCategory={setSelectedCategory}
      selectedLocation={selectedLocation}
      onSelectLocation={setSelectedLocation}
      locations={locations}
      search={search}
      onSearchChange={setSearch}
      onCreated={refresh}
    />
  );

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <Sheet open={mobileMenuOpen} onOpenChange={onMobileMenuOpenChange}>
        <SheetContent side="left" className="w-80 gap-0 p-0 lg:hidden">
          <SheetHeader className="border-b">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto p-6">{sidebar}</div>
        </SheetContent>
      </Sheet>

      <aside className="hidden shrink-0 bg-background lg:block lg:w-[22rem]">
        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-6">
          {sidebar}
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-secondary px-4 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-brand-orange">{heading}</h1>
          <LocationBadge />
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading listings…</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {visibleServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
