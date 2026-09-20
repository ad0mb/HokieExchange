"use client";

import { useState, use } from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/marketplace/navbar";
import { ProfileView } from "@/components/account/profile-view";
import { RateDialog } from "@/components/account/rate-dialog";
import { Button } from "@/components/ui/button";
import { useSellerProfile } from "@/lib/profile-data";

export default function SellerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { profile, listings, loading, vendorId } = useSellerProfile(slug);
  const [rateOpen, setRateOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-secondary">
        <Navbar />
        <p className="p-8 text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!profile || vendorId == null) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <Navbar />
      <div className="mx-auto flex w-full max-w-5xl justify-end px-4 pt-6 sm:px-8">
        <Button variant="outline" onClick={() => setRateOpen(true)}>
          Rate seller
        </Button>
      </div>
      <ProfileView profile={profile} listings={listings} showMessageButton />
      <RateDialog open={rateOpen} onOpenChange={setRateOpen} vendorId={vendorId} />
    </div>
  );
}
