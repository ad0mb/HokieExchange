"use client";
import { useEffect, useRef } from "react";
import { cn, initials } from "@/lib/utils";
export type DisplayMessage = { id: string; text: string; mine: boolean; label: string; name?: string; avatar?: React.ReactNode };
export function MessageList({ messages }: { messages: DisplayMessage[] }) {
  const end = useRef<HTMLDivElement>(null);
  const lastId = messages.at(-1)?.id;
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [lastId]);
  return <div role="log" aria-label="Messages" aria-live="polite" className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
    {!messages.length && <div className="flex h-full flex-col items-center justify-center gap-2 py-20 text-center">
      <p className="text-sm font-medium">Start the conversation</p>
      <p className="max-w-xs text-sm text-muted-foreground">Ask about services, listings, and bookings — the assistant replies right here.</p>
    </div>}
    {messages.map((m, i) => {
      const grouped = i > 0 && messages[i - 1].mine === m.mine;
      return <div key={m.id} className={cn("flex items-end gap-2", m.mine ? "justify-end" : "justify-start", grouped ? "mt-1" : "mt-4")}>
        {!m.mine && (grouped ? <div className="size-7 shrink-0" /> :
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-maroon to-brand-orange text-[11px] font-semibold text-white shadow-sm">{m.avatar ?? initials(m.name)}</div>)}
        <div className={cn("flex min-w-0 max-w-[78%] flex-col", m.mine ? "items-end" : "items-start")}>
          {!m.mine && !grouped && m.name && <p className="mb-1 px-1 text-xs font-medium text-muted-foreground">{m.name}</p>}
          <div className={cn("px-4 py-2.5 text-sm leading-relaxed [overflow-wrap:anywhere] shadow-sm", m.mine ? "rounded-2xl rounded-br-md bg-brand-maroon text-white" : "rounded-2xl rounded-bl-md border bg-card text-foreground")}>
            <p className="whitespace-pre-wrap break-words">{m.text}</p>
          </div>
          <p className="mt-1 px-1 text-[11px] text-muted-foreground">{m.label}</p>
        </div>
      </div>;
    })}
    <div ref={end} />
  </div>;
}
