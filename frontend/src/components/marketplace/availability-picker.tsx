"use client";

import { getUpcomingAvailability, type SlotStart } from "@/lib/availability";
import { cn } from "@/lib/utils";

export type BookingSelection = {
  key: string;
  dateLabel: string;
  slot: SlotStart;
  label: string;
};

export function AvailabilityPicker({
  bookingTimes,
  selected,
  onSelect,
  className,
}: {
  bookingTimes?: SlotStart[];
  selected?: string | null;
  onSelect?: (selection: BookingSelection) => void;
  className?: string;
}) {
  const availability = getUpcomingAvailability(7, bookingTimes);

  return (
    <div className={cn("space-y-4", className)}>
      {availability.map((day) => (
        <div key={day.dateLabel}>
          <h3 className="mb-1.5 text-sm font-semibold">{day.dateLabel}</h3>
          <div className="flex flex-wrap gap-1.5">
            {day.times.map(({ slot, label }) => {
              const key = `${day.dateLabel} · ${label}`;
              const active = selected === key;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    onSelect?.({ key, dateLabel: day.dateLabel, slot, label })
                  }
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    active
                      ? "border-brand-maroon bg-brand-maroon text-white"
                      : "hover:border-brand-maroon hover:text-brand-maroon"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
