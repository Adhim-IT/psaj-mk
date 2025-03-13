"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CategoryArticleSchema, type ArticleCategoryFormData } from "@/lib/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Swal from "sweetalert2"
import { Loader2, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface CategoryFormProps {
    initialData?: {
        id?: string
        name: string
        slug: string
    }
    onSubmit: (data: ArticleCategoryFormData) => Promise<{ success?: boolean; error?: any }>
    isSubmitting: boolean
}
export function ArticleCategoryForm({ initialData, onSubmit, isSubmitting }: CategoryFormProps) {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<ArticleCategoryFormData>({
        resolver: zodResolver(CategoryArticleSchema),
        defaultValues: {
            name: initialData?.name || "",
            slug: initialData?.slug || "",
        },
    })

    const nameValue = watch("name")

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "") // Remove characters except letters, numbers, and spaces
            .replace(/\s+/g, "-") // Replace spaces with "-"
            .replace(/-+/g, "-") // Avoid repeated "-"
    }

    // Update slug automatically when "name" changes
    useEffect(() => {
        if (!initialData) {
            setValue("slug", generateSlug(nameValue), { shouldValidate: true })
        }
    }, [nameValue, setValue, initialData])

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                slug: initialData.slug,
            })
        }
    }, [initialData, reset])

    const handleFormSubmit = async (data: ArticleCategoryFormData) => {
        try {
            const result = await onSubmit(data)

            if (result.success) {
                Swal.fire({
                    icon: "success",
                    title: initialData ? "Kategori diperbarui" : "Kategori dibuat",
                    text: initialData ? "Kategori telah berhasil diperbarui." : "Kategori baru telah berhasil dibuat.",
                })
                router.push("/admin/dashboard/artikel/kategori")
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        typeof result.error === "string"
                            ? result.error
                            : "Gagal menyimpan kategori. Silakan periksa formulir dan coba lagi.",
                })
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
            })
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{initialData ? "Edit Kategori" : "Buat Kategori Baru"}</CardTitle>
                <CardDescription>
                    {initialData
                        ? "Perbarui informasi kategori artikel yang sudah ada"
                        : "Tambahkan kategori artikel baru ke dalam sistem"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form id="category-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Kategori</Label>
                            <Input
                                id="name"
                                {...register("name")}
                                placeholder="Masukkan nama kategori"
                                className={errors.name ? "border-red-500" : ""}
                            />
                            {errors.name && <p className="text-sm font-medium text-red-500">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                {...register("slug")}
                                className={`bg-muted ${errors.slug ? "border-red-500" : ""}`}
                                readOnly
                            />
                            {errors.slug && <p className="text-sm font-medium text-red-500">{errors.slug.message}</p>}
                            <p className="text-xs text-muted-foreground">Slug akan digunakan sebagai URL untuk kategori ini</p>
                        </div>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/dashboard/artikel/kategori")}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </Button>
                <Button type="submit" form="category-form" disabled={isSubmitting} className="min-w-[120px]">
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
            </CardFooter>
        </Card>
    )

}