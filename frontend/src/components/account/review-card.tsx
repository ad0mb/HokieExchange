import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Review } from "@/lib/account";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="w-60 shrink-0 rounded-lg border bg-background p-4">
      <div className="flex items-center gap-2.5">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-brand-maroon text-sm text-white">
            {review.raterInitials}
          </AvatarFallback>
        </Avatar>
        <span className="line-clamp-1 text-sm font-medium">
          {review.raterName}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-sm">
        <Star className="h-4 w-4 fill-foreground text-foreground" />
        <span className="font-semibold">{review.rating.toFixed(1)}</span>
      </div>

      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
        {review.comment}
      </p>
    </div>
  );
}
