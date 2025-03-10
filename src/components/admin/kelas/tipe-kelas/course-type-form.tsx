"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { courseTypeSchema, type CourseTypeFormData } from "@/lib/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Swal from "sweetalert2"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Course {
  id: string
  title: string
}

interface CourseTypeFormProps {
  initialData?: {
    id?: string
    course_id: string
    type: string
    batch_number?: number | null
    slug: string
    normal_price: number
    discount_type?: string | null
    discount?: number | null
    start_date?: Date | null
    end_date?: Date | null
    is_active: boolean
    is_discount: boolean
    is_voucher: boolean
  }
  courses: Course[]
  onSubmit: (data: CourseTypeFormData) => Promise<{ success?: boolean; error?: string | unknown }>
  isSubmitting: boolean
}

export function CourseTypeForm({ initialData, courses, onSubmit, isSubmitting }: CourseTypeFormProps) {
  const router = useRouter()
  const [showDiscountFields, setShowDiscountFields] = useState(initialData?.is_discount || false)

  // Get today's date for min attribute
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = format(today, "yyyy-MM-dd")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CourseTypeFormData>({
    resolver: zodResolver(courseTypeSchema),
    defaultValues: {
      course_id: initialData?.course_id || "",
      type: (initialData?.type as "group" | "private" | "batch") || "group",
      batch_number: initialData?.batch_number || null,
      slug: initialData?.slug || "",
      normal_price: initialData?.normal_price || 0,
      discount_type: (initialData?.discount_type as "percentage" | "fixed" | null) || null,
      discount: initialData?.discount || null,
      start_date: initialData?.start_date || null,
      end_date: initialData?.end_date || null,
      is_active: initialData?.is_active ?? true,
      is_discount: initialData?.is_discount || false,
      is_voucher: initialData?.is_voucher || false,
    },
  })

  // Watch values for calculations
  const normalPrice = watch("normal_price")
  const discountType = watch("discount_type")
  const discount = watch("discount")
  const isDiscount = watch("is_discount")
  const startDate = watch("start_date")

  // Calculate final price
  const calculateFinalPrice = () => {
    if (!isDiscount || !discount) return normalPrice

    if (discountType === "percentage") {
      return normalPrice - normalPrice * (discount / 100)
    } else if (discountType === "fixed") {
      return Math.max(0, normalPrice - discount)
    }

    return normalPrice
  }

  const finalPrice = calculateFinalPrice()

  useEffect(() => {
    if (initialData) {
      reset({
        course_id: initialData.course_id,
        type: initialData.type as "group" | "private" | "batch",
        batch_number: initialData.batch_number,
        slug: initialData.slug,
        normal_price: initialData.normal_price,
        discount_type: (initialData.discount_type as "percentage" | "fixed" | null) || null,
        discount: initialData.discount,
        start_date: initialData.start_date,
        end_date: initialData.end_date,
        is_active: initialData.is_active,
        is_discount: initialData.is_discount,
        is_voucher: initialData.is_voucher,
      })
      setShowDiscountFields(initialData.is_discount)
    }
  }, [initialData, reset])

  const handleFormSubmit = async (data: CourseTypeFormData) => {
    try {
      const result = await onSubmit(data)

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: initialData ? "Tipe kelas diperbarui" : "Tipe kelas dibuat",
          text: initialData ? "Tipe kelas telah berhasil diperbarui." : "Tipe kelas baru telah berhasil dibuat.",
        })
        router.push("/admin/dashboard/kelas/tipe")
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            typeof result.error === "string"
              ? result.error || "Gagal menyimpan tipe kelas"
              : "Gagal menyimpan tipe kelas",
        })
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Terjadi kesalahan yang tidak terduga",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="course_id">Kelas</Label>
          <Select value={watch("course_id")} onValueChange={(value) => setValue("course_id", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih kelas" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.course_id && <p className="mt-1 text-sm text-red-500">{errors.course_id.message}</p>}
        </div>

        <div>
          <Label htmlFor="type">Tipe Kelas</Label>
          <Select
            value={watch("type")}
            onValueChange={(value: "group" | "private" | "batch") => setValue("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tipe kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="group">Group</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="batch">Batch</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>}
        </div>

        {watch("type") === "batch" && (
          <div>
            <Label htmlFor="batch_number">Nomor Batch</Label>
            <Input
              type="number"
              {...register("batch_number", { valueAsNumber: true })}
              className="mt-1"
              placeholder="Masukkan nomor batch"
            />
            {errors.batch_number && <p className="mt-1 text-sm text-red-500">{errors.batch_number.message}</p>}
          </div>
        )}

        <div>
          <Label htmlFor="normal_price">Harga Normal</Label>
          <Input
            type="number"
            step="0.01"
            {...register("normal_price", { valueAsNumber: true })}
            className="mt-1"
            placeholder="Masukkan harga normal"
          />
          {errors.normal_price && <p className="mt-1 text-sm text-red-500">{errors.normal_price.message}</p>}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_discount"
              checked={showDiscountFields}
              onCheckedChange={(checked) => {
                setShowDiscountFields(checked as boolean)
                setValue("is_discount", checked as boolean)
                if (!checked) {
                  setValue("discount_type", null)
                  setValue("discount", null)
                }
              }}
            />
            <Label htmlFor="is_discount">Ada Diskon?</Label>
          </div>

          {showDiscountFields && (
            <>
              <div>
                <Label htmlFor="discount_type">Tipe Diskon</Label>
                <Select
                  value={watch("discount_type") || ""}
                  onValueChange={(value: "percentage" | "fixed") => setValue("discount_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe diskon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Persentase (%)</SelectItem>
                    <SelectItem value="fixed">Harga Tetap (Rp)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.discount_type && <p className="mt-1 text-sm text-red-500">{errors.discount_type.message}</p>}
              </div>

              <div>
                <Label htmlFor="discount">{discountType === "percentage" ? "Diskon (%)" : "Diskon (Rp)"}</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("discount", { valueAsNumber: true })}
                  className="mt-1"
                  placeholder={`Masukkan nilai diskon ${discountType === "percentage" ? "dalam %" : "dalam Rupiah"}`}
                />
                {errors.discount && <p className="mt-1 text-sm text-red-500">{errors.discount.message}</p>}
              </div>

              <div>
                <Label>Harga Setelah Diskon</Label>
                <div className="mt-1 p-2 bg-gray-50 border rounded-md">Rp {finalPrice.toLocaleString("id-ID")}</div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_voucher"
            checked={watch("is_voucher")}
            onCheckedChange={(checked) => setValue("is_voucher", checked as boolean)}
          />
          <Label htmlFor="is_voucher">Boleh Pakai Kode Promo?</Label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="start_date">Tanggal Mulai</Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="start_date"
                type="date"
                min={todayStr}
                className={cn("pl-10", errors.start_date && "border-red-500 focus-visible:ring-red-500")}
                value={startDate ? format(startDate as Date, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null
                  setValue("start_date", date)

                  // If end_date is before new start_date, update end_date
                  const endDate = watch("end_date")
                  if (date && endDate && date > endDate) {
                    setValue("end_date", date)
                  }
                }}
              />
            </div>
            {errors.start_date && <p className="mt-1 text-sm text-red-500">{errors.start_date.message}</p>}
            <p className="mt-1 text-xs text-gray-500">Tidak bisa memilih tanggal yang sudah lewat</p>
          </div>

          <div>
            <Label htmlFor="end_date">Tanggal Akhir</Label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="end_date"
                type="date"
                min={startDate ? format(startDate as Date, "yyyy-MM-dd") : todayStr}
                className={cn("pl-10", errors.end_date && "border-red-500 focus-visible:ring-red-500")}
                value={watch("end_date") ? format(watch("end_date") as Date, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null
                  setValue("end_date", date)
                }}
              />
            </div>
            {errors.end_date && <p className="mt-1 text-sm text-red-500">{errors.end_date.message}</p>}
            <p className="mt-1 text-xs text-gray-500">Harus setelah tanggal mulai</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={watch("is_active")}
            onCheckedChange={(checked) => setValue("is_active", checked as boolean)}
          />
          <Label htmlFor="is_active">Aktif</Label>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/dashboard/kelas/tipe")}>
          Kembali
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData ? "Memperbarui..." : "Membuat..."}
            </>
          ) : initialData ? (
            "Perbarui Tipe Kelas"
          ) : (
            "Buat Tipe Kelas"
          )}
        </Button>
      </div>
    </form>
  )
}

