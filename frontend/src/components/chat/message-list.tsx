"use client";
import { useEffect, useRef } from "react";
export type DisplayMessage = { id: string; text: string; mine: boolean; label: string };
export function MessageList({ messages }: { messages: DisplayMessage[] }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [messages.length]);
  return <div role="log" aria-label="Messages" aria-live="polite" className="flex-1 overflow-y-auto space-y-4 p-6">
    {!messages.length && <p className="py-20 text-center text-stone-500">Your conversation starts here. Say hello.</p>}
    {messages.map(m => <div key={m.id} className={m.mine ? "flex justify-end" : "flex justify-start"}>
      <div className={"max-w-[80%] rounded-2xl px-4 py-3 " + (m.mine ? "bg-[#630031] text-white" : "bg-stone-100 text-stone-900")}>
        <p className="whitespace-pre-wrap break-words">{m.text}</p><p className="mt-1 text-xs opacity-65">{m.label}</p>
      </div>
    </div>)}<div ref={end} />
  </div>;
}

