"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateProfile } from "@/lib/profile-data";
import { useCurrentAccount } from "@/lib/use-current-account";
import type { AccountProfile } from "@/lib/account";

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: AccountProfile;
  onSaved?: () => void;
}) {
  const { studentId, vendorId } = useCurrentAccount();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [graduationYear, setGraduationYear] = useState(
    profile.graduationYear != null ? String(profile.graduationYear) : "",
  );
  const [bio, setBio] = useState(profile.bio);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (studentId == null) return;
    setBusy(true);
    setError(null);
    try {
      await updateProfile(studentId, vendorId, {
        firstName: firstName.trim() || profile.firstName,
        lastName: lastName.trim() || profile.lastName,
        graduationYear: graduationYear ? Number(graduationYear) : null,
        bio: bio.trim(),
      });
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update your account details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-first">First name</Label>
              <Input
                id="pf-first"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-last">Last name</Label>
              <Input
                id="pf-last"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pf-grad">Graduation year</Label>
            <Input
              id="pf-grad"
              type="number"
              min="2000"
              max="2100"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              placeholder="2027"
            />
          </div>

          {vendorId != null && (
            <div className="space-y-1.5">
              <Label htmlFor="pf-bio">Seller bio</Label>
              <Textarea
                id="pf-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={busy}
            className="bg-brand-maroon text-white hover:bg-brand-maroon-dark"
          >
            {busy ? "Saving…" : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
