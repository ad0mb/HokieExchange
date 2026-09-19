"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getUpcomingAvailability } from "@/lib/availability";

export function BookingDialog({ serviceTitle }: { serviceTitle: string }) {
  const availability = getUpcomingAvailability();

  return (
    <Dialog>
      <DialogTrigger className="text-xs font-semibold text-brand-maroon hover:underline">
        Book here
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{serviceTitle}</DialogTitle>
          <DialogDescription>
            Pick an available time slot over the next 7 days.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
          {availability.map((day) => (
            <div key={day.dateLabel}>
              <h3 className="mb-1.5 text-sm font-semibold">{day.dateLabel}</h3>
              <div className="flex flex-wrap gap-1.5">
                {day.times.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className="rounded-full border px-2.5 py-1 text-xs hover:border-brand-maroon hover:text-brand-maroon"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
