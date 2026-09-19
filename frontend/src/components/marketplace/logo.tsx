import Link from "next/link";
import { HokieScaleIcon } from "@/components/VTIcon";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <HokieScaleIcon className="h-14 w-14 object-contain" />
      <span className="font-heading text-2xl font-bold tracking-tight text-brand-orange">
        Exchange
      </span>
    </Link>
  );
}
