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
import {
  AvailabilityPicker,
  type BookingSelection,
} from "@/components/marketplace/availability-picker";
import { BookingConfirmedDialog } from "@/components/marketplace/booking-confirmed-dialog";
import type { SlotStart } from "@/lib/availability";

export function BookingDialog({
  serviceTitle,
  bookingTimes,
  onBook,
}: {
  serviceTitle: string;
  bookingTimes?: SlotStart[];
  onBook?: (slot: SlotStart) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<BookingSelection | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function handleBook() {
    if (!selection) return;
    onBook?.(selection.slot);
    setSelection(null);
    setOpen(false);
    setConfirmed(true);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
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
            selected={selection?.key ?? null}
            onSelect={setSelection}
            className="max-h-80 overflow-y-auto pr-1"
          />

          <Button
            type="button"
            disabled={!selection}
            onClick={handleBook}
            className="bg-brand-maroon text-white hover:bg-brand-maroon-dark"
          >
            Book
          </Button>
        </DialogContent>
      </Dialog>

      <BookingConfirmedDialog open={confirmed} onOpenChange={setConfirmed} />
    </>
  );
}
