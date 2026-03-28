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
        // Protected /app/* routes require auth
        if (pathname.startsWith("/app")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/app/:path*",
    "/api/users/me/:path*",
    "/api/matches/:path*",
    "/api/care-sessions/:path*",
    "/api/children/:path*",
  ],
};
