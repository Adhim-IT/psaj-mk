"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getCourseCategoryById, updateCourseCategory } from "@/lib/ketagori-kelas"
import { CourseCategoryForm } from "@/components/admin/categoryclass/categoryclass-form"
import { Loader2 } from "lucide-react"
import type { CourseCategoryFormData } from "@/lib/zod"

export default function EditCourseCategoryPage() {
  const params = useParams()
  const id = params.id as string

  const [CourseCategory, setCourseCategory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourseCategory = async () => {
      setIsLoading(true)
      try {
        const { category: CourseCategory, error } = await getCourseCategoryById(id)

        if (error) {
          setError(error)
        } else {
          setCourseCategory(CourseCategory)
        }
      } catch (err) {
        setError("Failed to fetch CourseCategory data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourseCategory()
  }, [id])

  const handleUpdateCourseCategory = async (data: CourseCategoryFormData) => {
    setIsSubmitting(true)
    try {
      const result = await updateCourseCategory(id, data)
      return result
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit CourseCategory</h1>
        <p className="text-muted-foreground mt-2">Update the CourseCategory information.</p>
      </div>

      <div className="rounded-md border p-6">
        {CourseCategory && <CourseCategoryForm initialData={CourseCategory} onSubmit={handleUpdateCourseCategory} isSubmitting={isSubmitting} />}
      </div>
    </div>
  )
}

