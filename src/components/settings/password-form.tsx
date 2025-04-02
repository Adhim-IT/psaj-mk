"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import Swal from "sweetalert2"

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(8, {
      message: "Password harus minimal 8 karakter.",
    }),
    newPassword: z.string().min(8, {
      message: "Password harus minimal 8 karakter.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password harus minimal 8 karakter.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Password baru tidak boleh sama dengan password lama",
    path: ["newPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordFormSchema>

interface PasswordFormProps {
  onSubmit: (values: PasswordFormValues) => Promise<void>
  isLoading: boolean
}

export function PasswordForm({ onSubmit, isLoading }: PasswordFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const showFormError = (message: string) => {
    Swal.fire({
      icon: "error",
      title: "Validasi Gagal",
      text: message,
      confirmButtonColor: "#5596DF",
    })
  }

  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleSubmit = async (values: PasswordFormValues) => {
    // Reset any previous errors
    setPasswordError(null)

    // Check if passwords match before submitting
    if (values.newPassword !== values.confirmPassword) {
      showFormError("Password tidak sesuai. Silakan periksa kembali.")
      return
    }

    try {
      await onSubmit(values)
      // Reset form after successful submission
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error(error)

      // If there's a specific error about incorrect password
      if (error instanceof Error && error.message.includes("Current password is incorrect")) {
        // Set the error state for the current password field
        setPasswordError("Password saat ini tidak sesuai")
        // Also focus the field
        document.getElementById("current-password")?.focus()
        // Show the alert for better visibility
        showFormError("Password saat ini tidak sesuai. Silakan periksa kembali.")

        // Prevent the error from bubbling up further
        return
      }

      // Handle other errors
      showFormError("Terjadi kesalahan saat memperbarui password. Silakan coba lagi.")
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-[#5596DF]">Password</h2>
      <p className="text-gray-500 mt-2 mb-8">
        Perbarui password Anda. Kami menyarankan menggunakan password yang kuat dan tidak digunakan di tempat lain.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => {
            // Check if passwords match
            if (values.newPassword !== values.confirmPassword) {
              showFormError("Password tidak sesuai. Silakan periksa kembali.")
              return
            }
            // Additional client-side validation if needed
            handleSubmit(values)
          })}
          className="space-y-6 max-w-xl"
        >
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Password Saat Ini</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      id="current-password"
                      placeholder="Masukkan password saat ini"
                      type={showCurrentPassword ? "text" : "password"}
                      className={`bg-gray-50/50 border-gray-200 focus:border-[#5596DF] focus:ring-2 focus:ring-[#5596DF]/20 transition-all pr-10 ${
                        passwordError ? "border-red-500 ring-1 ring-red-500" : ""
                      }`}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        // Clear error when user starts typing again
                        if (passwordError) setPasswordError(null)
                      }}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordError ? (
                  <p className="text-sm font-medium text-red-500 mt-1">{passwordError}</p>
                ) : (
                  <FormMessage className="text-red-500" />
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Password Baru</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="Masukkan password baru"
                      type={showNewPassword ? "text" : "password"}
                      className="bg-gray-50/50 border-gray-200 focus:border-[#5596DF] focus:ring-2 focus:ring-[#5596DF]/20 transition-all pr-10"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <FormDescription className="text-xs text-gray-500">Password harus minimal 8 karakter.</FormDescription>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Konfirmasi Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="Konfirmasi password baru"
                      type={showConfirmPassword ? "text" : "password"}
                      className="bg-gray-50/50 border-gray-200 focus:border-[#5596DF] focus:ring-2 focus:ring-[#5596DF]/20 transition-all pr-10"
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

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
                "Perbarui password"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

