"use client";

import { useId, useState } from "react";
import { CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/categories";
import { DEFAULT_SLOT_TIMES, formatSlotStart, type SlotStart } from "@/lib/availability";
import { createListing } from "@/lib/listing-data";
import { useCurrentAccount } from "@/lib/use-current-account";

function slotKey([hour, minute]: SlotStart) {
  return `${hour}:${minute}`;
}

export function CreateListingDialog({ onCreated }: { onCreated?: () => void }) {
  const formId = useId();
  const { vendorId } = useCurrentAccount();
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("30");
  const [categorySlug, setCategorySlug] = useState(categories[0].slug);
  const [location, setLocation] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<SlotStart[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setTitle("");
    setDescription("");
    setPrice("");
    setDuration("30");
    setCategorySlug(categories[0].slug);
    setLocation("");
    setSelectedSlots([]);
    setError(null);
  }

  function toggleSlot(slot: SlotStart) {
    setSelectedSlots((prev) =>
      prev.some((s) => slotKey(s) === slotKey(slot))
        ? prev.filter((s) => slotKey(s) !== slotKey(slot))
        : [...prev, slot],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const priceValue = Number(price);
    const durationValue = Number(duration);
    if (!title.trim()) {
      setError("Give your listing a title.");
      return;
    }
    if (!description.trim()) {
      setError("Add a description.");
      return;
    }
    if (!price || Number.isNaN(priceValue) || priceValue <= 0) {
      setError("Enter a price greater than $0.");
      return;
    }
    if (Number.isNaN(durationValue) || durationValue <= 0) {
      setError("Enter a duration in minutes.");
      return;
    }
    if (vendorId == null) {
      setError("Create a seller profile before listing services.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createListing(vendorId, {
        serviceName: title.trim(),
        description: description.trim(),
        location: location.trim() || null,
        category: categorySlug,
        price: priceValue,
        durationMinutes: durationValue,
        slots: selectedSlots,
      });
      resetForm();
      setOpen(false);
      onCreated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the listing.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="font-heading justify-start gap-2 border-brand-maroon text-brand-maroon hover:bg-brand-maroon hover:text-white"
          />
        }
      >
        <CirclePlus className="h-4 w-4" />
        Create new listing
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a new listing</DialogTitle>
          <DialogDescription>
            Fill this out to list your service on Hokie Exchange.
          </DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={handleSubmit}
          className="max-h-[60vh] space-y-4 overflow-y-auto px-1 pb-1"
        >
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-title`}>
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id={`${formId}-title`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fresh Fade Haircuts"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-category`}>
                Category <span className="text-destructive">*</span>
              </Label>
              <select
                id={`${formId}-category`}
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-location`}>Location</Label>
              <Input
                id={`${formId}-location`}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Blacksburg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-price`}>
                Price ($) <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`${formId}-price`}
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="25"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`${formId}-duration`}>
                Duration (min) <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`${formId}-duration`}
                type="number"
                min="1"
                step="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-description`}>
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id={`${formId}-description`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you offer, and what makes it worth booking?"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Booking times</Label>
            <p className="text-xs text-muted-foreground">
              Pick the times you&apos;re usually available (repeats weekly). Leave blank
              for a 10:00 AM default.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_SLOT_TIMES.map((slot) => {
                const active = selectedSlots.some(
                  (s) => slotKey(s) === slotKey(slot),
                );
                return (
                  <button
                    key={slotKey(slot)}
                    type="button"
                    onClick={() => toggleSlot(slot)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium",
                      active
                        ? "border-brand-orange bg-brand-orange text-white"
                        : "border-brand-maroon text-brand-maroon",
                    )}
                  >
                    {formatSlotStart(slot)}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form={formId}
            disabled={submitting}
            className="bg-brand-maroon text-white hover:bg-brand-maroon-dark"
          >
            {submitting ? "Creating…" : "Create listing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
