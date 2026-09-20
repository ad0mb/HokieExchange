"use client";

import { useId, useMemo, useState } from "react";
import { CirclePlus, ImagePlus } from "lucide-react";
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
import { locations, type Service } from "@/lib/services";
import { DEFAULT_SLOT_TIMES, formatSlotStart, type SlotStart } from "@/lib/availability";

function slotKey([hour, minute]: SlotStart) {
  return `${hour}:${minute}`;
}

export function CreateListingDialog({
  onCreate,
}: {
  onCreate: (service: Service) => void;
}) {
  const formId = useId();
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0].slug);
  const [location, setLocation] = useState(locations[0]);
  const [images, setImages] = useState<File[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<SlotStart[]>([]);
  const [error, setError] = useState<string | null>(null);

  const imagePreviews = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images]
  );

  function resetForm() {
    setTitle("");
    setDescription("");
    setPrice("");
    setCategorySlug(categories[0].slug);
    setLocation(locations[0]);
    setImages([]);
    setSelectedSlots([]);
    setError(null);
  }

  function toggleSlot(slot: SlotStart) {
    setSelectedSlots((prev) =>
      prev.some((s) => slotKey(s) === slotKey(slot))
        ? prev.filter((s) => slotKey(s) !== slotKey(slot))
        : [...prev, slot]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const priceValue = Number(price);
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
    if (images.length === 0) {
      setError("Add at least one image.");
      return;
    }

    onCreate({
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      price: priceValue,
      priceUnit: "per order",
      categorySlug,
      location,
      sellerName: "You",
      sellerInitials: "Y",
      rating: 0,
      ratingCount: 0,
      imageUrls: imagePreviews.length > 0 ? imagePreviews : undefined,
      bookingTimes: selectedSlots.length > 0 ? selectedSlots : undefined,
    });

    resetForm();
    setOpen(false);
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
              <Label htmlFor={`${formId}-location`}>
                Location <span className="text-destructive">*</span>
              </Label>
              <select
                id={`${formId}-location`}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}, VA
                  </option>
                ))}
              </select>
            </div>
          </div>

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
            <Label htmlFor={`${formId}-images`}>
              Relevant images <span className="text-destructive">*</span>
            </Label>
            <label
              htmlFor={`${formId}-images`}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-2.5 py-2 text-sm text-muted-foreground hover:border-brand-maroon hover:text-brand-maroon"
            >
              <ImagePlus className="h-4 w-4" />
              {images.length > 0
                ? `${images.length} image${images.length > 1 ? "s" : ""} selected`
                : "Upload photos of your service"}
            </label>
            <input
              id={`${formId}-images`}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                imagePreviews.forEach((url) => URL.revokeObjectURL(url));
                setImages(Array.from(e.target.files ?? []));
              }}
            />
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {imagePreviews.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element -- client-only object URL preview
                  <img
                    key={src}
                    src={src}
                    alt={`Upload ${i + 1}`}
                    className="h-14 w-14 rounded-md border object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Booking times</Label>
            <p className="text-xs text-muted-foreground">
              Pick the times you&apos;re usually available. Leave blank to use the
              default schedule.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_SLOT_TIMES.map((slot) => {
                const active = selectedSlots.some(
                  (s) => slotKey(s) === slotKey(slot)
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
                        : "border-brand-maroon text-brand-maroon"
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
          <Button type="submit" form={formId} className="bg-brand-maroon text-white hover:bg-brand-maroon-dark">
            Create listing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
