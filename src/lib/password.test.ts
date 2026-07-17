import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies a correct password", async () => {
    const hash = await hashPassword("Demo1234!");
    await expect(verifyPassword("Demo1234!", hash)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("Demo1234!");
    await expect(verifyPassword("Demo1234", hash)).resolves.toBe(false);
    await expect(verifyPassword("", hash)).resolves.toBe(false);
  });

  it("salts: the same password hashes differently every time", async () => {
    const a = await hashPassword("SamePassword1!");
    const b = await hashPassword("SamePassword1!");
    expect(a).not.toBe(b);
    await expect(verifyPassword("SamePassword1!", a)).resolves.toBe(true);
    await expect(verifyPassword("SamePassword1!", b)).resolves.toBe(true);
  });

  it("never stores the password in the hash string", async () => {
    const hash = await hashPassword("SuperSecret123!");
    expect(hash).not.toContain("SuperSecret123!");
    expect(hash.startsWith("scrypt$")).toBe(true);
  });

  it("rejects malformed stored hashes instead of throwing", async () => {
    await expect(verifyPassword("x", "")).resolves.toBe(false);
    await expect(verifyPassword("x", "not-a-hash")).resolves.toBe(false);
    await expect(verifyPassword("x", "bcrypt$1$2$3$4$5")).resolves.toBe(false);
  });

  it("treats unicode-equivalent passwords consistently", async () => {
    // Vietnamese input methods can produce either normalization form.
    const composed = "Nguyễn2026!";
    const decomposed = composed.normalize("NFD");
    const hash = await hashPassword(composed);
    await expect(verifyPassword(decomposed, hash)).resolves.toBe(true);
  });
});
