"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/marketplace/navbar";
import { ProfileView } from "@/components/account/profile-view";
import { getSellerProfile } from "@/lib/sellers";
import { useServices } from "@/lib/services-store";

export default function SellerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const services = useServices();
  const profile = getSellerProfile(services, slug);
  if (!profile) notFound();

  const listings = services.filter((s) =>
    profile.vendor.listingIds.includes(s.id)
  );

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <Navbar />
      <ProfileView profile={profile} listings={listings} showMessageButton />
    </div>
  );
}
