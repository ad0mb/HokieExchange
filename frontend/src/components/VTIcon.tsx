import type { ComponentProps } from "react";

export type VTIconName =
  | "vt-mark"
  | "virginia-tech-wordmark"
  | "seal"
  | "hokie-bird"
  | "hokie-feet"
  | "hokie-hand"
  | "tartan-pattern"
  | "brand-pattern";

const paths: Record<VTIconName, string> = {
  "vt-mark": "/icons/vt-mark.svg",
  "virginia-tech-wordmark": "/icons/virginia-tech-wordmark.svg",
  seal: "/icons/seal.svg",
  "hokie-bird": "/icons/hokie-bird.svg",
  "hokie-feet": "/icons/hokie-feet.svg",
  "hokie-hand": "/icons/hokie-hand.svg",
  "tartan-pattern": "/icons/tartan-pattern.svg",
  "brand-pattern": "/icons/brand-pattern.svg",
};

export function VTIcon({
  name,
  className = "h-8 w-8",
  ...props
}: { name: VTIconName } & Omit<ComponentProps<"img">, "name" | "src" | "alt">) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small icon sized via className, not an LCP/optimization candidate
    <img
      src={paths[name]}
      alt={name.replaceAll("-", " ")}
      className={className}
      {...props}
    />
  );
}

export function HokieScaleIcon({ className = "h-12 w-12" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small icon sized via className, not an LCP/optimization candidate
    <img
      src="/icons/hokie-bird-scale.png"
      alt="Hokie bird holding a scale"
      className={className}
    />
  );
}
