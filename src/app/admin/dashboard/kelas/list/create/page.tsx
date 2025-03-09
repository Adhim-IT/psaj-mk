"use client"

import { useState, useEffect } from "react"
import { createListClass, getMentors } from "@/lib/list-kelas"
import { getCourseCategories } from "@/lib/ketagori-kelas"
import { getTools } from "@/lib/tools"
import type { ListClassFormData } from "@/types"
import { ListClassForm } from "@/components/admin/list-kelas/ListClass-form"
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

export default function CreateListClassPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch mentors, categories, and tools in parallel
        const [mentorsResult, categoriesResult, toolsResult] = await Promise.all([
          getMentors(),
          getCourseCategories(),
          getTools(),
        ])

        setMentors(mentorsResult.mentors || [])
        setCategories(categoriesResult.categories || [])
        setTools(toolsResult.tools || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCreateListClass = async (data: ListClassFormData) => {
    setIsSubmitting(true)
    try {
      const result = await createListClass(data)
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
            <BreadcrumbLink>Buat Baru</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Buat Kelas Baru</h1>
        <p className="text-muted-foreground">Tambahkan kelas baru ke sistem.</p>
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
              <Skeleton className="h-40 w-full" />
              <div className="flex justify-end space-x-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          ) : (
            <ListClassForm
              mentors={mentors}
              categories={categories}
              tools={tools}
              onSubmit={handleCreateListClass}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

