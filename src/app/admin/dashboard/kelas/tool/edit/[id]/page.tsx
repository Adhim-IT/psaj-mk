"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getToolById, updateTool } from "@/lib/tools"
import { ToolForm } from "@/components/admin/tools/tool-form"
import { Loader2 } from "lucide-react"
import type { ToolFormData } from "@/lib/zod"

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
        <h1 className="text-2xl font-bold tracking-tight">Edit Tool</h1>
        <p className="text-muted-foreground mt-2">Update the tool information.</p>
      </div>

      <div className="rounded-md border p-6">
        {tool && <ToolForm initialData={tool} onSubmit={handleUpdateTool} isSubmitting={isSubmitting} />}
      </div>
    </div>
  )
}

