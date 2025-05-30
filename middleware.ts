// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that require authentication
const protectedPaths = ["/profile", "/transactions", "/wallet", "/chat"];

// Paths that should redirect to home if user is already logged in
const authPaths = ["/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from cookie or Authorization header
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("Authorization")?.split(" ")[1];

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  const isAuthPath = authPaths.includes(pathname);

  // Redirect unauthenticated users trying to access protected pages
  if (isProtectedPath && !token) {
    const url = new URL("/auth", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/transactions/:path*",
    "/wallet/:path*",
    "/chat/:path*",
    "/auth",
  ],
};
