import Link from "next/link";
import { HokieScaleIcon } from "@/components/VTIcon";

export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-1 sm:gap-2">
      <HokieScaleIcon className="h-8 w-8 object-contain sm:h-14 sm:w-14" />
      <span className="font-heading text-lg font-bold tracking-tight text-brand-orange sm:text-2xl">
        Exchange
      </span>
    </Link>
  );
}
