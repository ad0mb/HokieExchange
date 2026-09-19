import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Review } from "@/lib/account";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="w-44 shrink-0 rounded-lg border bg-background p-3">
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-brand-maroon text-[10px] text-white">
            {review.raterInitials}
          </AvatarFallback>
        </Avatar>
        <span className="line-clamp-1 text-xs font-medium">
          {review.raterName}
        </span>
      </div>

      <div className="mt-1.5 flex items-center gap-1 text-xs">
        <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
        <span className="font-semibold">{review.rating.toFixed(1)}</span>
      </div>

      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
        {review.comment}
      </p>
    </div>
  );
}
