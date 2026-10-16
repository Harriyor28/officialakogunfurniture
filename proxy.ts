import { NextResponse, type NextRequest } from "next/server";
import { isSignatureValid } from "@/lib/session";

const STAFF_ONLY_PREFIXES = ["/admin"];
const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

/**
 * Edge-safe route protection (redirects only). Every protected operation is
 * also verified on the server in layouts, server actions and route handlers —
 * this proxy is a convenience layer, not the security boundary.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("akogun_session")?.value;
  const hasSessionCookie = Boolean(token && isSignatureValid(token));

  const isStaffArea = STAFF_ONLY_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (isStaffArea && !hasSessionCookie) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (AUTH_PAGES.includes(pathname) && hasSessionCookie) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register", "/forgot-password", "/reset-password"],
};
