"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/sidebar"
import { DashboardHeader } from "@/components/admin/header"
import LoadingScreen from "@/components/admin/loading-screen"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    // If not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin")
      return
    }

    // If authenticated, check role
    if (status === "authenticated") {
      // Check if the user has the 'Admin' role
      const allowedRoles = ["Admin", "Mentor", "Writer"]
      const isAuthorized = allowedRoles.includes(session?.user?.role ?? "")

      setIsAuthorized(isAuthorized)

      if (!isAuthorized) {
        router.push("/")
      }
    }
  }, [status, session, router])

  // Show loading state while checking authorization
  if (status === "loading" || isAuthorized === null) {
    return <LoadingScreen />
  }

  // If not authorized, don't render the admin layout
  if (isAuthorized === false) {
    return null
  }

  // Render admin layout for authorized users
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white flex-col md:flex-row">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <DashboardHeader />
          <main className="flex-1 p-3 sm:p-4 md:p-6 animate-fadeIn overflow-x-hidden">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

