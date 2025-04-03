import { prisma } from "@/lib/prisma"
import { hash } from "bcrypt-ts"

export async function getWriters() {
  try {
    const writers = await prisma.writers.findMany({
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
    return writers
  } catch (error) {
    console.error("Error fetching writers:", error)
    throw new Error("Failed to fetch writers")
  }
}

export async function getWriterById(id: string) {
  try {
    const writer = await prisma.writers.findUnique({
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
    return writer
  } catch (error) {
    console.error(`Error fetching writer with ID ${id}:`, error)
    throw new Error("Failed to fetch writer")
  }
}

export async function createWriterData(data: {
  name: string
  username: string
  email: string
  password: string
  role_id: string
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
    const existingUsername = await prisma.writers.findUnique({
      where: {
        username: data.username,
      },
    })

    if (existingUsername) {
      return { success: false, error: "Username already in use" }
    }

    // Hash password
    const hashedPassword = await hash(data.password, 10)

    // Create user and writer in a transaction
    const result = await prisma.$transaction(async (tx:any) => {
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

      // Create writer
      const writer = await tx.writers.create({
        data: {
          user_id: user.id,
          username: data.username,
          name: data.name,
          profile_picture: data.profile_picture,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      return { user, writer }
    })

    return { success: true, data: result.writer }
  } catch (error) {
    console.error("Error creating writer:", error)
    return { success: false, error: "Failed to create writer" }
  }
}

export async function updateWriterData(
  id: string,
  data: {
    name: string
    username: string
    email: string
    password?: string
    role_id: string
    profile_picture?: string
  },
) {
  try {
    const writer = await prisma.writers.findUnique({
      where: { id },
      include: { users: true },
    })

    if (!writer) {
      return { success: false, error: "Writer not found" }
    }

    // Check if username is taken by another writer
    if (data.username !== writer.username) {
      const existingUsername = await prisma.writers.findUnique({
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
    if (data.email !== writer.users.email) {
      const existingEmail = await prisma.user.findUnique({
        where: {
          email: data.email,
          NOT: {
            id: writer.user_id,
          },
        },
      })

      if (existingEmail) {
        return { success: false, error: "Email already in use" }
      }
    }

    // Update user and writer in a transaction
    await prisma.$transaction(async (tx: any) => {
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
        where: { id: writer.user_id },
        data: userData,
      })

      // Update writer
      await tx.writers.update({
        where: { id },
        data: {
          username: data.username,
          name: data.name,
          profile_picture: data.profile_picture,
          updated_at: new Date(),
        },
      })
    })

    return { success: true }
  } catch (error) {
    console.error(`Error updating writer with ID ${id}:`, error)
    return { success: false, error: "Failed to update writer" }
  }
}

export async function deleteWriterData(id: string) {
  try {
    const writer = await prisma.writers.findUnique({
      where: { id },
      select: { user_id: true },
    })

    if (!writer) {
      return { success: false, error: "Writer not found" }
    }

    // Soft delete writer and user
    await prisma.$transaction(async (tx: any) => {
      await tx.writers.update({
        where: { id },
        data: {
          deleted_at: new Date(),
        },
      })

      await tx.user.update({
        where: { id: writer.user_id },
        data: {
          deleted_at: new Date(),
        },
      })
    })

    return { success: true }
  } catch (error) {
    console.error(`Error deleting writer with ID ${id}:`, error)
    return { success: false, error: "Failed to delete writer" }
  }
}

