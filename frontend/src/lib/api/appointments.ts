import { request } from "@/lib/api/client";

// Types mirror the backend Pydantic schemas (backend/appointments/schemas.py).

export type AppointmentCreate = {
  time_block_id: number;
  booked_at: string; // ISO datetime
  student_id: number;
  status?: string;
};

export type AppointmentUpdate = {
  status?: string;
  cancel_reason?: string | null;
  cancelled_at?: string | null;
  completed_at?: string | null;
};

export type Appointment = {
  appointment_id: number;
  time_block_id: number;
  booked_at: string;
  student_id: number;
  status: string;
  price_at_booking: string;
  cancel_reason: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  date_created: string | null;
  date_updated: string | null;
};

export function listAppointments(params?: {
  studentId?: number;
  vendorId?: number;
}): Promise<Appointment[]> {
  const q = new URLSearchParams();
  if (params?.studentId != null) q.set("student_id", String(params.studentId));
  if (params?.vendorId != null) q.set("vendor_id", String(params.vendorId));
  const query = q.toString();
  return request<Appointment[]>(`/appointments/${query ? `?${query}` : ""}`);
}

export function getAppointment(appointmentId: number): Promise<Appointment> {
  return request<Appointment>(`/appointments/${appointmentId}`);
}

export function createAppointment(data: AppointmentCreate): Promise<Appointment> {
  return request<Appointment>("/appointments/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAppointment(
  appointmentId: number,
  data: AppointmentUpdate,
): Promise<Appointment> {
  return request<Appointment>(`/appointments/${appointmentId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteAppointment(appointmentId: number): Promise<void> {
  return request<void>(`/appointments/${appointmentId}`, { method: "DELETE" });
}
