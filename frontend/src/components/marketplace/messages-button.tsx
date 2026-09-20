"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChat } from "@/chat/chat-provider";

export function MessagesButton({
  label = "Messages",
  href = "/chats",
  className,
}: {
  label?: string;
  href?: string;
  className?: string;
}) {
  const { inbox } = useChat();
  const unread = inbox.reduce((sum, row) => sum + row.unread, 0);
  return (
    <Button
      size="lg"
      nativeButton={false}
      render={<Link href={href} />}
      className={cn(
        "font-heading gap-1.5 bg-brand-maroon px-4 text-sm text-white hover:bg-brand-maroon-dark sm:px-6 sm:text-base",
        className
      )}
    >
      <MessageCircle className="h-4 w-4" />
      {label}
      {unread > 0 && <span aria-label={`${unread} unread messages`} className="ml-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">{unread > 99 ? "99+" : unread}</span>}
    </Button>
  );
}
