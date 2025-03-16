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
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim()
}

/**
 * Fetch mentors from the database
 */
export async function getMentors() {
  try {
    const mentors = await prisma.mentors.findMany({
      select: {
        id: true,
        name: true,
        specialization: true,
      },
      where: {
        deleted_at: null,
      },
      orderBy: {
        name: "asc",
      },
    })

    return { mentors }
  } catch (error) {
    console.error("Error fetching mentors:", error)
    return { mentors: [], error: "Failed to load mentors" }
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
      include: {
        mentors: {
          select: {
            id: true,
            name: true,
            specialization: true,
            profile_picture: true,
          },
        },
        course_transactions: {
          select: {
            id: true,
            student_id: true,
          },
        },
      },
    })

    return { listClasses }
  } catch (error) {
    console.error("Error fetching list classes:", error)
    return { error: "Failed to fetch list classes" }
  }
}

/**
 * Fetch a list class by ID
 */
export async function getListClassById(id: string) {
  try {
    const listClass = await prisma.courses.findUnique({
      where: { id },
      include: {
        course_category_pivot: {
          include: {
            course_categories: {
              select: { id: true, name: true },
            },
          },
        },
        course_tool_pivot: {
          include: {
            tools: {
              select: { id: true, name: true },
            },
          },
        },
        course_syllabus: {
          select: { id: true, title: true, sort: true },
          orderBy: { sort: "asc" },
        },
      },
    })

    if (!listClass) return { error: "List class not found" }

    return {
      listClass: {
        ...listClass,
        categories: listClass.course_category_pivot.map((pivot) => pivot.course_categories),
        tools: listClass.course_tool_pivot.map((pivot) => pivot.tools),
        syllabus: listClass.course_syllabus,
      },
    }
  } catch (error) {
    console.error("Error fetching list class:", error)
    return { error: "Failed to load list class" }
  }
}

/**
 * Create a new list class
 */
export async function createListClass(data: ListClassFormData) {
  try {
    if (!data.title || !data.description || !data.thumbnail || !data.trailer) {
      return { error: "Missing required fields" }
    }

    let thumbnailUrl = data.thumbnail
    if (data.thumbnail.startsWith("data:image")) {
      const uploadResult = await uploadImage(data.thumbnail)
      thumbnailUrl = uploadResult.url
    }

    const courseId = uuidv4()

    const course = await prisma.courses.create({
      data: {
        id: courseId,
        mentor_id: data.mentor_id,
        title: data.title,
        slug: data.slug || generateSlug(data.title),
        description: data.description,
        thumbnail: thumbnailUrl,
        trailer: data.trailer,
        level: data.level,
        meetings: data.meetings,
        is_popular: data.is_popular,
        is_request: data.is_request || false,
        is_active: data.is_active,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    if (data.categories?.length) {
      await prisma.course_category_pivot.createMany({
        data: data.categories.map((course_category_id) => ({
          course_category_id,
          course_id: courseId,
        })),
      })
    }

    if (data.tools?.length) {
      await prisma.course_tool_pivot.createMany({
        data: data.tools.map((toolId) => ({
          course_id: courseId,
          tool_id: toolId,
        })),
      });

    }

    if (data.syllabus?.length) {
      await prisma.course_syllabus.createMany({
        data: data.syllabus.map((item) => ({
          id: uuidv4(),
          course_id: courseId,
          title: item.title,
          sort: item.sort,
          created_at: new Date(),
          updated_at: new Date(),
        })),
      })
    }

    revalidatePath("/admin/dashboard/kelas/list")
    return { success: true, courseId, course }
  } catch (error) {
    console.error("Error creating list class:", error)
    return { error: "Failed to create list class" }
  }
}


export async function updateListClass(id: string, data: ListClassFormData) {
  try {
    if (!data.title || !data.description || !data.thumbnail || !data.trailer) {
      return { error: "Missing required fields" }
    }

    const existingListClass = await prisma.courses.findUnique({
      where: { id },
      select: { thumbnail: true, title: true },
    })

    if (!existingListClass) return { error: "List class not found" }

    let thumbnailUrl = data.thumbnail
    if (data.thumbnail.startsWith("data:image")) {
      if (existingListClass.thumbnail.includes("cloudinary.com")) {
        await deleteImage(existingListClass.thumbnail)
      }
      const uploadResult = await uploadImage(data.thumbnail)
      thumbnailUrl = uploadResult.url
    }

    return await prisma.$transaction(async (tx) => {
      await tx.courses.update({
        where: { id },
        data: {
          mentor_id: data.mentor_id,
          title: data.title,
          slug: data.slug || (existingListClass.title !== data.title ? generateSlug(data.title) : undefined),
          description: data.description,
          thumbnail: thumbnailUrl,
          trailer: data.trailer,
          level: data.level,
          meetings: data.meetings,
          is_popular: data.is_popular,
          is_request: data.is_request || false,
          is_active: data.is_active,
          updated_at: new Date(),
        },
      })

      await tx.course_category_pivot.deleteMany({ where: { course_id: id } })
      if (data.categories?.length) {
        await tx.course_category_pivot.createMany({
          data: data.categories.map((course_category_id) => ({
            course_category_id,
            course_id: id,
          })),
        })
      }

      await tx.course_tool_pivot.deleteMany({ where: { course_id: id } });

      if (data.tools?.length) {
        await tx.course_tool_pivot.createMany({
          data: data.tools.map((toolId) => ({
            course_id: id,
            tool_id: toolId,
          })),
        });
      }


      await tx.course_syllabus.deleteMany({ where: { course_id: id } })
      if (data.syllabus?.length) {
        await tx.course_syllabus.createMany({
          data: data.syllabus.map((item) => ({
            id: uuidv4(),
            course_id: id,
            title: item.title,
            sort: item.sort,
            created_at: new Date(),
            updated_at: new Date(),
          })),
        })
      }

      revalidatePath("/admin/dashboard/kelas/list")
      return { success: true }
    })
  } catch (error) {
    console.error("Error updating list class:", error)
    return { error: "Failed to update list class" }
  }
}

export async function deleteListClass(courseId: string) {
  try {
    await prisma.courses.update({
      where: { id: courseId },
      data: { deleted_at: new Date() },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting class:", error);
      return { success: false, error: error.message };
    } else {
      console.error("Unknown error:", error);
      return { success: false, error: "An unknown error occurred" };
    }
  }
}

