"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VTIcon } from "@/components/VTIcon";

export function BookingConfirmedDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex flex-col items-center gap-3 py-8 text-center sm:max-w-xs"
      >
        <DialogTitle className="sr-only">Booking complete</DialogTitle>
        <CheckCircle2 className="h-14 w-14 text-brand-maroon" strokeWidth={1.5} />
        <p className="font-heading text-xl font-bold">Booking complete!</p>
        <VTIcon name="hokie-bird" className="h-14 w-14" />
        <Button
          onClick={() => onOpenChange(false)}
          className="mt-2 w-full bg-brand-maroon text-white hover:bg-brand-maroon-dark"
        >
          OK
        </Button>
      </DialogContent>
    </Dialog>
  );
}
