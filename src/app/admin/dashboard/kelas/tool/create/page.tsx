"use client"

import { useState } from "react"
import { createTool } from "@/lib/tools"
import type { ToolFormData } from "@/lib/zod"
import { ToolForm } from "@/components/admin/tools/tool-form"
import { HomeIcon } from 'lucide-react'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import { Card, CardContent } from "@/components/ui/card"

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
            <BreadcrumbLink>Buat Baru</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Buat Tool Baru</h1>
        <p className="text-muted-foreground">Tambahkan tool baru ke dalam sistem.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ToolForm onSubmit={handleCreateTool} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  )
}
