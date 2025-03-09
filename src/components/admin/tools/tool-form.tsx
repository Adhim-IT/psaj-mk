"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toolSchema, type ToolFormData } from "@/lib/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Swal from "sweetalert2"
import { Loader2, Upload, Bold, Italic, List, LinkIcon } from "lucide-react"
import Image from "next/image"
import { Textarea } from "@/components/ui/textarea"

interface ToolFormProps {
  initialData?: {
    id?: string
    name: string
    description: string
    url: string
    logo: string
  }
  onSubmit: (data: ToolFormData) => Promise<{ success?: boolean; error?: any }>
  isSubmitting: boolean
}

export function ToolForm({ initialData, onSubmit, isSubmitting }: ToolFormProps) {
  const router = useRouter()
  const [logoPreview, setLogoPreview] = useState<string>(initialData?.logo || "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm<ToolFormData>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      url: initialData?.url || "",
      logo: initialData?.logo || "",
    },
  })

  // Watch the description field to sync with textarea
  const description = watch("description")

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || "",
        url: initialData.url,
        logo: initialData.logo,
      })
      setLogoPreview(initialData.logo)
    }
  }, [initialData, reset])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setLogoPreview(base64String)
        setValue("logo", base64String)
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

  const handleFormSubmit = async (data: ToolFormData) => {
    try {
      const result = await onSubmit(data)

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: initialData ? "Tool updated" : "Tool created",
          text: initialData ? "Tool has been updated successfully." : "New tool has been created successfully.",
        })
        router.push("/admin/dashboard/kelas/tool")
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            typeof result.error === "string"
              ? result.error
              : "Failed to save tool. Please check the form and try again.",
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
          <Label htmlFor="logo">Logo</Label>
          <div className="mt-2 flex flex-col items-start gap-4">
            {logoPreview && (
              <div className="relative h-24 w-24 overflow-hidden rounded-md border border-gray-200">
                <Image
                  src={logoPreview || "/placeholder.svg"}
                  alt="Tool logo preview"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <input
                type="file"
                id="logo"
                ref={fileInputRef}
                onChange={handleLogoChange}
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
              <input type="hidden" {...register("logo")} />
              {errors.logo && <p className="mt-1 text-sm text-red-500">{errors.logo.message}</p>}
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="name">Nama Tool</Label>
          <Input id="name" {...register("name")} className="mt-1" placeholder="Masukkan nama tool" />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">Deskripsi</Label>
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
              className="min-h-[200px]"
              placeholder="Masukkan deskripsi tool (Gunakan Markdown: **bold**, *italic*, - list item, [link](url))"
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

        <div>
          <Label htmlFor="url">URL</Label>
          <Input id="url" {...register("url")} className="mt-1" placeholder="https://example.com" />
          {errors.url && <p className="mt-1 text-sm text-red-500">{errors.url.message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/dashboard/kelas/tool")}>
          Kembali
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? "Updating..." : "Creating..."}
            </>
          ) : initialData ? (
            "Update Tool"
          ) : (
            "Create Tool"
          )}
        </Button>
      </div>
    </form>
  )
}

