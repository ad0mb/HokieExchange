import { request } from "@/lib/api/client";

// Types mirror the backend Pydantic schemas (backend/vendor_ratings/schemas.py).
// `rating` is a decimal.Decimal on the backend, serialized to a JSON string.

export type VendorRatingCreate = {
  student_id: number;
  vendor_id: number;
  rating: string;
  description?: string | null;
  appointment_id?: number | null;
};

export type VendorRatingUpdate = {
  rating?: string;
  description?: string | null;
};

export type VendorRating = {
  rating_id: number;
  student_id: number;
  vendor_id: number;
  appointment_id: number | null;
  rating: string;
  description: string | null;
  date_created: string | null;
  date_updated: string | null;
};

export type VendorRatingAverage = {
  vendor_id: number;
  average: string | null;
  count: number;
};

export function getAllVendorRatings(params?: {
  vendorId?: number;
  studentId?: number;
}): Promise<VendorRating[]> {
  const q = new URLSearchParams();
  if (params?.vendorId != null) q.set("vendor_id", String(params.vendorId));
  if (params?.studentId != null) q.set("student_id", String(params.studentId));
  const query = q.toString();
  return request<VendorRating[]>(`/vendor-ratings/${query ? `?${query}` : ""}`);
}

export function getVendorRatingAverage(vendorId: number): Promise<VendorRatingAverage> {
  return request<VendorRatingAverage>(`/vendor-ratings/average?vendor_id=${vendorId}`);
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
