import { notFound } from "next/navigation";
import { Navbar } from "@/components/marketplace/navbar";
import { ProfileView } from "@/components/account/profile-view";
import { getSellerProfile } from "@/lib/sellers";

export default async function SellerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = getSellerProfile(slug);
  if (!profile) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <Navbar />
      <ProfileView profile={profile} showMessageButton />
    </div>
  );
}
