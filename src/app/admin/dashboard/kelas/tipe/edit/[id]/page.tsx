"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getCourseTypeById, updateCourseType, getCourses } from "@/lib/course-types"
import { CourseTypeForm } from "@/components/admin/tipe-kelas/course-type-form"
import { HomeIcon, AlertCircle } from "lucide-react"
import type { CourseTypeFormData } from "@/lib/zod"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function EditCourseTypePage() {
  const params = useParams()
  const id = params.id as string

  const [courseType, setCourseType] = useState<any>(null)
  interface Course {
    id: string
    title: string
  }

  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [courseTypeResult, coursesResult] = await Promise.all([getCourseTypeById(id), getCourses()])

        if (courseTypeResult.error) {
          setError(courseTypeResult.error)
        } else {
          // Ensure numeric values are properly converted
          const formattedCourseType = {
            ...courseTypeResult.courseType,
            normal_price: Number(courseTypeResult.courseType.normal_price),
            discount: courseTypeResult.courseType.discount ? Number(courseTypeResult.courseType.discount) : null,
          }
          setCourseType(formattedCourseType)
        }

        setCourses(coursesResult.courses || [])
      } catch (err) {
        setError("Gagal mengambil data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleUpdateCourseType = async (data: CourseTypeFormData) => {
    setIsSubmitting(true)
    try {
      const result = await updateCourseType(id, data)
      return result
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
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
            <BreadcrumbLink href="/admin/dashboard/kelas/tipe">Tipe</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Edit</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Tipe Kelas</h1>
        <p className="text-muted-foreground">Perbarui informasi tipe kelas yang sudah ada.</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-end space-x-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardContent className="pt-6">
            {courseType && (
              <CourseTypeForm
                initialData={courseType}
                courses={courses}
                onSubmit={handleUpdateCourseType}
                isSubmitting={isSubmitting}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

