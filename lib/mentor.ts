import { prisma } from "@/lib/prisma"
import { hash } from "bcrypt-ts"

export async function getMentors() {
  try {
    const mentors = await prisma.mentors.findMany({
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
    return mentors
  } catch (error) {
    console.error("Error fetching mentors:", error)
    throw new Error("Failed to fetch mentors")
  }
}

export async function getMentorById(id: string) {
  try {
    const mentor = await prisma.mentors.findUnique({
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
    return mentor
  } catch (error) {
    console.error(`Error fetching mentor with ID ${id}:`, error)
    throw new Error("Failed to fetch mentor")
  }
}

// Update the createMentorData function to handle profile_picture correctly
export async function createMentorData(data: {
  name: string
  username: string
  email: string
  password: string
  role_id: string
  gender: "male" | "female"
  phone: string
  city: string
  specialization: string
  bio: string
  profile_picture?: string | null
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
    const existingUsername = await prisma.mentors.findUnique({
      where: {
        username: data.username,
      },
    })

    if (existingUsername) {
      return { success: false, error: "Username already in use" }
    }

    // Hash password
    const hashedPassword = await hash(data.password, 10)

    // Create user and mentor in a transaction
    const result = await prisma.$transaction(async (tx : any) => {
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

      // Create mentor
      const mentor = await tx.mentors.create({
        data: {
          user_id: user.id,
          username: data.username,
          name: data.name,
          gender: data.gender,
          phone: data.phone,
          city: data.city,
          specialization: data.specialization,
          bio: data.bio,
          profile_picture: data.profile_picture || null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      return { user, mentor }
    })

    return { success: true, data: result.mentor }
  } catch (error) {
    console.error("Error creating mentor:", error)
    return { success: false, error: "Failed to create mentor" }
  }
}

// Update the updateMentorData function to handle profile_picture correctly
export async function updateMentorData(
  id: string,
  data: {
    name: string
    username: string
    email: string
    password?: string
    role_id: string
    gender: "male" | "female"
    phone: string
    city: string
    specialization: string
    bio: string
    profile_picture?: string | null
  },
) {
  try {
    const mentor = await prisma.mentors.findUnique({
      where: { id },
      include: { users: true },
    })

    if (!mentor) {
      return { success: false, error: "Mentor not found" }
    }

    // Check if username is taken by another mentor
    if (data.username !== mentor.username) {
      const existingUsername = await prisma.mentors.findUnique({
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
    if (data.email !== mentor.users.email) {
      const existingEmail = await prisma.user.findUnique({
        where: {
          email: data.email,
          NOT: {
            id: mentor.user_id,
          },
        },
      })

      if (existingEmail) {
        return { success: false, error: "Email already in use" }
      }
    }

    // Update user and mentor in a transaction
    await prisma.$transaction(async (tx: any) => {
      // Update user
      const userData: any = {
        name: data.name,
        email: data.email,
        role_id: data.role_id,
        updated_at: new Date(),
      };

      // Only update password if provided
      if (data.password) {
        userData.password = await hash(data.password, 10);
      }

      await tx.user.update({
        where: { id: mentor.user_id },
        data: userData,
      });

      // Update mentor
      await tx.mentors.update({
        where: { id },
        data: {
          username: data.username,
          name: data.name,
          gender: data.gender,
          phone: data.phone,
          city: data.city,
          specialization: data.specialization,
          bio: data.bio,
          profile_picture: data.profile_picture || null,
          updated_at: new Date(),
        },
      });
    });

    return { success: true }
  } catch (error) {
    console.error(`Error updating mentor with ID ${id}:`, error)
    return { success: false, error: "Failed to update mentor" }
  }
}

export async function deleteMentorData(id: string) {
  try {
    const mentor = await prisma.mentors.findUnique({
      where: { id },
      select: { user_id: true },
    })

    if (!mentor) {
      return { success: false, error: "Mentor not found" }
    }

    // Soft delete mentor and user
    await prisma.$transaction(async (tx: any) => {
      await tx.mentors.update({
        where: { id },
        data: {
          deleted_at: new Date(),
        },
      });

      await tx.user.update({
        where: { id: mentor.user_id },
        data: {
          deleted_at: new Date(),
        },
      });
    });

    return { success: true }
  } catch (error) {
    console.error(`Error deleting mentor with ID ${id}:`, error)
    return { success: false, error: "Failed to delete mentor" }
  }
}

