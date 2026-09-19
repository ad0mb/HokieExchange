import { Navbar } from "@/components/marketplace/navbar";
import { AccountView } from "@/components/account/account-view";

export default function AccountPage() {
  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <Navbar />
      <AccountView />
    </div>
  );
}
