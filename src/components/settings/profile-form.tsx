"use client"

import type React from "react"
import { useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { User as NextAuthUser } from "next-auth"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Camera } from 'lucide-react'

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
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
        setPreviewImage(reader.result as string)
        form.setValue("image", file)
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
      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Profile</h2>
      <p className="text-gray-500 mt-2 mb-8">
        Update your profile information and email address.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="relative group">
              <div 
                onClick={handleImageClick}
                className="relative cursor-pointer rounded-full overflow-hidden transition-transform duration-200 transform group-hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Avatar className="h-24 w-24 ring-2 ring-white shadow-lg">
                  <AvatarImage src={previewImage || user?.image || ""} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Click to upload
              </p>
            </div>
            
            <div className="flex-1 space-y-6 w-full">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your name" 
                        {...field} 
                        className="bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" 
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      This is your public display name.
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
                        placeholder="Your email address" 
                        {...field} 
                        className="bg-gray-50/50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" 
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      We'll use this email to contact you.
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
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update profile"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
