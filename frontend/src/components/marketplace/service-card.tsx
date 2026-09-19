import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookingDialog } from "@/components/marketplace/booking-dialog";
import { categories } from "@/lib/categories";
import type { Service } from "@/lib/services";

export function ServiceCard({ service }: { service: Service }) {
  const Icon = categories.find((c) => c.slug === service.categorySlug)!.icon;

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border bg-background transition-shadow hover:shadow-md">
      <div className="flex aspect-square items-center justify-center bg-secondary">
        <Icon
          className="h-10 w-10 text-brand-maroon/70 transition-transform group-hover:scale-110"
          strokeWidth={1.5}
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="font-bold text-brand-orange">
          ${service.price}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {service.priceUnit}
          </span>
        </p>
        <h3 className="line-clamp-1 text-sm font-semibold">{service.title}</h3>
        <p className="text-[11px] text-muted-foreground">{service.location}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {service.description}
        </p>

        <div className="mt-1.5 flex items-center justify-between border-t pt-1.5">
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
          <BookingDialog serviceTitle={service.title} />
        </div>
      </div>
    </div>
  );
}
