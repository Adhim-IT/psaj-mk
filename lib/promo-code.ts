"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { promoCodeSchema } from "@/lib/zod"
import type { PromoCodeFormData } from "@/types"

export async function getPromoCodes() {
  try {
    const promoCodes = await prisma.promo_codes.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: "desc" },
    })
    return { success: true, data: promoCodes }
  } catch (error) {
    console.error("Failed to fetch promo codes:", error)
    return { success: false, error: "Failed to fetch promo codes" }
  }
}

export async function getPromoCodeById(id: number) {
  try {
    const promoCode = await prisma.promo_codes.findUnique({
      where: { id },
    })
    if (!promoCode) {
      return { success: false, error: "Promo code not found" }
    }
    return { success: true, data: promoCode }
  } catch (error) {
    console.error("Failed to fetch promo code:", error)
    return { success: false, error: "Failed to fetch promo code" }
  }
}

export async function createPromoCode(data: PromoCodeFormData) {
  try {
    const validatedData = promoCodeSchema.parse(data)
    const promoCode = await prisma.promo_codes.create({
      data: {
        code: validatedData.code,
        discount_type: validatedData.discount_type,
        discount: validatedData.discount,
        valid_until: new Date(validatedData.valid_until), // Convert string to Date
        is_used: validatedData.is_used,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })
    revalidatePath("/admin/dashboard/transaksi/promo-code")
    return { success: true, data: promoCode }
  } catch (error) {
    console.error("Failed to create promo code:", error)
    return { success: false, error: "Failed to create promo code" }
  }
}

export async function updatePromoCode(id: number, data: PromoCodeFormData) {
  try {
    const validatedData = promoCodeSchema.parse(data)
    const updatedPromoCode = await prisma.promo_codes.update({
      where: { id },
      data: {
        code: validatedData.code,
        discount_type: validatedData.discount_type,
        discount: validatedData.discount,
        valid_until: new Date(validatedData.valid_until), // Convert string to Date
        is_used: validatedData.is_used,
        updated_at: new Date(),
      },
    })
    revalidatePath("/admin/dashboard/transaksi/promo-code")
    return { success: true, data: updatedPromoCode }
  } catch (error) {
    console.error("Failed to update promo code:", error)
    return { success: false, error: "Failed to update promo code" }
  }
}

export async function deletePromoCode(id: number) {
  try {
    await prisma.promo_codes.update({
      where: { id },
      data: { deleted_at: new Date() },
    })
    revalidatePath("/admin/dashboard/transaksi/promo-code")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete promo code:", error)
    return { success: false, error: "Failed to delete promo code" }
  }
}

