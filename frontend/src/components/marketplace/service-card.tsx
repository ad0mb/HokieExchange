import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { categories } from "@/lib/categories";
import type { Service } from "@/lib/services";

export function ServiceCard({ service }: { service: Service }) {
  const Icon = categories.find((c) => c.slug === service.categorySlug)!.icon;

  return (
    <a
      href={`/services/${service.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-background transition-shadow hover:shadow-md"
    >
      <div className="flex aspect-square items-center justify-center bg-secondary">
        <Icon
          className="h-14 w-14 text-brand-maroon/70 transition-transform group-hover:scale-110"
          strokeWidth={1.5}
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-lg font-bold text-brand-orange">
          ${service.price}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {service.priceUnit}
          </span>
        </p>
        <h3 className="line-clamp-1 font-semibold">{service.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {service.description}
        </p>

        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-brand-maroon text-[10px] text-white">
                {service.sellerInitials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {service.sellerName}
            </span>
          </div>
          <span className="text-xs font-semibold text-brand-maroon group-hover:underline">
            Book here
          </span>
        </div>
      </div>
    </a>
  );
}
