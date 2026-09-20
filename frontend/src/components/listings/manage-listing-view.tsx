"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { updateService } from "@/lib/services-store";
import {
  DEFAULT_SLOT_TIMES,
  formatSlotStart,
  type SlotStart,
} from "@/lib/availability";
import type { Service } from "@/lib/services";

function slotKey([hour, minute]: SlotStart) {
  return `${hour}:${minute}`;
}

export function ManageListingView({ service }: { service: Service }) {
  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState(service.description);
  const [imageUrls, setImageUrls] = useState<string[]>(
    service.imageUrls ?? []
  );
  const [selectedSlots, setSelectedSlots] = useState<SlotStart[]>(
    service.bookingTimes ?? DEFAULT_SLOT_TIMES
  );
  const [saved, setSaved] = useState(false);

  function toggleSlot(slot: SlotStart) {
    setSelectedSlots((prev) =>
      prev.some((s) => slotKey(s) === slotKey(slot))
        ? prev.filter((s) => slotKey(s) !== slotKey(slot))
        : [...prev, slot]
    );
    setSaved(false);
  }

  function addImages(files: FileList | null) {
    const urls = Array.from(files ?? []).map((file) =>
      URL.createObjectURL(file)
    );
    setImageUrls((prev) => [...prev, ...urls]);
    setSaved(false);
  }

  function removeImage(url: string) {
    setImageUrls((prev) => prev.filter((u) => u !== url));
    setSaved(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateService(service.id, {
      title: title.trim() || service.title,
      description: description.trim() || service.description,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      bookingTimes: selectedSlots,
    });
    setSaved(true);
  }

  const bookings = service.bookings ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-8">
      <Link
        href="/account"
        className="mb-8 inline-flex items-center gap-1.5 text-base font-medium text-brand-maroon hover:underline"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to your profile
      </Link>

      <h1 className="mb-6 font-heading text-2xl font-bold text-brand-orange">
        Manage listing
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="listing-title">Title</Label>
          <Input
            id="listing-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaved(false);
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="listing-description">Description</Label>
          <Textarea
            id="listing-description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setSaved(false);
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="listing-images">Images</Label>
          <label
            htmlFor="listing-images"
            className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed px-2.5 py-2 text-sm text-muted-foreground hover:border-brand-maroon hover:text-brand-maroon"
          >
            <ImagePlus className="h-4 w-4" />
            Add photos
          </label>
          <input
            id="listing-images"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addImages(e.target.files)}
          />
          {imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {imageUrls.map((src) => (
                <div key={src} className="group relative">
                  {/* eslint-disable-next-line @next/next/no-img-element -- client-only object URL preview, not a static/remote asset */}
                  <img
                    src={src}
                    alt="Listing"
                    className="h-16 w-16 rounded-md border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(src)}
                    aria-label="Remove image"
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-background text-foreground shadow ring-1 ring-border"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Booking times</Label>
          <p className="text-xs text-muted-foreground">
            Toggle which times you&apos;re generally available for this
            listing.
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

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            className="bg-brand-maroon text-white hover:bg-brand-maroon-dark"
          >
            Save changes
          </Button>
          {saved && (
            <span className="text-sm text-muted-foreground">Saved!</span>
          )}
        </div>
      </form>

      <div className="mt-10 border-t pt-6">
        <h2 className="mb-4 font-heading text-lg font-bold text-brand-orange">
          Bookings so far
        </h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No one has booked this listing yet.
          </p>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center gap-3 rounded-lg border bg-background p-3"
              >
                <Avatar className="h-10 w-10">
                  {booking.bookerImage && (
                    <AvatarImage
                      src={booking.bookerImage}
                      alt={booking.bookerName}
                    />
                  )}
                  <AvatarFallback className="bg-brand-maroon text-sm text-white">
                    {booking.bookerInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{booking.bookerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.dateLabel} · {booking.timeLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
