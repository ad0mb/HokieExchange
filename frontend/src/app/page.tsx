import { Navbar } from "@/components/marketplace/navbar";
import { Sidebar } from "@/components/marketplace/sidebar";
import { LocationBadge } from "@/components/marketplace/location-badge";
import { ServiceCard } from "@/components/marketplace/service-card";
import { services } from "@/lib/services";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-6 px-4 py-6 md:px-6">
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-22">
            <Sidebar />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold">Recommended</h1>
            <LocationBadge />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
