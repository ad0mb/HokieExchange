import Link from "next/link";
import { HokieScaleIcon } from "@/components/VTIcon";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <HokieScaleIcon className="h-10 w-10 object-contain" />
      <span className="font-heading text-xl font-bold tracking-tight text-brand-orange">
        Exchange
      </span>
    </Link>
  );
}
