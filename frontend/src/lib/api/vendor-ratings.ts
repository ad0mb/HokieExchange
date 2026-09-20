import { request } from "@/lib/api/client";

// Types mirror the backend Pydantic schemas (backend/vendor_ratings/schemas.py).
// `rating` is a decimal.Decimal on the backend, serialized to a JSON string.

export type VendorRatingCreate = {
  student_id: number;
  vendor_id: number;
  rating: string;
  description?: string | null;
};

export type VendorRatingUpdate = {
  rating?: string;
  description?: string | null;
};

export type VendorRating = {
  rating_id: number;
  student_id: number;
  vendor_id: number;
  rating: string;
  description: string | null;
  date_created: string | null;
  date_updated: string | null;
};

export function getAllVendorRatings(vendorId?: number): Promise<VendorRating[]> {
  const query = vendorId != null ? `?vendor_id=${vendorId}` : "";
  return request<VendorRating[]>(`/vendor-ratings/${query}`);
}

export function getVendorRating(ratingId: number): Promise<VendorRating> {
  return request<VendorRating>(`/vendor-ratings/${ratingId}`);
}

export function createVendorRating(data: VendorRatingCreate): Promise<VendorRating> {
  return request<VendorRating>("/vendor-ratings/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateVendorRating(
  ratingId: number,
  data: VendorRatingUpdate,
): Promise<VendorRating> {
  return request<VendorRating>(`/vendor-ratings/${ratingId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteVendorRating(ratingId: number): Promise<void> {
  return request<void>(`/vendor-ratings/${ratingId}`, { method: "DELETE" });
}
