import { isValidYouTubeUrl } from "./youtube"
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

export const listClassSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  thumbnail: z.string().min(1, "Thumbnail is required"),
  trailer: z.string().min(1, "Trailer URL is required").refine(isValidYouTubeUrl, {
    message: "Please enter a valid YouTube URL",
  }),
  level: z.enum(["Beginner", "Intermediate", "Advanced"], {
    errorMap: () => ({ message: "Please select a valid level" }),
  }),
  meetings: z.coerce.number().int("Number of meetings must be an integer").min(1, "At least one meeting is required"),
  mentor_id: z.string().min(1, "Mentor is required"),
  is_popular: z.boolean().default(false),
  is_request: z.boolean().nullable().default(null),
  is_active: z.boolean().default(true),
})

export type ListClassFormData = z.infer<typeof listClassSchema>
