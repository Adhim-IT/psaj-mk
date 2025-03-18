"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { ChevronDown, LogOut, Menu, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/user/avatar"

// Define program items to ensure consistency between mobile and desktop
const programItems = [
  { title: "Online Bootcamp Intensive", href: "/program/online-bootcamp" },
  { title: "Online Bootcamp Batch", href: "/program/batch-bootcamp" },
  { title: "Online Short Class", href: "/program/short-class" },
]

export default function Navbar() {
  const pathname = usePathname()
  const [isProgramOpen, setIsProgramOpen] = useState(false)
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userImage, setUserImage] = useState("")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setUserName(session.user.name || "")
      setUserEmail(session.user.email || "")
      setUserImage(session.user.image || "")
    }
  }, [session])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const getLinkClass = (path: string) =>
    pathname === path
      ? "text-[#5596DF] font-semibold text-sm md:text-base"
      : "text-gray-600 hover:text-[#5596DF] transition-colors duration-200 text-sm md:text-base"

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  const getUserInitials = () => {
    if (!userName) return "TC"
    return userName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header
      className={`w-full border-b border-black/10 bg-white/80 backdrop-blur-md fixed top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-md h-14 md:h-16" : "h-16 md:h-18"}`}
    >
      <div className="w-full max-w-[1400px] px-4 md:px-8 lg:px-12 mx-auto flex h-full items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/images/logo/logo-teencode.png" alt="TeenCode Logo" width={70} height={70} priority />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-6 md:flex md:ml-6 lg:ml-10">
          <Link href="/" className={getLinkClass("/")}>
            Home
          </Link>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="flex items-center text-gray-600 hover:text-[#5596DF] transition-colors duration-200 text-sm md:text-base">
              Program
              <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="overflow-auto max-h-[calc(100vh-100px)]">
              {programItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild className="focus:bg-[#EBF3FC] focus:text-[#5596DF]">
                  <Link href={item.href} className="w-full hover:text-[#5596DF] transition-colors duration-200">
                    {item.title}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/kelas" className={getLinkClass("/kelas")}>
            Kelas
          </Link>
          <Link href="/event" className={getLinkClass("/event")}>
            Event
          </Link>
          <Link href="/artikel" className={getLinkClass("/artikel")}>
            Artikel
          </Link>
          <Link href="/mentor" className={getLinkClass("/mentor")}>
            Mentor
          </Link>
        </nav>

        {/* Auth Buttons or User Profile */}
        <div className="hidden items-center space-x-4 md:flex md:ml-auto">
          {isAuthenticated ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3 hover:bg-[#EBF3FC] hover:text-[#5596DF]"
                >
                  <Avatar className="h-7 w-7 border border-[#5596DF]">
                    <AvatarImage src={userImage} alt={userName || "User"} />
                    <AvatarFallback className="bg-[#EBF3FC] text-[#5596DF]">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-medium">{userName}</span>
                    <span className="text-xs text-gray-500">{userEmail}</span>
                  </div>
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-red-500 focus:text-red-500"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-5 py-2 h-9 border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 hover:text-[#5596DF] hover:border-[#5596DF] transition-all duration-200 flex items-center justify-center"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-[#5596DF] px-5 py-2 h-9 text-sm text-white hover:bg-[#3E7BBF] transition-transform duration-200 transform hover:scale-105 flex items-center justify-center"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-[#EBF3FC] hover:text-[#5596DF] transition-colors duration-200"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle className="text-left text-xl font-normal text-[#5596DF]">Menu</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col">
              {/* User Profile in Mobile Menu (if authenticated) */}
              {isAuthenticated && (
                <div className="border-b p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-[#5596DF]">
                      <AvatarImage src={session?.user?.image || ""} alt={userName || "User"} />
                      <AvatarFallback className="bg-[#EBF3FC] text-[#5596DF]">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{userName}</span>
                      <span className="text-xs text-gray-500">{userEmail}</span>
                    </div>
                  </div>
                </div>
              )}

              <nav className="flex-1 space-y-2 p-4">
                <Link href="/" className="block py-3 text-base text-gray-700 hover:text-[#5596DF]">
                  Home
                </Link>
                <div>
                  <button
                    className="flex w-full items-center justify-between py-3 text-base text-gray-700 hover:text-[#5596DF]"
                    onClick={() => setIsProgramOpen(!isProgramOpen)}
                    aria-expanded={isProgramOpen}
                    aria-controls="program-submenu"
                  >
                    Program
                    <ChevronDown
                      className={`h-5 w-5 transition-transform duration-200 ${isProgramOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  <div id="program-submenu" className={`ml-4 space-y-2 ${isProgramOpen ? "block" : "hidden"}`}>
                    {programItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block py-2 text-base text-gray-700 hover:text-[#5596DF]"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
                <Link href="/kelas" className="block py-3 text-base text-gray-700 hover:text-[#5596DF]">
                  Kelas
                </Link>
                <Link href="/event" className="block py-3 text-base text-gray-700 hover:text-[#5596DF]">
                  Event
                </Link>
                <Link href="/artikel" className="block py-3 text-base text-gray-700 hover:text-[#5596DF]">
                  Artikel
                </Link>
                <Link href="/mentor" className="block py-3 text-base text-gray-700 hover:text-[#5596DF]">
                  Mentor
                </Link>

                {/* User-specific links in mobile menu */}
                {isAuthenticated && (
                  <>
                    <Link href="/dashboard" className="block py-3 text-base text-gray-700 hover:text-[#5596DF]">
                      Dashboard
                    </Link>
                    <Link href="/settings" className="block py-3 text-base text-gray-700 hover:text-[#5596DF]">
                      Settings
                    </Link>
                  </>
                )}
              </nav>

              <div className="border-t p-4 space-y-3">
                {isAuthenticated ? (
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full rounded-md border-red-300 bg-white text-base text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500 flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link href="/login" className="block w-full">
                      <Button
                        variant="outline"
                        className="w-full rounded-md border-gray-300 bg-white text-base text-gray-700 hover:bg-gray-50 hover:text-[#5596DF] hover:border-[#5596DF]"
                      >
                        Masuk
                      </Button>
                    </Link>
                    <Link href="/register" className="block w-full">
                      <Button className="w-full rounded-md bg-[#5596DF] text-base text-white hover:bg-[#3E7BBF]">
                        Daftar
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

