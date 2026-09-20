"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AvailabilityPicker } from "@/components/marketplace/availability-picker";
import { ImageCarousel } from "@/components/marketplace/image-carousel";
import { categories } from "@/lib/categories";
import { sellerHref } from "@/lib/sellers";
import type { Service } from "@/lib/services";

export function ListingDialog({
  service,
  open,
  onOpenChange,
}: {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const Icon = categories.find((c) => c.slug === service.categorySlug)!.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid max-w-3xl grid-cols-1 gap-0 overflow-hidden p-0 sm:max-w-3xl md:grid-cols-[1.2fr_1fr]">
        <DialogTitle className="sr-only">{service.title}</DialogTitle>

        <ImageCarousel
          images={service.imageUrls ?? []}
          alt={service.title}
          className="aspect-square md:aspect-auto md:h-[32rem]"
          fallback={
            <Icon
              className="h-16 w-16 text-brand-maroon/70"
              strokeWidth={1.5}
            />
          }
        />

        <div className="flex max-h-[32rem] flex-col gap-4 overflow-y-auto p-5 pt-8">
          <div>
            <p className="text-2xl font-bold text-brand-orange">
              ${service.price}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                {service.priceUnit}
              </span>
            </p>
            <h2 className="mt-1 font-heading text-lg font-bold">
              {service.title}
            </h2>
            {service.ratingCount > 0 && (
              <div className="mt-1 flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-foreground text-foreground" />
                <span className="font-semibold">
                  {service.rating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  ({service.ratingCount})
                </span>
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold">Description</h3>
            <p className="text-sm text-muted-foreground">
              {service.description}
            </p>
          </div>

          <div>
            <h3 className="mb-1 text-sm font-semibold">Location</h3>
            <p className="text-sm text-muted-foreground">
              {service.location}, VA
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-2 text-sm font-semibold">Seller information</h3>
            <div className="flex items-center gap-2.5">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-brand-maroon text-sm text-white">
                  {service.sellerInitials}
                </AvatarFallback>
              </Avatar>
              <Link
                href={sellerHref(service)}
                className="text-sm font-medium hover:text-brand-maroon hover:underline"
              >
                {service.sellerName}
              </Link>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t pt-4">
            <h3 className="text-sm font-semibold">Available bookings</h3>
            <AvailabilityPicker
              bookingTimes={service.bookingTimes}
              selected={selectedSlot}
              onSelect={setSelectedSlot}
              className="max-h-48 overflow-y-auto pr-1"
            />
            <Button
              type="button"
              disabled={!selectedSlot}
              className="bg-brand-maroon text-white hover:bg-brand-maroon-dark"
            >
              Book
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
