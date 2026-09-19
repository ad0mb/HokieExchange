"use client";
import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { connectChat, history, type Message } from "@/chat/chatsignal/client";
import { MessageList } from "@/components/chat/message-list";
import { MessageComposer } from "@/components/chat/message-composer";

export function ChatWindow({ studentId, vendorId, role }: { studentId: number; vendorId: number; role: "student" | "vendor" }) {
  const socket = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [ready, setReady] = useState(false); const [error, setError] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const merge = (incoming: Message[]) => setMessages(old => Array.from(new Map([...old, ...incoming].map(m => [m.id, m])).values()).sort((a,b) => a.id.localeCompare(b.id)));
  useEffect(() => {
    let active = true; const client = connectChat(studentId, vendorId, role); socket.current = client;
    client.on("message_received", (m: Message) => { if(active) merge([m]); });
    client.on("connect", async () => {
      try { const result = await history(studentId, vendorId); if(!active) return; merge(result.messages); setCursor(result.next_before); setReady(true); setError(""); }
      catch(e) { if(active) setError((e as Error).message); }
    });
    client.on("disconnect", () => { setReady(false); });
    client.on("connect_error", () => { setReady(false); setError("Cannot connect to chat. Check that the backend is running."); });
    client.connect();
    return () => { active = false; client.disconnect(); socket.current = null; };
  }, [studentId, vendorId, role]);
  async function send(text: string) {
    try {
      const reply = await socket.current!.timeout(8000).emitWithAck("send_message", { text });
      if(!reply.ok) throw new Error(reply.error);
      merge([reply.message]); setError("");
    } catch(e) { setError("Send was not confirmed. Reload history before retrying."); throw e; }
  }
  return <section className="flex h-[min(700px,75vh)] flex-col overflow-hidden rounded-3xl border bg-white shadow-sm">
    <header className="flex items-center justify-between border-b px-6 py-5"><div><h2 className="font-semibold text-lg">Student {studentId} ↔ Vendor {vendorId}</h2><p className="text-sm text-stone-500">Viewing as {role === "student" ? "buyer" : "vendor"}</p></div><span role="status" className="text-sm text-stone-500">{ready ? "Connected" : "Connecting…"}</span></header>
    {error && <p role="alert" className="bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {cursor && <button className="p-2 text-sm underline" onClick={async () => { try { const r = await history(studentId,vendorId,cursor); merge(r.messages); setCursor(r.next_before); } catch(e) { setError((e as Error).message); } }}>Load earlier messages</button>}
    <MessageList messages={messages.map(m => ({ id:m.id, text:m.text, mine:m.sender_role===role, label: new Date(m.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}) }))} />
    <MessageComposer onSend={send} disabled={!ready} />
  </section>;
}
