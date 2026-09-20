import { request } from "@/lib/api/client";

// Types mirror the backend Pydantic schemas (backend/services/schemas.py).
// `price`/`duration`/`rating` are Decimal/time on the backend → JSON strings.

export type ServiceCreate = {
  vendor_id: number;
  service_name: string;
  description: string;
  location?: string | null;
  category: string;
  price: string;
  duration: string; // "HH:MM:SS"
};

export type ServiceUpdate = {
  service_name?: string;
  description?: string;
  location?: string | null;
  category?: string;
  price?: string;
  duration?: string;
};

export type ServiceRead = {
  service_id: number;
  vendor_id: number;
  service_name: string;
  description: string;
  location: string | null;
  category: string;
  price: string;
  duration: string;
  seller_name: string;
  date_created: string | null;
  date_updated: string | null;
};

export type ServiceWithRating = ServiceRead & {
  rating: string | null;
  rating_count: number;
};

export type TimeBlock = {
  time_block_id: number;
  service_id: number;
  day_of_week: number;
  start_time: string;
  status: string;
  date_created: string | null;
  date_updated: string | null;
};

export type TimeBlockCreate = {
  day_of_week: number;
  start_time: string; // "HH:MM:SS"
  status?: string;
};

export type AvailabilitySlot = {
  time_block_id: number;
  day_of_week: number;
  start_time: string;
  datetime: string;
  available: boolean;
};

export function listServices(params?: {
  vendorId?: number;
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}): Promise<ServiceWithRating[]> {
  const q = new URLSearchParams();
  if (params?.vendorId != null) q.set("vendor_id", String(params.vendorId));
  if (params?.search) q.set("search", params.search);
  if (params?.category) q.set("category", params.category);
  if (params?.minPrice != null) q.set("min_price", params.minPrice);
  if (params?.maxPrice != null) q.set("max_price", params.maxPrice);
  const query = q.toString();
  return request<ServiceWithRating[]>(`/services/${query ? `?${query}` : ""}`);
}

export function getService(serviceId: number): Promise<ServiceRead> {
  return request<ServiceRead>(`/services/${serviceId}`);
}

export function createService(data: ServiceCreate): Promise<ServiceRead> {
  return request<ServiceRead>("/services/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateService(serviceId: number, data: ServiceUpdate): Promise<ServiceRead> {
  return request<ServiceRead>(`/services/${serviceId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteService(serviceId: number): Promise<void> {
  return request<void>(`/services/${serviceId}`, { method: "DELETE" });
}

export function listTimeBlocks(serviceId: number): Promise<TimeBlock[]> {
  return request<TimeBlock[]>(`/services/${serviceId}/blocks`);
}

export function createTimeBlock(serviceId: number, data: TimeBlockCreate): Promise<TimeBlock> {
  return request<TimeBlock>(`/services/${serviceId}/blocks`, {
    method: "POST",
    body: JSON.stringify({ ...data, service_id: serviceId }),
  });
}

export function getAvailability(serviceId: number, days = 14): Promise<AvailabilitySlot[]> {
  return request<AvailabilitySlot[]>(`/services/${serviceId}/availability?days=${days}`);
}
