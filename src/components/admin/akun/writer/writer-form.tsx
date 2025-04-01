"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Swal from "sweetalert2"
import { Loader2 } from "lucide-react"
import { uploadImage } from "@/lib/cloudinary"

const writerFormSchema = z.object({
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
  profile_picture: z.string().optional(),
})

type WriterFormValues = z.infer<typeof writerFormSchema>

interface Role {
  id: string
  name: string
}

interface WriterFormProps {
  writer?: {
    id: string
    name: string
    username: string
    profile_picture: string | null
    users: {
      id: string
      email: string
      role_id: string | null
    }
  }
  roles: Role[]
}

export function WriterForm({ writer, roles }: WriterFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(writer?.profile_picture || null)

  // For edit mode, make password optional
  const formSchema = writer
    ? writerFormSchema.omit({ password: true }).extend({
        password: z
          .string()
          .min(8, {
            message: "Password must be at least 8 characters.",
          })
          .optional(),
      })
    : writerFormSchema

  const form = useForm<WriterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: writer?.name || "",
      username: writer?.username || "",
      email: writer?.users.email || "",
      password: "",
      role_id: writer?.users.role_id || "",
      profile_picture: writer?.profile_picture || "",
    },
  })

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true)
      const base64 = await fileToBase64(file)
      const result = await uploadImage(base64)

      // Update form with the Cloudinary URL
      form.setValue("profile_picture", result.url)
      setPreviewImage(result.url)

      Swal.fire({
        title: "Success!",
        text: "Image uploaded successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      Swal.fire({
        title: "Error!",
        text: "Failed to upload image",
        icon: "error",
        confirmButtonText: "OK",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (values: WriterFormValues) => {
    setIsSubmitting(true)
    try {
      const endpoint = "/api/writer"
      const method = writer ? "PUT" : "POST"
      const body = writer ? JSON.stringify({ id: writer.id, ...values }) : JSON.stringify(values)

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
          text: writer ? "Writer updated successfully" : "Writer created successfully",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          router.push("/admin/dashboard/akun/writer")
        })
      } else {
        Swal.fire({
          title: "Error!",
          text: result.error || "Failed to save writer",
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
                  <FormLabel>{writer ? "Password Baru (opsional)" : "Password"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={writer ? "Kosongkan jika tidak ingin mengubah" : "Masukkan password"}
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
              name="profile_picture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto Profil</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {previewImage && (
                        <div className="w-32 h-32 rounded-full overflow-hidden border">
                          <img
                            src={previewImage || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleFileUpload(file)
                            }
                          }}
                        />
                        {isUploading && (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Uploading...</span>
                          </div>
                        )}
                      </div>
                      <Input type="hidden" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>Unggah foto profil (opsional). Gambar akan disimpan di Cloudinary.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/dashboard/akun/writer")}
              disabled={isSubmitting || isUploading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {writer ? "Update Writer" : "Tambah Writer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

