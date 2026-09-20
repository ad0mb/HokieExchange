import { request } from "@/lib/api/client";

// Types mirror the backend Pydantic schemas (backend/consumer_ratings/schemas.py).
// `rating` is a decimal.Decimal on the backend, serialized to a JSON string.

export type ConsumerRatingCreate = {
  vendor_id: number;
  student_id: number;
  rating: string;
  appointment_id?: number | null;
};

export type ConsumerRatingUpdate = {
  rating?: string;
};

export type ConsumerRating = {
  rating_id: number;
  vendor_id: number;
  student_id: number;
  appointment_id: number | null;
  rating: string;
  date_created: string | null;
  date_updated: string | null;
};

export type ConsumerRatingAverage = {
  student_id: number;
  average: string | null;
  count: number;
};

export function getAllConsumerRatings(params?: {
  vendorId?: number;
  studentId?: number;
}): Promise<ConsumerRating[]> {
  const q = new URLSearchParams();
  if (params?.vendorId != null) q.set("vendor_id", String(params.vendorId));
  if (params?.studentId != null) q.set("student_id", String(params.studentId));
  const query = q.toString();
  return request<ConsumerRating[]>(`/consumer-ratings/${query ? `?${query}` : ""}`);
}

export function getConsumerRatingAverage(studentId: number): Promise<ConsumerRatingAverage> {
  return request<ConsumerRatingAverage>(`/consumer-ratings/average?student_id=${studentId}`);
}

export function getConsumerRating(ratingId: number): Promise<ConsumerRating> {
  return request<ConsumerRating>(`/consumer-ratings/${ratingId}`);
}

export function createConsumerRating(data: ConsumerRatingCreate): Promise<ConsumerRating> {
  return request<ConsumerRating>("/consumer-ratings/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateConsumerRating(
  ratingId: number,
  data: ConsumerRatingUpdate,
): Promise<ConsumerRating> {
  return request<ConsumerRating>(`/consumer-ratings/${ratingId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteConsumerRating(ratingId: number): Promise<void> {
  return request<void>(`/consumer-ratings/${ratingId}`, { method: "DELETE" });
}
