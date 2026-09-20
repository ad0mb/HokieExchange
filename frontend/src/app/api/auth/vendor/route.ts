import { auth } from "@/auth";
import { backendToken, backendUrl } from "@/lib/backend-token";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Sign in to continue." }, { status: 401 });
  }
  try {
    const token = backendToken({
      ...session.user,
      emailVerified: session.user.googleEmailVerified,
    });
    const response = await fetch(`${backendUrl}/auth/vendor`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return Response.json(
        { error: "Could not create your seller profile." },
        { status: response.status },
      );
    }
    return Response.json(await response.json());
  } catch {
    return Response.json(
      { error: "Seller setup is incomplete. Check server settings." },
      { status: 503 },
    );
  }
}
