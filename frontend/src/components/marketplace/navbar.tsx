"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/marketplace/logo";
import { Sidebar } from "@/components/marketplace/sidebar";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-brand-maroon bg-background">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="md:hidden" />}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b px-4 py-4">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <Logo />
              </SheetHeader>
              <div className="px-4 py-4">
                <Sidebar />
              </div>
            </SheetContent>
          </Sheet>
          <Logo />
        </div>

        <div className="flex items-center gap-3">
          <Button className="bg-brand-maroon text-white hover:bg-brand-maroon-dark">
            Log In
          </Button>
          <a
            href="#"
            className="hidden text-sm text-muted-foreground hover:text-foreground hover:underline sm:inline"
          >
            Forgot Account?
          </a>
        </div>
      </div>
    </header>
  );
}
