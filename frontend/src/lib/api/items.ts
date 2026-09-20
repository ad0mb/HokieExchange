import { request } from "@/lib/api/client";

// Types mirror the backend Pydantic schemas (backend/items/schemas.py).
// `price` is a decimal.Decimal on the backend, which Pydantic v2 serializes
// to a JSON string — hence `string` here.

export type ItemCreate = {
  vendor_id: number;
  item_name: string;
  description?: string | null;
  price: string;
  stock: number;
};

export type ItemUpdate = {
  item_name?: string;
  description?: string | null;
  price?: string;
  stock?: number;
};

export type Item = {
  item_id: number;
  vendor_id: number;
  item_name: string;
  description: string | null;
  price: string;
  stock: number;
  date_created: string | null;
  date_updated: string | null;
};

export function getAllItems(vendorId?: number): Promise<Item[]> {
  const query = vendorId != null ? `?vendor_id=${vendorId}` : "";
  return request<Item[]>(`/items/${query}`);
}

export function getItem(itemId: number): Promise<Item> {
  return request<Item>(`/items/${itemId}`);
}

export function createItem(data: ItemCreate): Promise<Item> {
  return request<Item>("/items/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateItem(itemId: number, data: ItemUpdate): Promise<Item> {
  return request<Item>(`/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteItem(itemId: number): Promise<void> {
  return request<void>(`/items/${itemId}`, { method: "DELETE" });
}
