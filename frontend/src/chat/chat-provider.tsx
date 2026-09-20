"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { io, type Socket } from "socket.io-client";
import { chatUrl, request, type Contact, type Conversation } from "./chatsignal/client";

type ChatContextValue = {
  account: Contact | null; inbox: Conversation[]; socket: Socket | null; connected: boolean; error: string;
  api: <T>(path: string, init?: RequestInit) => Promise<T>;
  refreshInbox: () => Promise<void>; retry: () => void; ensureVendor: () => Promise<Contact>;
};
const Context = createContext<ChatContextValue | null>(null);
export function useChat() { const value = useContext(Context); if (!value) throw new Error("ChatProvider missing"); return value; }

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const [account, setAccount] = useState<Contact | null>(null);
  const [inbox, setInbox] = useState<Conversation[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const token = useRef("");
  const generation = useRef(0);
  const inboxVersion = useRef(0);
  const api = useCallback(<T,>(path: string, init?: RequestInit) => request<T>(token.current, path, init), []);
  const refreshInbox = useCallback(async () => {
    const current = generation.current;
    const version = ++inboxVersion.current;
    const rows = await api<Conversation[]>("/chat/inbox");
    if (current === generation.current && version === inboxVersion.current) setInbox(rows);
  }, [api]);
  const ensureVendor = useCallback(async () => {
    const value = await api<Contact>("/auth/vendor", { method: "POST" });
    setAccount(value);
    await update();
    return value;
  }, [api, update]);

  useEffect(() => {
    let active = true;
    let client: Socket | null = null;
    let refreshing = false;
    generation.current++;
    token.current = "";
    const boot = async () => {
      setAccount(null); setInbox([]); setSocket(null); setConnected(false); setError("");
      if (status !== "authenticated") return;
      try {
        const response = await fetch("/api/chat/token", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (!active) return;
        token.current = data.token;
        const value = await api<Contact>("/auth/me", { method: "POST" });
        if (!active) return;
        setAccount(value);
        client = io(chatUrl, { autoConnect: false, auth: { token: data.token } });
        setSocket(client);
        client.on("connect", () => { if (active) { setConnected(true); setError(""); void refreshInbox().catch(e => setError(e.message)); } });
        client.on("disconnect", () => { if (active) setConnected(false); });
        client.on("connect_error", () => { if (active) setError("Messaging is offline. Check the backend connection or retry."); });
        client.on("message_received", () => { void refreshInbox().catch(e => { if (active) setError(e.message); }); });
        client.on("inbox_changed", () => { void refreshInbox().catch(e => { if (active) setError(e.message); }); });
        client.connect();
      } catch (e) { if (active) setError((e as Error).message); }
    };
    const renew = async () => {
      if (!active || !client || refreshing) return;
      refreshing = true;
      try {
        const response = await fetch("/api/chat/token", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (!active) return;
        token.current = data.token;
        client.auth = { token: data.token };
        client.disconnect().connect();
      } catch (e) { if (active) { client?.disconnect(); setError((e as Error).message); } }
      finally { refreshing = false; }
    };
    void boot();
    const timer = setInterval(() => { void renew(); }, 240000);
    const onVisible = () => { if (document.visibilityState === "visible") void renew(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { active = false; client?.disconnect(); clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [status, session?.user?.googleSub, attempt, api, refreshInbox]);

  return <Context.Provider value={{ account, inbox, socket, connected, error, api, refreshInbox, ensureVendor, retry: () => setAttempt(v => v + 1) }}>{children}</Context.Provider>;
}
