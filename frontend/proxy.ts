import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const { pathname } = request.nextUrl

  // Define public paths that don't require authentication
  const publicPaths = ["/auth/login", "/auth/signup", "/"]

  // If the user has a token and tries to access auth pages, redirect to dashboard
  if (token && (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If the user does NOT have a token and tries to access protected pages, redirect to login
  // We assume everything not in publicPaths is protected
  if (!token && !publicPaths.includes(pathname) && !pathname.startsWith("/_next") && !pathname.startsWith("/api") && !pathname.startsWith("/static")) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
