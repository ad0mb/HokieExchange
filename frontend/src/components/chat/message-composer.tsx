"use client";
import { useState } from "react";
export function MessageComposer({ onSend, disabled }: { onSend: (text: string) => Promise<void>; disabled: boolean }) {
  const [text, setText] = useState(""); const [sending, setSending] = useState(false);
  return <form className="flex gap-3 border-t p-4" onSubmit={async e => {
    e.preventDefault(); if (!text.trim() || sending) return; setSending(true);
    try { await onSend(text); setText(""); } catch { /* Parent displays error and preserves draft. */ }
    finally { setSending(false); }
  }}>
    <input aria-label="Message" placeholder="Write a message…" maxLength={4000} value={text} onChange={e => setText(e.target.value)}
      className="min-w-0 flex-1 rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-brand-orange" />
    <button disabled={disabled || sending || !text.trim()} className="rounded-xl bg-brand-maroon px-4 text-white disabled:opacity-40">{sending ? "Sending…" : "Send"}</button>
  </form>;
}

