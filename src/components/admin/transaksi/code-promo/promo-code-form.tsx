"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { PromoCodeFormData } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createPromoCode, updatePromoCode } from "@/lib/promo-code"
import Swal from "sweetalert2"

// Create a form-specific schema for client-side validation
const formSchema = z.object({
  code: z.string().min(1, "Code is required"),
  discount_type: z.enum(["percentage", "fixed"]),
  discount: z.number().min(0, "Discount must be a positive number"),
  valid_until: z.string().min(1, "Valid until is required"),
  is_used: z.boolean().default(false),
})

interface PromoCodeFormProps {
  initialData?: PromoCodeFormData & { id?: number }
  isEditing: boolean
}

export function PromoCodeForm({ initialData, isEditing }: PromoCodeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PromoCodeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      code: "",
      discount_type: "percentage",
      discount: 0,
      valid_until: "",
      is_used: false,
    },
  })

  const onSubmit = async (data: PromoCodeFormData) => {
    setIsSubmitting(true)
    try {
      const result = isEditing ? await updatePromoCode(initialData!.id!, data) : await createPromoCode(data)

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: isEditing ? "Promo code updated" : "Promo code created",
          text: isEditing ? "The promo code has been successfully updated." : "A new promo code has been created.",
        }).then(() => {
          router.push("/admin/dashboard/transaksi/code")
          router.refresh()
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="code">Promo Code</Label>
          <Input id="code" {...register("code")} className="mt-1" placeholder="Enter promo code" />
          {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>}
        </div>

        <div>
          <Label htmlFor="discount_type">Discount Type</Label>
          <Select
            onValueChange={(value) => setValue("discount_type", value as "percentage" | "fixed")}
            defaultValue={watch("discount_type")}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select discount type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Presentase</SelectItem>
              <SelectItem value="fixed">Nominal</SelectItem>
            </SelectContent>
          </Select>
          {errors.discount_type && <p className="mt-1 text-sm text-red-500">{errors.discount_type.message}</p>}
        </div>

        <div>
          <Label htmlFor="discount">Discount</Label>
          <Input
            id="discount"
            type="number"
            {...register("discount", { valueAsNumber: true })}
            className="mt-1"
            placeholder="Enter discount value"
          />
          {errors.discount && <p className="mt-1 text-sm text-red-500">{errors.discount.message}</p>}
        </div>

        <div>
          <Label htmlFor="valid_until">Valid Until</Label>
          <Input id="valid_until" type="datetime-local" {...register("valid_until")} className="mt-1" />
          {errors.valid_until && <p className="mt-1 text-sm text-red-500">{errors.valid_until.message}</p>}
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="is_used" checked={watch("is_used")} onCheckedChange={(checked) => setValue("is_used", checked)} />
          <Label htmlFor="is_used">Is Used</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/dashboard/transaksi/promo-code")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Promo Code" : "Create Promo Code"}
        </Button>
      </div>
    </form>
  )
}

