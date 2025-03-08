"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CategoryCourseSchema, type CourseCategoryFormData } from "@/lib/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface CategoryFormProps {
  initialData?: {
    id?: string
    name: string
    slug: string
  }
  onSubmit: (data: CourseCategoryFormData) => Promise<{ success?: boolean; error?: any }>
  isSubmitting: boolean
}

export function CourseCategoryForm({ initialData, onSubmit, isSubmitting }: CategoryFormProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CourseCategoryFormData>({
    resolver: zodResolver(CategoryCourseSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug,
      })
    }
  }, [initialData, reset])

  const handleFormSubmit = async (data: CourseCategoryFormData) => {
    try {
      const result = await onSubmit(data)

      if (result.success) {
        toast({
          title: initialData ? "Kategori diperbarui" : "Kategori dibuat",
          description: initialData ? "Kategori telah berhasil diperbarui." : "Kategori baru telah berhasil dibuat.",
        })
        router.push("/admin/dashboard/kelas/kategori")
      } else {
        toast({
          title: "Error",
          description:
            typeof result.error === "string"
              ? result.error
              : "Gagal menyimpan kategori. Silakan periksa formulir dan coba lagi.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nama Kategori</Label>
          <Input id="name" {...register("name")} className="mt-1" placeholder="Masukkan nama kategori" />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register("slug")} className="mt-1" placeholder="Masukkan slug kategori" />
          {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/dashboard/kelas/kategori")}>Kembali</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? "Memperbarui..." : "Membuat..."}
            </>
          ) : initialData ? (
            "Perbarui Kategori"
          ) : (
            "Buat Kategori"
          )}
        </Button>
      </div>
    </form>
  )
}
