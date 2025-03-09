"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { uploadImage, deleteImage } from "@/lib/cloudinary"
import type { ListClassFormData } from "@/types"
import { prisma } from "@/lib/prisma"

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, "-")
}

// Get all mentors (for dropdown selection)
export async function getMentors() {
  try {
    const mentors = await prisma.mentors.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        specialization: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return { mentors }
  } catch (error) {
    console.error("Error fetching mentors:", error)
    return { error: "Failed to fetch mentors" }
  }
}

// Get all list classes
export async function getListClasses() {
  try {
    const listClasses = await prisma.courses.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return { listClasses }
  } catch (error) {
    console.error("Error fetching list classes:", error)
    return { error: "Failed to fetch list classes" }
  }
}

// Get a single list class by ID
export async function getListClassById(id: string) {
  try {
    const listClass = await prisma.courses.findUnique({
      where: { id },
    })

    if (!listClass) {
      return { error: "List class not found" }
    }

    return { listClass }
  } catch (error) {
    console.error("Error fetching list class:", error)
    return { error: "Failed to fetch list class" }
  }
}

// Create a new list class
export async function createListClass(data: ListClassFormData) {
  try {
    // Validate the data
    if (!data.title || !data.description || !data.thumbnail || !data.trailer) {
      return { error: "Missing required fields" }
    }

    // Upload thumbnail to Cloudinary if it's a base64 string
    let thumbnailUrl = data.thumbnail

    if (data.thumbnail.startsWith("data:image")) {
      const uploadResult = await uploadImage(data.thumbnail)
      thumbnailUrl = uploadResult.url
    }

    // Generate slug from title
    const slug = generateSlug(data.title)

    // Create new list class
    const listClass = await prisma.courses.create({
      data: {
        id: uuidv4(),
        mentor_id: data.mentor_id,
        title: data.title,
        slug,
        description: data.description,
        thumbnail: thumbnailUrl,
        trailer: data.trailer,
        level: data.level,
        meetings: data.meetings,
        is_popular: data.is_popular,
        is_request: data.is_request,
        is_active: data.is_active,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    revalidatePath("/admin/dashboard/kelas/list")
    return { success: true, listClass }
  } catch (error) {
    console.error("Error creating list class:", error)
    return { error: "Failed to create list class. Please try again later." }
  }
}

// Update an existing list class
export async function updateListClass(id: string, data: ListClassFormData) {
  try {
    // Validate the data
    if (!data.title || !data.description || !data.thumbnail || !data.trailer) {
      return { error: "Missing required fields" }
    }

    // Get the existing list class
    const existingListClass = await prisma.courses.findUnique({
      where: { id },
      select: { thumbnail: true, title: true },
    })

    if (!existingListClass) {
      return { error: "List class not found" }
    }

    // Upload thumbnail to Cloudinary if it's a base64 string
    let thumbnailUrl = data.thumbnail

    if (data.thumbnail.startsWith("data:image")) {
      // Delete the old image if it exists and is a Cloudinary URL
      if (existingListClass.thumbnail && existingListClass.thumbnail.includes("cloudinary.com")) {
        await deleteImage(existingListClass.thumbnail)
      }

      // Upload the new image
      const uploadResult = await uploadImage(data.thumbnail)
      thumbnailUrl = uploadResult.url
    }

    // Generate slug from title if title has changed
    const slug = existingListClass.title !== data.title ? generateSlug(data.title) : undefined

    // Update the list class
    const listClass = await prisma.courses.update({
      where: { id },
      data: {
        mentor_id: data.mentor_id,
        title: data.title,
        slug,
        description: data.description,
        thumbnail: thumbnailUrl,
        trailer: data.trailer,
        level: data.level,
        meetings: data.meetings,
        is_popular: data.is_popular,
        is_request: data.is_request,
        is_active: data.is_active,
        updated_at: new Date(),
      },
    })

    revalidatePath("/admin/dashboard/kelas/list")
    return { success: true, listClass }
  } catch (error) {
    console.error("Error updating list class:", error)
    return { error: "Failed to update list class" }
  }
}

// Soft delete a list class
export async function deleteListClass(id: string) {
  try {
    await prisma.courses.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    })

    revalidatePath("/admin/dashboard/kelas/list")
    return { success: true }
  } catch (error) {
    console.error("Error deleting list class:", error)
    return { error: "Failed to delete list class" }
  }
}

// Hard delete a list class (for admin purposes)
export async function hardDeleteListClass(id: string) {
  try {
    const listClass = await prisma.courses.findUnique({
      where: { id },
      select: { thumbnail: true },
    })

    if (!listClass) {
      return { error: "List class not found" }
    }

    // Delete the thumbnail from Cloudinary if it exists
    if (listClass.thumbnail && listClass.thumbnail.includes("cloudinary.com")) {
      await deleteImage(listClass.thumbnail)
    }

    // Hard delete the list class
    await prisma.courses.delete({
      where: { id },
    })

    revalidatePath("/admin/dashboard/kelas/list")
    return { success: true }
  } catch (error) {
    console.error("Error permanently deleting list class:", error)
    return { error: "Failed to permanently delete list class" }
  }
}

