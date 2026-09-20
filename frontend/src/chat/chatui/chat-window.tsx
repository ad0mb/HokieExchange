"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, PanelRight, Sparkles } from "lucide-react";
import { useChat } from "@/chat/chat-provider";
import type { Contact, History, Message } from "@/chat/chatsignal/client";
import { BOT_ID } from "@/chat/chatsignal/client";
import { AgentResults } from "./agent-results";
import { MessageList } from "@/components/chat/message-list";
import { MessageComposer } from "@/components/chat/message-composer";
import { cn, initials } from "@/lib/utils";

export function ChatWindow({ contact, onBack }: { contact: Contact; onBack: () => void }) {
  const { account, api, socket, connected, refreshInbox } = useChat();
  const isBot = contact.studentId === BOT_ID;
  const [messages, setMessages] = useState<Message[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const [typing, setTyping] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
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

  useEffect(() => {
    if (!isBot) return;
    const onTyping = (payload: { typing?: boolean }) => { setTyping(!!payload?.typing); };
    const clearTyping = () => setTyping(false);
    socket?.on("bot_typing", onTyping);
    socket?.on("disconnect", clearTyping);
    return () => { socket?.off("bot_typing", onTyping); socket?.off("disconnect", clearTyping); };
  }, [socket, isBot]);

  async function send(text: string) {
    try {
      if (!socket?.connected) throw new Error("Messaging is reconnecting. Try again shortly.");
      const reply = await socket.timeout(10000).emitWithAck("send_message", { recipient_id: contact.studentId, text });
      if (!reply.ok) throw new Error(reply.error);
      merge([reply.message]); setError("");
    } catch (e) { setError((e as Error).message || "Send was not confirmed. Reload before retrying."); throw e; }
  }
  const latestListings = messages.findLast(m => m.sender_id === BOT_ID)?.listings ?? [];
  return <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
    <header className="flex items-center gap-3 border-b bg-card px-4 py-3">
      <button onClick={onBack} aria-label="Back to conversations" className="rounded-full p-2 text-muted-foreground hover:bg-muted md:hidden"><ArrowLeft size={20} /></button>
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full text-white shadow-sm", isBot ? "bg-gradient-to-br from-brand-maroon to-brand-orange" : "bg-brand-maroon")}>
        {isBot ? <Sparkles size={18} /> : <span className="text-sm font-semibold">{initials(contact.name)}</span>}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="truncate font-heading font-semibold">{contact.name}</h2>
          {isBot && <span className="rounded-full bg-brand-orange/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-orange">AI</span>}
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn("size-1.5 rounded-full", connected ? "bg-emerald-500" : "bg-amber-500")} />
          {isBot ? "Assistant" : contact.vendorId ? "Student · Seller" : "Student"}
        </p>
      </div>
      <span role="status" className="ml-auto hidden text-xs text-muted-foreground sm:block">{connected ? "Connected" : "Reconnecting…"}</span>
      {isBot && <button type="button" onClick={() => setResultsOpen(value => !value)} aria-expanded={resultsOpen} aria-controls="assistant-results-panel" className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted lg:hidden"><PanelRight size={16} />Results{latestListings.length > 0 && <span className="rounded-full bg-brand-maroon px-1.5 py-0.5 text-[10px] text-white">{latestListings.length}</span>}</button>}
    </header>
    <div className="relative flex min-h-0 flex-1 overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {error && <p role="alert" className="border-b p-3 text-sm text-destructive">{error}</p>}
        {loading && <p role="status" className="p-4 text-sm text-muted-foreground">Loading messages…</p>}
        {cursor && <button disabled={loadingEarlier} className="p-2 text-sm text-brand-maroon underline disabled:opacity-50" onClick={async () => {
          setLoadingEarlier(true);
          try { const result = await api<History>(`/chat/users/${contact.studentId}/messages?before=${cursor}`); merge(result.messages); setCursor(result.next_before); }
          catch(e) { setError((e as Error).message); } finally { setLoadingEarlier(false); }
        }}>{loadingEarlier ? "Loading…" : "Load earlier messages"}</button>}
        <MessageList messages={messages.map(m => ({ id: m.id, text: m.text, mine: m.sender_id === account?.studentId,
          label: new Date(m.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          name: contact.name, avatar: isBot ? <Sparkles size={14} /> : undefined }))} />
        {typing && <p className="flex items-center gap-2 px-6 pb-2 text-xs text-muted-foreground"><span className="flex gap-0.5"><span className="size-1 animate-bounce rounded-full bg-muted-foreground" /><span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" /><span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" /></span>{contact.name} is typing…</p>}
        <MessageComposer onSend={send} disabled={!connected || loading} placeholder={isBot ? "Ask the Hokie Assistant…" : "Write a message…"} />
      </div>
      {isBot && account && <AgentResults studentId={account.studentId} listings={latestListings} open={resultsOpen} onClose={() => setResultsOpen(false)} />}
    </div>
  </section>;
}
