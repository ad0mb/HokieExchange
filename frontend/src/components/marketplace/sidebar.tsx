import { Search, Grid2x2, UserRound, CirclePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { categories } from "@/lib/categories";

export function Sidebar() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search Exchange" className="pl-9" />
      </div>

      <nav className="flex flex-col gap-1">
        <a
          href="#"
          className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-accent"
        >
          <Grid2x2 className="h-5 w-5 text-brand-maroon" />
          Browse all
        </a>
        <a
          href="#"
          className="flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium hover:bg-accent"
        >
          <UserRound className="h-5 w-5 text-brand-maroon" />
          VT account
        </a>
      </nav>

      <Button
        variant="outline"
        className="justify-start gap-2 border-brand-maroon text-brand-maroon hover:bg-brand-maroon hover:text-white"
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
            <a
              key={category.slug}
              href={`#${category.slug}`}
              className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent"
            >
              <category.icon className="h-5 w-5 text-brand-orange" />
              {category.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
