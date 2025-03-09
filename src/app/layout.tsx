
import type { Metadata } from "next"
import { Geist, Azeret_Mono as Geist_Mono } from "next/font/google"
import NextAuthSessionProvider from "@/providers/session-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

import { Poppins } from "next/font/google"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"], // Pilih variasi berat font yang diinginkan
  variable: "--font-poppins", // Nama CSS Variable
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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}>
        <NextAuthSessionProvider>
          {children}
          <Toaster />
        </NextAuthSessionProvider>
      </body>
    </html>
  )
}

