/**
 * Barrel export for the HokieExchange API layer.
 *
 * Import from "@/lib/api" to get every resource's types and functions:
 *   import { getAllStudents, type Student } from "@/lib/api";
 */

export { ApiError } from "@/lib/api/types";
export { request } from "@/lib/api/client";

export * from "@/lib/api/students";
export * from "@/lib/api/vendors";
export * from "@/lib/api/items";
export * from "@/lib/api/consumer-ratings";
export * from "@/lib/api/vendor-ratings";
