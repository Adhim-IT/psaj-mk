"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { listClassSchema, type ListClassFormData } from "@/lib/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Upload, Bold, Italic, List, LinkIcon } from "lucide-react"
import Image from "next/image"
import { YouTubePreview } from "./youtube-preview"

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
    description: string
    thumbnail: string
    trailer: string
    level: string
    meetings: number
    is_popular: boolean
    is_request?: boolean
    is_active: boolean
  }
  mentors: Mentor[]
  onSubmit: (data: ListClassFormData) => Promise<{ success?: boolean; error?: any }>
  isSubmitting: boolean
}

export function ListClassForm({ initialData, mentors, onSubmit, isSubmitting }: ListClassFormProps) {
  const router = useRouter()
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(initialData?.thumbnail || "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

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
      description: initialData?.description || "",
      thumbnail: initialData?.thumbnail || "",
      trailer: initialData?.trailer || "",
      level: (initialData?.level as "Beginner" | "Intermediate" | "Advanced") || "Beginner",
      meetings: initialData?.meetings || 1,
      is_popular: initialData?.is_popular || false,
      is_request: initialData?.is_request || null,
      is_active: initialData?.is_active || true,
    },
  })

  // Watch fields for real-time updates
  const description = watch("description")
  const trailer = watch("trailer")
  const level = watch("level")

  useEffect(() => {
    if (initialData) {
      reset({
        mentor_id: initialData.mentor_id,
        title: initialData.title,
        description: initialData.description,
        thumbnail: initialData.thumbnail,
        trailer: initialData.trailer,
        level: initialData.level as "Beginner" | "Intermediate" | "Advanced",
        meetings: initialData.meetings,
        is_popular: initialData.is_popular,
        is_request: initialData.is_request || null,
        is_active: initialData.is_active,
      })
      setThumbnailPreview(initialData.thumbnail)
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

  const handleFormSubmit = async (data: ListClassFormData) => {
    try {
      const result = await onSubmit(data)

      if (result.success) {
        toast({
          title: initialData ? "List class updated" : "List class created",
          description: initialData
            ? "List class has been updated successfully."
            : "New list class has been created successfully.",
            
        
            
        })
        router.push("/admin/dashboard/kelas/list")
      } else {
        toast({
          title: "Error",
          description:
            typeof result.error === "string"
              ? result.error
              : "Failed to save list class. Please check the form and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
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
            <option value="Advanced">Lanjutan</option>
          </select>
          {errors.level && <p className="mt-1 text-sm text-red-500">{errors.level.message}</p>}
        </div>

        <div>
          <Label htmlFor="meetings">Number of Meetings</Label>
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
          <Label htmlFor="description">Description</Label>
          <div className="mt-1">
            <div className="bg-white rounded-md border border-input mb-2 p-1 flex gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("bold")} title="Bold">
                <Bold className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("italic")} title="Italic">
                <Italic className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("list")} title="List">
                <List className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => insertFormatting("link")} title="Link">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              id="description"
              {...register("description")}
              ref={textareaRef}
              className="min-h-[200px] font-mono"
              placeholder="Masukkan deskripsi kelas (Gunakan Markdown: **tebal**, *miring*, - daftar item, [tautan](url))"
              defaultValue={initialData?.description || ""}
            />
          </div>
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}

          {description && (
            <div className="mt-4">
              <Label>Preview</Label>
              <div className="mt-1 p-3 border rounded-md bg-gray-50">
                <div className="prose prose-sm max-w-none">
                  {description.split("\n").map((line, i) => {
                    // Basic markdown rendering
                    let content = line
                    // Bold
                    content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    // Italic
                    content = content.replace(/\*(.*?)\*/g, "<em>$1</em>")
                    // Links
                    content = content.replace(
                      /\[(.*?)\]$$(.*?)$$/g,
                      '<a href="$2" class="text-blue-600 hover:underline">$1</a>',
                    )
                    // List items
                    if (content.startsWith("- ")) {
                      return <li key={i} dangerouslySetInnerHTML={{ __html: content.substring(2) }} />
                    }
                    return <p key={i} dangerouslySetInnerHTML={{ __html: content }} />
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_popular"
              checked={watch("is_popular")}
              onCheckedChange={(checked) => setValue("is_popular", checked as boolean)}
            />
            <Label htmlFor="is_popular">Mark as Popular Class</Label>
            <input type="hidden" {...register("is_popular")} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_request"
              checked={watch("is_request") || false}
              onCheckedChange={(checked) => setValue("is_request", checked as boolean | null)}
            />
            <Label htmlFor="is_request">Mark as Request Class</Label>
            <input type="hidden" {...register("is_request")} />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={watch("is_active")}
              onCheckedChange={(checked) => setValue("is_active", checked as boolean)}
            />
            <Label htmlFor="is_active">Active Class</Label>
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