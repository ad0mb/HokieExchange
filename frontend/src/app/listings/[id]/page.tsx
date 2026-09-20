"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/marketplace/navbar";
import { ManageListingView } from "@/components/listings/manage-listing-view";
import { getService } from "@/lib/api";
import { mapService } from "@/lib/listing-data";
import { useCurrentAccount } from "@/lib/use-current-account";
import type { Service } from "@/lib/services";

export default function ListingManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { vendorId } = useCurrentAccount();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await getService(Number(id));
        if (!cancelled) setService(mapService(raw));
      } catch {
        if (!cancelled) setService(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const allowed = !!service && vendorId != null && service.vendorId === vendorId;

  useEffect(() => {
    if (!loading && !allowed) router.replace("/");
  }, [loading, allowed, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-secondary">
        <Navbar />
        <p className="p-8 text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (!allowed || !service) return null;

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <Navbar />
      <ManageListingView service={service} />
    </div>
  );
}
