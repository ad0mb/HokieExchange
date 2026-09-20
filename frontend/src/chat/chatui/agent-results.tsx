"use client";

import { useState, useSyncExternalStore } from "react";
import { ShoppingCart, Plus, Check, Trash2, Search, X, Sparkles, PackageOpen } from "lucide-react";
import type { AgentListing } from "@/chat/chatsignal/client";

const CART_EVENT = "hokie-assistant-cart";
function subscribe(notify: () => void) {
  window.addEventListener(CART_EVENT, notify);
  window.addEventListener("storage", notify);
  return () => { window.removeEventListener(CART_EVENT, notify); window.removeEventListener("storage", notify); };
}
function snapshot(key: string) {
  try { return sessionStorage.getItem(key) ?? "[]"; } catch { return "[]"; }
}
function parseCart(raw: string): AgentListing[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((row): row is AgentListing => row && (row.type === "service" || row.type === "item") &&
      Number.isSafeInteger(row.id) && row.id > 0 && typeof row.name === "string" &&
      typeof row.description === "string" && typeof row.location === "string" && row.currency === "USD" &&
      (row.price === null || (typeof row.price === "number" && Number.isFinite(row.price) && row.price >= 0)) &&
      (row.stock === null || (Number.isSafeInteger(row.stock) && row.stock >= 0))).slice(0, 50);
  } catch { return []; }
}
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
const keyOf = (listing: AgentListing) => listing.type + ":" + listing.id;

export function AgentResults({ studentId, listings, open, onClose }: { studentId: number; listings: AgentListing[]; open: boolean; onClose: () => void }) {
  const storageKey = "hokie:assistant-cart:" + studentId;
  const raw = useSyncExternalStore(subscribe, () => snapshot(storageKey), () => "[]");
  const cart = parseCart(raw);
  const [tab, setTab] = useState<"results" | "cart">("results");
  const [notice, setNotice] = useState("");
  const rows = tab === "results" ? listings : cart;
  const totalCents = cart.reduce((sum, item) => sum + Math.round((item.price ?? 0) * 100), 0);
  function save(next: AgentListing[], message: string) {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(next));
      window.dispatchEvent(new Event(CART_EVENT));
      setNotice(message);
    } catch { setNotice("Your browser could not save the cart. Please enable browser storage and try again."); }
  }
  return <aside id="assistant-results-panel" aria-label="Assistant listings and cart" className={(open ? "flex" : "hidden") + " absolute inset-y-0 right-0 z-20 w-[min(22rem,calc(100%-2rem))] shrink-0 flex-col border-l bg-card shadow-2xl lg:static lg:flex lg:w-80 lg:shadow-none xl:w-96"}>
    <div className="flex items-center justify-between gap-3 border-b bg-gradient-to-br from-brand-maroon to-brand-maroon-dark px-4 py-3 text-white">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25"><Sparkles size={16} /></div>
        <div className="min-w-0"><h3 className="truncate font-heading font-semibold">Hokie Assistant</h3><p className="text-xs text-white/70">Matches & cart</p></div>
      </div>
      <button type="button" onClick={onClose} aria-label="Close assistant results" className="rounded-md p-2 text-white/80 hover:bg-white/10 lg:hidden"><X size={18} /></button>
    </div>
    <div className="p-4 pb-3">
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1" role="group" aria-label="Show listings or cart">
        <button type="button" aria-pressed={tab === "results"} onClick={() => setTab("results")} className={"flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm transition " + (tab === "results" ? "bg-card font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground")}><Search size={15} />Matches <span className="text-xs">{listings.length}</span></button>
        <button type="button" aria-pressed={tab === "cart"} onClick={() => setTab("cart")} className={"flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm transition " + (tab === "cart" ? "bg-card font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground")}><ShoppingCart size={15} />Cart <span className="text-xs">{cart.length}</span></button>
      </div>
    </div>
    {tab === "cart" && cart.length > 0 && <div className="mx-4 mb-3 flex items-center justify-between rounded-xl border bg-muted/40 px-3 py-2"><span className="text-xs text-muted-foreground">Estimated total</span><strong className="font-heading text-base">{money(totalCents / 100)}{cart.some(row => row.price === null) ? "+" : ""}</strong></div>}
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-4">
      {!rows.length && <div className="rounded-xl border border-dashed p-8 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">{tab === "results" ? <PackageOpen size={20} /> : <ShoppingCart size={20} />}</div>
        <p className="text-sm font-medium">{tab === "results" ? "No matches yet" : "Your cart is empty"}</p>
        <p className="mt-1 text-xs text-muted-foreground">{tab === "results" ? "Ask the assistant and services or items will appear here." : "Add a listing from the Matches tab."}</p>
      </div>}
      {rows.map(listing => {
        const added = cart.some(row => keyOf(row) === keyOf(listing));
        const soldOut = listing.type === "item" && listing.stock === 0;
        return <article key={keyOf(listing)} className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between gap-3"><div><span className="text-[11px] font-semibold uppercase tracking-wide text-brand-maroon">{listing.type === "service" ? "Service" : "Item"}</span><h4 className="mt-0.5 break-words text-sm font-semibold">{listing.name}</h4></div><span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-sm font-semibold">{listing.price === null ? "—" : money(listing.price)}</span></div>
          {listing.vendor_name && <p className="text-xs text-muted-foreground">{listing.vendor_name}{listing.rating != null ? " · ★ " + listing.rating.toFixed(1) : ""}</p>}
          {listing.available_slots != null && <p className="text-xs text-muted-foreground">{listing.available_slots} available {listing.available_slots === 1 ? "slot" : "slots"}</p>}
          {listing.description && <p className="line-clamp-2 text-xs text-muted-foreground">{listing.description}</p>}
          {listing.location && <p className="text-xs text-muted-foreground">{listing.location}</p>}
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <span className="text-xs text-muted-foreground">{listing.price === null ? "Price not provided" : soldOut ? "Currently unavailable" : "Available to select"}</span>
            {tab === "cart" ? <button type="button" aria-label={"Remove " + listing.name + " from cart"} onClick={() => save(cart.filter(row => keyOf(row) !== keyOf(listing)), listing.name + " removed from cart.")} className="rounded-md p-2 text-muted-foreground hover:bg-muted"><Trash2 size={16} /></button> :
              <button type="button" disabled={added || soldOut || cart.length >= 50} onClick={() => save([...cart, listing], listing.name + " added to cart.")} className="flex items-center gap-1 rounded-lg bg-brand-maroon px-2.5 py-2 text-xs font-medium text-white transition hover:bg-brand-maroon-dark disabled:opacity-50">{added ? <Check size={14} /> : <Plus size={14} />}{added ? "Added" : soldOut ? "Sold out" : "Add to cart"}</button>}
          </div>
        </article>;
      })}
    </div>
    {tab === "cart" && cart.length > 0 && <p className="border-t px-4 py-3 text-xs text-muted-foreground">Adding to cart does not reserve a time or purchase an item. Confirm availability and price before booking.</p>}
    <p role="status" aria-live="polite" className="sr-only">{notice}</p>
  </aside>;
}
