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
import { Loader2 } from "lucide-react"
import Swal from "sweetalert2"

const roleFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
})

type RoleFormValues = z.infer<typeof roleFormSchema>

interface RoleFormProps {
  role?: {
    id: string
    name: string
    description: string | null
  }
}

export function RoleForm({ role }: RoleFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name || "",
      description: role?.description || "",
    },
  })

  const onSubmit = async (values: RoleFormValues) => {
    setIsSubmitting(true)
    try {
      const endpoint = role ? "/api/role" : "/api/role"
      const method = role ? "PUT" : "POST"
      const body = role ? JSON.stringify({ id: role.id, ...values }) : JSON.stringify(values)

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
          text: role ? "Role updated successfully" : "Role created successfully",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          router.push("/admin/dashboard/akun/role")
        })
      } else {
        Swal.fire({
          title: "Error!",
          text: result.error || "Failed to save role",
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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Role</FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama role" {...field} />
                </FormControl>
                <FormDescription>Nama role harus unik dan minimal 2 karakter.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Textarea placeholder="Masukkan deskripsi role (opsional)" className="resize-none" {...field} />
                </FormControl>
                <FormDescription>Deskripsi singkat tentang role ini.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/dashboard/akun/role")}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {role ? "Update Role" : "Tambah Role"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

