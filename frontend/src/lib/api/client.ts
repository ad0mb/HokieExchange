import { ApiError } from "@/lib/api/types";

/**
 * Base URL of the FastAPI backend. Override with NEXT_PUBLIC_API_URL
 * (e.g. a deployed backend); defaults to localhost for development.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * The single entry point for every backend call in the API layer.
 *
 * Endpoint modules (students.ts, items.ts, ...) pass a path, method, and body;
 * this function handles building the URL, sending the request, parsing JSON,
 * and normalizing errors so callers get typed data or a catchable ApiError.
 */
export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // DELETE endpoints return 204 No Content (no body to parse).
  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json();

  if (!response.ok) {
    // Backend errors come back as { "detail": "..." }.
    throw new ApiError(response.status, body?.detail ?? "Request failed");
  }

  return body as T;
}
