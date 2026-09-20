"use client";

import { SessionProvider } from "next-auth/react";
import { ChatProvider } from "@/chat/chat-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider><ChatProvider>{children}</ChatProvider></SessionProvider>;
}
