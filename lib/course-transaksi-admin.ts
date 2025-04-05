"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { courseTransactionFilterSchema } from "@/lib/zod"
import type { z } from "zod"
import type { CourseTransactionStatus } from '@/types';

type Filters = z.infer<typeof courseTransactionFilterSchema>

export async function getCourseTransactions(filters: Filters) {
  try {
    const { status, course_id, student_id, search, page, limit } = filters
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      deleted_at: null,
    }

    if (status && status !== "unpaid") {
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
        { code: { contains: search, mode: "insensitive" } },
        { courses: { title: { contains: search, mode: "insensitive" } } },
        { students: { name: { contains: search, mode: "insensitive" } } },
        { students: { email: { contains: search, mode: "insensitive" } } },
      ]
    }

    // Get total count
    const total = await prisma.course_transactions.count({ where })

    // Get transactions
    const transactions = await prisma.course_transactions.findMany({
      where,
      include: {
        courses: {
          select: {
            title: true,
            thumbnail: true,
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
      skip,
      take: limit,
    })

    // Convert Decimal objects to numbers
    const serializedTransactions = transactions.map((transaction: any) => ({
      ...transaction,
      original_price: Number(transaction.original_price),
      discount: Number(transaction.discount),
      final_price: Number(transaction.final_price),
    }))

    return {
      data: serializedTransactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error fetching course transactions:", error)
    throw new Error("Failed to fetch course transactions")
  }
}

export async function getCourseTransactionById(id: string) {
  try {
    const transaction = await prisma.course_transactions.findUnique({
      where: { id },
      include: {
        courses: {
          select: {
            title: true,
            thumbnail: true,
          },
        },
        students: {
          select: {
            name: true,
            
          },
        },
      },
    })

    if (!transaction) {
      throw new Error("Transaction not found")
    }

    // Convert Decimal objects to numbers
    return {
      ...transaction,
      original_price: Number(transaction.original_price),
      discount: Number(transaction.discount),
      final_price: Number(transaction.final_price),
    }
  } catch (error) {
    console.error("Error fetching course transaction:", error)
    throw new Error("Failed to fetch course transaction")
  }
}

export async function deleteCourseTransaction({ id }: { id: string }) {
  try {
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

export async function updateCourseTransactionStatus(id: string, status: CourseTransactionStatus) {
  try {
    await prisma.course_transactions.update({
      where: { id },
      data: { status: status, updated_at: new Date() },
    });
    revalidatePath('/admin/transaksi/kelas');
    return { success: true };
  } catch (error) {
    console.error('Error updating course transaction status:', error);
    return { success: false, error: 'Failed to update course transaction status' };
  }
}
