import { Navbar } from "@/components/marketplace/navbar";
import { Sidebar } from "@/components/marketplace/sidebar";
import { LocationBadge } from "@/components/marketplace/location-badge";
import { ServiceCard } from "@/components/marketplace/service-card";
import { services } from "@/lib/services";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex flex-1">
        <aside className="w-80 shrink-0 border-r-4 border-brand-maroon bg-background">
          <div className="sticky top-16 p-6">
            <Sidebar />
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-secondary px-6 py-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold">Recommended</h1>
            <LocationBadge />
          </div>

          <div className="grid grid-cols-4 gap-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
