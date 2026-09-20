"use client";

import { Navbar } from "@/components/marketplace/navbar";
import { ProfileView } from "@/components/account/profile-view";
import { currentUser } from "@/lib/account";
import { useServices } from "@/lib/services-store";
import { useCurrentViewer } from "@/lib/use-current-viewer";

export default function AccountPage() {
  const viewer = useCurrentViewer();
  const services = useServices();
  const listings = services.filter((s) => s.sellerName === "You");

  const profile = {
    ...currentUser,
    firstName: viewer.firstName,
    lastName: viewer.lastName,
    email: viewer.email,
    avatarInitials: viewer.initials,
    image: viewer.image,
  };

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <Navbar />
      <ProfileView profile={profile} listings={listings} />
    </div>
  );
}
