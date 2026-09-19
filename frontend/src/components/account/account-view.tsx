"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ServiceCard } from "@/components/marketplace/service-card";
import { ReviewCard } from "@/components/account/review-card";
import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/account";
import { services } from "@/lib/services";

type View = "vendor" | "buyer";

export function AccountView() {
  const [view, setView] = useState<View>("vendor");
  const profile = currentUser[view];
  const listings = services.filter((s) =>
    currentUser.vendor.listingIds.includes(s.id)
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-brand-maroon hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-brand-maroon text-xl text-white">
              {currentUser.avatarInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                value={currentUser.firstName}
                readOnly
                className="w-24 sm:w-32"
              />
              <Input
                value={currentUser.lastName}
                readOnly
                className="w-24 sm:w-32"
              />
            </div>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="inline-flex rounded-full border border-brand-maroon p-1">
            <button
              type="button"
              onClick={() => setView("vendor")}
              className={cn(
                "rounded-full px-4 py-1 text-sm font-semibold",
                view === "vendor"
                  ? "bg-brand-orange text-white"
                  : "text-brand-maroon"
              )}
            >
              Vendor
            </button>
            <button
              type="button"
              onClick={() => setView("buyer")}
              className={cn(
                "rounded-full px-4 py-1 text-sm font-semibold",
                view === "buyer"
                  ? "bg-brand-orange text-white"
                  : "text-brand-maroon"
              )}
            >
              Buyer
            </button>
          </div>
          <p className="max-w-[12rem] text-right text-xs text-muted-foreground">
            Switches between your vendor and buyer info
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto]">
        <div>
          <h2 className="mb-2 font-heading text-sm font-bold text-brand-orange">
            About me
          </h2>
          <div className="min-h-32 rounded-lg border bg-background p-3 text-sm text-muted-foreground">
            {currentUser.bio}
          </div>
        </div>

        <div className="text-center sm:text-right">
          <h2 className="font-heading text-sm font-bold text-brand-orange">
            {view === "vendor" ? "Total Sold Items" : "Total Bought Items"}
          </h2>
          <p className="text-3xl font-bold">
            {view === "vendor"
              ? currentUser.vendor.itemsSold
              : currentUser.buyer.itemsBought}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2">
          <h2 className="font-heading text-sm font-bold text-brand-orange">
            Ratings
          </h2>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-foreground text-foreground" />
            <span className="font-semibold">{profile.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              ({profile.ratingCount})
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {profile.reviews.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </div>
      </div>

      {view === "vendor" && (
        <div className="mt-8">
          <h2 className="mb-3 font-heading text-lg font-bold text-brand-orange">
            Current Listings
          </h2>
          <div className="grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-3 xl:grid-cols-4">
            {listings.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
