"use client";

import { useMemo } from "react";
import type { AvailabilitySlot } from "@/lib/api";
import { cn } from "@/lib/utils";

export type BookingSelection = {
  key: string;
  timeBlockId: number;
  datetime: string;
  label: string;
};

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const day = d.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  return `${weekday}, ${month} ${day}${suffix}`;
}

function formatTimeLabel(time: string): string {
  const [h = 0, m = 0] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour12}${period}` : `${hour12}:${String(m).padStart(2, "0")}${period}`;
}

export function AvailabilityPicker({
  slots,
  selected,
  onSelect,
  className,
}: {
  slots: AvailabilitySlot[];
  selected?: string | null;
  onSelect?: (selection: BookingSelection) => void;
  className?: string;
}) {
  const days = useMemo(() => {
    const map = new Map<string, AvailabilitySlot[]>();
    for (const slot of slots) {
      const date = slot.datetime.slice(0, 10);
      const list = map.get(date) ?? [];
      list.push(slot);
      map.set(date, list);
    }
    return [...map.entries()].map(([date, daySlots]) => ({ date, slots: daySlots }));
  }, [slots]);

  if (days.length === 0) {
    return (
      <p className={cn("py-2 text-sm text-muted-foreground", className)}>
        No available times right now.
      </p>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {days.map(({ date, slots: daySlots }) => (
        <div key={date}>
          <h3 className="mb-1.5 text-sm font-semibold">{formatDateLabel(date)}</h3>
          <div className="flex flex-wrap gap-1.5">
            {daySlots.map((slot) => {
              const label = formatTimeLabel(slot.start_time);
              const key = `${date} · ${label}`;
              const active = selected === key;
              return (
                <button
                  key={slot.time_block_id}
                  type="button"
                  onClick={() =>
                    onSelect?.({
                      key,
                      timeBlockId: slot.time_block_id,
                      datetime: slot.datetime,
                      label,
                    })
                  }
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    active
                      ? "border-brand-maroon bg-brand-maroon text-white"
                      : "hover:border-brand-maroon hover:text-brand-maroon",
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
