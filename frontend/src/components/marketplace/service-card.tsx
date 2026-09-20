"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookingDialog } from "@/components/marketplace/booking-dialog";
import type { BookingSelection } from "@/components/marketplace/availability-picker";
import { ImageCarousel } from "@/components/marketplace/image-carousel";
import { ListingDialog } from "@/components/marketplace/listing-dialog";
import { categories } from "@/lib/categories";
import { sellerHref } from "@/lib/sellers";
import { bookSlot } from "@/lib/services-store";
import { useCurrentViewer } from "@/lib/use-current-viewer";
import type { Service } from "@/lib/services";

export function ServiceCard({ service }: { service: Service }) {
  const Icon = categories.find((c) => c.slug === service.categorySlug)!.icon;
  const [detailOpen, setDetailOpen] = useState(false);
  const router = useRouter();
  const viewer = useCurrentViewer();
  const isOwnListing = service.sellerName === "You";

  function handleBook(selection: BookingSelection) {
    bookSlot(service.id, selection.slot, {
      id: crypto.randomUUID(),
      dateLabel: selection.dateLabel,
      timeLabel: selection.label,
      bookerName: viewer.name,
      bookerInitials: viewer.initials,
      bookerImage: viewer.image,
    });
  }

  function openCard() {
    if (isOwnListing) {
      router.push(`/listings/${service.id}`);
    } else {
      setDetailOpen(true);
    }
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={openCard}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openCard();
        }}
        className="flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-background transition-shadow hover:shadow-md"
      >
        <ImageCarousel
          images={service.imageUrls ?? []}
          alt={service.title}
          className="aspect-square"
          fallback={
            <Icon
              className="h-10 w-10 text-brand-maroon/70 transition-transform group-hover:scale-110"
              strokeWidth={1.5}
            />
          }
        />

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

          <div
            className="mt-1.5 flex items-center justify-between border-t pt-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-brand-maroon text-[10px] text-white">
                  {service.sellerInitials}
                </AvatarFallback>
              </Avatar>
              <Link
                href={sellerHref(service)}
                className="text-xs text-muted-foreground hover:text-brand-maroon hover:underline"
              >
                {service.sellerName}
              </Link>
            </div>
            {isOwnListing ? (
              <Link
                href={`/listings/${service.id}`}
                className="flex items-center gap-1 text-xs font-semibold text-brand-maroon hover:underline"
              >
                <Pencil className="h-3 w-3" />
                Manage
              </Link>
            ) : (
              <BookingDialog
                serviceTitle={service.title}
                bookingTimes={service.bookingTimes}
                onBook={handleBook}
              />
            )}
          </div>
        </div>
      </div>

      {!isOwnListing && (
        <ListingDialog
          service={service}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onBook={handleBook}
        />
      )}
    </>
  );
}
