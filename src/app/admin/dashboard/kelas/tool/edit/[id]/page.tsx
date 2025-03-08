"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getToolById, updateTool } from "@/lib/tools"
import { ToolForm } from "@/components/admin/tools/tool-form"
import { HomeIcon, AlertCircle } from "lucide-react"
import type { ToolFormData } from "@/lib/zod"
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

export default function EditToolPage() {
  const params = useParams()
  const id = params.id as string

  const [tool, setTool] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTool = async () => {
      setIsLoading(true)
      try {
        const { tool, error } = await getToolById(id)

        if (error) {
          setError(error)
        } else {
          setTool(tool)
        }
      } catch (err) {
        setError("Failed to fetch tool data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTool()
  }, [id])

  const handleUpdateTool = async (data: ToolFormData) => {
    setIsSubmitting(true)
    try {
      const result = await updateTool(id, data)
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
            <BreadcrumbLink href="/admin/dashboard/kelas/tool">Tool</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Edit</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Tool</h1>
        <p className="text-muted-foreground">Perbarui informasi tool yang sudah ada.</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-24 rounded-md" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-between pt-4">
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
            {tool && <ToolForm initialData={tool} onSubmit={handleUpdateTool} isSubmitting={isSubmitting} />}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

