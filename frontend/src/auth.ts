import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      firstName?: string;
      lastName?: string;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.firstName = profile.given_name as string | undefined;
        token.lastName = profile.family_name as string | undefined;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.firstName = token.firstName as string | undefined;
      session.user.lastName = token.lastName as string | undefined;
      return session;
    },
  },
});
