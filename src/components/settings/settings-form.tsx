"use client"

import { useState } from "react"
import { ProfileForm } from "./profile-form"
import { PasswordForm } from "./password-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateProfile, updatePassword } from "@/lib/settings"
import { toast } from "sonner"
import type { User } from "next-auth"

interface SettingsFormProps {
  user: User & {
    id: string
    role?: string
    role_id?: string
    profilePicture?: string | null
  }
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleProfileUpdate = async (values: {
    name: string
    email: string
    image?: string | null
  }) => {
    setIsLoading(true)
    try {
      const result = await updateProfile(values)
      if (result.success) {
        toast.success("Profile updated successfully")
      } else {
        toast.error(result.error || "Failed to update profile")
      }
    } catch (error) {
      toast.error("An error occurred while updating your profile")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (values: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    setIsLoading(true)
    try {
      const result = await updatePassword(values)
      if (result.success) {
        toast.success("Password updated successfully")
      } else {
        toast.error(result.error || "Failed to update password")
      }
    } catch (error) {
      toast.error("An error occurred while updating your password")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Create a modified user object that includes the profilePicture
  const userWithProfilePicture = {
    ...user,
    image: user.profilePicture || user.image, // Use profilePicture if available, otherwise fall back to user.image
  }

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 rounded-t-xl">
        <TabsTrigger
          value="profile"
          className="rounded-tl-xl data-[state=active]:bg-white data-[state=active]:text-blue-600"
        >
          Profile
        </TabsTrigger>
        <TabsTrigger
          value="password"
          className="rounded-tr-xl data-[state=active]:bg-white data-[state=active]:text-blue-600"
        >
          Password
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="p-6 bg-white rounded-b-xl">
        <ProfileForm user={userWithProfilePicture} onSubmit={handleProfileUpdate} isLoading={isLoading} />
      </TabsContent>
      <TabsContent value="password" className="p-6 bg-white rounded-b-xl">
        <PasswordForm onSubmit={handlePasswordUpdate} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  )
}

