"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { rateBuyer, rateVendor } from "@/lib/profile-data";
import { useCurrentAccount } from "@/lib/use-current-account";
import { cn } from "@/lib/utils";

export function RateDialog({
  open,
  onOpenChange,
  direction,
  targetId,
  appointmentId,
  onRated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direction: "vendor" | "buyer";
  targetId: number;
  appointmentId: number;
  onRated?: () => void;
}) {
  const { studentId, vendorId } = useCurrentAccount();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isVendor = direction === "vendor";

  async function handleSubmit() {
    if (rating < 1) {
      setError("Select a star rating.");
      return;
    }
    if (isVendor && studentId == null) {
      setError("Sign in to leave a rating.");
      return;
    }
    if (!isVendor && vendorId == null) {
      setError("You need a seller profile to rate buyers.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (isVendor) {
        await rateVendor({
          studentId: studentId!,
          vendorId: targetId,
          rating,
          description: comment.trim(),
          appointmentId,
        });
      } else {
        await rateBuyer({
          studentId: targetId,
          vendorId: vendorId!,
          rating,
          appointmentId,
        });
      }
      setRating(0);
      setComment("");
      onOpenChange(false);
      onRated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit rating.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isVendor ? "Rate this seller" : "Rate this buyer"}</DialogTitle>
          <DialogDescription>Share your experience.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  "h-6 w-6",
                  n <= rating
                    ? "fill-brand-orange text-brand-orange"
                    : "text-muted-foreground",
                )}
              />
            </button>
          ))}
        </div>

        {isVendor && (
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a review…"
          />
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button
          type="button"
          disabled={busy}
          onClick={handleSubmit}
          className="bg-brand-maroon text-white hover:bg-brand-maroon-dark"
        >
          Submit rating
        </Button>
      </DialogContent>
    </Dialog>
  );
}
