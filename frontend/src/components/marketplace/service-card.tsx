"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookingDialog } from "@/components/marketplace/booking-dialog";
import { categories } from "@/lib/categories";
import type { Service } from "@/lib/services";
import { cn } from "@/lib/utils";

export function ServiceCard({ service }: { service: Service }) {
  const Icon = categories.find((c) => c.slug === service.categorySlug)!.icon;
  const images = service.imageUrls ?? [];
  const [imageIndex, setImageIndex] = useState(0);

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border bg-background transition-shadow hover:shadow-md">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-secondary">
        {images.length > 0 ? (
          <div
            className="flex h-full w-full transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${imageIndex * 100}%)` }}
          >
            {images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- client-only object URL preview, not a static/remote asset
              <img
                key={i}
                src={src}
                alt={`${service.title} photo ${i + 1}`}
                className="h-full w-full shrink-0 object-cover"
              />
            ))}
          </div>
        ) : (
          <Icon
            className="h-10 w-10 text-brand-maroon/70 transition-transform group-hover:scale-110"
            strokeWidth={1.5}
          />
        )}

        {images.length > 1 && (
          <>
            {imageIndex > 0 && (
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() => setImageIndex((i) => Math.max(i - 1, 0))}
                className="absolute left-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {imageIndex < images.length - 1 && (
              <button
                type="button"
                aria-label="Next photo"
                onClick={() =>
                  setImageIndex((i) => Math.min(i + 1, images.length - 1))
                }
                className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    i === imageIndex ? "bg-brand-orange" : "bg-white/70"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="font-bold text-brand-orange">
          ${service.price}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {service.priceUnit}
          </span>
        </p>
        <h3 className="line-clamp-1 text-sm font-semibold">{service.title}</h3>
        {service.ratingCount > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
            <span className="font-semibold">{service.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({service.ratingCount})
            </span>
          </div>
        )}
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
          <BookingDialog
            serviceTitle={service.title}
            bookingTimes={service.bookingTimes}
          />
        </div>
      </div>
    </div>
  );
}
