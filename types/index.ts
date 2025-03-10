import { ToolFormData } from "@/lib/zod"


export interface Mentor {
  id: string
  name: string
  specialization: string
}



export interface Tool {
  id: string
  logo: string
  logo_public_id?: string
  name: string
  description: string | null
  url: string
  created_at: Date | null
  updated_at: Date | null
}

export interface ToolListProps {
  tools: Tool[]
}

export interface ListClass {
  id: string
  mentor_id: string
  title: string
  slug: string
  description: string
  thumbnail: string
  trailer: string
  level: string
  meetings: number
  is_popular: boolean
  is_request?: boolean | null
  is_active: boolean
  categories?: { id: string; name: string }[]
  tools?: { id: string; name: string }[]
  syllabus?: { id: string; title: string; sort: number }[]
  transactions?: { id: string; student_id: string;}[]
}

export interface ListClassFormData {
  mentor_id: string
  title: string
  slug: string
  description: string
  thumbnail: string
  trailer: string
  level: "Beginner" | "Intermediate" | "Expert"
  meetings: number
  is_popular: boolean
  is_request: boolean | null
  is_active: boolean
  categories: string[]
  tools: string[]
  syllabus: {
    id: string
    title: string
    sort: number
  }[]
}

export type CourseTypeType = "group" | "private" | "batch"
export type DiscountType = "percentage" | "fixed"

export interface CourseType {
  id: string
  course_id: string
  type: CourseTypeType
  batch_number?: number | null
  slug: string
  normal_price: number
  discount_type?: DiscountType | null
  discount?: number | null
  start_date?: Date | null
  end_date?: Date | null
  is_active: boolean
  is_discount: boolean
  is_voucher: boolean
  deleted_at?: Date | null
  created_at?: Date | null
  updated_at?: Date | null
  courses: {
    title: string
  }
}

export interface CourseTypeFormData {
  course_id: string
  type: CourseTypeType
  batch_number?: number | null
  slug?: string
  normal_price: number
  discount_type?: DiscountType | null
  discount?: number | null
  start_date?: Date | null
  end_date?: Date | null
  is_active: boolean
  is_discount: boolean
  is_voucher: boolean
}

export interface StudentGroup {
  id: string
  course_type_id: string
  mentor_id: string
  name: string
  remarks?: string | null
  start_date: Date
  end_date: Date
  total_meeting: number
  deleted_at?: Date | null
  created_at?: Date | null
  updated_at?: Date | null
  course_types: {
    id: string
    type: CourseTypeType
    title: string
  }
  mentors: {
    id: string
    name: string
  }
  course_students?: {
    id: string
    student_id: string
  }[]
}

export interface StudentGroupFormData {
  course_type_id: string
  mentor_id: string
  name: string
  remarks?: string | null
  start_date: Date
  end_date: Date
  total_meeting: number
}

