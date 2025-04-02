import type React from "react"
import Footer from "@/src/components/user/Footer"
import Navbar from "@/src/components/user/Navbar"

const DashboardUserLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16">
        <main className="w-full">{children}</main>
      </div>
      <Footer />
    </div>
  )
}

export default DashboardUserLayout

