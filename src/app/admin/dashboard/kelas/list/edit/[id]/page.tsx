"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getListClassById, updateListClass, getMentors } from "@/lib/list-kelas"
import { getCourseCategories } from "@/lib/ketagori-kelas"
import { getTools } from "@/lib/tools"
import { ListClassForm } from "@/components/admin/list-kelas/ListClass-form"
import { HomeIcon, AlertCircle } from "lucide-react"
import type { ListClassFormData } from "@/types"
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

interface Mentor {
  id: string
  name: string
  specialization: string
}

interface Category {
  id: string
  name: string
}

interface Tool {
  id: string
  name: string
}

export default function EditListClassPage() {
  const params = useParams()
  const id = params.id as string

  const [listClass, setListClass] = useState<any>(null)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch list class, mentors, categories, and tools in parallel
        const [listClassResult, mentorsResult, categoriesResult, toolsResult] = await Promise.all([
          getListClassById(id),
          getMentors(),
          getCourseCategories(),
          getTools(),
        ])

        if (listClassResult.error) {
          setError(listClassResult.error)
        } else {
          setListClass(listClassResult.listClass)
        }

        setMentors(mentorsResult.mentors || [])
        setCategories(categoriesResult.categories || [])
        setTools(toolsResult.tools || [])
      } catch (err) {
        setError("Gagal mengambil data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleUpdateListClass = async (data: ListClassFormData) => {
    setIsSubmitting(true)
    try {
      const result = await updateListClass(id, data)
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
            <BreadcrumbLink href="/admin/dashboard/kelas/list">List</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Edit</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Kelas</h1>
        <p className="text-muted-foreground">Perbarui informasi untuk kelas yang sudah ada.</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
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
            {listClass && (
              <ListClassForm
                initialData={listClass}
                mentors={mentors}
                categories={categories}
                tools={tools}
                onSubmit={handleUpdateListClass}
                isSubmitting={isSubmitting}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

