"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getListArticleById, updateListArticle, getWriters } from "@/lib/list-artikel"
import { getArticleCategories } from "@/lib/kategori-artikel"
import { getTag } from "@/lib/tag"
import { ListArticleForm } from "@/src/components/admin/artikel/list/listArtikel-form"
import { HomeIcon, AlertCircle } from "lucide-react"
import type { ListArticleFormData } from "@/types"
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

interface Writer {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
}

export default function EditListArticlePage() {
  const params = useParams()
  const id = params.id as string

  const [listArticle, setListArticle] = useState<any>(null)
  const [writers, setWriters] = useState<Writer[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTag] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch list class, mentors, categories, and tools in parallel
        const [listArticleResult, writersResult, categoriesResult, tagsResult] = await Promise.all([
          getListArticleById(id),
          getWriters(),
          getArticleCategories(),
          getTag(),
        ])

        if (listArticleResult.error) {
          setError(listArticleResult.error)
        } else {
          setListArticle(listArticleResult.listArticle)
        }

        setWriters(writersResult.writer || [])
        setCategories(categoriesResult.categories || [])
        setTag(tagsResult.tags || [])
      } catch (err) {
        setError("Gagal mengambil data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleUpdateListArticle = async (data: ListArticleFormData) => {
    setIsSubmitting(true)
    try {
      const result = await updateListArticle(id, data)
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
            <BreadcrumbLink href="/admin/dashboard/artikel">Artikel</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard/artikel/list">List</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Edit</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Artikel</h1>
        <p className="text-muted-foreground">Perbarui informasi untuk artikel yang sudah ada.</p>
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
            {listArticle && (
              <ListArticleForm
                initialData={listArticle}
                writers={writers}
                categories={categories}
                tags={tags}
                onSubmit={handleUpdateListArticle}
                isSubmitting={isSubmitting}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

