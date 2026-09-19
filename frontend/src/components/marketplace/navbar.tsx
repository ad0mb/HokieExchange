import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/marketplace/logo";
import { LoginDialog } from "@/components/marketplace/login-dialog";

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-brand-maroon bg-background">
      <div className="flex h-16 items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
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

        <div className="flex items-center gap-2 sm:gap-3">
          <LoginDialog />
          <a
            href="#"
            className="font-heading text-xs font-bold text-brand-orange no-underline hover:text-brand-maroon"
          >
            Forgot Account?
          </a>
        </div>
      </div>
    </header>
  );
}
