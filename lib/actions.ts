"use server"

import { RegisterSchema } from "@/lib/zod"
import { hashSync } from "bcrypt-ts"
import { prisma } from "./prisma"
import { redirect } from "next/navigation"

export const signUpCredentials = async (prevState: unknown, formData: FormData) => {
  const rawFormData = Object.fromEntries(formData)
  const validateFields = RegisterSchema.safeParse(rawFormData)

  if (!validateFields.success) {
    return {
      error: validateFields.error.flatten(),
    }
  }

  const { name, email, password } = validateFields.data
  const hashedPassword = hashSync(password, 10)

  try {
    await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        password: hashedPassword,
      },
    })

    
  } catch (error) {
    return { error: "Terjadi kesalahan saat registrasi" }
  }
  redirect("/login")
}

