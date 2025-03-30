"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "./auth"
import type { course_transactions_status, course_transactions_type } from "@prisma/client"

interface TransactionData {
  courseId: string
  courseTypeId: string
  type: course_transactions_type
  batchNumber?: number | null
  originalPrice: number
  discount: number
  voucherDiscount: number
  finalPrice: number
}

export async function createTransaction(data: TransactionData) {
  const user = await getCurrentUser()

  if (!user || !user.studentId) {
    redirect("/login?redirect=/checkout")
  }

  try {
    // Create transaction in database
    const transactionCode = `TRX-${Date.now()}`
    const transaction = await prisma.course_transactions.create({
      data: {
        id: uuidv4(),
        code: transactionCode,
        course_id: data.courseId,
        student_id: user.studentId,
        type: data.type,
        batch_number: data.batchNumber,
        status: "unpaid",
        original_price: data.originalPrice,
        discount: data.discount + data.voucherDiscount,
        final_price: data.finalPrice,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    // Get Midtrans token (this would be an API call to your backend that communicates with Midtrans)
    const midtransResponse = await fetch("/api/midtrans/create-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transactionId: transaction.id,
        transactionCode: transaction.code,
        amount: data.finalPrice,
        customerName: user.name,
        customerEmail: user.email,
      }),
    })

    if (!midtransResponse.ok) {
      throw new Error("Failed to create Midtrans token")
    }

    const { token } = await midtransResponse.json()

    return {
      transactionId: transaction.id,
      token,
    }
  } catch (error) {
    console.error("Transaction creation error:", error)
    throw new Error("Failed to create transaction")
  }
}

export async function updateTransactionStatus(transactionId: string, status: course_transactions_status) {
  try {
    await prisma.course_transactions.update({
      where: { id: transactionId },
      data: {
        status,
        updated_at: new Date(),
      },
    })

    revalidatePath("/dashboard/courses")
    return { success: true }
  } catch (error) {
    console.error("Transaction update error:", error)
    return { success: false, error: "Failed to update transaction status" }
  }
}

export async function getTransactions(studentId?: string) {
  try {
    const where = studentId ? { student_id: studentId } : {}

    const transactions = await prisma.course_transactions.findMany({
      where,
      include: {
        courses: {
          select: {
            title: true,
            thumbnail: true,
            level: true,
            meetings: true,
          },
        },
        students: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return { transactions: JSON.parse(JSON.stringify(transactions)) }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return { error: "Failed to fetch transactions" }
  }
}

