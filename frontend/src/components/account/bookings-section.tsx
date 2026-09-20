"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RateDialog } from "@/components/account/rate-dialog";
import { markCompleted, useBookings } from "@/lib/profile-data";
import { useCurrentAccount } from "@/lib/use-current-account";
import type { Appointment } from "@/lib/api";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground capitalize">
      {status.replace("-", " ")}
    </span>
  );
}

function AppointmentCard({
  appointment,
  action,
}: {
  appointment: Appointment;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-background p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{appointment.service_name}</p>
        <p className="text-xs text-muted-foreground">{formatDate(appointment.booked_at)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={appointment.status} />
        {action}
      </div>
    </div>
  );
}

type RateTarget = { direction: "vendor" | "buyer"; targetId: number; appointmentId: number };

export function BookingsSection() {
  const { isVendor } = useCurrentAccount();
  const { purchases, sales, ratedPurchaseIds, ratedSaleIds, loading, refresh } = useBookings();
  const [rateTarget, setRateTarget] = useState<RateTarget | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function handleMarkComplete(appointmentId: number) {
    setBusyId(appointmentId);
    try {
      await markCompleted(appointmentId);
      refresh();
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8">
      <h2 className="mb-4 font-heading text-2xl font-bold text-brand-orange">Bookings</h2>

      {loading ? (
        <p className="text-muted-foreground">Loading bookings…</p>
      ) : (
        <div className="space-y-8">
          <section>
            <h3 className="mb-2 font-heading text-lg font-bold text-brand-maroon">Purchases</h3>
            {purchases.length === 0 ? (
              <p className="text-sm text-muted-foreground">No purchases yet.</p>
            ) : (
              <div className="space-y-2">
                {purchases.map((a) => (
                  <AppointmentCard
                    key={a.appointment_id}
                    appointment={a}
                    action={
                      a.status === "complete" && !ratedPurchaseIds.has(a.appointment_id) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setRateTarget({
                              direction: "vendor",
                              targetId: a.vendor_id,
                              appointmentId: a.appointment_id,
                            })
                          }
                        >
                          Rate seller
                        </Button>
                      ) : undefined
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {isVendor && (
            <section>
              <h3 className="mb-2 font-heading text-lg font-bold text-brand-maroon">Sales</h3>
              {sales.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales yet.</p>
              ) : (
                <div className="space-y-2">
                  {sales.map((a) => (
                    <AppointmentCard
                      key={a.appointment_id}
                      appointment={a}
                      action={
                        <div className="flex items-center gap-2">
                          {a.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busyId === a.appointment_id}
                              onClick={() => handleMarkComplete(a.appointment_id)}
                            >
                              Mark complete
                            </Button>
                          )}
                          {a.status === "complete" && !ratedSaleIds.has(a.appointment_id) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setRateTarget({
                                  direction: "buyer",
                                  targetId: a.student_id,
                                  appointmentId: a.appointment_id,
                                })
                              }
                            >
                              Rate buyer
                            </Button>
                          )}
                        </div>
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {rateTarget && (
        <RateDialog
          open={!!rateTarget}
          onOpenChange={(o) => {
            if (!o) setRateTarget(null);
          }}
          direction={rateTarget.direction}
          targetId={rateTarget.targetId}
          appointmentId={rateTarget.appointmentId}
          onRated={refresh}
        />
      )}
    </div>
  );
}
