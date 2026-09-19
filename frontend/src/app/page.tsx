import { Navbar } from "@/components/marketplace/navbar";
import { MarketplaceView } from "@/components/marketplace/marketplace-view";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <MarketplaceView />
    </div>
  );
}
