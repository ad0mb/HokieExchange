"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAppointment,
  createService,
  createTimeBlock,
  deleteService,
  getAvailability,
  listServices,
  updateService,
  type AvailabilitySlot,
  type ServiceRead,
} from "@/lib/api";
import type { SlotStart } from "@/lib/availability";
import type { Service } from "@/lib/services";

export function durationLabel(duration: string): string {
  const [h = 0, m = 0] = duration.split(":").map(Number);
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
}

export function initials(name: string): string {
  const [first, last] = name.trim().split(/\s+/);
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "Y";
}

export function mapService(
  raw: ServiceRead & { rating?: string | null; rating_count?: number },
): Service {
  return {
    id: String(raw.service_id),
    vendorId: raw.vendor_id,
    title: raw.service_name,
    categorySlug: raw.category,
    price: Number(raw.price),
    durationLabel: durationLabel(raw.duration),
    sellerName: raw.seller_name,
    sellerInitials: initials(raw.seller_name),
    description: raw.description,
    location: raw.location,
    rating: raw.rating != null ? Number(raw.rating) : 0,
    ratingCount: raw.rating_count ?? 0,
  };
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

function slotToTime([h, m]: SlotStart): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

export type CreateListingInput = {
  serviceName: string;
  description: string;
  location: string | null;
  category: string;
  price: number;
  durationMinutes: number;
  slots: SlotStart[];
};

export async function createListing(
  vendorId: number,
  input: CreateListingInput,
): Promise<ServiceRead> {
  const service = await createService({
    vendor_id: vendorId,
    service_name: input.serviceName,
    description: input.description,
    location: input.location ?? null,
    category: input.category,
    price: String(input.price),
    duration: minutesToTime(input.durationMinutes),
  });

  // Make the listing bookable: create a recurring weekly block per selected time.
  const slots = input.slots.length ? input.slots : ([[10, 0]] as SlotStart[]);
  for (const slot of slots) {
    for (let day = 0; day < 7; day++) {
      await createTimeBlock(service.service_id, {
        day_of_week: day,
        start_time: slotToTime(slot),
      });
    }
  }
  return service;
}

export async function updateListing(
  serviceId: number,
  input: {
    serviceName: string;
    description: string;
    location: string | null;
    price: number;
  },
): Promise<ServiceRead> {
  return updateService(serviceId, {
    service_name: input.serviceName,
    description: input.description,
    location: input.location ?? null,
    price: String(input.price),
  });
}

export async function removeListing(serviceId: number): Promise<void> {
  return deleteService(serviceId);
}

async function fetchAllServices(): Promise<Service[]> {
  const rows = await listServices();
  return rows.map(mapService);
}

export function useListings() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchAllServices();
        if (!cancelled) setServices(rows);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setServices(await fetchAllServices());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  return { services, loading, error, refresh };
}

export function useAvailability(serviceId: number | undefined, enabled: boolean) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (serviceId == null || !enabled) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await getAvailability(serviceId);
        if (!cancelled) setSlots(rows.filter((r) => r.available));
      } catch {
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [serviceId, enabled]);

  return { slots, loading };
}

export async function bookAppointment(input: {
  timeBlockId: number;
  bookedAt: string;
  studentId: number;
}): Promise<void> {
  await createAppointment({
    time_block_id: input.timeBlockId,
    booked_at: input.bookedAt,
    student_id: input.studentId,
  });
}
