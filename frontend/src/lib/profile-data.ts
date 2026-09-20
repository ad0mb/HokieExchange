"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createConsumerRating,
  createVendorRating,
  getAllConsumerRatings,
  getAllStudents,
  getAllVendorRatings,
  getAllVendors,
  getConsumerRatingAverage,
  getStudent,
  getVendor,
  getVendorRatingAverage,
  listAppointments,
  listServices,
  updateAppointment,
  updateStudent,
  updateVendor,
  type Appointment,
  type Student,
  type Vendor,
} from "@/lib/api";
import type { AccountProfile, Review } from "@/lib/account";
import { initials, mapService } from "@/lib/listing-data";
import { sellerSlug } from "@/lib/sellers";
import type { Service } from "@/lib/services";
import { useCurrentAccount } from "@/lib/use-current-account";

type NameMaps = { studentById: Map<number, Student>; vendorById: Map<number, Vendor> };

async function buildNameMaps(): Promise<NameMaps> {
  const [students, vendors] = await Promise.all([getAllStudents(), getAllVendors()]);
  return {
    studentById: new Map(students.map((s) => [s.student_id, s])),
    vendorById: new Map(vendors.map((v) => [v.vendor_id, v])),
  };
}

function fullName(s: Student): string {
  return `${s.first_name} ${s.last_name}`.trim();
}

function toReview(
  rating: { rating: string; description?: string | null },
  raterName: string,
): Review {
  return {
    raterName,
    raterInitials: initials(raterName),
    rating: Number(rating.rating),
    comment: rating.description ?? "",
  };
}

export async function fetchAccountProfile(
  studentId: number,
  vendorId: number | null,
): Promise<AccountProfile> {
  const { studentById, vendorById } = await buildNameMaps();
  const student = studentById.get(studentId) ?? (await getStudent(studentId));
  const vendor = vendorId != null ? (vendorById.get(vendorId) ?? (await getVendor(vendorId))) : null;

  const [vendorRatings, consumerRatings, vendorAvg, consumerAvg, bought, sold, myServices] =
    await Promise.all([
      vendorId != null ? getAllVendorRatings({ vendorId }) : Promise.resolve([]),
      getAllConsumerRatings({ studentId }),
      vendorId != null ? getVendorRatingAverage(vendorId) : Promise.resolve(null),
      getConsumerRatingAverage(studentId),
      listAppointments({ studentId }),
      vendorId != null ? listAppointments({ vendorId }) : Promise.resolve([]),
      vendorId != null ? listServices({ vendorId }) : Promise.resolve([]),
    ]);

  const name = fullName(student);

  return {
    firstName: student.first_name,
    lastName: student.last_name,
    email: student.email ?? "",
    avatarInitials: initials(name),
    graduationYear: student.graduation_year,
    bio: vendor?.description ?? "",
    buyer: {
      rating: consumerAvg?.average != null ? Number(consumerAvg.average) : 0,
      ratingCount: consumerAvg?.count ?? 0,
      itemsBought: bought.length,
      reviews: consumerRatings.map((r) => {
        const ratingVendor = vendorById.get(r.vendor_id);
        const owner = ratingVendor ? studentById.get(ratingVendor.student_id) : undefined;
        return toReview(r, owner ? fullName(owner) : "VT Student");
      }),
    },
    vendor: {
      rating: vendorAvg?.average != null ? Number(vendorAvg.average) : 0,
      ratingCount: vendorAvg?.count ?? 0,
      itemsSold: sold.length,
      reviews: vendorRatings.map((r) => {
        const rater = studentById.get(r.student_id);
        return toReview(r, rater ? fullName(rater) : "VT Student");
      }),
      listingIds: myServices.map((s) => String(s.service_id)),
    },
  };
}

export async function fetchVendorProfile(vendorId: number): Promise<{
  profile: AccountProfile;
  listings: Service[];
}> {
  const { studentById, vendorById } = await buildNameMaps();
  const vendor = vendorById.get(vendorId) ?? (await getVendor(vendorId));
  const student = studentById.get(vendor.student_id) ?? (await getStudent(vendor.student_id));

  const [vendorRatings, vendorAvg, sold, myServices] = await Promise.all([
    getAllVendorRatings({ vendorId }),
    getVendorRatingAverage(vendorId),
    listAppointments({ vendorId }),
    listServices({ vendorId }),
  ]);

  const name = fullName(student);
  const profile: AccountProfile = {
    firstName: student.first_name,
    lastName: student.last_name,
    email: student.email ?? "",
    avatarInitials: initials(name),
    graduationYear: student.graduation_year,
    bio: vendor.description,
    buyer: { rating: 0, ratingCount: 0, itemsBought: 0, reviews: [] },
    vendor: {
      rating: vendorAvg?.average != null ? Number(vendorAvg.average) : 0,
      ratingCount: vendorAvg?.count ?? 0,
      itemsSold: sold.length,
      reviews: vendorRatings.map((r) => {
        const rater = studentById.get(r.student_id);
        return toReview(r, rater ? fullName(rater) : "VT Student");
      }),
      listingIds: myServices.map((s) => String(s.service_id)),
    },
  };

  return { profile, listings: myServices.map(mapService) };
}

export type ProfileUpdate = {
  firstName: string;
  lastName: string;
  graduationYear: number | null;
  bio: string;
};

export async function updateProfile(
  studentId: number,
  vendorId: number | null,
  data: ProfileUpdate,
): Promise<void> {
  await updateStudent(studentId, {
    first_name: data.firstName,
    last_name: data.lastName,
    graduation_year: data.graduationYear,
  });
  if (vendorId != null) {
    await updateVendor(vendorId, { description: data.bio });
  }
}

export async function rateVendor(input: {
  studentId: number;
  vendorId: number;
  rating: number;
  description: string;
  appointmentId: number;
}): Promise<void> {
  await createVendorRating({
    student_id: input.studentId,
    vendor_id: input.vendorId,
    rating: String(input.rating),
    description: input.description,
    appointment_id: input.appointmentId,
  });
}

export async function rateBuyer(input: {
  studentId: number;
  vendorId: number;
  rating: number;
  appointmentId: number;
}): Promise<void> {
  await createConsumerRating({
    student_id: input.studentId,
    vendor_id: input.vendorId,
    rating: String(input.rating),
    appointment_id: input.appointmentId,
  });
}

export async function markCompleted(appointmentId: number): Promise<void> {
  await updateAppointment(appointmentId, {
    status: "complete",
    completed_at: new Date().toISOString(),
  });
}

export async function becomeVendor(): Promise<void> {
  const response = await fetch("/api/auth/vendor", { method: "POST" });
  if (!response.ok) throw new Error("Could not create your seller profile.");
}

export function useAccountProfile() {
  const { studentId, vendorId, loading: authLoading, authenticated } = useCurrentAccount();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (studentId == null) return;
    setLoading(true);
    try {
      setProfile(await fetchAccountProfile(studentId, vendorId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [studentId, vendorId]);

  useEffect(() => {
    if (studentId == null) return;
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchAccountProfile(studentId, vendorId);
        if (!cancelled) setProfile(result);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId, vendorId]);

  return { profile, loading: loading || authLoading, error, authenticated, refresh };
}

export function useSellerProfile(slug: string) {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [listings, setListings] = useState<Service[]>([]);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const services = await listServices();
        const match = services.find((s) => sellerSlug(s.seller_name) === slug);
        if (!match) {
          if (!cancelled) {
            setProfile(null);
            setVendorId(null);
            setLoading(false);
          }
          return;
        }
        const result = await fetchVendorProfile(match.vendor_id);
        if (!cancelled) {
          setProfile(result.profile);
          setListings(result.listings);
          setVendorId(match.vendor_id);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
          setVendorId(null);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { profile, listings, vendorId, loading };
}

async function fetchBookings(
  studentId: number | undefined,
  vendorId: number | null,
): Promise<{
  purchases: Appointment[];
  sales: Appointment[];
  ratedPurchaseIds: Set<number>;
  ratedSaleIds: Set<number>;
}> {
  const [p, s, vendorRatings, consumerRatings] = await Promise.all([
    studentId != null ? listAppointments({ studentId }) : Promise.resolve([]),
    vendorId != null ? listAppointments({ vendorId }) : Promise.resolve([]),
    studentId != null ? getAllVendorRatings({ studentId }) : Promise.resolve([]),
    vendorId != null ? getAllConsumerRatings({ vendorId }) : Promise.resolve([]),
  ]);
  return {
    purchases: p,
    sales: s,
    ratedPurchaseIds: new Set(
      vendorRatings.map((r) => r.appointment_id).filter((x): x is number => x != null),
    ),
    ratedSaleIds: new Set(
      consumerRatings.map((r) => r.appointment_id).filter((x): x is number => x != null),
    ),
  };
}

export function useBookings() {
  const { studentId, vendorId } = useCurrentAccount();
  const [purchases, setPurchases] = useState<Appointment[]>([]);
  const [sales, setSales] = useState<Appointment[]>([]);
  const [ratedPurchaseIds, setRatedPurchaseIds] = useState<Set<number>>(new Set());
  const [ratedSaleIds, setRatedSaleIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const result = await fetchBookings(studentId, vendorId);
    setPurchases(result.purchases);
    setSales(result.sales);
    setRatedPurchaseIds(result.ratedPurchaseIds);
    setRatedSaleIds(result.ratedSaleIds);
  }, [studentId, vendorId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await fetchBookings(studentId, vendorId);
        if (!cancelled) {
          setPurchases(result.purchases);
          setSales(result.sales);
          setRatedPurchaseIds(result.ratedPurchaseIds);
          setRatedSaleIds(result.ratedSaleIds);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId, vendorId]);

  return { purchases, sales, ratedPurchaseIds, ratedSaleIds, loading, refresh };
}
