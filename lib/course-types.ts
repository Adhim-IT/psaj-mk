"use server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { prisma } from "@/lib/prisma"
import type { CourseTypeFormData } from "@/lib/zod"
import { CourseTypeTransaction } from "@/types"

// Get all course types
export async function getCourseTypes() {
  try {
    const courseTypesRaw = await prisma.course_types.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        courses: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    // Convert Decimal to plain objects using JSON serialization
    const courseTypes = JSON.parse(JSON.stringify(courseTypesRaw))

    return { courseTypes }
  } catch (error) {
    console.error("Error fetching course types:", error)
    return { error: "Gagal mengambil data tipe kelas" }
  }
}

// Get course types by course ID
export async function getCourseTypesByCourseId(courseId: string) {
  try {
    const courseTypesRaw = await prisma.course_types.findMany({
      where: {
        course_id: courseId,
        is_active: true,
        deleted_at: null,
      },
      include: {
        courses: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        normal_price: "asc", // Order by price, lowest first
      },
    })

    // Convert Decimal to plain objects using JSON serialization
    const courseTypes = JSON.parse(JSON.stringify(courseTypesRaw))

    return { courseTypes, error: null }
  } catch (error) {
    console.error("Error fetching course types by course ID:", error)
    return { courseTypes: [], error: "Gagal mengambil data tipe kelas" }
  }
}

// Get a single course type by ID
export async function getCourseTypeById(id: string) {
  try {
    const courseTypeRaw = await prisma.course_types.findUnique({
      where: { id },
      include: {
        courses: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!courseTypeRaw) {
      return { error: "Tipe kelas tidak ditemukan" }
    }

    // Convert Decimal to plain objects using JSON serialization
    const courseType = JSON.parse(JSON.stringify(courseTypeRaw))

    return { courseType }
  } catch (error) {
    console.error("Error fetching course type:", error)
    return { error: "Gagal mengambil data tipe kelas" }
  }
}

// Get all courses for dropdown
export async function getCourses() {
  try {
    const courses = await prisma.courses.findMany({
      where: {
        deleted_at: null,
        is_active: true,
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: "asc",
      },
    })

    return { courses }
  } catch (error) {
    console.error("Error fetching courses:", error)
    return { error: "Gagal mengambil data kelas" }
  }
}

// Create new course type
export async function createCourseType(data: CourseTypeFormData) {
  try {
    // Cek apakah tipe kelas dengan course_id dan type sudah ada
    const existingCourseType = await prisma.course_types.findFirst({
      where: {
        course_id: data.course_id,
        type: data.type,
        deleted_at: null, // Pastikan hanya mengecek tipe kelas yang masih aktif
      },
    });

    if (existingCourseType) {
      return { error: "Tipe kelas untuk kursus ini sudah ada" };
    }

    // Dapatkan judul kelas untuk membuat slug
    const course = await prisma.courses.findUnique({
      where: { id: data.course_id },
      select: { title: true },
    });

    if (!course) {
      return { error: "Kelas tidak ditemukan" };
    }

    // Generate slug unik
    const slug = `${course.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")}-${data.type.toLowerCase()}${data.batch_number ? `-batch-${data.batch_number}` : ""}`;

    // Buat tipe kelas baru
    const courseTypeRaw = await prisma.course_types.create({
      data: {
        id: uuidv4(),
        course_id: data.course_id,
        type: data.type,
        batch_number: data.batch_number,
        slug,
        normal_price: data.normal_price,
        discount_type: data.is_discount ? data.discount_type : null,
        discount: data.is_discount ? data.discount : null,
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: data.is_active,
        is_discount: data.is_discount,
        is_voucher: data.is_voucher,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Konversi Decimal ke angka biasa sebelum mengirimkan ke client
    const courseType = JSON.parse(JSON.stringify(courseTypeRaw));

    revalidatePath("/admin/dashboard/kelas/tipe");
    return { success: true, courseType };
  } catch (error) {
    console.error("Error creating course type:", error);
    return { error: "Gagal membuat tipe kelas" };
  }
}

// Update course type
export async function updateCourseType(id: string, data: CourseTypeFormData) {
  try {
    // Get course title for slug generation
    const course = await prisma.courses.findUnique({
      where: { id: data.course_id },
      select: { title: true },
    })

    if (!course) {
      return { error: "Kelas tidak ditemukan" }
    }

    // Generate new slug
    const newSlug = `${course.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")}-${data.type.toLowerCase()}${data.batch_number ? `-batch-${data.batch_number}` : ""}`

    // Check if new slug already exists (excluding current record)
    const existingType = await prisma.course_types.findFirst({
      where: {
        slug: newSlug,
        id: { not: id },
      },
    })

    if (existingType) {
      return { error: "Tipe kelas dengan slug ini sudah ada" }
    }

    // Update the course type
    const courseTypeRaw = await prisma.course_types.update({
      where: { id },
      data: {
        course_id: data.course_id,
        type: data.type,
        batch_number: data.batch_number,
        slug: newSlug,
        normal_price: data.normal_price,
        discount_type: data.is_discount ? data.discount_type : null,
        discount: data.is_discount ? data.discount : null,
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: data.is_active,
        is_discount: data.is_discount,
        is_voucher: data.is_voucher,
        updated_at: new Date(),
      },
    })

    // Convert Decimal to number before sending to client
    const courseType = JSON.parse(JSON.stringify(courseTypeRaw))

    revalidatePath("/admin/dashboard/kelas/tipe")
    return { success: true, courseType }
  } catch (error) {
    console.error("Error updating course type:", error)
    return { error: "Gagal memperbarui tipe kelas" }
  }
}

// Soft delete a course type
export async function deleteCourseType(id: string) {
  try {
    await prisma.course_types.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    })

    revalidatePath("/admin/dashboard/kelas/tipe")
    return { success: true }
  } catch (error) {
    console.error("Error deleting course type:", error)
    return { error: "Gagal menghapus tipe kelas" }
  }
}

export async function getCourseTypeBySlug(slug: string): Promise<CourseTypeTransaction | null> {
  try {
    const courseType = await prisma.course_types.findUnique({
      where: {
        slug,
        is_active: true,
      },
      include: {
        courses: {
          select: {
            title: true,
            description: true,
            thumbnail: true,
          },
        },
      },
    })

    if (!courseType) return null

    return {
      id: courseType.id,
      course_id: courseType.course_id,
      type: courseType.type,
      batch_number: courseType.batch_number,
      slug: courseType.slug,
      normal_price: Number(courseType.normal_price),
      discount_type: courseType.discount_type || undefined,
      discount: courseType.discount ? Number(courseType.discount) : undefined,
      is_active: courseType.is_active,
      is_voucher: courseType.is_voucher,
      is_discount: courseType.is_discount,
      course_title: courseType.courses.title,
      course_description: courseType.courses.description,
      course_thumbnail: courseType.courses.thumbnail,
    }
  } catch (error) {
    console.error("Error fetching course type:", error)
    return null
  }
}
