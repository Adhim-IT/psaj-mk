"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "next-auth"
import { ProfileForm } from "./profile-form"
import { PasswordForm } from "./password-form"
import { updateProfile, updatePassword } from "@/lib/settings"
import { UserCircle, KeyRound } from "lucide-react"
import { useSession } from "next-auth/react"
import Swal from "sweetalert2"

interface SettingsFormProps {
  user: User & {
    id: string
    role?: string
    role_id?: string
  }
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, update } = useSession()

  const handleProfileUpdate = async (data: any) => {
    setIsLoading(true)
    try {
      const result = await updateProfile(data)
      if (result.success) {
        // Update the session with new user data
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.name,
            email: data.email,
            image: data.image instanceof File ? URL.createObjectURL(data.image) : session?.user?.image,
          },
        })

        Swal.fire({
          icon: "success",
          title: "Profile updated",
          text: "Your profile has been updated successfully.",
          confirmButtonColor: "#3085d6",
          timer: 3000,
        })

        router.refresh()
      }
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#d33",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (data: any) => {
    setIsLoading(true)
    try {
      await updatePassword(data)
      Swal.fire({
        icon: "success",
        title: "Password updated",
        text: "Your password has been updated successfully.",
        confirmButtonColor: "#3085d6",
        timer: 3000,
      })
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#d33",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex border-b mb-8">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm relative transition-colors
            ${
              activeTab === "profile" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"
            }
            before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 
            before:bg-blue-600 before:transform before:scale-x-0 before:transition-transform
            ${activeTab === "profile" ? "before:scale-x-100" : "hover:before:scale-x-100"}
          `}
        >
          <UserCircle className={`h-4 w-4 ${activeTab === "profile" ? "text-blue-600" : "text-gray-400"}`} />
          <span>Profile</span>
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm relative transition-colors
            ${
              activeTab === "password"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }
            before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 
            before:bg-blue-600 before:transform before:scale-x-0 before:transition-transform
            ${activeTab === "password" ? "before:scale-x-100" : "hover:before:scale-x-100"}
          `}
        >
          <KeyRound className={`h-4 w-4 ${activeTab === "password" ? "text-blue-600" : "text-gray-400"}`} />
          <span>Password</span>
        </button>
      </div>

      <div className="pb-8">
        {activeTab === "profile" && <ProfileForm user={user} onSubmit={handleProfileUpdate} isLoading={isLoading} />}
        {activeTab === "password" && <PasswordForm onSubmit={handlePasswordUpdate} isLoading={isLoading} />}
      </div>
    </div>
  )
}

