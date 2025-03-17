"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth" // Import auth dari konfigurasi NextAuth utama

interface User {
  id: string
  name: string | null
  email: string
  studentId?: string
}

/**
 * Gets the currently authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Gunakan auth() dari NextAuth untuk mendapatkan session
    const session = await auth()

    // Jika tidak ada session, return null
    if (!session || !session.user) {
      console.log("No session found via auth()")
      return null
    }

    // Log session untuk debugging
    console.log("Session found:", {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
    })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        students: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!user) {
      console.log("User not found in database with ID:", session.user.id)
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      studentId: user.students[0]?.id,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Checks if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Checks if the user is a student
 */
export async function isStudent(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user?.studentId
}

