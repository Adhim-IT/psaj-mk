export interface Mentor {
    id: string
    name: string
    specialization: string
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
    is_request: boolean | null
    is_active: boolean
    created_at: Date | null
    updated_at: Date | null
    deleted_at: Date | null
  }
  
  export interface ListClassFormData {
    mentor_id: string
    title: string
    description: string
    thumbnail: string
    trailer: string
    level: "Beginner" | "Intermediate" | "Advanced"
    meetings: number
    is_popular: boolean
    is_request: boolean | null
    is_active: boolean
  }
  
  