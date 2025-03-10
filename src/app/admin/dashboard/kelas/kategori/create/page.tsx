"use client"

import { useState } from "react"
import { createCourseCategory } from "@/lib/ketagori-kelas"
import type { CourseCategoryFormData } from "@/lib/zod"
import { CourseCategoryForm } from "@/src/components/admin/kelas/categoryclass/categoryclass-form"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { HomeIcon } from 'lucide-react'

export default function CreateCourseCategoryPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateCourseCategory = async (data: CourseCategoryFormData) => {
    setIsSubmitting(true)
    try {
      const result = await createCourseCategory(data)
      return result
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
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
              <BreadcrumbLink href="/admin/dashboard/kelas/kategori">Kategori</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Buat Baru</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <CourseCategoryForm onSubmit={handleCreateCourseCategory} isSubmitting={isSubmitting} />
    </div>
  )
}
