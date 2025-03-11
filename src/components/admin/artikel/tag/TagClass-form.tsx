"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Swal from "sweetalert2"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createTag, updateTag } from "@/lib/tag"
import { Tag } from "@/lib/tag"

// Use the existing Zod schema
const TagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
})

type FormValues = z.infer<typeof TagSchema>

interface TagFormProps {
  tag?: Tag | null
  isEditing?: boolean
}

export default function TagForm({ tag, isEditing = false }: TagFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form with default values or existing tag data
  const form = useForm<FormValues>({
    resolver: zodResolver(TagSchema),
    defaultValues: {
      name: tag?.name || "",
      slug: tag?.slug || "",
    },
  })

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    
    try {
      if (isEditing && tag) {
        // Update existing tag
        const result = await updateTag(tag.id, data)
        
        if (result.error) {
          throw new Error(result.error)
        }
        
        Swal.fire({
          icon: "success",
          title: "Tag Berhasil Diperbarui",
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        // Create new tag
        const result = await createTag(data)
        
        if (result.error) {
          throw new Error(result.error)
        }
        
        Swal.fire({
          icon: "success",
          title: "Tag Berhasil Dibuat",
          showConfirmButton: false,
          timer: 1500,
        })
      }
      
      // Redirect back to tag list
      router.push("/admin/dashboard/artikel/tag")
      router.refresh()
    } catch (error) {
      console.error("Error submitting form:", error)
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: error instanceof Error ? error.message : "Gagal menyimpan tag",
        confirmButtonText: "OK",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    
    form.setValue("slug", slug)
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Tag</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Masukkan nama tag" 
                      onChange={(e) => {
                        field.onChange(e)
                        handleNameChange(e)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Nama tag yang akan ditampilkan pada artikel.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="slug-tag" 
                    />
                  </FormControl>
                  <FormDescription>
                    Slug digunakan untuk URL. Dibuat otomatis dari nama tag.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : isEditing ? "Perbarui" : "Simpan"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
