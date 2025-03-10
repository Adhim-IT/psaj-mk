"use client"

import { useState, useEffect } from "react"
import { createStudentGroup, getCourseTypesForDropdown, getMentorsForDropdown } from "@/lib/kelompok-kelas"
import type { StudentGroupFormData } from "@/types"
import { StudentGroupForm } from "@/src/components/admin/kelas/kelompok-kelas/GroupClass-form"
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

export default function CreateStudentGroupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courseTypes, setCourseTypes] = useState<Array<{ id: string; type: string; title: string }>>([])
  const [mentors, setMentors] = useState<Array<{ id: string; name: string; specialization?: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch course types and mentors in parallel
        const [courseTypesResult, mentorsResult] = await Promise.all([
          getCourseTypesForDropdown(),
          getMentorsForDropdown(),
        ])

        setCourseTypes(courseTypesResult.courseTypes || [])
        setMentors(mentorsResult.mentors || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCreateStudentGroup = async (data: StudentGroupFormData) => {
    setIsSubmitting(true)
    try {
      const result = await createStudentGroup(data)
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
            <BreadcrumbLink href="/admin/dashboard/kelas/kelompok">Kelompok</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Create</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Buat Kelompok Kelas Baru</h1>
        <p className="text-muted-foreground">Buat kelompok kelas baru</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="flex justify-end space-x-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          ) : (
            <StudentGroupForm
              courseTypes={courseTypes}
              mentors={mentors}
              onSubmit={handleCreateStudentGroup}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

