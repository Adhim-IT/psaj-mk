"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ChevronDown, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet"
import Image from "next/image"

// Define program items to ensure consistency between mobile and desktop
const programItems = [
  { title: "Online Bootcamp Intensive", href: "/program/online-bootcamp" },
  { title: "Online Bootcamp Batch", href: "/program/batch-bootcamp" },
  { title: "Online Short Class", href: "/program/short-class" },
]

export default function Navbar() {
  const pathname = usePathname()
  const [isProgramOpen, setIsProgramOpen] = useState(false)

  const getLinkClass = (path: string) =>
    pathname === path
      ? "text-[#5596DF] font-semibold text-base"
      : "text-gray-600 hover:text-[#5596DF] transition-colors duration-200 text-base"

  return (
    <header className="w-full border-b border-black bg-white/80 backdrop-blur-md fixed top-0 z-50 transition-all duration-300 shadow-md">
      <div className="w-full max-w-[1400px] px-4 md:px-8 lg:px-12 mx-auto flex h-24 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/images/logo/logo-teencode.png" alt="TeenCode Logo" width={90} height={90} priority />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center space-x-8 md:flex md:ml-10 lg:ml-16">
          <Link href="/" className={getLinkClass("/")}>
            Home
          </Link>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="flex items-center text-gray-600 hover:text-[#5596DF] transition-colors duration-200 text-base">
              Program
              <ChevronDown className="ml-1 h-5 w-5" />
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

        {/* Auth Buttons */}
        <div className="hidden items-center space-x-6 md:flex md:ml-auto">
          <Link
            href="/masuk"
            className="rounded-md px-8 py-3 h-12 border border-gray-300 text-base text-gray-600 hover:bg-gray-100 hover:text-[#5596DF] hover:border-[#5596DF] transition-all duration-200 flex items-center justify-center"
          >
            Masuk
          </Link>
          <Link
            href="/daftar"
            className="rounded-md bg-[#5596DF] px-8 py-3 h-12 text-base text-white hover:bg-[#3E7BBF] transition-transform duration-200 transform hover:scale-105 flex items-center justify-center"
          >
            Daftar
          </Link>
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
              <Menu className="h-7 w-7" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-0">
            <SheetHeader className="border-b p-4">
              <SheetTitle className="text-left text-xl font-normal text-[#5596DF]">Menu</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col">
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
              </nav>
              <div className="border-t p-4 space-y-3">
                <Link href="/masuk" className="block w-full">
                  <Button
                    variant="outline"
                    className="w-full rounded-md border-gray-300 bg-white text-base text-gray-700 hover:bg-gray-50 hover:text-[#5596DF] hover:border-[#5596DF]"
                  >
                    Masuk
                  </Button>
                </Link>
                <Link href="/daftar" className="block w-full">
                  <Button className="w-full rounded-md bg-[#5596DF] text-base text-white hover:bg-[#3E7BBF]">
                    Daftar
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

