"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import type { CourseTransaction, CourseTransactionStatus } from "@/types"
import { courseTransactionDeleteSchema, type courseTransactionFilterSchema } from "@/lib/zod"
import type { z } from "zod"

export async function getCourseTransactions(filters: z.infer<typeof courseTransactionFilterSchema>) {
  try {
    const { status, course_id, student_id, search, page, limit } = filters

    const skip = (page - 1) * limit

    const where: any = {
      deleted_at: null,
    }

    if (status) {
      where.status = status
    }

    if (course_id) {
      where.course_id = course_id
    }

    if (student_id) {
      where.student_id = student_id
    }

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { courses: { title: { contains: search } } },
        { students: { name: { contains: search } } },
      ]
    }

    const transactions = await prisma.course_transactions.findMany({
      where,
      include: {
        courses: {
          select: {
            id: true,
            title: true,
          },
        },
        students: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
    })

    const total = await prisma.course_transactions.count({ where })

    return {
      data: transactions as CourseTransaction[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error getting course transactions:", error)
    throw new Error("Failed to fetch course transactions")
  }
}

export async function getCourseTransactionById(id: string) {
  try {
    const transaction = await prisma.course_transactions.findUnique({
      where: { id, deleted_at: null },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
          },
        },
        students: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!transaction) {
      throw new Error("Course transaction not found")
    }

    return transaction as CourseTransaction
  } catch (error) {
    console.error("Error getting course transaction:", error)
    throw new Error("Failed to fetch course transaction")
  }
}

export async function deleteCourseTransaction(data: z.infer<typeof courseTransactionDeleteSchema>) {
  try {
    const { id } = courseTransactionDeleteSchema.parse(data)

    const transaction = await prisma.course_transactions.findUnique({
      where: { id, deleted_at: null },
    })

    if (!transaction) {
      throw new Error("Course transaction not found")
    }

    // Soft delete by updating deleted_at field
    await prisma.course_transactions.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    })

    revalidatePath("/admin/transaksi/kelas")
    return { success: true }
  } catch (error) {
    console.error("Error deleting course transaction:", error)
    return { success: false, error: "Failed to delete course transaction" }
  }
}

export async function getMidtransStatus(orderId: string) {
  try {
    const midtransServerKey = process.env.MIDTRANS_SERVER_KEY

    if (!midtransServerKey) {
      throw new Error("Midtrans server key is not configured")
    }

    const auth = Buffer.from(`${midtransServerKey}:`).toString("base64")

    const response = await fetch(`${process.env.MIDTRANS_API_URL}/v2/${orderId}/status`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get transaction status from Midtrans")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error getting Midtrans status:", error)
    throw new Error("Failed to get transaction status")
  }
}

export async function updateTransactionStatus(id: string, status: CourseTransactionStatus) {
  try {
    await prisma.course_transactions.update({
      where: { id },
      data: {
        status,
        updated_at: new Date(),
      },
    })

    revalidatePath("/admin/transaksi/kelas")
    return { success: true }
  } catch (error) {
    console.error("Error updating transaction status:", error)
    throw new Error("Failed to update transaction status")
  }
}

