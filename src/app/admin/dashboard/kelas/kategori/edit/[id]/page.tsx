"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getCourseCategoryById, updateCourseCategory } from "@/lib/ketagori-kelas"
import { CourseCategoryForm } from "@/components/admin/categoryclass/categoryclass-form"
import { HomeIcon, AlertCircle } from "lucide-react"
import type { CourseCategoryFormData } from "@/lib/zod"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditCourseCategoryPage() {
  const params = useParams()
  const id = params.id as string

  const [courseCategory, setCourseCategory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourseCategory = async () => {
      setIsLoading(true)
      try {
        const { category: courseCategory, error } = await getCourseCategoryById(id)

        if (error) {
          setError(error)
        } else {
          setCourseCategory(courseCategory)
        }
      } catch (err) {
        setError("Failed to fetch category data")
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

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard">
                <HomeIcon className="h-4 w-4 mr-1" />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard/kelas">Kelas</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard/kelas/kategori">Kategori</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Edit</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Kategori Kelas</h1>
        <p className="text-muted-foreground">Perbarui informasi kategori kelas yang sudah ada.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="rounded-md border p-6 space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-between pt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <CourseCategoryForm
          initialData={courseCategory}
          onSubmit={handleUpdateCourseCategory}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

