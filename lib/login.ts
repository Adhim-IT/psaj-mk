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
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/",
      })
    }catch (error) {
      if (error instanceof AuthError){
        switch (error.type) {
          case "CredentialsSignin":
            return {message: "Email atau password salah"};
          default:
            return{ message: "Terjadi kesalahan. Silakan coba lagi."}
  
        }
      }
      throw error
    }
  }
  