"use client";
import { useState } from "react";
import Link from "next/link";
import { ChatWindow } from "./chat-window";
export function ChatDemo() {
  const [pair, setPair] = useState<{studentId:number; vendorId:number; role:"student" | "vendor"} | null>(null);
  return <main className="min-h-screen bg-stone-50 px-4 py-10 text-stone-900">
    <div className="mx-auto max-w-3xl"><Link href="/" className="text-sm text-[#630031]">← Hokie Exchange</Link>
      <h1 className="mt-6 text-3xl font-semibold">Chats</h1><p className="mt-2 mb-6 text-stone-500">A simple space to keep the conversation going.</p>
      <form className="mb-5 flex flex-wrap items-end gap-3" onSubmit={e => { e.preventDefault(); const d = new FormData(e.currentTarget); setPair({ studentId:Number(d.get("user")), vendorId:Number(d.get("other")), role:d.get("role") as "student" | "vendor" }); }}>
        <label className="text-sm">Buyer student ID<input name="user" type="number" min="1" required defaultValue="1" className="mt-1 block w-36 rounded-lg border bg-white p-2" /></label>
        <label className="text-sm">Vendor ID<input name="other" type="number" min="1" required defaultValue="2" className="mt-1 block w-36 rounded-lg border bg-white p-2" /></label>
        <label className="text-sm">View as<select name="role" className="mt-1 block rounded-lg border bg-white p-2"><option value="student">Buyer</option><option value="vendor">Vendor</option></select></label>
        <button className="rounded-lg bg-[#630031] px-4 py-2 text-white">Open chat</button>
      </form>
      <p className="mb-4 text-xs text-stone-500">Hackathon demo · Use the same student and vendor IDs in both tabs; choose a different view.</p>
      {pair ? <ChatWindow key={pair.studentId+":"+pair.vendorId+":"+pair.role} {...pair} /> : <div className="rounded-3xl border bg-white p-16 text-center text-stone-500">Choose a student and vendor to open a conversation.</div>}
    </div>
  </main>;
}
