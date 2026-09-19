import { Button } from "@/components/ui/button";
import { Logo } from "@/components/marketplace/logo";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-brand-maroon bg-background">
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        <Logo />

        <div className="flex items-center gap-3">
          <Button className="font-heading bg-brand-maroon text-white hover:bg-brand-maroon-dark">
            Log In
          </Button>
          <a href="#" className="text-sm text-brand-orange hover:underline">
            Forgot Account?
          </a>
        </div>
      </div>
    </header>
  );
}
