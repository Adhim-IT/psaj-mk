"use client"

import { useState, useEffect } from "react"
import { createListArticle, getWriters } from "@/lib/list-artikel"
import { getArticleCategories } from "@/lib/kategori-artikel"
import { getTag } from "@/lib/tag"
import type { ListArticleFormData } from "@/types"
import { ListArticleForm } from "@/src/components/admin/artikel/list/listArtikel-form"
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

export default function CreateListArticlePage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [writers, setWriters] = useState<Writer[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [tags, setTags] = useState<Tag[]>([])
    const [isLoading, setIsLoading] = useState(true)
  
    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true)
        try {
          // Fetch writers, categories, and tags in parallel
          const [writersResult, categoriesResult, tagsResult] = await Promise.all([
            getWriters(),
            getArticleCategories(),
            getTag(),
          ])
  
          setWriters(writersResult.writer || [])
          setCategories(categoriesResult.categories || [])
          setTags(tagsResult.tags || [])
        } catch (error) {
          console.error("Error fetching data:", error)
        } finally {
          setIsLoading(false)
        }
      }
  
      fetchData()
    }, [])
  
    const handleCreateListArticle = async (data: ListArticleFormData) => {
      setIsSubmitting(true)
      try {
        const result = await createListArticle(data)
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
              <BreadcrumbLink href="/admin/dashboard/artikeel">Artikel</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Create New</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
  
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Article</h1>
          <p className="text-muted-foreground">Add a new article to the system.</p>
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
              <ListArticleForm
                writers={writers}
                categories={categories}
                tags={tags}
                onSubmit={handleCreateListArticle}
                isSubmitting={isSubmitting}
              />
            )}
          </CardContent>
        </Card>
      </div>
    )
  }
