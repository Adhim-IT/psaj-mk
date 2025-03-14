"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getArticleCategoryById, updateArticleCategory } from "@/lib/kategori-artikel"
import { ArticleCategoryForm } from "@/src/components/admin/artikel/kategori/categoryArticle-form"
import { HomeIcon, AlertCircle } from "lucide-react"
import type { ArticleCategoryFormData } from "@/lib/zod"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditArticleCategoryPage(){
    const params = useParams()
    const id = params.id as string

    const [articleCategory, setArticleCategory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticleCategory = async () => {
      setIsLoading(true)
      try {
        const { category: articleCategory, error } = await getArticleCategoryById(id)

        if (error) {
          setError(error)
        } else {
          setArticleCategory(articleCategory)
        }
      } catch (err) {
        setError("Failed to fetch category data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticleCategory()
  }, [id])

  const handleUpdateArticleCategory = async (data: ArticleCategoryFormData) => {
    setIsSubmitting(true)
    try {
      const result = await updateArticleCategory(id, data)
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
              <BreadcrumbLink>Edit</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Kategori Kelas</h1>
        <p className="text-muted-foreground">Perbarui informasi kategori kelas yang sudah ada.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="rounded-md border p-6 space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-between pt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <ArticleCategoryForm
          initialData={articleCategory}
          onSubmit={handleUpdateArticleCategory}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}