import { MapPin } from "lucide-react";

export function LocationBadge() {
  return (
    <div className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium">
      <MapPin className="h-4 w-4 text-brand-maroon" />
      Virginia Tech
      <span className="text-muted-foreground">· 40 mi</span>
    </div>
  );
}
