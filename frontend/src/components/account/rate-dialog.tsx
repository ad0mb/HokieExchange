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
import { rateVendor } from "@/lib/profile-data";
import { useCurrentAccount } from "@/lib/use-current-account";
import { cn } from "@/lib/utils";

export function RateDialog({
  open,
  onOpenChange,
  vendorId,
  onRated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: number;
  onRated?: () => void;
}) {
  const { studentId } = useCurrentAccount();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (studentId == null) {
      setError("Sign in to leave a rating.");
      return;
    }
    if (rating < 1) {
      setError("Select a star rating.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await rateVendor(studentId, vendorId, rating, comment.trim());
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
          <DialogTitle>Rate this seller</DialogTitle>
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

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a review…"
        />

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
