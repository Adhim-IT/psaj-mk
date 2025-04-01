"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Calendar, Home, MessageSquare, Settings, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

export default function SidebarNavigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    {
      href: "/dashboard/courses",
      label: "My Courses",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      href: "/dashboard/event",
      label: "My Events",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      href: "/dashboard/reviews",
      label: "My Reviews",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ]

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-20 left-4 z-50 lg:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-[72px] left-0 h-[calc(100vh-72px)] bg-white border-r transition-all duration-300 z-40",
          isOpen ? "w-64" : isMobile ? "w-0 -translate-x-full" : "w-20",
        )}
      >
        <div className="flex flex-col h-full py-6 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 mx-2 rounded-md transition-colors",
                pathname === item.href ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100",
                !isOpen && !isMobile ? "justify-center" : "",
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {(isOpen || !isMobile) && (
                <span
                  className={cn(
                    "ml-3 font-medium transition-opacity",
                    !isOpen && !isMobile ? "opacity-0 w-0" : "opacity-100",
                  )}
                >
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Content Margin */}
      <div className={cn("transition-all duration-300", isOpen ? "lg:ml-64" : isMobile ? "ml-0" : "lg:ml-20")}></div>
    </>
  )
}

