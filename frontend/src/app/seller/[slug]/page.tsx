"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/marketplace/navbar";
import { ProfileView } from "@/components/account/profile-view";
import { useSellerProfile } from "@/lib/profile-data";

export default function SellerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { profile, listings, loading } = useSellerProfile(slug);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-secondary">
        <Navbar />
        <p className="p-8 text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!profile) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <Navbar />
      <ProfileView profile={profile} listings={listings} showMessageButton />
    </div>
  );
}
