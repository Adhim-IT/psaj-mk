"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import Swal from "sweetalert2"

const mentorFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters.",
    })
    .optional(),
  role_id: z.string({
    required_error: "Please select a role.",
  }),
  gender: z.enum(["male", "female"], {
    required_error: "Please select a gender.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  specialization: z.string().min(2, {
    message: "Specialization must be at least 2 characters.",
  }),
  bio: z.string().min(10, {
    message: "Bio must be at least 10 characters.",
  }),
  profile_picture: z.string().optional(),
})

type MentorFormValues = z.infer<typeof mentorFormSchema>

interface Role {
  id: string
  name: string
}

interface MentorFormProps {
  mentor?: {
    id: string
    name: string
    username: string
    gender: string
    phone: string
    city: string
    specialization: string
    bio: string
    profile_picture: string | null
    users: {
      id: string
      email: string
      role_id: string | null
    }
  }
  roles: Role[]
}

export function MentorForm({ mentor, roles }: MentorFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(mentor?.profile_picture || null)
  const [isUploading, setIsUploading] = useState(false)

  // For edit mode, make password optional
  const formSchema = mentor
    ? mentorFormSchema.omit({ password: true }).extend({
        password: z
          .string()
          .min(8, {
            message: "Password must be at least 8 characters.",
          })
          .optional(),
      })
    : mentorFormSchema

  const form = useForm<MentorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: mentor?.name || "",
      username: mentor?.username || "",
      email: mentor?.users.email || "",
      password: "",
      role_id: mentor?.users.role_id || "",
      gender: mentor?.gender as "male" | "female",
      phone: mentor?.phone || "",
      city: mentor?.city || "",
      specialization: mentor?.specialization || "",
      bio: mentor?.bio || "",
      profile_picture: mentor?.profile_picture || "",
    },
  })

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append("file", file)

      // Upload to server
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Upload failed")
      }

      // Update form value with the Cloudinary URL
      form.setValue("profile_picture", result.url)
      setImagePreview(result.url)

      return result.url
    } catch (error) {
      console.error("Error uploading image:", error)
      Swal.fire({
        title: "Error!",
        text: "Failed to upload image",
        icon: "error",
        confirmButtonText: "OK",
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (values: MentorFormValues) => {
    setIsSubmitting(true)
    try {
      const endpoint = "/api/mentor"
      const method = mentor ? "PUT" : "POST"
      const body = mentor
        ? JSON.stringify({
            id: mentor.id,
            ...values,
          })
        : JSON.stringify(values)

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body,
      })

      const result = await response.json()

      if (result.success) {
        Swal.fire({
          title: "Success!",
          text: mentor ? "Mentor updated successfully" : "Mentor created successfully",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          router.push("/admin/dashboard/akun/mentor")
        })
      } else {
        Swal.fire({
          title: "Error!",
          text: result.error || "Failed to save mentor",
          icon: "error",
          confirmButtonText: "OK",
        })
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "An error occurred",
        icon: "error",
        confirmButtonText: "OK",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{mentor ? "Password Baru (opsional)" : "Password"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={mentor ? "Kosongkan jika tidak ingin mengubah" : "Masukkan password"}
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Kelamin</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis kelamin" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Laki-laki</SelectItem>
                      <SelectItem value="female">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nomor telepon" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kota</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan kota" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spesialisasi</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan spesialisasi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profile_picture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto Profil</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {imagePreview && (
                        <div className="w-32 h-32 rounded-full overflow-hidden border">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const url = await handleFileUpload(file)
                              if (url) {
                                field.onChange(url)
                              }
                            }
                          }}
                        />
                        {/* Hidden input to store the actual URL value */}
                        <input type="hidden" {...field} />
                        {isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>Unggah foto profil (opsional).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Masukkan bio atau deskripsi singkat" className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/dashboard/akun/mentor")}
              disabled={isSubmitting || isUploading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mentor ? "Update Mentor" : "Tambah Mentor"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

