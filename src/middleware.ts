import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Public routes - always allowed
        if (
          pathname === "/" ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/signup") ||
          pathname.startsWith("/api/auth")
        ) {
          return true;
        }
        // Protected app routes require auth
        const protectedPaths = ["/home", "/care", "/matching", "/my", "/caregiver", "/guardian", "/education", "/community", "/chat"];
        if (protectedPaths.some((p) => pathname.startsWith(p))) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/home/:path*",
    "/care/:path*",
    "/matching/:path*",
    "/my/:path*",
    "/caregiver/:path*",
    "/guardian/:path*",
    "/education/:path*",
    "/community/:path*",
    "/chat/:path*",
    "/api/users/me/:path*",
    "/api/matches/:path*",
    "/api/care-sessions/:path*",
  ],
};
