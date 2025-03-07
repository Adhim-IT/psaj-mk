"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "next-auth"
import { toast } from "@/components/ui/use-toast"
import { ProfileForm } from "./profile-form"
import { PasswordForm } from "./password-form"
import { updateProfile, updatePassword } from "@/lib/settings"
import { UserCircle, KeyRound } from 'lucide-react'

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

  const handleProfileUpdate = async (data: any) => {
    setIsLoading(true)
    try {
      await updateProfile(data)
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (data: any) => {
    setIsLoading(true)
    try {
      await updatePassword(data)
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
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
            ${activeTab === "profile"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
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
            ${activeTab === "password"
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
