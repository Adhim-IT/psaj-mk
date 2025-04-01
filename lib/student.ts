import { prisma } from "@/lib/prisma"
import { hash } from "bcrypt-ts"

export async function getStudents() {
  try {
    const students = await prisma.students.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        users: {
          select: {
            email: true,
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })
    return students
  } catch (error) {
    console.error("Error fetching students:", error)
    throw new Error("Failed to fetch students")
  }
}

export async function getStudentById(id: string) {
  try {
    const student = await prisma.students.findUnique({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role_id: true,
          },
        },
      },
    })
    return student
  } catch (error) {
    console.error(`Error fetching student with ID ${id}:`, error)
    throw new Error("Failed to fetch student")
  }
}

export async function createStudentData(data: {
  name: string
  username: string
  email: string
  password: string
  role_id: string
  gender?: "male" | "female"
  occupation?: string
  occupation_type?: "student" | "employee" | "business" | "other"
  phone?: string
  city?: string
  profile_picture?: string
}) {
  try {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (existingUser) {
      return { success: false, error: "Email already in use" }
    }

    // Check if username already exists
    const existingUsername = await prisma.students.findUnique({
      where: {
        username: data.username,
      },
    })

    if (existingUsername) {
      return { success: false, error: "Username already in use" }
    }

    // Hash password
    const hashedPassword = await hash(data.password, 10)

    // Create user and student in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role_id: data.role_id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      // Create student
      const student = await tx.students.create({
        data: {
          user_id: user.id,
          username: data.username,
          name: data.name,
          gender: data.gender,
          occupation: data.occupation,
          occupation_type: data.occupation_type,
          phone: data.phone,
          city: data.city,
          profile_picture: data.profile_picture,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      return { user, student }
    })

    return { success: true, data: result.student }
  } catch (error) {
    console.error("Error creating student:", error)
    return { success: false, error: "Failed to create student" }
  }
}

export async function updateStudentData(
  id: string,
  data: {
    name: string
    username: string
    email: string
    password?: string
    role_id: string
    gender?: "male" | "female"
    occupation?: string
    occupation_type?: "student" | "employee" | "business" | "other"
    phone?: string
    city?: string
    profile_picture?: string
  },
) {
  try {
    const student = await prisma.students.findUnique({
      where: { id },
      include: { users: true },
    })

    if (!student) {
      return { success: false, error: "Student not found" }
    }

    // Check if username is taken by another student
    if (data.username !== student.username) {
      const existingUsername = await prisma.students.findUnique({
        where: {
          username: data.username,
          NOT: {
            id: id,
          },
        },
      })

      if (existingUsername) {
        return { success: false, error: "Username already in use" }
      }
    }

    // Check if email is taken by another user
    if (data.email !== student.users.email) {
      const existingEmail = await prisma.user.findUnique({
        where: {
          email: data.email,
          NOT: {
            id: student.user_id,
          },
        },
      })

      if (existingEmail) {
        return { success: false, error: "Email already in use" }
      }
    }

    // Update user and student in a transaction
    await prisma.$transaction(async (tx) => {
      // Update user
      const userData: any = {
        name: data.name,
        email: data.email,
        role_id: data.role_id,
        updated_at: new Date(),
      }

      // Only update password if provided
      if (data.password) {
        userData.password = await hash(data.password, 10)
      }

      await tx.user.update({
        where: { id: student.user_id },
        data: userData,
      })

      // Update student
      await tx.students.update({
        where: { id },
        data: {
          username: data.username,
          name: data.name,
          gender: data.gender,
          occupation: data.occupation,
          occupation_type: data.occupation_type,
          phone: data.phone,
          city: data.city,
          profile_picture: data.profile_picture,
          updated_at: new Date(),
        },
      })
    })

    return { success: true }
  } catch (error) {
    console.error(`Error updating student with ID ${id}:`, error)
    return { success: false, error: "Failed to update student" }
  }
}

export async function deleteStudentData(id: string) {
  try {
    const student = await prisma.students.findUnique({
      where: { id },
      select: { user_id: true },
    })

    if (!student) {
      return { success: false, error: "Student not found" }
    }

    // Soft delete student and user
    await prisma.$transaction(async (tx) => {
      await tx.students.update({
        where: { id },
        data: {
          deleted_at: new Date(),
        },
      })

      await tx.user.update({
        where: { id: student.user_id },
        data: {
          deleted_at: new Date(),
        },
      })
    })

    return { success: true }
  } catch (error) {
    console.error(`Error deleting student with ID ${id}:`, error)
    return { success: false, error: "Failed to delete student" }
  }
}

