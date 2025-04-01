import type React from "react"
import Footer from "@/components/user/Footer"
import Navbar from "@/components/user/Navbar"

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  )
}

export default UserLayout

