import type React from "react"

import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import NextAuthSessionProvider from "@/providers/session-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

import { Poppins } from "next/font/google"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Add display swap for better font loading
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Add display swap for better font loading
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
  display: "swap", // Add display swap for better font loading
})

export const metadata: Metadata = {
  title: "Kursus Pemrograman Online | TeenCode",
  description: "Platform belajar IT #1 di Indonesia untuk remaja dan pemula",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: dark)",
        url: "/images/logo/logo-teencode.png",
        href: "/images/logo/logo-teencode.png",
      },
      {
        media: "(prefers-color-scheme: light)",
        url: "/images/logo/logo-teencode.png",
        href: "/images/logo/logo-teencode.png",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased min-h-screen`}>
        <NextAuthSessionProvider>
          {children}
          <Toaster />
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}

