"use client"

import { useState } from "react"
import { createArticleCategory } from "@/lib/kategori-artikel"
import type { ArticleCategoryFormData } from "@/lib/zod"
import { ArticleCategoryForm } from "@/src/components/admin/artikel/kategori/categoryArticle-form"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { HomeIcon } from 'lucide-react'

export default function CreateArticleCategoryPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
  
    const handleCreateArticleCategory = async (data: ArticleCategoryFormData) => {
      setIsSubmitting(true)
      try {
        const result = await createArticleCategory(data)
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
                  <BreadcrumbLink href="/admin/dashboard/artikel">Artikel</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/dashboard/artikel/kategori">Kategori</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>Buat Baru</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
    
          <ArticleCategoryForm onSubmit={handleCreateArticleCategory} isSubmitting={isSubmitting} />
        </div>
      )
}