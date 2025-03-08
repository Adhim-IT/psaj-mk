"use client"

import React from "react"

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
    href: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "Manajemen Kelas",
    href: "/dashboard/kelas",
    icon: BookOpen,
    submenu: [
      { title: "Tool", href: "/admin/dashboard/kelas/tool" },
      { title: "Kategori Kelas", href: "/admin/dashboard/kelas/kategori" },
      { title: "Kelas", href: "/admin/dashboard/kelas/list" },
      { title: "Tipe Kelas", href: "/admin/dashboard/kelas/tipe" },
      { title: "Kelompok Kelas", href: "/admin/dashboard/kelas/kelompok" },
      { title: "Review Kelas", href: "/admin/dashboard/kelas/review" },
    ],
  },
  {
    title: "Manajemen Event",
    href: "/dashboard/event",
    icon: Calendar,
    submenu: [
      { title: "Event", href: "/admin/dashboard/event/list" },
      { title: "Review Event", href: "/admin/dashboard/event/review" },
    ],
  },
  {
    title: "Manajemen Transaksi",
    href: "/dashboard/transaksi",
    icon: DollarSign,
    submenu: [
      { title: "Kode Promo", href: "/admin/dashboard/transaksi/promo" },
      { title: "Transaksi Kelas", href: "/admin/dashboard/transaksi/kelas" },
      { title: "Transaksi Event", href: "/admin/dashboard/transaksi/event" },
    ],
  },
  {
    title: "Manajemen Artikel",
    href: "/dashboard/artikel",
    icon: FileText,
    submenu: [
      { title: "Tag", href: "/admin/dashboard/artikel/tag" },
      { title: "Kategori", href: "/admin/dashboard/artikel/kategori" },
      { title: "Artikel", href: "/admin/dashboard/artikel/list" },
      { title: "Komentar", href: "/admin/dashboard/artikel/komentar" },
    ],
  },
  {
    title: "Manajemen Akun",
    href: "/dashboard/akun",
    icon: Users,
    submenu: [
      { title: "Role", href: "/admin/dashboard/akun/role" },
      { title: "Mentor", href: "/admin/dashboard/akun/mentor" },
      { title: "Writer", href: "/admin/dashboard/akun/writer" },
      { title: "Student", href: "/admin/dashboard/akun/student" },
    ],
  },
  {
    title: "Manajemen FAQ",
    href: "/dashboard/faq",
    icon: CircleHelp,
    submenu: [
      { title: "Kategori", href: "/admin/dashboard/faq/kategori" },
      { title: "FAQ", href: "/admin/dashboard/faq/list" },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  // Auto-expand menus that contain the active page
  React.useEffect(() => {
    const newOpenMenus: Record<string, boolean> = {}

    navItems.forEach((item) => {
      if (item.submenu && item.submenu.some((subItem) => pathname === subItem.href)) {
        newOpenMenus[item.title] = true
      }
    })

    setOpenMenus((prev) => ({ ...prev, ...newOpenMenus }))
  }, [pathname])

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  // Check if a menu item or any of its submenu items is active
  const isMenuActive = (item: NavItem) => {
    if (pathname.startsWith(item.href)) return true
    if (item.submenu) {
      return item.submenu.some((subItem) => pathname.startsWith(subItem.href))
    }
    return false
  }

  // Define common active styles for both menu and submenu items
  const activeTextClass = "text-blue-600 dark:text-blue-400"
  const activeIconClass = "text-blue-600 dark:text-blue-400"
  const activeBgClass = "bg-blue-50 dark:bg-blue-950/30"
  const hoverClass = "hover:bg-blue-50 dark:hover:bg-blue-950/30"

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
                        "justify-between transition-all duration-200",
                        hoverClass,
                        isMenuActive(item) && cn(activeBgClass, activeTextClass, "font-medium"),
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon
                          className={cn(
                            "h-4 w-4 mr-2 transition-colors",
                            isMenuActive(item) ? activeIconClass : "text-gray-500 dark:text-gray-400",
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
                        {item.submenu.map((subItem) => {
                          const isSubItemActive = pathname.startsWith(subItem.href)
                          return (
                            <SidebarMenuSubItem key={subItem.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubItemActive}
                                className={cn(
                                  "transition-all duration-200",
                                  hoverClass,
                                  isSubItemActive && cn(activeTextClass, "font-medium"),
                                )}
                              >
                                <Link href={subItem.href}>
                                  <span className={cn("ml-1", isSubItemActive && activeTextClass)}>
                                    • {subItem.title}
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    )}
                  </>
                ) : (
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    className={cn(
                      "transition-all duration-200",
                      hoverClass,
                      pathname.startsWith(item.href) && cn(activeBgClass, activeTextClass, "font-medium"),
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon
                        className={cn(
                          "h-4 w-4 mr-2 transition-colors",
                          pathname.startsWith(item.href) ? activeIconClass : "text-gray-500 dark:text-gray-400",
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

