import { prisma } from "@/lib/prisma"

export async function getRoles() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: {
        name: "asc",
      },
    })
    return roles
  } catch (error) {
    console.error("Error fetching roles:", error)
    throw new Error("Failed to fetch roles")
  }
}

export async function getRoleById(id: string) {
  try {
    const role = await prisma.role.findUnique({
      where: {
        id,
      },
    })
    return role
  } catch (error) {
    console.error(`Error fetching role with ID ${id}:`, error)
    throw new Error("Failed to fetch role")
  }
}

export async function createRoleData(data: { name: string; description?: string }) {
  try {
    const role = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    return { success: true, data: role }
  } catch (error) {
    console.error("Error creating role:", error)
    return { success: false, error: "Failed to create role" }
  }
}

export async function updateRoleData(id: string, data: { name: string; description?: string }) {
  try {
    const role = await prisma.role.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        description: data.description,
        updated_at: new Date(),
      },
    })

    return { success: true, data: role }
  } catch (error) {
    console.error(`Error updating role with ID ${id}:`, error)
    return { success: false, error: "Failed to update role" }
  }
}

export async function deleteRoleData(id: string) {
  try {
    // Check if role is in use
    const usersWithRole = await prisma.user.count({
      where: {
        role_id: id,
      },
    })

    if (usersWithRole > 0) {
      return {
        success: false,
        error: "Cannot delete role that is assigned to users",
      }
    }

    await prisma.role.delete({
      where: {
        id,
      },
    })

    return { success: true }
  } catch (error) {
    console.error(`Error deleting role with ID ${id}:`, error)
    return { success: false, error: "Failed to delete role" }
  }
}

