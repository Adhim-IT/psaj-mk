"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  getStudentGroupById,
  updateStudentGroup,
  getCourseTypesForDropdown,
  getMentorsForDropdown,
} from "@/lib/kelompok-kelas"
import { StudentGroupForm } from "@/src/components/admin/kelas/kelompok-kelas/GroupClass-form"
import { HomeIcon, AlertCircle } from "lucide-react"
import type { StudentGroupFormData } from "@/types"
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

export default function EditStudentGroupPage() {
  const params = useParams()
  const id = params.id as string

  const [studentGroup, setStudentGroup] = useState<any>(null)
  const [courseTypes, setCourseTypes] = useState<Array<{ id: string; type: string; title: string }>>([])
  const [mentors, setMentors] = useState<Array<{ id: string; name: string; specialization?: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch student group, course types, and mentors in parallel
        const [groupResult, courseTypesResult, mentorsResult] = await Promise.all([
          getStudentGroupById(id),
          getCourseTypesForDropdown(),
          getMentorsForDropdown(),
        ])

        if (groupResult.error) {
          setError(groupResult.error)
        } else {
          setStudentGroup(groupResult.studentGroup)
        }

        setCourseTypes(courseTypesResult.courseTypes || [])
        setMentors(mentorsResult.mentors || [])
      } catch (err) {
        setError("Failed to fetch data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleUpdateStudentGroup = async (data: StudentGroupFormData) => {
    setIsSubmitting(true)
    try {
      const result = await updateStudentGroup(id, data)
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
            <BreadcrumbLink>Edit</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Kelompok Kelas</h1>
        <p className="text-muted-foreground">Edit kelompok kelas Anda.</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
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
            {studentGroup && (
              <StudentGroupForm
                initialData={studentGroup}
                courseTypes={courseTypes}
                mentors={mentors}
                onSubmit={handleUpdateStudentGroup}
                isSubmitting={isSubmitting}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

