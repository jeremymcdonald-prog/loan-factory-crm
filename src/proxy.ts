/**
 * Proxy — Next.js 16 renamed `middleware` to `proxy` and pinned it to the
 * Node.js runtime (node_modules/next/dist/docs/.../version-16.md).
 *
 * This is an OPTIMISTIC check only: it reads the session cookie to keep signed
 * -out users off app routes. It is deliberately not the authorization boundary
 * — every Server Action and data read re-checks via `requireUser()`.
 */
import { NextResponse, type NextRequest } from "next/server";
import { decodeSession } from "@/lib/session";
import { COOKIE_NAME } from "@/lib/session";

const PUBLIC_PATHS = ["/login"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await decodeSession(token) : null;

  if (!session && !isPublic) {
    const url = new URL("/login", req.nextUrl);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (session && isPublic) {
    return NextResponse.redirect(new URL("/today", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // Never run on static assets: an auth check there blocks CSS/JS/images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
