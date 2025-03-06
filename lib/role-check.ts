import { prisma } from "@/lib/prisma"
import type { Session } from "next-auth"

/**
 * Checks if the user has the specified role
 * @param session The user's session
 * @param roleName The role name to check against
 * @returns Promise<boolean> True if the user has the specified role
 */
export async function hasRole(session: Session | null, roleName: string): Promise<boolean> {
  if (!session?.user?.id) return false

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: true,
      },
    })

    return user?.role?.name === roleName
  } catch (error) {
    console.error("Error checking user role:", error)
    return false
  }
}

/**
 * Checks if the user has admin role
 * @param session The user's session
 * @returns Promise<boolean> True if the user has admin role
 */
export async function isAdmin(session: Session | null): Promise<boolean> {
  return hasRole(session, "Admin")
}

/**
 * Gets the user's role name
 * @param session The user's session
 * @returns Promise<string|null> The role name or null if not found
 */
export async function getUserRole(session: Session | null): Promise<string | null> {
  if (!session?.user?.id) return null

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: true,
      },
    })

    return user?.role?.name || null
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}

