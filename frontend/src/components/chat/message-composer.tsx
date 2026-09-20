"use client";
import { useState } from "react";
import { Send } from "lucide-react";
export function MessageComposer({ onSend, disabled, placeholder = "Write a message…" }: { onSend: (text: string) => Promise<void>; disabled: boolean; placeholder?: string }) {
  const [text, setText] = useState(""); const [sending, setSending] = useState(false);
  return <form className="flex items-end gap-2 border-t bg-card p-3 sm:p-4" onSubmit={async e => {
    e.preventDefault(); if (!text.trim() || sending) return; setSending(true);
    try { await onSend(text); setText(""); } catch { /* Parent displays error and preserves draft. */ }
    finally { setSending(false); }
  }}>
    <input aria-label="Message" placeholder={placeholder} maxLength={4000} value={text} onChange={e => setText(e.target.value)}
      className="min-w-0 flex-1 rounded-2xl border bg-muted/50 px-4 py-3 outline-none transition placeholder:text-muted-foreground focus:border-ring focus:bg-background focus:ring-2 focus:ring-brand-orange/40" />
    <button type="submit" disabled={disabled || sending || !text.trim()} aria-label="Send message"
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-maroon text-white shadow-sm transition hover:bg-brand-maroon-dark disabled:opacity-40">
      <Send size={18} />
    </button>
  </form>;
}
