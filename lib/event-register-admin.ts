"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import type { EventRegistrant } from "@/types"
import { type eventRegistrantFilterSchema, updateRegistrantStatusSchema } from "@/lib/zod"
import type { z } from "zod"

export async function getEventRegistrants(filters: z.infer<typeof eventRegistrantFilterSchema>) {
  try {
    const { event_id, student_id, status, search, page, limit } = filters

    const skip = (page - 1) * limit

    const where: any = {
      deleted_at: null,
    }

    if (status) {
      where.status = status
    }

    if (event_id) {
      where.event_id = event_id
    }

    if (student_id) {
      where.student_id = student_id
    }

    if (search) {
      where.OR = [
        { events: { title: { contains: search } } },
        { students: { name: { contains: search } } },
        { students: { phone: { contains: search } } },
      ]
    }

    const registrants = await prisma.event_registrants.findMany({
      where,
      include: {
        events: {
          select: {
            id: true,
            title: true,
          },
        },
        students: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
    })

    const total = await prisma.event_registrants.count({ where })

    return {
      data: registrants as EventRegistrant[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error getting event registrants:", error)
    throw new Error("Failed to fetch event registrants")
  }
}

export async function updateRegistrantStatus(data: z.infer<typeof updateRegistrantStatusSchema>) {
  try {
    const { id, status } = updateRegistrantStatusSchema.parse(data)

    const registrant = await prisma.event_registrants.findUnique({
      where: { id, deleted_at: null },
    })

    if (!registrant) {
      throw new Error("Event registrant not found")
    }

    await prisma.event_registrants.update({
      where: { id },
      data: {
        status,
        updated_at: new Date(),
      },
    })

    revalidatePath("/admin/transaksi/event")
    return { success: true }
  } catch (error) {
    console.error("Error updating registrant status:", error)
    return { success: false, error: "Failed to update registrant status" }
  }
}
export async function deleteRegistrant(id: string) {
  try {
    await prisma.event_registrants.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    })

    revalidatePath("/admin/transaksi/event")
    return { success: true }
  } catch (error) {
    console.error("Error deleting registrant:", error)
    return { success: false, error: "Failed to delete registrant" }
  }
}


