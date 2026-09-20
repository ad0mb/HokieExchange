import { Navbar } from "@/components/marketplace/navbar";
import { ProfileView } from "@/components/account/profile-view";

export default function AccountPage() {
  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <Navbar />
      <ProfileView />
    </div>
  );
}
