/**
 * Password hashing — scrypt from node:crypto.
 *
 * No native dependency and no third-party crypto: scrypt is memory-hard and
 * built in. When Supabase Auth lands (Technical_Architecture §1) this module
 * goes away entirely and `user.auth_user_id` becomes the link.
 */
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

// OWASP-aligned parameters: N=2^16, r=8, p=1.
const PARAMS = { N: 65536, r: 8, p: 1 };
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * scrypt needs ~128 * N * r bytes (~67MB here); Node's default maxmem is 32MB
 * and throws ERR_CRYPTO_INVALID_SCRYPT_PARAMS without this. Doubled for headroom.
 */
function maxmemFor(n: number, r: number): number {
  return 256 * n * r;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, {
    ...PARAMS,
    maxmem: maxmemFor(PARAMS.N, PARAMS.r),
  });
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, n, r, p, saltB64, hashB64] = parts;
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");

  const derived = await scrypt(password.normalize("NFKC"), salt, expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: maxmemFor(Number(n), Number(r)),
  });

  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
