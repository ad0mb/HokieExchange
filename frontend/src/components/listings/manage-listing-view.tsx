"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { removeListing, updateListing } from "@/lib/listing-data";
import type { Service } from "@/lib/services";

export function ManageListingView({ service }: { service: Service }) {
  const router = useRouter();
  const [title, setTitle] = useState(service.title);
  const [description, setDescription] = useState(service.description);
  const [location, setLocation] = useState(service.location ?? "");
  const [price, setPrice] = useState(String(service.price));
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await updateListing(Number(service.id), {
        serviceName: title.trim() || service.title,
        description: description.trim() || service.description,
        location: location.trim() || null,
        price: Number(price) || service.price,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this listing?")) return;
    setBusy(true);
    setError(null);
    try {
      await removeListing(Number(service.id));
      router.replace("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the listing.");
      setBusy(false);
    }
  }

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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="listing-price">Price ($)</Label>
            <Input
              id="listing-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setSaved(false);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="listing-location">Location</Label>
            <Input
              id="listing-location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setSaved(false);
              }}
            />
          </div>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={busy}
            className="bg-brand-maroon text-white hover:bg-brand-maroon-dark"
          >
            Save changes
          </Button>
          {saved && <span className="text-sm text-muted-foreground">Saved!</span>}
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={handleDelete}
            className="text-destructive hover:bg-destructive/10"
          >
            Delete
          </Button>
        </div>
      </form>
    </div>
  );
}
