import { createHmac } from "node:crypto";

export function backendToken(user: { googleSub?: string; emailVerified?: boolean; email?: string | null; name?: string | null; firstName?: string; lastName?: string }) {
  const secret = process.env.CHAT_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("Set CHAT_AUTH_SECRET to at least 32 characters on both servers.");
  if (!user.googleSub || !user.emailVerified || !user.email) throw new Error("Sign out and sign in with Google again.");
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const data = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({
    iss: "hokie-frontend", aud: "hokie-backend", sub: user.googleSub,
    email: user.email, email_verified: true, name: user.name,
    given_name: user.firstName, family_name: user.lastName, iat: now, exp: now + 300,
  })}`;
  return `${data}.${createHmac("sha256", secret).update(data).digest("base64url")}`;
}

export const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
