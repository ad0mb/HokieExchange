import type { Service } from "@/lib/services";

export function sellerSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function sellerHref(service: Service, currentVendorId?: number | null): string {
  return currentVendorId != null && service.vendorId === currentVendorId
    ? "/account"
    : `/seller/${sellerSlug(service.sellerName)}`;
}
