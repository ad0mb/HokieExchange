"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/marketplace/navbar";
import { ManageListingView } from "@/components/listings/manage-listing-view";
import { useServices } from "@/lib/services-store";

export default function ListingManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const services = useServices();
  const service = services.find((s) => s.id === id);
  const router = useRouter();
  const allowed = !!service && service.sellerName === "You";

  useEffect(() => {
    if (!allowed) router.replace("/");
  }, [allowed, router]);

  if (!allowed || !service) return null;

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <Navbar />
      <ManageListingView service={service} />
    </div>
  );
}
