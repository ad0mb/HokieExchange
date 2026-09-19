"use client";

import { useState } from "react";
import { Navbar } from "@/components/marketplace/navbar";
import { MarketplaceView } from "@/components/marketplace/marketplace-view";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
      <MarketplaceView
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuOpenChange={setMobileMenuOpen}
      />
    </div>
  );
}
