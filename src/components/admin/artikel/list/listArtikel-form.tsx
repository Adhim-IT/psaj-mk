"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { listArticleSchema, type ListArticleFormData } from "@/lib/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Swal from "sweetalert2"
import { Loader2, Upload, RefreshCw } from "lucide-react"
import Image from "next/image"
import { RichTextEditor } from "@/components/rich-text-editor"
import { MultiSelect } from "@/components/ui/multi-select"


interface Category {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
}

interface Writer {
  id: string
  name: string
}

interface ListArticleFormProps {
  initialData?: {
    id?: string
    writer_id: string
    title: string
    slug: string
    content: string
    thumbnail: string
    categories?: { id: string; name: string }[]
    tag?: { id: string; name: string }[]
  }
  writers: Writer[]
  categories: Category[]
  tags: Tag[]
  onSubmit: (data: ListArticleFormData) => Promise<{ success?: boolean; error?: any }>
  isSubmitting: boolean
}

export function ListArticleForm({
  initialData,
  writers,
  categories,
  tags,
  onSubmit,
  isSubmitting,
}: ListArticleFormProps) {
  const router = useRouter()
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(initialData?.thumbnail || "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categories?.map((cat) => cat.id) || [],
  )
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tag?.map((t) => t.id) || [])
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!initialData?.slug)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ListArticleFormData>({
    resolver: zodResolver(listArticleSchema),
    defaultValues: {
      writer_id: initialData?.writer_id || "",
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      content: initialData?.content || "",
      thumbnail: initialData?.thumbnail || "",
      categories: initialData?.categories?.map((cat) => cat.id) || [],
      tag: initialData?.tag?.map((t) => t.id) || [],
    },
  })

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
      .trim()
  }

  // Watch fields for real-time updates
  const title = watch("title")
  const slug = watch("slug")
  const content = watch("content")

  // Auto-generate slug from title if slug hasn't been manually edited
  useEffect(() => {
    if (title && !isSlugManuallyEdited) {
      const generatedSlug = generateSlug(title)
      setValue("slug", generatedSlug)
    }
  }, [title, isSlugManuallyEdited, setValue])

  useEffect(() => {
    if (initialData) {
      reset({
        writer_id: initialData.writer_id,
        title: initialData.title,
        slug: initialData.slug,
        content: initialData.content,
        thumbnail: initialData.thumbnail,
        categories: initialData?.categories?.map((cat) => cat.id) || [],
        tag: initialData?.tag?.map((t) => t.id) || [],
      })
      setThumbnailPreview(initialData.thumbnail)
      setSelectedCategories(initialData?.categories?.map((cat) => cat.id) || [])
      setSelectedTags(initialData?.tag?.map((t) => t.id) || [])
      setIsSlugManuallyEdited(!!initialData.slug)
    }
  }, [initialData, reset])

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setThumbnailPreview(base64String)
        setValue("thumbnail", base64String)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }

  // Regenerate slug from title
  const regenerateSlug = () => {
    if (title) {
      const generatedSlug = generateSlug(title)
      setValue("slug", generatedSlug)
    }
  }

  // Handle manual slug edit
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true)
  }

  const handleFormSubmit = async (data: ListArticleFormData) => {
    // Ensure categories and tags are included in the submission
    const formData = {
      ...data,
      categories: selectedCategories,
      tag: selectedTags,
    }

    try {
      const result = await onSubmit(formData)

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: initialData ? "Article updated" : "Article created",
          text: initialData ? "Article has been updated successfully." : "New article has been created successfully.",
        })
        router.push("/admin/dashboard/artikel/list")
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            typeof result.error === "string"
              ? result.error
              : "Failed to save article. Please check the form and try again.",
        })
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="writer_id">Writer</Label>
          <select
            id="writer_id"
            {...register("writer_id")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select a writer</option>
            {writers.map((writer) => (
              <option key={writer.id} value={writer.id}>
                {writer.name}
              </option>
            ))}
          </select>
          {errors.writer_id && <p className="mt-1 text-sm text-red-500">{errors.writer_id.message}</p>}
        </div>

        <div>
          <Label htmlFor="title">Article Title</Label>
          <Input id="title" {...register("title")} className="mt-1" placeholder="Enter article title" />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <Label htmlFor="slug">Slug</Label>
          <div className="flex gap-2 mt-1">
            <Input id="slug" {...register("slug")} placeholder="enter-slug-here" onChange={handleSlugChange} />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={regenerateSlug}
              title="Regenerate slug from title"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            The slug is used in the URL: https://example.com/artikel/list/
            <span className="font-mono">{slug || "your-slug"}</span>
          </p>
        </div>

        <div>
          <Label htmlFor="thumbnail">Thumbnail</Label>
          <div className="mt-2 flex flex-col items-start gap-4">
            {thumbnailPreview && (
              <div className="relative h-40 w-full max-w-md overflow-hidden rounded-md border border-gray-200">
                <Image
                  src={thumbnailPreview || "/placeholder.svg?height=160&width=320"}
                  alt="Article thumbnail preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <input
                type="file"
                id="thumbnail"
                ref={fileInputRef}
                onChange={handleThumbnailChange}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Choose File
                  </>
                )}
              </Button>
              <input type="hidden" {...register("thumbnail")} />
              {errors.thumbnail && <p className="mt-1 text-sm text-red-500">{errors.thumbnail.message}</p>}
            </div>
          </div>
        </div>

        <div>
          <Label>Categories</Label>
          <div className="mt-2">
            <MultiSelect
              options={categories.map((category) => ({ value: category.id, label: category.name }))}
              selected={selectedCategories}
              onChange={(values) => {
                setSelectedCategories(values)
                setValue("categories", values)
              }}
              placeholder="Select categories..."
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Click to select multiple categories</p>
          <input type="hidden" {...register("categories")} value={selectedCategories.join(",")} />
        </div>

        <div>
          <Label>Tags</Label>
          <div className="mt-2">
            <MultiSelect
              options={tags.map((tag) => ({ value: tag.id, label: tag.name }))}
              selected={selectedTags}
              onChange={(values) => {
                setSelectedTags(values)
                setValue("tag", values)
              }}
              placeholder="Select tags..."
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Click to select multiple tags</p>
          <input type="hidden" {...register("tag")} value={selectedTags.join(",")} />
        </div>

        <div>
          <Label htmlFor="content">Content</Label>
          <div className="mt-1">
            <RichTextEditor
              id="content"
              value={content}
              onChange={(value) => setValue("content", value)}
              minHeight="300px"
              placeholder="Enter article content (Use Markdown: **bold**, *italic*, - list item, [link](url))"
              error={errors.content?.message}
            />
          </div>
          {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/dashboard/artikel/list")}>
          Back
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || isUploading}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? "Updating..." : "Creating..."}
            </>
          ) : initialData ? (
            "Update Article"
          ) : (
            "Create Article"
          )}
        </Button>
      </div>
    </form>
  )
}

