"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

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
    // Use the auth() function from NextAuth
    const session = await auth()

    if (!session || !session.user || !session.user.id) {
      console.log("No valid session found")
      return null
    }

    // Fetch the user from the database to get the studentId
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
      console.log("User not found in database")
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

