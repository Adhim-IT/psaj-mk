import { AuthError } from "next-auth"
import { signIn } from "next-auth/react"
import { LoginSchema } from "./zod"

export const signInCredentials = async (prevState: unknown, formData: FormData) => {
  const rawFormData = Object.fromEntries(formData)
  const validateFields = LoginSchema.safeParse(rawFormData)

  if (!validateFields.success) {
    return {
      error: validateFields.error.flatten(),
    }
  }

  const { email, password } = validateFields.data
  try {
    // Add error handling for the signIn call
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Avoid automatic redirect to handle role
      })

      if (result?.error) {
        return { message: "Email atau password salah" }
      }

      // Get session or user after sign in to get role_id
      try {
        const response = await fetch("/api/auth/session")
        if (!response.ok) {
          throw new Error(`Failed to fetch session: ${response.status}`)
        }

        const session = await response.json()

        const allowedRoleIds = ["cm7wzebij0000fgngw776djak", "cm7wzebj10002fgngkkc6rkdk", "cm7wzebj60003fgngf5yl85ka"]

        if (allowedRoleIds.includes(session?.user?.role_id ?? "")) {
          window.location.href = "/admin/dashboard"
        } else {
          window.location.href = "/"
        }
      } catch (sessionError) {
        console.error("Error fetching session:", sessionError)
        // If we can't get the session, redirect to home as fallback
        window.location.href = "/"
      }
    } catch (signInError) {
      console.error("Sign in error:", signInError)
      return { message: "Terjadi kesalahan saat login. Silakan coba lagi." }
    }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Email atau password salah" }
        default:
          return { message: "Terjadi kesalahan. Silakan coba lagi." }
      }
    }
    console.error("Authentication error:", error)
    return { message: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi." }
  }
}

