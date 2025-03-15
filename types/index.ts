import { Decimal } from "@prisma/client/runtime/library"


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
  remarks?: string | undefined
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
  remarks?: string | undefined
  start_date: Date
  end_date: Date
  total_meeting: number
}

export interface EventFormData {
  id?: string;
  mentor_id: string;
  title: string;
  slug?: string; 
  thumbnail: string;
  description: string;
  start_date: Date;
  end_date: Date;
  price?: string | number; 
  whatsapp_group_link: string;
  is_active: boolean;
}


// Update the PromoCode interface
export interface PromoCode {
  id: number
  code: string
  discount_type: "percentage" | "fixed"
  discount: number
  valid_until: Date
  is_used: boolean
  created_at: Date | null
  updated_at: Date | null
  deleted_at: Date | null
}

// Update the PromoCodeFormData interface to use string for valid_until
export interface PromoCodeFormData {
  code: string
  discount_type: "percentage" | "fixed"
  discount: number
  valid_until: string // Changed from Date to string for form handling
  is_used: boolean
}

export enum CourseTransactionType {
  GROUP = "group",
  PRIVATE = "private",
  BATCH = "batch",
}

export enum CourseTransactionStatus {
  PAID = "paid",
  UNPAID = "unpaid",
  FAILED = "failed",
}

export interface CourseTransaction {
  id: string
  code: string
  course_id: string
  student_id: string
  type: CourseTransactionType
  batch_number: number | null
  status: CourseTransactionStatus
  original_price: Decimal
  discount: Decimal | null
  final_price: Decimal
  deleted_at: Date | null
  created_at: Date | null
  updated_at: Date | null
  courses: {
    id: string
    title: string
    // Add other course fields you need
  }
  students: {
    id: string
    name: string
    email: string
    // Add other student fields you need
  }
}

export interface MidtransConfig {
  clientKey: string
  serverKey: string
  merchantId: string
  isProduction: boolean
}

export enum EventRegistrantStatus {
  PENDING = "pending",
  PAID = "paid",
}

export interface EventRegistrant {
  id: string
  event_id: string
  student_id: string
  instagram_follow: string | null
  payment_proof: string | null
  status: EventRegistrantStatus
  deleted_at: Date | null
  created_at: Date | null
  updated_at: Date | null
  events: {
    id: string
    title: string
    // Add other event fields you need
  }
  students: {
    id: string
    name: string
    phone: string
    // Add other student fields you need
  }
}


export interface Tag {
  id: string
  name: string
  slug: string
  url: string
  created_at: Date | null
  updated_at: Date | null
}

export interface TagListProps {
  tags: Tag[]
}

export interface ListArticle {
  id: string
  writer_id: string
  title: string
  slug: string
  content: string
  thumbnail: string
  categories?: { id: string; name: string }[]
  tag?: { id: string; name: string }[]
}

export interface ListArticleFormData {
  writer_id: string
  title: string
  slug?: string 
  content: string
  thumbnail: string
  tag: string[]
  categories: string[]
}