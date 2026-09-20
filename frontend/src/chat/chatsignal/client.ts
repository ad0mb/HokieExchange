export type Contact = { studentId: number; vendorId: number | null; name: string };
export type Message = { id: string; sender_id: number; recipient_id: number; text: string; created_at: string; read: boolean };
export type History = { messages: Message[]; next_before: string | null };
export type Conversation = { contact: Contact; lastMessage: Message; unread: number };
export const chatUrl = process.env.NEXT_PUBLIC_CHAT_API_URL || "http://localhost:8000";

export async function request<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(chatUrl + path, { ...init, cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers, Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(12000) });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(typeof body.detail === "string" ? body.detail : "Unable to load messaging. Please retry.");
  }
  return response.json();
}
