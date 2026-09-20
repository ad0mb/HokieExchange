"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useChat } from "@/chat/chat-provider";
import type { Contact, History, Message } from "@/chat/chatsignal/client";
import { MessageList } from "@/components/chat/message-list";
import { MessageComposer } from "@/components/chat/message-composer";

export function ChatWindow({ contact, onBack }: { contact: Contact; onBack: () => void }) {
  const { account, api, socket, connected, refreshInbox } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const latest = useRef<string | null>(null);
  const readThrough = useRef<string | null>(null);
  const merge = useCallback((incoming: Message[]) => {
    for (const m of incoming) if (!latest.current || m.id > latest.current) latest.current = m.id;
    setMessages(old => Array.from(new Map([...old, ...incoming].map(m => [m.id, m])).values()).sort((a,b) => a.id.localeCompare(b.id)));
  }, []);
  const markRead = useCallback(async () => {
    const through = latest.current;
    if (!through || readThrough.current === through || document.visibilityState !== "visible" || !document.hasFocus()) return;
    await api(`/chat/users/${contact.studentId}/read`, { method: "POST", body: JSON.stringify({ through }) });
    readThrough.current = through;
    await refreshInbox();
  }, [api, contact.studentId, refreshInbox]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const result = await api<History>(`/chat/users/${contact.studentId}/messages`);
        if (!active) return;
        merge(result.messages); setCursor(result.next_before); setError("");
        await markRead();
      } catch (e) { if (active) setError((e as Error).message); }
      finally { if (active) setLoading(false); }
    }
    const received = (m: Message) => {
      if ((m.sender_id === contact.studentId && m.recipient_id === account?.studentId) || (m.recipient_id === contact.studentId && m.sender_id === account?.studentId)) {
        merge([m]); void markRead().catch(e => { if (active) setError(e.message); });
      }
    };
    const visible = () => { void markRead().catch(e => { if (active) setError(e.message); }); };
    socket?.on("message_received", received);
    socket?.on("connect", load);
    document.addEventListener("visibilitychange", visible); window.addEventListener("focus", visible);
    void load();
    return () => { active = false; socket?.off("message_received", received); socket?.off("connect", load); document.removeEventListener("visibilitychange", visible); window.removeEventListener("focus", visible); };
  }, [socket, contact.studentId, account?.studentId, api, merge, markRead]);

  async function send(text: string) {
    try {
      if (!socket?.connected) throw new Error("Messaging is reconnecting. Try again shortly.");
      const reply = await socket.timeout(10000).emitWithAck("send_message", { recipient_id: contact.studentId, text });
      if (!reply.ok) throw new Error(reply.error);
      merge([reply.message]); setError("");
    } catch (e) { setError((e as Error).message || "Send was not confirmed. Reload before retrying."); throw e; }
  }
  return <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
    <header className="flex items-center gap-3 border-b p-4">
      <button onClick={onBack} aria-label="Back to conversations" className="rounded-md p-2 hover:bg-muted md:hidden"><ArrowLeft size={20} /></button>
      <div className="min-w-0"><h2 className="truncate font-heading font-semibold">{contact.name}</h2><p className="text-xs text-muted-foreground">{contact.vendorId ? "Student · Seller" : "Student"}</p></div>
      <span role="status" className="ml-auto text-xs text-muted-foreground">{connected ? "Connected" : "Reconnecting…"}</span>
    </header>
    {error && <p role="alert" className="p-3 text-sm text-destructive">{error}</p>}
    {loading && <p role="status" className="p-4 text-sm text-muted-foreground">Loading messages…</p>}
    {cursor && <button disabled={loadingEarlier} className="p-2 text-sm text-brand-maroon underline disabled:opacity-50" onClick={async () => {
      setLoadingEarlier(true);
      try { const result = await api<History>(`/chat/users/${contact.studentId}/messages?before=${cursor}`); merge(result.messages); setCursor(result.next_before); }
      catch(e) { setError((e as Error).message); } finally { setLoadingEarlier(false); }
    }}>{loadingEarlier ? "Loading…" : "Load earlier messages"}</button>}
    <MessageList messages={messages.map(m => ({ id: m.id, text: m.text, mine: m.sender_id === account?.studentId,
      label: new Date(m.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) }))} />
    <MessageComposer onSend={send} disabled={!connected || loading} />
  </section>;
}
