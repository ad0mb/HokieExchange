"use client";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useChat } from "@/chat/chat-provider";
import type { Contact } from "@/chat/chatsignal/client";
import { BOT, BOT_ID } from "@/chat/chatsignal/client";
import { Navbar } from "@/components/marketplace/navbar";
import { ChatWindow } from "./chat-window";
import { cn, initials } from "@/lib/utils";

export function ChatDemo() {
  const { status } = useSession();
  const { account, inbox, api, error, retry } = useChat();
  const [selected, setSelected] = useState<Contact | null>(BOT);
  const [search, setSearch] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchError, setSearchError] = useState("");
  useEffect(() => {
    if (!account) return;
    let active = true;
    const timer = setTimeout(async () => {
      try { const rows = await api<Contact[]>(`/chat/contacts?q=${encodeURIComponent(search)}`); if (active) { setContacts(rows); setSearchError(""); } }
      catch (e) { if (active) setSearchError((e as Error).message); }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [account, api, search]);
  return <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
    <Navbar />
    <div className="flex items-center justify-between border-b px-4 py-3"><h1 className="font-heading text-xl font-semibold">Messages</h1><Link href="/" className="text-sm text-brand-maroon hover:underline">Back to marketplace</Link></div>
    {status === "unauthenticated" ? <main className="m-auto space-y-4 p-6 text-center"><p>Sign in to message another Hokie.</p><button onClick={() => signIn("google", { redirectTo: "/chats" })} className="rounded-lg bg-brand-maroon px-4 py-2 text-white">Continue with Google</button></main> : <>
      {error && <div role="alert" className="border-b p-3 text-sm text-destructive">{error} <button onClick={retry} className="underline">Retry</button></div>}
      {!account ? <p role="status" className="m-auto p-6 text-muted-foreground">{error ? "Messaging is not available yet." : "Connecting your account…"}</p> : <main className="mx-auto flex min-h-0 w-full max-w-[90rem] flex-1 md:border-x">
        <aside aria-label="Conversations" className={cn("w-full flex-col border-r md:flex md:w-80 md:shrink-0", selected ? "hidden" : "flex")}>
          <div className="p-4"><label htmlFor="chat-search" className="mb-2 block text-sm font-medium">Find a person</label><input id="chat-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name" className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-brand-orange" /></div>
          <div className="flex-1 overflow-y-auto">
            {!search && <button onClick={() => setSelected(BOT)} className={cn("flex w-full gap-3 border-b p-4 text-left transition-colors hover:bg-muted", selected?.studentId === BOT_ID && "bg-muted")}>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-maroon to-brand-orange text-white shadow-sm"><Sparkles size={18} /></div>
              <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="truncate font-medium">{BOT.name}</span><span className="rounded-full bg-brand-orange/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-orange">AI</span></div><p className="truncate text-sm text-muted-foreground">Ask about services, listings, and your bookings</p></div>
            </button>}
            {!search && inbox.filter(row => row.contact.studentId !== BOT_ID).map(row => <button key={row.contact.studentId} onClick={() => setSelected(row.contact)} className={cn("flex w-full gap-3 border-b p-4 text-left transition-colors hover:bg-muted", selected?.studentId === row.contact.studentId && "bg-muted")}>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">{initials(row.contact.name)}</div>
              <div className="min-w-0 flex-1"><div className="truncate font-medium">{row.contact.name}</div><p className="truncate text-sm text-muted-foreground">{row.lastMessage.text}</p></div>
              {row.unread > 0 && <span aria-label={`${row.unread} unread messages`} className="mt-1 h-fit rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">{row.unread}</span>}
            </button>)}
            <p className="px-4 pt-4 pb-2 text-xs font-medium text-muted-foreground">{search ? "Search results" : "Start a conversation"}</p>
            {searchError && <p role="alert" className="px-4 text-sm text-destructive">{searchError}</p>}
            {contacts.filter(c => search || !inbox.some(row => row.contact.studentId === c.studentId)).map(c => <button key={c.studentId} onClick={() => setSelected(c)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">{initials(c.name)}</div>
              <span className="min-w-0 flex-1"><span className="block truncate font-medium">{c.name}</span><span className="text-xs text-muted-foreground">{c.vendorId ? "Seller" : "Student"}</span></span>
            </button>)}
            {!contacts.length && <p className="px-4 py-6 text-sm text-muted-foreground">{search ? "No matching users." : "Other users appear here after signing in with Google."}</p>}
          </div>
        </aside>
        {selected ? <ChatWindow key={`${account.studentId}:${selected.studentId}`} contact={selected} onBack={() => setSelected(null)} /> : <div className="hidden flex-1 items-center justify-center p-8 text-muted-foreground md:flex">Choose a conversation or find someone to message.</div>}
      </main>}
    </>}
  </div>;
}
