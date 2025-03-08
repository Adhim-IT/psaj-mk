import SlugPage from "@/src/app/(user)/kelas/[slug]/page"
import { object, string, z } from "zod"


export const LoginSchema = object({
  email: string().email("Email tidak valid"),
  password: string()
    .min(5, "Kata sandi harus lebih dari 5 karakter")
    .max(32, "Kata sandi harus kurang dari 32 karakter"),
})

export const RegisterSchema = object({
  name: string().min(1, "Nama harus lebih dari 1 karakter"),
  email: string().email("Email tidak valid"),
  password: string()
    .min(5, "Kata sandi harus lebih dari 5 karakter")
    .max(32, "Kata sandi harus kurang dari 32 karakter"),
  confirmPassword: string()
    .min(8, "Kata sandi harus lebih dari 8 karakter")
    .max(32, "Kata sandi harus kurang dari 32 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Kata sandi tidak cocok",
  path: ["confirmPassword"],
})

export const toolSchema = object({
  name: string().min(1, "Nama tool harus diisi"),
  description: string().optional(),
  url: string().url("URL tidak valid"),
  logo: string().min(1, "Logo harus diisi"),
})

export type ToolFormData = z.infer<typeof toolSchema>


export const CategoryCourseSchema = object({
  name: string().min(1, "Nama kategori harus diisi"),
  slug: string().min(1, "Slug harus diisi"),
})
export type CourseCategoryFormData = z.infer<typeof CategoryCourseSchema>
