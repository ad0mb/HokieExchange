export type Contact = { studentId: number; vendorId: number | null; name: string };
export type AgentListing = { type: "service" | "item"; id: number; name: string; description: string; price: number | null; currency: "USD"; location: string; stock: number | null; vendor_name?: string; rating?: number | null; available_slots?: number | null };
export type Message = { id: string; sender_id: number; recipient_id: number; text: string; listings?: AgentListing[]; created_at: string; read: boolean };
export type History = { messages: Message[]; next_before: string | null };
export type Conversation = { contact: Contact; lastMessage: Message; unread: number };
export const BOT_ID = 0;
export const BOT: Contact = { studentId: BOT_ID, vendorId: null, name: "Hokie Assistant" };
// Use the website's existing rewrite to reach Socket.IO on the HTTP backend.
export const chatPath = "/api/backend/socket.io";

// Chat REST is proxied through the Next.js server like the rest of the API.
const REST_BASE = "/api/backend";

export async function request<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(REST_BASE + path, { ...init, cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers, Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(12000) });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.detail === "string" ? body.detail : "Unable to load messaging. Please retry.");
  }
  return response.json();
}
