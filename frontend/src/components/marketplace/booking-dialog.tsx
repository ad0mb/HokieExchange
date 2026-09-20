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
import { bookAppointment, useAvailability } from "@/lib/listing-data";
import { useCurrentAccount } from "@/lib/use-current-account";

export function BookingDialog({
  serviceId,
  serviceTitle,
}: {
  serviceId: number;
  serviceTitle: string;
}) {
  const { studentId } = useCurrentAccount();
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<BookingSelection | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { slots, loading } = useAvailability(serviceId, open);

  async function handleBook() {
    if (!selection) return;
    if (studentId == null) {
      setError("Sign in to book a slot.");
      return;
    }
    try {
      await bookAppointment({
        timeBlockId: selection.timeBlockId,
        bookedAt: selection.datetime,
        studentId,
      });
      setSelection(null);
      setOpen(false);
      setConfirmed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not book this slot.");
    }
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
              Pick an available time over the next 14 days.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <p className="py-4 text-sm text-muted-foreground">Loading availability…</p>
          ) : (
            <AvailabilityPicker
              slots={slots}
              selected={selection?.key ?? null}
              onSelect={setSelection}
              className="max-h-80 overflow-y-auto pr-1"
            />
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button
            type="button"
            disabled={!selection || loading}
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
