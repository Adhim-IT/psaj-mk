"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { uploadImage, deleteImage } from "@/lib/cloudinary"
import { Tool } from "@/types"

// Create a new file for the schema
export type ToolFormData = {
  name: string
  description?: string
  url: string
  logo: string
}

// Get all tools
export async function getTools() {
  try {
    const tools = await prisma.tools.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        created_at: "desc",
      },
    })
    return { tools }
  } catch (error) {
    console.error("Error fetching tools:", error)
    return { error: "Failed to fetch tools" }
  }
}

// Get a single tool by ID
export async function getToolById(id: string) {
  try {
    const tool = await prisma.tools.findUnique({
      where: { id },
    })

    if (!tool) {
      return { error: "Tool not found" }
    }

    return { tool }
  } catch (error) {
    console.error("Error fetching tool:", error)
    return { error: "Failed to fetch tool" }
  }
}
export async function getToolsById(ids: string[]): Promise<{ tools: Tool[]; error?: string }> {
  try {
    if (!ids || ids.length === 0) {
      return { tools: [] }
    }

    const tools = await prisma.tools.findMany({
      where: {
        id: { in: ids },
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        logo: true,
        description: true,
        url: true,
        created_at: true,
        updated_at: true,
      },
    })

    return { tools }
  } catch (error) {
    console.error("Error fetching tools:", error)
    return { tools: [], error: "Failed to load tools" }
  }
}

// Create a new tool
export async function createTool(data: ToolFormData) {
  try {
    // Validate the data
    if (!data.name || !data.url || !data.logo) {
      return { error: "Missing required fields" }
    }

    // Upload image to Cloudinary if it's a base64 string
    let logoUrl = data.logo

    if (data.logo.startsWith("data:image")) {
      const uploadResult = await uploadImage(data.logo)
      logoUrl = uploadResult.url
    }

    // Add connection retry logic
    let retries = 3
    let tool

    while (retries > 0) {
      try {
        tool = await prisma.tools.create({
          data: {
            id: uuidv4(),
            name: data.name,
            description: data.description || null,
            url: data.url,
            logo: logoUrl,
            created_at: new Date(),
            updated_at: new Date(),
          },
        })
        break // If successful, exit the loop
      } catch (err) {
        retries--
        if (retries === 0) throw err // If no more retries, throw the error
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * (3 - retries)))
      }
    }

    revalidatePath("/admin/dashboard/kelas/tool")
    return { success: true, tool }
  } catch (error) {
    console.error("Error creating tool:", error)
    return { error: "Failed to create tool. Database connection issue. Please try again later." }
  }
}

// Update an existing tool
export async function updateTool(id: string, data: ToolFormData) {
  try {
    // Validate the data
    if (!data.name || !data.url || !data.logo) {
      return { error: "Missing required fields" }
    }

    // Get the existing tool to check if we need to delete the old image
    const existingTool = await prisma.tools.findUnique({
      where: { id },
      select: { logo: true },
    })

    // Upload image to Cloudinary if it's a base64 string
    let logoUrl = data.logo

    if (data.logo.startsWith("data:image")) {
      // Delete the old image if it exists and is a Cloudinary URL
      if (existingTool?.logo && existingTool.logo.includes("cloudinary.com")) {
        await deleteImage(existingTool.logo)
      }

      // Upload the new image
      const uploadResult = await uploadImage(data.logo)
      logoUrl = uploadResult.url
    }

    const tool = await prisma.tools.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        url: data.url,
        logo: logoUrl,
        updated_at: new Date(),
      },
    })

    revalidatePath("/admin/dashboard/kelas/tool")
    return { success: true, tool }
  } catch (error) {
    console.error("Error updating tool:", error)
    return { error: "Failed to update tool" }
  }
}

// Soft delete a tool
export async function deleteTool(id: string) {
  try {
    // We don't delete the image on soft delete
    await prisma.tools.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    })

    revalidatePath("/admin/dashboard/kelas/tool")
    return { success: true }
  } catch (error) {
    console.error("Error deleting tool:", error)
    return { error: "Failed to delete tool" }
  }
}

// Hard delete a tool (for admin purposes)
export async function hardDeleteTool(id: string) {
  try {
    // Get the tool to delete the image
    const tool = await prisma.tools.findUnique({
      where: { id },
      select: { logo: true },
    })

    // Delete the image from Cloudinary if it exists
    if (tool?.logo && tool.logo.includes("cloudinary.com")) {
      await deleteImage(tool.logo)
    }

    await prisma.tools.delete({
      where: { id },
    })

    revalidatePath("/admin/dashboard/kelas/tool")
    return { success: true }
  } catch (error) {
    console.error("Error permanently deleting tool:", error)
    return { error: "Failed to permanently delete tool" }
  }
}

