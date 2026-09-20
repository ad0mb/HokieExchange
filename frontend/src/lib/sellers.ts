import type { Service } from "@/lib/services";
import type { AccountProfile } from "@/lib/account";

export function sellerSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function sellerHref(service: Service): string {
  return service.sellerName === "You"
    ? "/account"
    : `/seller/${sellerSlug(service.sellerName)}`;
}

export function getSellerProfile(
  services: Service[],
  slug: string
): AccountProfile | null {
  const listings = services.filter(
    (s) => s.sellerName !== "You" && sellerSlug(s.sellerName) === slug
  );
  if (listings.length === 0) return null;

  const [sample] = listings;
  const [firstName, ...rest] = sample.sellerName.split(" ");
  const totalRatingCount = listings.reduce((sum, s) => sum + s.ratingCount, 0);
  const weightedRating =
    totalRatingCount > 0
      ? listings.reduce((sum, s) => sum + s.rating * s.ratingCount, 0) /
        totalRatingCount
      : 0;

  return {
    firstName,
    lastName: rest.join(" "),
    email: `${firstName.toLowerCase()}@vt.edu`,
    avatarInitials: sample.sellerInitials,
    bio: "Virginia Tech student offering services on Hokie Exchange.",
    buyer: { rating: 0, ratingCount: 0, itemsBought: 0, reviews: [] },
    vendor: {
      rating: weightedRating,
      ratingCount: totalRatingCount,
      itemsSold: 0,
      reviews: [],
      listingIds: listings.map((s) => s.id),
    },
  };
}
