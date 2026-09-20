"use client";

import { useSession } from "next-auth/react";

export type CurrentAccount = {
  studentId?: number;
  vendorId: number | null;
  isVendor: boolean;
  loading: boolean;
  authenticated: boolean;
};

export function useCurrentAccount(): CurrentAccount {
  const { data: session, status } = useSession();
  const studentId = session?.user?.studentId;
  const vendorId = session?.user?.vendorId ?? null;

  return {
    studentId,
    vendorId,
    isVendor: vendorId != null,
    loading: status === "loading",
    authenticated: studentId != null,
  };
}
