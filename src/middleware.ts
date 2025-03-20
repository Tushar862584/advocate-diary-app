import { NextResponse } from "next/server";
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const path = request.nextUrl.pathname;
    const token = request.nextauth.token;
    
    // Protected admin routes
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Protect case editing/deleting for non-owners (implement in API routes)
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/cases/:path*", 
    "/admin/:path*",
    "/api/cases/:path*",
    "/api/admin/:path*",
  ],
}; 