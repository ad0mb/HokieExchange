import { Bird } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-maroon text-white">
        <Bird className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <span className="text-xl font-bold tracking-tight text-brand-orange">
        Exchange
      </span>
    </Link>
  );
}
