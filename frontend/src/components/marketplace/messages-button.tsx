"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MessagesButton({
  label = "Messages",
  href = "/chats",
  className,
}: {
  label?: string;
  href?: string;
  className?: string;
}) {
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
    </Button>
  );
}
