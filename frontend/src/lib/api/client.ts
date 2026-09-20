import { ApiError } from "@/lib/api/types";

/**
 * Base path for the FastAPI backend. Requests are proxied through the
 * Next.js server (`/api/backend/*` → `${BACKEND_URL}/*` via next.config.ts
 * rewrites), so the browser only talks same-origin HTTPS to Vercel.
 */
const BASE_URL = "/api/backend";

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
