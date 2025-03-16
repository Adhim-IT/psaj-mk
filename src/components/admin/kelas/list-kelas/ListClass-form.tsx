"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { listClassSchema, type ListClassFormData } from "@/lib/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Swal from "sweetalert2"
import { Loader2, Upload, Plus, RefreshCw } from "lucide-react"
import Image from "next/image"
import { YouTubePreview } from "./youtube-preview"
import { RichTextEditor } from "@/components/rich-text-editor"
import { MultiSelect } from "@/components/ui/multi-select"

interface Category {
  id: string
  name: string
}

interface Tool {
  id: string
  name: string
}

interface SyllabusItem {
  id: string
  title: string
  sort: number
}
interface MentorUser {
  id: string
  name: string
  specialization: string
}
interface Mentor {
  id: string
  name: string
  specialization: string
}

interface ListClassFormProps {
  initialData?: {
    id?: string
    mentor_id: string
    title: string
    slug: string
    description: string
    thumbnail: string
    trailer: string
    level: string
    meetings: number
    is_popular: boolean
    is_request?: boolean
    is_active: boolean
    categories?: { id: string; name: string }[]
    tools?: { id: string; name: string }[]
    syllabus?: SyllabusItem[]
  }
  mentors: Mentor[]
  categories: Category[]
  tools: Tool[]
  onSubmit: (data: ListClassFormData) => Promise<{ success?: boolean; error?: any }>
  isSubmitting: boolean
}

export function ListClassForm({ initialData, mentors, categories, tools, onSubmit, isSubmitting }: ListClassFormProps) {
  const router = useRouter()
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(initialData?.thumbnail || "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categories?.map((cat) => cat.id) || [],
  )
  const [selectedTools, setSelectedTools] = useState<string[]>(initialData?.tools?.map((tool) => tool.id) || [])
  const [syllabusItems, setSyllabusItems] = useState<SyllabusItem[]>(initialData?.syllabus || [])
  const [newSyllabusTitle, setNewSyllabusTitle] = useState("")
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!initialData?.slug)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ListClassFormData>({
    resolver: zodResolver(listClassSchema),
    defaultValues: {
      mentor_id: initialData?.mentor_id || "",
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      thumbnail: initialData?.thumbnail || "",
      trailer: initialData?.trailer || "",
      level: (initialData?.level as "Beginner" | "Intermediate" | "Expert") || "Beginner",
      meetings: initialData?.meetings || 1,
      is_popular: initialData?.is_popular || false,
      is_request: initialData?.is_request || null,
      is_active: initialData?.is_active || true,
      categories: initialData?.categories?.map((cat) => cat.id) || [],
      tools: initialData?.tools?.map((tool) => tool.id) || [],
      syllabus: initialData?.syllabus || [],
    },
  })

  // Watch fields for real-time updates
  const title = watch("title")
  const slug = watch("slug")
  const description = watch("description")
  const trailer = watch("trailer")
  const level = watch("level")

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
        mentor_id: initialData.mentor_id,
        title: initialData.title,
        slug: initialData.slug,
        description: initialData.description,
        thumbnail: initialData.thumbnail,
        trailer: initialData.trailer,
        level: initialData.level as "Beginner" | "Intermediate" | "Expert",
        meetings: initialData.meetings,
        is_popular: initialData.is_popular,
        is_request: initialData.is_request || null,
        is_active: initialData.is_active,
        categories: initialData?.categories?.map((cat) => cat.id) || [],
        tools: initialData?.tools?.map((tool) => tool.id) || [],
        syllabus: initialData?.syllabus || [],
      })
      setThumbnailPreview(initialData.thumbnail)
      setSelectedCategories(initialData?.categories?.map((cat) => cat.id) || [])
      setSelectedTools(initialData?.tools?.map((tool) => tool.id) || [])
      setSyllabusItems(initialData?.syllabus || [])
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

  // Generate slug from title
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
      .trim()
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

  // Simple formatting functions
  const insertFormatting = (format: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)

    let formattedText = ""
    let cursorPosition = 0

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        cursorPosition = start + 2
        break
      case "italic":
        formattedText = `*${selectedText}*`
        cursorPosition = start + 1
        break
      case "list":
        formattedText = `\n- ${selectedText}`
        cursorPosition = start + 3
        break
      case "link":
        formattedText = `[${selectedText}](url)`
        cursorPosition = end + 3
        break
      default:
        return
    }

    const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end)

    setValue("description", newValue)

    // Set cursor position after the operation is complete
    setTimeout(() => {
      textarea.focus()
      if (selectedText) {
        textarea.setSelectionRange(start, start + formattedText.length)
      } else {
        textarea.setSelectionRange(cursorPosition, cursorPosition)
      }
    }, 0)
  }

  // Category management
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
    setValue(
      "categories",
      selectedCategories.includes(categoryId)
        ? selectedCategories.filter((id) => id !== categoryId)
        : [...selectedCategories, categoryId],
    )
  }

  // Tool management
  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) => {
      if (prev.includes(toolId)) {
        return prev.filter((id) => id !== toolId)
      } else {
        return [...prev, toolId]
      }
    })
    setValue(
      "tools",
      selectedTools.includes(toolId) ? selectedTools.filter((id) => id !== toolId) : [...selectedTools, toolId],
    )
  }

  // Syllabus management
  const addSyllabusItem = () => {
    if (!newSyllabusTitle.trim()) return

    const newItem: SyllabusItem = {
      id: Math.random().toString(36).substring(2, 9), // Generate a temporary ID
      title: newSyllabusTitle,
      sort: syllabusItems.length + 1,
    }

    setSyllabusItems((prev) => [...prev, newItem])
    setValue("syllabus", [...syllabusItems, newItem])
    setNewSyllabusTitle("")
  }

  const removeSyllabusItem = (id: string) => {
    const updatedItems = syllabusItems
      .filter((item) => item.id !== id)
      .map((item, index) => ({
        ...item,
        sort: index + 1,
      }))
    setSyllabusItems(updatedItems)
    setValue("syllabus", updatedItems)
  }

  const handleFormSubmit = async (data: ListClassFormData) => {
    // Ensure categories, tools, and syllabus are included in the submission
    const formData = {
      ...data,
      categories: selectedCategories,
      tools: selectedTools,
      syllabus: syllabusItems,
    }

    try {
      const result = await onSubmit(formData)

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: initialData ? "List class updated" : "List class created",
          text: initialData
            ? "List class has been updated successfully."
            : "New list class has been created successfully.",
        })
        router.push("/admin/dashboard/kelas/list")
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            typeof result.error === "string"
              ? result.error
              : "Failed to save list class. Please check the form and try again.",
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
          <Label htmlFor="mentor_id">Mentor</Label>
          <select
            id="mentor_id"
            {...register("mentor_id")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select a mentor</option>
            {mentors.map((mentor) => (
              <option key={mentor.id} value={mentor.id}>
                {mentor.name} - {mentor.specialization}
              </option>
            ))}
          </select>
          {errors.mentor_id && <p className="mt-1 text-sm text-red-500">{errors.mentor_id.message}</p>}
        </div>

        <div>
          <Label htmlFor="title">Class Title</Label>
          <Input id="title" {...register("title")} className="mt-1" placeholder="Enter class title" />
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
            The slug is used in the URL: https://example.com/courses/
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
                  alt="Class thumbnail preview"
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
          <Label htmlFor="trailer">YouTube Trailer URL</Label>
          <Input
            id="trailer"
            {...register("trailer")}
            className="mt-1"
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {errors.trailer && <p className="mt-1 text-sm text-red-500">{errors.trailer.message}</p>}

          {trailer && (
            <div className="mt-4">
              <Label>Preview Video</Label>
              <div className="mt-1 rounded-lg overflow-hidden border">
                <YouTubePreview url={trailer} />
              </div>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="level">Level</Label>
          <select
            id="level"
            {...register("level")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Pilih level</option>
            <option value="Beginner">Pemula</option>
            <option value="Intermediate">Menengah</option>
            <option value="Expert">Lanjutan</option>
          </select>
          {errors.level && <p className="mt-1 text-sm text-red-500">{errors.level.message}</p>}
        </div>

        <div>
          <Label>Kategori Kelas</Label>
          <div className="mt-2">
            <MultiSelect
              options={categories.map((category) => ({ value: category.id, label: category.name }))}
              selected={selectedCategories}
              onChange={(values) => {
                setSelectedCategories(values)
                setValue("categories", values)
              }}
              placeholder="Pilih kategori..."
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Klik untuk memilih beberapa kategori</p>
          <input type="hidden" {...register("categories")} value={selectedCategories.join(",")} />
        </div>

        <div>
          <Label>Tools</Label>
          <div className="mt-2">
            <MultiSelect
              options={tools.map((tool) => ({ value: tool.id, label: tool.name }))}
              selected={selectedTools}
              onChange={(values) => {
                setSelectedTools(values)
                setValue("tools", values)
              }}
              placeholder="Pilih tools..."
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Klik untuk memilih beberapa tools</p>
          <input type="hidden" {...register("tools")} value={selectedTools.join(",")} />
        </div>

        <div>
          <Label htmlFor="meetings">Jumlah Pertemuan</Label>
          <Input
            id="meetings"
            type="number"
            min="1"
            {...register("meetings")}
            className="mt-1"
            placeholder="Enter number of meetings"
          />
          {errors.meetings && <p className="mt-1 text-sm text-red-500">{errors.meetings.message}</p>}
        </div>

        <div>
          <Label>Silabus</Label>
          <div className="mt-2 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Judul materi"
                value={newSyllabusTitle}
                onChange={(e) => setNewSyllabusTitle(e.target.value)}
              />
              <Button
                type="button"
                size="icon"
                onClick={addSyllabusItem}
                className="bg-blue-500 hover:bg-blue-600"
                disabled={!newSyllabusTitle.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {syllabusItems.length > 0 && (
              <div className="space-y-2 border rounded-md p-4">
                {syllabusItems.map((item, index) => (
                  <div key={item.id} className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Materi</div>
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const updatedItems = syllabusItems.map((i) =>
                              i.id === item.id ? { ...i, title: e.target.value } : i,
                            )
                            setSyllabusItems(updatedItems)
                            setValue("syllabus", updatedItems)
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium">Urutan</div>
                        <Input
                          type="number"
                          min="1"
                          value={item.sort}
                          onChange={(e) => {
                            const updatedItems = syllabusItems.map((i) =>
                              i.id === item.id ? { ...i, sort: Number.parseInt(e.target.value) || 1 } : i,
                            )
                            setSyllabusItems(updatedItems)
                            setValue("syllabus", updatedItems)
                          }}
                          className="mt-1 w-20"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSyllabusItem(item.id)}
                        className="ml-4 self-end"
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <div className="mt-1">
            <RichTextEditor
              id="description"
              value={description}
              onChange={(value) => setValue("description", value)}
              minHeight="200px"
              placeholder="Masukkan deskripsi kelas (Gunakan Markdown: **tebal**, *miring*, - daftar item, [tautan](url))"
              error={errors.description?.message}
            />
          </div>
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_popular"
              checked={watch("is_popular")}
              onCheckedChange={(checked) => setValue("is_popular", checked as boolean)}
            />
            <Label htmlFor="is_popular">Kelas Populer</Label>
            <input type="hidden" {...register("is_popular")} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_request"
              checked={watch("is_request") || false}
              onCheckedChange={(checked) => setValue("is_request", checked as boolean | null)}
            />
            <Label htmlFor="is_request">Kelas Request</Label>
            <input type="hidden" {...register("is_request")} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={watch("is_active")}
              onCheckedChange={(checked) => setValue("is_active", checked as boolean)}
            />
            <Label htmlFor="is_active">Kelas Aktif</Label>
            <input type="hidden" {...register("is_active")} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/dashboard/kelas/list")}>
          Kembali
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || isUploading}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? "Memperbarui..." : "Membuat..."}
            </>
          ) : initialData ? (
            "Perbarui Kelas"
          ) : (
            "Buat Kelas"
          )}
        </Button>
      </div>
    </form>
  )
}

