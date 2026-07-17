import { describe, it, expect } from "vitest";
import { SignJWT } from "jose";
import { encodeSession, decodeSession } from "./session";

const CLAIMS = {
  userId: "1a000000-0000-4000-8000-000000000001",
  tenantId: "0a9c8f42-1d3e-4b7a-9c21-8f6d5e4b3a20",
  role: "lo",
  fullName: "Minh Nguyen",
  email: "minh@loanfactory.com",
};

describe("session tokens", () => {
  it("round-trips the tenant and role claims RLS depends on", async () => {
    const token = await encodeSession(CLAIMS);
    const decoded = await decodeSession(token);
    expect(decoded).toEqual(CLAIMS);
  });

  it("rejects a token signed with a different secret", async () => {
    const forged = await new SignJWT({ ...CLAIMS, tenantId: "other-tenant" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer("loan-factory-crm")
      .setAudience("lfcrm-staff")
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode("an-attackers-secret-that-is-long-enough"));

    await expect(decodeSession(forged)).resolves.toBeNull();
  });

  it("rejects a tampered token", async () => {
    const token = await encodeSession(CLAIMS);
    const [header, payload, signature] = token.split(".");
    const evil = Buffer.from(
      JSON.stringify({ ...CLAIMS, tenantId: "11111111-1111-1111-1111-111111111111" }),
    ).toString("base64url");

    await expect(decodeSession(`${header}.${evil}.${signature}`)).resolves.toBeNull();
    expect(payload).toBeTruthy();
  });

  it("rejects an expired token", async () => {
    const expired = await new SignJWT({ ...CLAIMS })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer("loan-factory-crm")
      .setAudience("lfcrm-staff")
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(new TextEncoder().encode(process.env.SESSION_SECRET!));

    await expect(decodeSession(expired)).resolves.toBeNull();
  });

  it("rejects a token issued for another audience", async () => {
    const wrongAudience = await new SignJWT({ ...CLAIMS })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuer("loan-factory-crm")
      .setAudience("some-other-app")
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(process.env.SESSION_SECRET!));

    await expect(decodeSession(wrongAudience)).resolves.toBeNull();
  });

  it("rejects garbage", async () => {
    await expect(decodeSession("")).resolves.toBeNull();
    await expect(decodeSession("not.a.jwt")).resolves.toBeNull();
  });
});
