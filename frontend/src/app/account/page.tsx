"use client";

import { useSession } from "next-auth/react";
import { Navbar } from "@/components/marketplace/navbar";
import { ProfileView } from "@/components/account/profile-view";
import { currentUser } from "@/lib/account";

export default function AccountPage() {
  const { data: session } = useSession();
  const googleUser = session?.user;

  const profile = googleUser
    ? {
        ...currentUser,
        firstName: googleUser.firstName ?? currentUser.firstName,
        lastName: googleUser.lastName ?? currentUser.lastName,
        email: googleUser.email ?? currentUser.email,
        avatarInitials:
          `${googleUser.firstName?.[0] ?? ""}${googleUser.lastName?.[0] ?? ""}`.toUpperCase() ||
          currentUser.avatarInitials,
        image: googleUser.image ?? undefined,
      }
    : currentUser;

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <Navbar />
      <ProfileView profile={profile} />
    </div>
  );
}
