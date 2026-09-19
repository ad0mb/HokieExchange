import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/marketplace/logo";

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-brand-maroon bg-background">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
          <Logo />
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="lg"
            className="font-heading bg-brand-maroon px-6 text-base text-white hover:bg-brand-maroon-dark"
          >
            Log In
          </Button>
          <a
            href="#"
            className="font-heading text-xs font-bold text-brand-orange underline underline-offset-2 hover:text-brand-maroon"
          >
            Forgot Account?
          </a>
        </div>
      </div>
    </header>
  );
}
