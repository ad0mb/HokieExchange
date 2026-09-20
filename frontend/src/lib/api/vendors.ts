import { request } from "@/lib/api/client";

// Types mirror the backend Pydantic schemas (backend/vendors/schemas.py).

export type VendorCreate = {
  student_id: number;
  description: string;
};

export type VendorUpdate = {
  description?: string;
};

export type Vendor = {
  vendor_id: number;
  student_id: number;
  description: string;
  date_created: string | null;
  date_updated: string | null;
};

export function getAllVendors(): Promise<Vendor[]> {
  return request<Vendor[]>("/vendors/");
}

export function getVendor(vendorId: number): Promise<Vendor> {
  return request<Vendor>(`/vendors/${vendorId}`);
}

export function createVendor(data: VendorCreate): Promise<Vendor> {
  return request<Vendor>("/vendors/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateVendor(vendorId: number, data: VendorUpdate): Promise<Vendor> {
  return request<Vendor>(`/vendors/${vendorId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteVendor(vendorId: number): Promise<void> {
  return request<void>(`/vendors/${vendorId}`, { method: "DELETE" });
}
