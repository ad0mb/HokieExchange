import { request } from "@/lib/api/client";

// Types mirror the backend Pydantic schemas (backend/consumer_ratings/schemas.py).
// `rating` is a decimal.Decimal on the backend, serialized to a JSON string.

export type ConsumerRatingCreate = {
  vendor_id: number;
  student_id: number;
  rating: string;
};

export type ConsumerRatingUpdate = {
  rating?: string;
};

export type ConsumerRating = {
  rating_id: number;
  vendor_id: number;
  student_id: number;
  rating: string;
  date_created: string | null;
  date_updated: string | null;
};

export function getAllConsumerRatings(vendorId?: number): Promise<ConsumerRating[]> {
  const query = vendorId != null ? `?vendor_id=${vendorId}` : "";
  return request<ConsumerRating[]>(`/consumer-ratings/${query}`);
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
