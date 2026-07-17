/**
 * Session handling — signed JWT in an httpOnly cookie.
 *
 * The session carries the tenant and role claims that every database
 * transaction sets as `app.tenant_id` / `app.user_role` (Technical_Architecture
 * §4: "RLS policies compare it to the tenant_id claim baked into the user's
 * session JWT at login").
 *
 * Next.js 16: cookies() is async and .set() only works in a Server Action or
 * Route Handler — never during a Server Component render.
 */
import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "lfcrm_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // A working day; re-auth each morning.

export type SessionClaims = {
  userId: string;
  tenantId: string;
  role: string;
  fullName: string;
  email: string;
};

function secret(): Uint8Array {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  }
  return new TextEncoder().encode(value);
}

export async function encodeSession(claims: SessionClaims): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("loan-factory-crm")
    .setAudience("lfcrm-staff")
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function decodeSession(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), {
      issuer: "loan-factory-crm",
      audience: "lfcrm-staff",
    });
    const { userId, tenantId, role, fullName, email } = payload as Record<string, unknown>;
    if (
      typeof userId !== "string" ||
      typeof tenantId !== "string" ||
      typeof role !== "string" ||
      typeof fullName !== "string" ||
      typeof email !== "string"
    ) {
      return null;
    }
    return { userId, tenantId, role, fullName, email };
  } catch {
    return null;
  }
}

/** Only callable from a Server Action or Route Handler. */
export async function createSession(claims: SessionClaims): Promise<void> {
  const token = await encodeSession(claims);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function readSession(): Promise<SessionClaims | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
