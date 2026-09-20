import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { backendToken, backendUrl } from "@/lib/backend-token";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      firstName?: string;
      lastName?: string;
      googleSub?: string;
      googleEmailVerified?: boolean;
      studentId?: number;
      vendorId?: number | null;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ account, profile }) {
      return account?.provider === "google" && profile?.email_verified === true;
    },
    async jwt({ token, profile, account, trigger }) {
      if (profile) {
        token.firstName = profile.given_name as string | undefined;
        token.lastName = profile.family_name as string | undefined;
        token.googleSub = account?.providerAccountId;
        token.emailVerified = profile.email_verified === true;
      }
      if (profile || (trigger === "update" && token.googleSub)) {
        const proof = backendToken({ googleSub: token.googleSub as string, emailVerified: true,
          email: token.email, name: token.name, firstName: token.firstName as string,
          lastName: token.lastName as string });
        const response = await fetch(`${backendUrl}/auth/me`, {
          method: "POST", headers: { Authorization: `Bearer ${proof}` },
          cache: "no-store", signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) throw new Error("Account setup failed. Check the backend database and identity migration.");
        const linked = await response.json();
        token.studentId = linked.studentId;
        token.vendorId = linked.vendorId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.firstName = token.firstName as string | undefined;
      session.user.lastName = token.lastName as string | undefined;
      session.user.googleSub = token.googleSub as string | undefined;
      session.user.googleEmailVerified = token.emailVerified as boolean | undefined;
      session.user.studentId = token.studentId as number | undefined;
      session.user.vendorId = token.vendorId as number | null | undefined;
      return session;
    },
  },
});
