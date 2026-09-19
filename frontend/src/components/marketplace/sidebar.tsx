"use client";

import { Search, Grid2x2, UserRound, CirclePlus, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/categories";

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
}: {
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
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
          active={selectedCategory === null}
          onClick={() => onSelectCategory(null)}
        />
        <SidebarLink href="#" icon={UserRound} label="VT account" iconClassName="text-brand-maroon" />
      </nav>

      <Button
        variant="outline"
        className="font-heading justify-start gap-2 border-brand-maroon text-brand-maroon hover:bg-brand-maroon hover:text-white"
      >
        <CirclePlus className="h-4 w-4" />
        Create new listing
      </Button>

      <Separator />

      <div className="flex min-h-0 flex-1 flex-col">
        <h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
          Categories
        </h3>
        <div className="flex flex-col gap-0.5 overflow-y-auto pr-1">
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
