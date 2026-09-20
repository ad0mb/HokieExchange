"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  function selectTheme(next: Theme) {
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
    setTheme(next);
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-brand-maroon p-1">
      <button
        type="button"
        aria-label="Light mode"
        aria-pressed={theme === "light"}
        onClick={() => selectTheme("light")}
        suppressHydrationWarning
        className={cn(
          "h-5 w-5 rounded-full border border-border bg-white",
          theme === "light" && "ring-2 ring-brand-orange"
        )}
      />
      <button
        type="button"
        aria-label="Dark mode"
        aria-pressed={theme === "dark"}
        onClick={() => selectTheme("dark")}
        suppressHydrationWarning
        className={cn(
          "h-5 w-5 rounded-full bg-neutral-700",
          theme === "dark" && "ring-2 ring-brand-orange"
        )}
      />
    </div>
  );
}
