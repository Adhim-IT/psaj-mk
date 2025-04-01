"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
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
  roles?: string[] // Add roles property to control visibility
}

// Define navigation items with role-based access
const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: Home,
    roles: ["Admin", "Mentor", "Writer"], // All roles can see dashboard
  },
  {
    title: "Manajemen Kelas",
    href: "/dashboard/kelas",
    icon: BookOpen,
    roles: ["Admin", "Mentor"], // Only Admin and Mentor can see this
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
    roles: ["Admin", "Mentor"], // Only Admin and Mentor can see this
    submenu: [
      { title: "Event", href: "/admin/dashboard/event/list" },
      { title: "Review Event", href: "/admin/dashboard/event/review" },
    ],
  },
  {
    title: "Manajemen Transaksi",
    href: "/dashboard/transaksi",
    icon: DollarSign,
    roles: ["Admin"], // Only Admin can see this
    submenu: [
      { title: "Kode Promo", href: "/admin/dashboard/transaksi/code" },
      { title: "Transaksi Kelas", href: "/admin/dashboard/transaksi/kelas" },
      { title: "Transaksi Event", href: "/admin/dashboard/transaksi/event" },
    ],
  },
  {
    title: "Manajemen Artikel",
    href: "/dashboard/artikel",
    icon: FileText,
    roles: ["Admin", "Writer"], // Only Admin and Writer can see this
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
    roles: ["Admin"], // Only Admin can see this
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
    roles: ["Admin"], // Only Admin can see this
    submenu: [
      { title: "Kategori", href: "/admin/dashboard/faq/kategori" },
      { title: "FAQ", href: "/admin/dashboard/faq/list" },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  const { data: session } = useSession()
  const [userRole, setUserRole] = useState<string | null>(null)

  // Get user role from session
  useEffect(() => {
    if (session?.user?.role) {
      setUserRole(session.user.role)
    }
  }, [session])

  // Auto-expand menus that contain the active page
  useEffect(() => {
    const newOpenMenus: Record<string, boolean> = {}

    navItems.forEach((item) => {
      if (item.submenu && item.submenu.some((subItem) => pathname === subItem.href)) {
        newOpenMenus[item.title] = true
      }
    })

    setOpenMenus((prev) => ({ ...prev, ...newOpenMenus }))
  }, [pathname])

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => {
      // If this menu is already open, just close it
      if (prev[title]) {
        return {
          ...prev,
          [title]: false,
        }
      }

      // Otherwise, close all menus and open only this one
      const newState: Record<string, boolean> = {}
      Object.keys(prev).forEach((key) => {
        newState[key] = false
      })

      return {
        ...newState,
        [title]: true,
      }
    })
  }

  // Check if a menu item or any of its submenu items is active
  const isMenuActive = (item: NavItem) => {
    if (pathname.startsWith(item.href)) return true
    if (item.submenu) {
      return item.submenu.some((subItem) => pathname.startsWith(subItem.href))
    }
    return false
  }

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) => {
    // If no roles specified or user is admin, show the item
    if (!item.roles || userRole === "Admin") return true

    // Otherwise, check if the user's role is in the allowed roles
    return userRole !== null && item.roles.includes(userRole)
  })

  // Define common active styles for both menu and submenu items
  const activeTextClass = "text-[#5596DF] dark:text-blue-400"
  const activeIconClass = "text-[#5596DF] dark:text-blue-400"
  const activeBgClass = "bg-blue-50 dark:bg-blue-950/30"
  const hoverClass = "hover:bg-blue-50 dark:hover:bg-blue-950/30"

  return (
    <Sidebar className="border-r shadow-sm md:w-64 transition-transform duration-300 ease-in-out z-50">
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-[#5596DF] to-[#5596DF] text-white shadow-md">
            <Cube className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-[#5596DF] to-blue-400 bg-clip-text text-transparent">
            TC
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-4 py-3">
          <h2 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">MAIN</h2>
          <SidebarMenu>
            {filteredNavItems.map((item) => (
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

