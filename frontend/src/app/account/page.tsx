"use client";

import { useSession } from "next-auth/react";
import { Navbar } from "@/components/marketplace/navbar";
import { ProfileView } from "@/components/account/profile-view";
import { currentUser } from "@/lib/account";

export default function AccountPage() {
  const { data: session } = useSession();
  const googleUser = session?.user;

  const profile = googleUser
    ? (() => {
        const [nameFirst, ...nameRest] = (googleUser.name ?? "").split(" ");
        const firstName = googleUser.firstName || nameFirst || "";
        const lastName = googleUser.lastName || nameRest.join(" ");

        return {
          ...currentUser,
          firstName,
          lastName,
          email: googleUser.email ?? currentUser.email,
          avatarInitials:
            `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() ||
            currentUser.avatarInitials,
          image: googleUser.image ?? undefined,
        };
      })()
    : currentUser;

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <Navbar />
      <ProfileView profile={profile} />
    </div>
  );
}
