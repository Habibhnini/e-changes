// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that require authentication
const protectedPaths = [
  "/profile",
  "/settings",
  "/transactions",
  "/wallet",
  "/chat",
];

// Paths that should redirect to home if user is already logged in
const authPaths = ["/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("Authorization")?.split(" ")[1];

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Check if the path is for authentication (login/register)
  const isAuthPath = authPaths.some((path) => pathname === path);

  // If it's a protected path and no token exists
  if (isProtectedPath && !token) {
    const url = new URL("/auth", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // If it's an auth path and token exists, redirect to home
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths that need protection
    ...protectedPaths.map((path) => `${path}/:path*`),
    // Match auth paths
    ...authPaths,
  ],
};
