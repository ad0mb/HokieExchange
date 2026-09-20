"use client";
import { useEffect, useRef } from "react";
export type DisplayMessage = { id: string; text: string; mine: boolean; label: string };
export function MessageList({ messages }: { messages: DisplayMessage[] }) {
  const end = useRef<HTMLDivElement>(null);
  const lastId = messages.at(-1)?.id;
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [lastId]);
  return <div role="log" aria-label="Messages" aria-live="polite" className="min-h-0 flex-1 overflow-y-auto space-y-4 p-4 sm:p-6">
    {!messages.length && <p className="py-20 text-center text-muted-foreground">Your conversation starts here. Say hello.</p>}
    {messages.map(m => <div key={m.id} className={m.mine ? "flex justify-end" : "flex justify-start"}>
      <div className={"min-w-0 max-w-[85%] rounded-2xl px-4 py-3 [overflow-wrap:anywhere] " + (m.mine ? "bg-brand-maroon text-white" : "bg-muted text-foreground")}>
        <p className="whitespace-pre-wrap break-words">{m.text}</p><p className="mt-1 text-xs opacity-65">{m.label}</p>
      </div>
    </div>)}<div ref={end} />
  </div>;
}

