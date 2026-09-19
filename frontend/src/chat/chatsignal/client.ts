import { io } from "socket.io-client";
export type Message = { id: string; sender_role: "student" | "vendor"; student_id: number; vendor_id: number; text: string; created_at: string };
export type History = { messages: Message[]; next_before: string | null };
const base = process.env.NEXT_PUBLIC_CHAT_API_URL || "http://localhost:8000";
export function connectChat(studentId: number, vendorId: number, role: "student" | "vendor") {
  return io(base, { autoConnect: false, auth: { student_id: studentId, vendor_id: vendorId, role } });
}
export async function history(studentId: number, vendorId: number, before?: string): Promise<History> {
  const query = new URLSearchParams({ student_id: String(studentId) }); if (before) query.set("before", before);
  const response = await fetch(base + "/chat/vendors/" + vendorId + "/messages?" + query, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load history. Check the backend connection and demo configuration.");
  return response.json();
}
