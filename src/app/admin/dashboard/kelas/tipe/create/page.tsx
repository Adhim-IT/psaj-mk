"use client"

import { useState, useEffect } from "react"
import { createCourseType, getCourses } from "@/lib/course-types"
import type { CourseTypeFormData } from "@/lib/zod"
import { CourseTypeForm } from "@/components/admin/tipe-kelas/course-type-form"
import { HomeIcon } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CreateCourseTypePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  interface Course {
    id: string
    title: string
  }

  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true)
      try {
        const { courses } = await getCourses()
        setCourses(courses || [])
      } catch (error) {
        console.error("Error fetching courses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const handleCreateCourseType = async (data: CourseTypeFormData) => {
    setIsSubmitting(true)
    try {
      const result = await createCourseType(data)
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
            <BreadcrumbLink>Buat Baru</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Buat Tipe Kelas Baru</h1>
        <p className="text-muted-foreground">Tambahkan tipe kelas baru ke sistem.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="flex justify-end space-x-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          ) : (
            <CourseTypeForm courses={courses} onSubmit={handleCreateCourseType} isSubmitting={isSubmitting} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

