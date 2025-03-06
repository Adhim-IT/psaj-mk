"use client"

import type React from "react"

import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/admin/sidebar"
import { DashboardHeader } from "@/components/admin/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white">
        <DashboardSidebar />
        <div className="flex flex-col flex-1">
          <DashboardHeader />
          <main className="flex-1 p-4 md:p-6 animate-fadeIn">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

