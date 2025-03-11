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
  mentor_id: z.string().min(1, { message: "Mentor is required" }),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  slug: z.string().min(3, { message: "Slug must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  thumbnail: z.string().min(1, { message: "Thumbnail is required" }),
  trailer: z.string().url({ message: "Please enter a valid URL" }),
  level: z.enum(["Beginner", "Intermediate", "Expert"], {
    required_error: "Level is required",
  }),
  meetings: z.coerce.number().min(1, { message: "At least 1 meeting is required" }),
  is_popular: z.boolean().default(false),
  is_request: z.boolean().nullable().default(null),
  is_active: z.boolean().default(true),
  categories: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  syllabus: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1, { message: "Syllabus title is required" }),
        sort: z.number().min(1),
      }),
    )
    .default([]),
})

export type ListClassFormData = z.infer<typeof listClassSchema>




export const courseTypeSchema = z
  .object({
    course_id: z.string().min(1, {
      message: "Kelas harus dipilih",
    }),
    type: z.enum(["group", "private", "batch"], {
      required_error: "Tipe kelas harus dipilih",
    }),
    batch_number: z.number().nullable().optional(),
    slug: z.string().optional(),
    normal_price: z
      .number({
        required_error: "Harga harus diisi",
      })
      .min(0, {
        message: "Harga tidak boleh negatif",
      }),
    discount_type: z.enum(["percentage", "fixed"]).optional().nullable(),
    discount: z.number().optional().nullable(),
    start_date: z
      .date()
      .nullable()
      .optional()
      .refine(
        (date) => {
          if (!date) return true
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return date >= today
        },
        {
          message: "Tanggal mulai tidak boleh di masa lalu",
        },
      ),
    end_date: z.date().nullable().optional(),
    is_active: z.boolean().default(true),
    is_discount: z.boolean().default(false),
    is_voucher: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return data.end_date >= data.start_date
      }
      return true
    },
    {
      message: "Tanggal akhir harus setelah tanggal mulai",
      path: ["end_date"],
    },
  )

export type CourseTypeFormData = z.infer<typeof courseTypeSchema>

export const studentGroupSchema = z.object({
  course_type_id: z.string().min(1, { message: "Course type is required" }),
  mentor_id: z.string().min(1, { message: "Mentor is required" }),
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  remarks: z.string().optional(),
  start_date: z.date({ required_error: "Start date is required" }),
  end_date: z.date({ required_error: "End date is required" }),
  total_meeting: z.coerce.number().min(1, { message: "At least 1 meeting is required" }),
}).refine(data => data.start_date <= data.end_date, {
  message: "End date must be after start date",
  path: ["end_date"],
})

export type StudentGroupFormData = z.infer<typeof studentGroupSchema>

export const courseReviewSchema = z.object({
  id: z.string().optional(),
  course_id: z.string().min(1, { message: "Course is required" }),
  student_id: z.string().min(1, { message: "Student is required" }),
  rating: z.number().min(1, { message: "Rating must be at least 1" }).max(5, { message: "Rating cannot exceed 5" }),
  review: z
    .string()
    .min(1, { message: "Review is required" })
    .max(255, { message: "Review cannot exceed 255 characters" }),
  is_approved: z.boolean().default(false),
})

export type CourseReviewFormData = z.infer<typeof courseReviewSchema>

export default courseReviewSchema

export const eventSchema = z.object({
  id: z.string().optional(),
  mentor_id: z.string().min(1, "Mentor is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().optional(),
  thumbnail: z.string().min(1, "Thumbnail is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  price: z.union([z.string(), z.number()]).optional(), // Hapus `z.null()`
  whatsapp_group_link: z.string().min(1, "WhatsApp group link is required"),
  is_active: z.boolean().default(true),
});

export const promoCodeSchema = z.object({
  code: z.string().min(1, "Code is required"),
  discount_type: z.enum(["percentage", "fixed"]),
  discount: z.number().min(0, "Discount must be a positive number"),
  valid_until: z.string().min(1, "Valid until date is required"),
  is_used: z.boolean().default(false),
})
