"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/marketplace/navbar";
import { ProfileView } from "@/components/account/profile-view";
import { EditProfileDialog } from "@/components/account/edit-profile-dialog";
import { Button } from "@/components/ui/button";
import { useListings } from "@/lib/listing-data";
import { becomeVendor, useAccountProfile } from "@/lib/profile-data";
import { useCurrentAccount } from "@/lib/use-current-account";

export default function AccountPage() {
  const { update } = useSession();
  const { vendorId, authenticated, isVendor } = useCurrentAccount();
  const { profile, loading, refresh } = useAccountProfile();
  const { services } = useListings();
  const [editOpen, setEditOpen] = useState(false);

  const myListings = services.filter((s) => s.vendorId === vendorId);

  async function handleBecomeVendor() {
    await becomeVendor();
    await update({});
  }

  if (loading || !authenticated) {
    return (
      <div className="flex min-h-screen flex-col bg-secondary">
        <Navbar />
        <p className="p-8 text-muted-foreground">
          {authenticated ? "Loading…" : "Sign in to view your account."}
        </p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <Navbar />
      <div className="mx-auto flex w-full max-w-5xl justify-end gap-2 px-4 pt-6 sm:px-8">
        {!isVendor && (
          <Button variant="outline" onClick={handleBecomeVendor}>
            Become a vendor
          </Button>
        )}
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          Edit profile
        </Button>
      </div>
      <ProfileView profile={profile} listings={myListings} isVendor={isVendor} />
      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile}
        onSaved={refresh}
      />
    </div>
  );
}
