import React from "react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "./components/AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "AUTHOR" && session.user.role !== "SUPER_ADMIN") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex">
      <AdminSidebar
        user={{
          name: session.user.name || "User",
          role: session.user.role,
          avatarUrl: session.user.image || undefined,
        }}
      />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
