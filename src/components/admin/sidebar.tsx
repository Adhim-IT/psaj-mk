"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Calendar,
  ChevronDown,
  CircleHelp,
  CuboidIcon as Cube,
  DollarSign,
  FileText,
  Home,
  Users,
} from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  submenu?: { title: string; href: string }[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Manajemen Kelas",
    href: "/dashboard/kelas",
    icon: BookOpen,
    submenu: [
      { title: "Tool", href: "/dashboard/kelas/tool" },
      { title: "Kategori Kelas", href: "/dashboard/kelas/kategori" },
      { title: "Kelas", href: "/dashboard/kelas/list" },
      { title: "Tipe Kelas", href: "/dashboard/kelas/tipe" },
      { title: "Kelompok Kelas", href: "/dashboard/kelas/kelompok" },
      { title: "Review Kelas", href: "/dashboard/kelas/review" },
    ],
  },
  {
    title: "Manajemen Event",
    href: "/dashboard/event",
    icon: Calendar,
    submenu: [
      { title: "Event", href: "/dashboard/event/list" },
      { title: "Review Event", href: "/dashboard/event/review" },
    ],
  },
  {
    title: "Manajemen Transaksi",
    href: "/dashboard/transaksi",
    icon: DollarSign,
    submenu: [
      { title: "Kode Promo", href: "/dashboard/transaksi/promo" },
      { title: "Transaksi Kelas", href: "/dashboard/transaksi/kelas" },
      { title: "Transaksi Event", href: "/dashboard/transaksi/event" },
    ],
  },
  {
    title: "Manajemen Artikel",
    href: "/dashboard/artikel",
    icon: FileText,
    submenu: [
      { title: "Tag", href: "/dashboard/artikel/tag" },
      { title: "Kategori", href: "/dashboard/artikel/kategori" },
      { title: "Artikel", href: "/dashboard/artikel/list" },
      { title: "Komentar", href: "/dashboard/artikel/komentar" },
    ],
  },
  {
    title: "Manajemen Akun",
    href: "/dashboard/akun",
    icon: Users,
    submenu: [
      { title: "Role", href: "/dashboard/akun/role" },
      { title: "Mentor", href: "/dashboard/akun/mentor" },
      { title: "Writer", href: "/dashboard/akun/writer" },
      { title: "Student", href: "/dashboard/akun/student" },
    ],
  },
  {
    title: "Manajemen FAQ",
    href: "/dashboard/faq",
    icon: CircleHelp,
    submenu: [
      { title: "Kategori", href: "/dashboard/faq/kategori" },
      { title: "FAQ", href: "/dashboard/faq/list" },
    ],
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  // Check if a menu item or any of its submenu items is active
  const isMenuActive = (item: NavItem) => {
    if (pathname === item.href) return true
    if (item.submenu) {
      return item.submenu.some((subItem) => pathname === subItem.href)
    }
    return false
  }

  return (
    <Sidebar className="border-r shadow-sm">
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
            <Cube className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            TC
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-4 py-3">
          <h2 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">MAIN</h2>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                {item.submenu ? (
                  <>
                    <SidebarMenuButton
                      onClick={() => toggleMenu(item.title)}
                      className={cn(
                        "justify-between transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950/30",
                        isMenuActive(item) &&
                          "bg-blue-50 text-blue-600 font-medium dark:bg-blue-950/30 dark:text-blue-400",
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon
                          className={cn(
                            "h-4 w-4 mr-2 transition-colors",
                            isMenuActive(item)
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400",
                          )}
                        />
                        <span>{item.title}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          openMenus[item.title] && "rotate-180",
                        )}
                      />
                    </SidebarMenuButton>
                    {openMenus[item.title] && (
                      <SidebarMenuSub className="animate-in slide-in-from-left-2 duration-200">
                        {item.submenu.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.href}
                              className={cn(
                                "transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950/30",
                                pathname === subItem.href && "text-blue-600 font-medium dark:text-blue-400",
                              )}
                            >
                              <Link href={subItem.href}>
                                <span className="ml-1">• {subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </>
                ) : (
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className={cn(
                      "transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950/30",
                      pathname === item.href &&
                        "bg-blue-50 text-blue-600 font-medium dark:bg-blue-950/30 dark:text-blue-400",
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon
                        className={cn(
                          "h-4 w-4 mr-2 transition-colors",
                          pathname === item.href
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400",
                        )}
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

