"use client";

import { Search, Grid2x2, UserRound, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CreateListingDialog } from "@/components/marketplace/create-listing-dialog";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/categories";
import { locations, type Service } from "@/lib/services";

function SidebarLink({
  icon: Icon,
  label,
  iconClassName,
  active,
  href,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  iconClassName?: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const className = cn(
    "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-accent",
    active && "bg-accent"
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        <Icon className={cn("h-5 w-5", iconClassName)} />
        {label}
      </button>
    );
  }

  return (
    <a href={href ?? "#"} className={className}>
      <Icon className={cn("h-5 w-5", iconClassName)} />
      {label}
    </a>
  );
}

export function Sidebar({
  selectedCategory,
  onSelectCategory,
  selectedLocation,
  onSelectLocation,
  onCreateListing,
}: {
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  selectedLocation: string | null;
  onSelectLocation: (location: string | null) => void;
  onCreateListing: (service: Service) => void;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-orange" />
        <Input
          placeholder="Search Exchange"
          className="pl-9 placeholder:text-brand-orange"
        />
      </div>

      <nav className="flex flex-col gap-1">
        <SidebarLink
          icon={Grid2x2}
          label="Browse all"
          iconClassName="text-brand-maroon"
          active={selectedCategory === null && selectedLocation === null}
          onClick={() => {
            onSelectCategory(null);
            onSelectLocation(null);
          }}
        />
        <SidebarLink href="#" icon={UserRound} label="VT account" iconClassName="text-brand-maroon" />
      </nav>

      <CreateListingDialog onCreate={onCreateListing} />

      <Separator />

      <div className="flex flex-col">
        <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
          Locations
        </h3>
        <div className="flex flex-wrap gap-2 px-2">
          {locations.map((location) => {
            const active = selectedLocation === location;
            return (
              <button
                key={location}
                type="button"
                onClick={() => onSelectLocation(active ? null : location)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  active
                    ? "border-brand-orange bg-brand-orange text-white"
                    : "border-brand-maroon text-brand-maroon"
                )}
              >
                {location}, VA
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col">
        <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
          Categories
        </h3>
        <div className="flex flex-col gap-0.5">
          {categories.map((category) => (
            <SidebarLink
              key={category.slug}
              icon={category.icon}
              label={category.label}
              iconClassName="text-brand-orange"
              active={selectedCategory === category.slug}
              onClick={() => onSelectCategory(category.slug)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
