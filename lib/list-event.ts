"use server"

import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache"
import prisma from "./prisma"
import { uploadImage, deleteImage } from "./cloudinary"
import type { EventFormData } from "@/types"

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim()
}

// Helper function to serialize Decimal values
function serializeData(data: any) {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      // Convert Decimal to number
      if (typeof value === "object" && value !== null && typeof value.toNumber === "function") {
        return value.toNumber()
      }
      return value
    }),
  )
}

// Get all events with mentor information
export async function getEvents() {
  try {
    const events = await prisma.events.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        mentors: {
          select: {
            id: true,
            name: true,
            specialization: true,
            profile_picture: true,
          },
        },
        event_registrants: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    // Serialize the data to handle Decimal objects
    const serializedEvents = serializeData(events)

    return { success: true, data: serializedEvents }
  } catch (error) {
    console.error("Error fetching events:", error)
    return { success: false, error: "Failed to fetch events" }
  }
}

// Get a single event by ID
export async function getEventById(id: string) {
  try {
    const event = await prisma.events.findUnique({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        mentors: {
          select: {
            id: true,
            name: true,
            specialization: true,
          },
        },
      },
    })

    if (!event) {
      return { success: false, error: "Event not found" }
    }

    // Serialize the data to handle Decimal objects
    const serializedEvent = serializeData(event)

    return { success: true, data: serializedEvent }
  } catch (error) {
    console.error("Error fetching event:", error)
    return { success: false, error: "Failed to fetch event" }
  }
}
export async function getEventBySlug(slug: string) {
  try {
    const event = await prisma.events.findFirst({
      where: {
        slug: slug,
        is_active: true, 
      },
      include: {
        mentors: { select: { id: true, name: true, specialization: true, profile_picture: true } },
        event_registrants: { select: { id: true } },
      },
    });

    if (!event) {
      return {
        success: false,
        error: "Event not found",
      }
    }

    // ✅ Convert Decimal to number
    const serializedEvent = serializeData(event);

    return {
      success: true,
      data: serializedEvent,
    }
  } catch (error) {
    console.error("Error fetching event by slug:", error)
    return {
      success: false,
      error: "Failed to fetch event",
    }
  }
}


export async function getUpcomingEvents(limit?: number) {
  try {
    const now = new Date()

    const events = await prisma.events.findMany({
      where: {
        is_active: true,
        start_date: {
          gte: now,
        },
      },
      include: {
        mentors: {
          select: {
            id: true,
            name: true,
            specialization: true,
            profile_picture: true,
          },
        },
        event_registrants: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        start_date: "asc",
      },
      take: limit || undefined,
    })

    // Serialize the data to handle Decimal objects
    const serializedEvents = serializeData(events)

    return {
      success: true,
      data: serializedEvents,
    }
  } catch (error) {
    console.error("Error fetching upcoming events:", error)
    return {
      success: false,
      error: "Failed to fetch upcoming events",
    }
  }
}

// Create a new event
export async function createEvent(data: EventFormData) {
  try {
    if (!data.title || !data.description || !data.thumbnail || !data.whatsapp_group_link) {
      return { success: false, error: "Missing required fields" }
    }

    let thumbnailUrl = data.thumbnail
    if (data.thumbnail.startsWith("data:image")) {
      const uploadResult = await uploadImage(data.thumbnail)
      thumbnailUrl = uploadResult.url
    }

    const eventId = uuidv4()

    const event = await prisma.events.create({
      data: {
        id: eventId,
        mentor_id: data.mentor_id,
        title: data.title,
        slug: data.slug || generateSlug(data.title),
        thumbnail: thumbnailUrl,
        description: data.description,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        price: data.price ? Number(data.price) : null,
        whatsapp_group_link: data.whatsapp_group_link,
        is_active: data.is_active ?? true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    // Serialize the data to handle Decimal objects
    const serializedEvent = serializeData(event)

    revalidatePath("/admin/dashboard/event/list")
    return { success: true, data: serializedEvent }
  } catch (error) {
    console.error("Error creating event:", error)
    return { success: false, error: "Failed to create event" }
  }
}

// Update an existing event
export async function updateEvent(id: string, data: EventFormData) {
  try {
    if (!data.title || !data.description || !data.thumbnail || !data.whatsapp_group_link) {
      return { success: false, error: "Missing required fields" }
    }

    const existingEvent = await prisma.events.findUnique({
      where: { id },
      select: { thumbnail: true, title: true },
    })

    if (!existingEvent) {
      return { success: false, error: "Event not found" }
    }

    let thumbnailUrl = data.thumbnail
    if (data.thumbnail.startsWith("data:image")) {
      if (existingEvent.thumbnail.includes("cloudinary.com")) {
        await deleteImage(existingEvent.thumbnail)
      }
      const uploadResult = await uploadImage(data.thumbnail)
      thumbnailUrl = uploadResult.url
    }

    const updatedEvent = await prisma.events.update({
      where: { id },
      data: {
        mentor_id: data.mentor_id,
        title: data.title,
        slug: data.slug || (existingEvent.title !== data.title ? generateSlug(data.title) : undefined),
        thumbnail: thumbnailUrl,
        description: data.description,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        price: data.price ? Number(data.price) : null,
        whatsapp_group_link: data.whatsapp_group_link,
        is_active: data.is_active ?? true,
        updated_at: new Date(),
      },
    })

    // Serialize the data to handle Decimal objects
    const serializedEvent = serializeData(updatedEvent)

    revalidatePath("/admin/dashboard/event/list")
    return { success: true, data: serializedEvent }
  } catch (error) {
    console.error("Error updating event:", error)
    return { success: false, error: "Failed to update event" }
  }
}

// Soft delete an event
export async function deleteEvent(id: string) {
  try {
    await prisma.events.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    })

    revalidatePath("/admin/dashboard/event/list")
    return { success: true }
  } catch (error) {
    console.error("Error deleting event:", error)
    return { success: false, error: "Failed to delete event" }
  }
}

// Get all mentors for dropdown
export async function getMentorsForDropdown() {
  try {
    const mentors = await prisma.mentors.findMany({
      select: {
        id: true,
        name: true,
        specialization: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return { success: true, data: mentors }
  } catch (error) {
    console.error("Error fetching mentors:", error)
    return { success: false, error: "Failed to fetch mentors" }
  }
}

