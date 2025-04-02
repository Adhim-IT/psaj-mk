"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { User as NextAuthUser } from "next-auth"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Camera } from "lucide-react"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nama harus minimal 2 karakter.",
  }),
  email: z.string().email({
    message: "Masukkan alamat email yang valid.",
  }),
  image: z.any().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  user: NextAuthUser & {
    id: string
    role?: string
    role_id?: string
  }
  onSubmit: (values: ProfileFormValues) => Promise<void>
  isLoading: boolean
}

export function ProfileForm({ user, onSubmit, isLoading }: ProfileFormProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set initial preview image from user data
  useEffect(() => {
    if (user?.image) {
      setPreviewImage(user.image)
      console.log("Setting initial image from user:", user.image)
    }
  }, [user?.image])

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewImage(result)
        // Set the actual file for upload
        form.setValue("image", result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const getUserInitials = () => {
    if (!user?.name) return "U"
    return user.name.charAt(0).toUpperCase()
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#5596DF]">Profil</h2>
      <p className="text-gray-500 mt-2 mb-8">Perbarui informasi profil dan alamat email Anda.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="relative group">
              <div
                onClick={handleImageClick}
                className="relative cursor-pointer rounded-full overflow-hidden transition-transform duration-200 transform group-hover:scale-105"
              >
                <div className="absolute inset-0 bg-[#5596DF]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Avatar className="h-24 w-24 ring-2 ring-white shadow-lg">
                  {previewImage ? (
                    <AvatarImage
                      src={previewImage}
                      alt={user?.name || "User"}
                      className="object-cover"
                      onError={(e) => {
                        console.error("Error loading image:", previewImage)
                        ;(e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  ) : null}
                  <AvatarFallback className="bg-[#5596DF] text-white">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              <p className="text-sm text-gray-500 mt-2 text-center">Klik untuk upload</p>
            </div>

            <div className="flex-1 space-y-6 w-full">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Nama</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama Anda"
                        {...field}
                        className="bg-gray-50/50 border-gray-200 focus:border-[#5596DF] focus:ring-2 focus:ring-[#5596DF]/20 transition-all"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Ini adalah nama tampilan publik Anda.
                    </FormDescription>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Alamat email Anda"
                        {...field}
                        className="bg-gray-50/50 border-gray-200 focus:border-[#5596DF] focus:ring-2 focus:ring-[#5596DF]/20 transition-all"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Kami akan menggunakan email ini untuk menghubungi Anda.
                    </FormDescription>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#5596DF] text-white hover:bg-[#4785cc] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memperbarui...
                </>
              ) : (
                "Perbarui profil"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

