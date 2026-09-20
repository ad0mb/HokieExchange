"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AvailabilityPicker } from "@/components/marketplace/availability-picker";
import type { SlotStart } from "@/lib/availability";

export function BookingDialog({
  serviceTitle,
  bookingTimes,
}: {
  serviceTitle: string;
  bookingTimes?: SlotStart[];
}) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

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

        <AvailabilityPicker
          bookingTimes={bookingTimes}
          selected={selectedSlot}
          onSelect={setSelectedSlot}
          className="max-h-80 overflow-y-auto pr-1"
        />

        <Button
          type="button"
          disabled={!selectedSlot}
          className="bg-brand-maroon text-white hover:bg-brand-maroon-dark"
        >
          Book
        </Button>
      </DialogContent>
    </Dialog>
  );
}
