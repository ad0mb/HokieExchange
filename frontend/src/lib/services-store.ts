import { useSyncExternalStore } from "react";
import { DEFAULT_SLOT_TIMES, type SlotStart } from "@/lib/availability";
import { services as initialServices, type Booking, type Service } from "@/lib/services";

let state: Service[] = initialServices;
const listeners = new Set<() => void>();

function setState(next: Service[]) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function useServices(): Service[] {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => state,
    () => state
  );
}

export function getService(id: string): Service | undefined {
  return state.find((s) => s.id === id);
}

export function addService(service: Service) {
  setState([service, ...state]);
}

export function updateService(id: string, updates: Partial<Service>) {
  setState(state.map((s) => (s.id === id ? { ...s, ...updates } : s)));
}

export function bookSlot(
  serviceId: string,
  slot: SlotStart,
  booking: Booking
) {
  setState(
    state.map((s) => {
      if (s.id !== serviceId) return s;
      const bookingTimes = (s.bookingTimes ?? DEFAULT_SLOT_TIMES).filter(
        ([hour, minute]) => hour !== slot[0] || minute !== slot[1]
      );
      return {
        ...s,
        bookingTimes,
        bookings: [...(s.bookings ?? []), booking],
      };
    })
  );
}
