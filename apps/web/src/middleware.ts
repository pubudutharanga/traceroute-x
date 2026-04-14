/**
 * TraceRoute X — Middleware
 * ===========================
 * Protects admin, dashboard, and profile routes.
 * Uses JWT inspection — no DB call required.
 */

import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const token = req.auth

  // ---- Protect /admin routes ----
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const role = token.user?.role

    // SUPER_ADMIN only routes
    const superAdminRoutes = ["/admin/users", "/admin/comments", "/admin/settings"]
    const isSuperAdminRoute = superAdminRoutes.some((route) =>
      pathname.startsWith(route),
    )

    if (isSuperAdminRoute && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url))
    }

    // At minimum, AUTHOR role required for /admin
    if (role !== "AUTHOR" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // ---- Protect /profile routes ----
  if (pathname.startsWith("/profile")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // ---- Protect /api/admin routes ----
  if (pathname.startsWith("/api/admin")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (token.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/api/admin/:path*"],
}
