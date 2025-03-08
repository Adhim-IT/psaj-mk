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
    }

    let updatedUser

    // Start a transaction to update both user and student
    await prisma.$transaction(async (tx) => {
      // Update user
      updatedUser = await tx.user.update({
        where: { id: session?.user?.id },
        data: updateData,
      })

      const student = await tx.students.findFirst({
        where: { user_id: session?.user?.id },
        select: { id: true, username: true, profile_picture: true },
      })

      if (student) {
        // Update student if exists
        await tx.students.update({
          where: { id: student.id }, 
          data: {
            name: formData.name,
            profile_picture: formData.image || student.profile_picture,
          },
        })
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
      data: { password: hashedPassword },
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error updating password:", error)
    throw error
  }
}

