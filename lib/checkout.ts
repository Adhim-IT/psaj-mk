"use server"
import { v4 as uuidv4 } from "uuid"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { createMidtransTransaction } from "@/lib/midtrans"
import type { CourseTypeTransaction } from "@/types"
import type { course_transactions_type } from "@prisma/client"

interface CheckoutData {
  courseType: CourseTypeTransaction
  promoCode?: string
  promoDiscountType?: "percentage" | "fixed" | null
  promoDiscount?: number
}

export async function initiateCheckout(data: CheckoutData) {
  console.log("Input Checkout Data:", data);
  const user = await getCurrentUser()

  if (!user || !user.studentId) {
    return { error: "Anda harus login terlebih dahulu", redirectUrl: "/login?redirect=/checkout" }
  }

  try {
    const { courseType, promoCode } = data

    // Calculate prices
    let discount = 0
    let voucherDiscount = 0

    // Apply course discount if available
    if (courseType.is_discount && courseType.discount && courseType.discount_type) {
      if (courseType.discount_type === "percentage") {
        discount = (courseType.normal_price * courseType.discount) / 100
      } else {
        discount = courseType.discount
      }
    }

    // Apply promo code if provided
    if (promoCode) {
      const promoCodeData = await prisma.promo_codes.findFirst({
        where: {
          code: promoCode,
          is_used: false,
          valid_until: {
            gte: new Date(),
          },
          deleted_at: null,
        },
      })

      if (promoCodeData) {
        if (promoCodeData.discount_type === "percentage") {
          voucherDiscount = (courseType.normal_price * promoCodeData.discount) / 100
        } else {
          voucherDiscount = promoCodeData.discount
        }
      }
    }

    // Calculate final price
    const finalPrice = Math.max(courseType.normal_price - discount - voucherDiscount, 0)

    // Create transaction code
    const transactionCode = `TRX-${Date.now()}`

    // Create transaction in database
    const transaction = await prisma.course_transactions.create({
      data: {
        id: uuidv4(),
        code: transactionCode,
        course_id: courseType.course_id,
        student_id: user.studentId,
        type: courseType.type as course_transactions_type,
        batch_number: courseType.batch_number || null,
        status: "unpaid",
        original_price: courseType.normal_price,
        discount: discount + voucherDiscount,
        final_price: finalPrice,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    // Create Midtrans transaction
    const midtransResponse = await createMidtransTransaction({
      orderId: transaction.code,
      amount: Number(finalPrice),
      customerName: user.name || "Student",
      customerEmail: user.email,
      description: `Pembayaran kelas ${courseType.course_title || "Course"}`,
    })

    // Mark promo code as used if applicable
    if (promoCode && voucherDiscount > 0) {
      await prisma.promo_codes.updateMany({
        where: { code: promoCode },
        data: { is_used: true, updated_at: new Date() },
      })
    }

    return {
      success: true,
      transactionId: transaction.id,
      paymentUrl: midtransResponse.va_numbers ? null : midtransResponse.redirect_url,
      bankTransfer: midtransResponse.va_numbers
        ? {
            bank: midtransResponse.va_numbers[0].bank,
            vaNumber: midtransResponse.va_numbers[0].va_number,
          }
        : null,
    }
  } catch (error) {
    console.error("Checkout error:", error)
    return { error: "Gagal memproses pembayaran" }
  }
}

