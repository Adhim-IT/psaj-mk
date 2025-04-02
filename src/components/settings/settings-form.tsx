"use client"

import { useState } from "react"
import { ProfileForm } from "./profile-form"
import { PasswordForm } from "./password-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateProfile, updatePassword } from "@/lib/settings"
import Swal from "sweetalert2"
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
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Profil berhasil diperbarui",
          confirmButtonColor: "#5596DF",
          timer: 3000,
        })
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: result.error || "Gagal memperbarui profil",
          confirmButtonColor: "#5596DF",
        })
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: "Terjadi kesalahan saat memperbarui profil Anda",
        confirmButtonColor: "#5596DF",
      })
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
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Password berhasil diperbarui",
          confirmButtonColor: "#5596DF",
          timer: 3000,
        })
      } else {
        // Check for specific error messages
        if (result.error && result.error.includes("Current password is incorrect")) {
          // Show SweetAlert instead of throwing an error
          Swal.fire({
            icon: "error",
            title: "Validasi Gagal",
            text: "Password saat ini tidak sesuai. Silakan periksa kembali.",
            confirmButtonColor: "#5596DF",
          })

          // Focus the current password field if possible
          setTimeout(() => {
            document.getElementById("current-password")?.focus()
          }, 500)
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: result.error || "Gagal memperbarui password",
            confirmButtonColor: "#5596DF",
          })
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat memperbarui password Anda"
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: errorMessage,
        confirmButtonColor: "#5596DF",
      })
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

