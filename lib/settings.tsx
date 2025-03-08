"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { compareSync, hashSync } from "bcrypt-ts"

interface UpdateProfileData {
  name: string
  email: string
  image?: string
}

export async function updateProfile(formData: UpdateProfileData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("You must be logged in to update your profile")
  }

  try {
    // Check if email is already taken by another user
    if (formData.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: formData.email },
      })

      if (existingUser && existingUser.id !== session.user.id) {
        throw new Error("Email already in use")
      }
    }

    // Prepare update data
    const updateData = {
      name: formData.name,
      email: formData.email,
      image: formData.image || session.user.image,
      updated_at: new Date(),
    }

    let updatedUser

    // Start a transaction to update both user and corresponding role table
    await prisma.$transaction(async (tx) => {
      // Update user
      updatedUser = await tx.user.update({
        where: { id: session?.user?.id },
        data: updateData,
      })

      const userRole = await tx.user.findUnique({
        where: { id: session?.user?.id },
        select: { role_id: true },
      })

      if (!userRole) {
        throw new Error("User role not found")
      }

      if (userRole.role_id === "cm7wzebiv0001fgnglebnmv99") {
        const student = await tx.students.findFirst({
          where: { user_id: session?.user?.id },
          select: { id: true, username: true, profile_picture: true },
        })

        if (student) {
          await tx.students.update({
            where: { id: student.id },
            data: {
              name: formData.name,
              profile_picture: formData.image || student.profile_picture,
              updated_at: new Date(),
            },
          })
        }
      } else if (userRole.role_id === "cm7wzebj10002fgngkkc6rkdk") {
        const mentor = await tx.mentors.findFirst({
          where: { user_id: session?.user?.id },
          select: { id: true, name: true, profile_picture: true },
        })

        if (mentor) {
          await tx.mentors.update({
            where: { id: mentor.id },
            data: {
              name: formData.name,
              profile_picture: formData.image || mentor.profile_picture,
              updated_at: new Date(),
            },
          })
        }
      } else if (userRole.role_id === "cm7wzebj60003fgngf5yl85ka") {
        const writer = await tx.writers.findFirst({
          where: { user_id: session?.user?.id },
          select: { id: true, name: true, profile_picture: true },
        })

        if (writer) {
          await tx.writers.update({
            where: { id: writer.id },
            data: {
              name: formData.name,
              profile_picture: formData.image || writer.profile_picture,
              updated_at: new Date(),
            },
          })
        }
      }
    })

    revalidatePath("/settings")
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}

export async function updatePassword(formData: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("You must be logged in to update your password")
  }

  try {
    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user || !user.password) {
      throw new Error("User not found or password not set")
    }

    // Verify current password
    const isPasswordValid = compareSync(formData.currentPassword, user.password)
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect")
    }

    // Hash new password
    const hashedPassword = hashSync(formData.newPassword, 10)

    // Update password in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        password: hashedPassword,
        updated_at: new Date(),
      },
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error updating password:", error)
    throw error
  }
}
