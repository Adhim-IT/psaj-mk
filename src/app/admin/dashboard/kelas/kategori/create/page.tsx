"use client"

import { useState } from "react"
import { createCourseCategory } from "@/lib/ketagori-kelas"
import type { CourseCategoryFormData } from "@/lib/zod"
import { CourseCategoryForm } from "@/src/components/admin/categoryclass/categoryclass-form"

export default function CreateCourseCategoryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateCourseCategory = async (data: CourseCategoryFormData) => {
    setIsSubmitting(true)
    try {
      const result = await createCourseCategory(data)
      return result
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Course Category</h1>
        <p className="text-muted-foreground mt-2">Add a new course category to the system.</p>
      </div>

      <div className="rounded-md border p-6">
        <CourseCategoryForm onSubmit={handleCreateCourseCategory} isSubmitting={isSubmitting} />
      </div>
    </div>
  )
}
