"use client"

import { useState } from "react"
import { createTool } from "@/lib/tools"
import { ToolForm } from "@/components/admin/tools/tool-form"
import type { ToolFormData } from "@/lib/zod"

export default function CreateToolPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateTool = async (data: ToolFormData) => {
    setIsSubmitting(true)
    try {
      const result = await createTool(data)
      return result
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Tool</h1>
        <p className="text-muted-foreground mt-2">Add a new tool to the system.</p>
      </div>

      <div className="rounded-md border p-6">
        <ToolForm onSubmit={handleCreateTool} isSubmitting={isSubmitting} />
      </div>
    </div>
  )
}

