import { auth } from "@/auth";
import { backendToken } from "@/lib/backend-token";

export const runtime = "nodejs";
export async function GET() {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Sign in to use messaging." }, { status: 401 });
  try {
    return Response.json({ token: backendToken({ ...session.user, emailVerified: session.user.googleEmailVerified }) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Messaging setup is incomplete. Check server settings, then sign out and sign in again." }, { status: 503 });
  }
}
