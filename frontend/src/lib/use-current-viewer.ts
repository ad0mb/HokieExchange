"use client";

import { useSession } from "next-auth/react";
import { currentUser } from "@/lib/account";

export function useCurrentViewer() {
  const { data: session } = useSession();
  const googleUser = session?.user;

  if (googleUser) {
    const [nameFirst, ...nameRest] = (googleUser.name ?? "").split(" ");
    const firstName = googleUser.firstName || nameFirst || "";
    const lastName = googleUser.lastName || nameRest.join(" ");

    return {
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim() || "You",
      initials:
        `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "Y",
      image: googleUser.image ?? undefined,
      email: googleUser.email ?? currentUser.email,
    };
  }

  return {
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    name: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
    initials: currentUser.avatarInitials,
    image: currentUser.image,
    email: currentUser.email,
  };
}
