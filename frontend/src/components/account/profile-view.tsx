"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ServiceCard } from "@/components/marketplace/service-card";
import { MessagesButton } from "@/components/marketplace/messages-button";
import { ReviewCard } from "@/components/account/review-card";
import { cn } from "@/lib/utils";
import { currentUser, type AccountProfile } from "@/lib/account";
import { services } from "@/lib/services";

type View = "vendor" | "buyer";

export function ProfileView({
  profile = currentUser,
  showMessageButton = false,
  messageHref = "/chats",
}: {
  profile?: AccountProfile;
  showMessageButton?: boolean;
  messageHref?: string;
}) {
  const [view, setView] = useState<View>("vendor");
  const roleProfile = profile[view];
  const listings = services.filter((s) =>
    profile.vendor.listingIds.includes(s.id)
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1.5 text-base font-medium text-brand-maroon hover:underline"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Marketplace
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-8">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar className="h-28 w-28">
            {profile.image && (
              <AvatarImage
                src={profile.image}
                alt={`${profile.firstName} ${profile.lastName}`}
              />
            )}
            <AvatarFallback className="bg-brand-maroon text-3xl text-white">
              {profile.avatarInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1.5">
            <h1 className="font-heading text-2xl font-bold">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        {showMessageButton && (
          <MessagesButton label="Message" href={messageHref} />
        )}

        <div className="flex flex-col items-end gap-2">
          <div className="relative inline-flex rounded-full border border-brand-maroon p-1.5">
            <div
              className={cn(
                "absolute inset-y-1.5 left-1.5 w-24 rounded-full bg-brand-orange transition-transform duration-300 ease-in-out",
                view === "buyer" && "translate-x-24"
              )}
            />
            <button
              type="button"
              onClick={() => setView("vendor")}
              className={cn(
                "relative z-10 w-24 rounded-full py-2 text-base font-semibold transition-colors duration-300",
                view === "vendor" ? "text-white" : "text-brand-maroon"
              )}
            >
              Vendor
            </button>
            <button
              type="button"
              onClick={() => setView("buyer")}
              className={cn(
                "relative z-10 w-24 rounded-full py-2 text-base font-semibold transition-colors duration-300",
                view === "buyer" ? "text-white" : "text-brand-maroon"
              )}
            >
              Buyer
            </button>
          </div>
          <p className="max-w-[14rem] text-right text-sm text-muted-foreground">
            Switches between {showMessageButton ? "their" : "your"} vendor and
            buyer info
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_auto]">
        <div>
          <h2 className="mb-3 font-heading text-lg font-bold text-brand-orange">
            About
          </h2>
          <div className="min-h-48 rounded-lg border bg-background p-4 text-base text-muted-foreground">
            {profile.bio}
          </div>
        </div>

        <div className="text-center sm:text-right">
          <h2 className="font-heading text-lg font-bold text-brand-orange">
            {view === "vendor" ? "Total Sold Items" : "Total Bought Items"}
          </h2>
          <p className="text-5xl font-bold">
            {view === "vendor"
              ? profile.vendor.itemsSold
              : profile.buyer.itemsBought}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="font-heading text-lg font-bold text-brand-orange">
            Ratings
          </h2>
          <div className="flex items-center gap-1.5 text-base">
            <Star className="h-5 w-5 fill-foreground text-foreground" />
            <span className="font-semibold">
              {roleProfile.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              ({roleProfile.ratingCount})
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          {roleProfile.reviews.map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </div>
      </div>

      {view === "vendor" && (
        <div className="mt-10">
          <h2 className="mb-4 font-heading text-2xl font-bold text-brand-orange">
            Current Listings
          </h2>
          <div className="grid grid-cols-2 gap-4 border-t pt-5 sm:grid-cols-3 xl:grid-cols-4">
            {listings.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
