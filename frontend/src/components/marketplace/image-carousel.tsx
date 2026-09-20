"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImageCarousel({
  images,
  alt,
  fallback,
  className,
}: {
  images: string[];
  alt: string;
  fallback?: ReactNode;
  className?: string;
}) {
  const [imageIndex, setImageIndex] = useState(0);

  return (
    <div
      className={cn(
        "group relative flex items-center justify-center overflow-hidden bg-secondary",
        className
      )}
    >
      {images.length > 0 ? (
        <div
          className="flex h-full w-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${imageIndex * 100}%)` }}
        >
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- client-only object URL preview, not a static/remote asset
            <img
              key={i}
              src={src}
              alt={`${alt} photo ${i + 1}`}
              className="h-full w-full shrink-0 object-cover"
            />
          ))}
        </div>
      ) : (
        fallback
      )}

      {images.length > 1 && (
        <>
          {imageIndex > 0 && (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                setImageIndex((i) => Math.max(i - 1, 0));
              }}
              className="absolute left-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {imageIndex < images.length - 1 && (
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                setImageIndex((i) => Math.min(i + 1, images.length - 1));
              }}
              className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  i === imageIndex ? "bg-brand-orange" : "bg-white/70"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
