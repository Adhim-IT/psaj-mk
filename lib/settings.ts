"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { compareSync, hashSync } from "bcrypt-ts"
import { uploadImage, deleteImage } from "@/lib/cloudinary"

interface UpdateProfileData {
  name: string
  email: string
  image?: string | null
}

// Add a new function to get the user profile with student data
export async function getUserProfile() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  try {
    // Get user with role information
    const userWithRole = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: {
          select: { name: true },
        },
      },
    })

    if (!userWithRole || !userWithRole.role) {
      return { ...session.user }
    }

    // Get role-specific profile data
    let profileData = null
    if (userWithRole.role.name.toLowerCase() === "student") {
      profileData = await prisma.students.findFirst({
        where: { user_id: session.user.id },
        select: {
          profile_picture: true,
          username: true,
          name: true,
        },
      })
    } else if (userWithRole.role.name.toLowerCase() === "mentor") {
      profileData = await prisma.mentors.findFirst({
        where: { user_id: session.user.id },
        select: {
          profile_picture: true,
          name: true,
        },
      })
    } else if (userWithRole.role.name.toLowerCase() === "writer") {
      profileData = await prisma.writers.findFirst({
        where: { user_id: session.user.id },
        select: {
          profile_picture: true,
          name: true,
        },
      })
    }

    // Combine user data with profile data
    return {
      ...session.user,
      role: userWithRole.role.name,
      profilePicture: profileData?.profile_picture || null,
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return { ...session.user }
  }
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

    // Get current user to check if we need to delete old image
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        image: true,
        role: {
          select: { name: true },
        },
      },
    })

    if (!currentUser || !currentUser.role) {
      throw new Error("User or role not found")
    }

    const roleName = currentUser.role.name.toLowerCase()

    // Get current profile picture from role-specific table
    let currentProfilePicture = null
    if (roleName === "student") {
      const student = await prisma.students.findFirst({
        where: { user_id: session.user.id },
        select: { profile_picture: true },
      })
      currentProfilePicture = student?.profile_picture
    } else if (roleName === "mentor") {
      const mentor = await prisma.mentors.findFirst({
        where: { user_id: session.user.id },
        select: { profile_picture: true },
      })
      currentProfilePicture = mentor?.profile_picture
    } else if (roleName === "writer") {
      const writer = await prisma.writers.findFirst({
        where: { user_id: session.user.id },
        select: { profile_picture: true },
      })
      currentProfilePicture = writer?.profile_picture
    }

    // Handle image upload to Cloudinary if a new image is provided
    let imageUrl: string | null = null

    if (formData.image && formData.image !== currentProfilePicture) {
      try {
        console.log("Uploading new image to Cloudinary...")
        // If it's a new image (base64 string), upload to Cloudinary
        const uploadResult = await uploadImage(formData.image)

        if (!uploadResult || !uploadResult.url) {
          console.error("Cloudinary upload failed or returned no URL")
          throw new Error("Failed to upload image")
        }

        imageUrl = uploadResult.url
        console.log("Image uploaded successfully:", imageUrl)

        // Delete old image if it exists and is a Cloudinary URL
        if (currentProfilePicture && currentProfilePicture.includes("cloudinary.com")) {
          await deleteImage(currentProfilePicture)
          console.log("Old image deleted from Cloudinary")
        }
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError)
        throw new Error(
          "Failed to upload image: " + (uploadError instanceof Error ? uploadError.message : "Unknown error"),
        )
      }
    } else {
      // Keep the existing image if no new one is provided
      imageUrl = currentProfilePicture || null
      console.log("Using existing image:", imageUrl)
    }

    // Prepare update data for user
    const updateData = {
      name: formData.name,
      email: formData.email,
      image: imageUrl, // Update user.image with the same URL
      updated_at: new Date(),
    }

    console.log("Updating user with data:", JSON.stringify(updateData))

    let updatedUser

    try {
      // Update the user record first
      updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
      })

      console.log("User updated successfully:", updatedUser.id)

      // Now update the role-specific table based on the role name
      if (roleName === "student") {
        // Find the student record
        const student = await prisma.students.findFirst({
          where: { user_id: session.user.id },
        })

        if (student) {
          // Update the student record directly
          const studentUpdate = await prisma.students.update({
            where: { id: student.id },
            data: {
              name: formData.name,
              profile_picture: imageUrl,
              updated_at: new Date(),
            },
          })
          console.log("Student updated successfully:", student.id)
          console.log("Student profile_picture set to:", imageUrl)

          // Double-check the update
          const updatedStudent = await prisma.students.findUnique({
            where: { id: student.id },
            select: { profile_picture: true },
          })
          console.log("Verified student profile_picture:", updatedStudent?.profile_picture)
        } else {
          console.error("Student record not found for user:", session.user.id)
        }
      } else if (roleName === "mentor") {
        const mentor = await prisma.mentors.findFirst({
          where: { user_id: session.user.id },
        })

        if (mentor) {
          const mentorUpdate = await prisma.mentors.update({
            where: { id: mentor.id },
            data: {
              name: formData.name,
              profile_picture: imageUrl,
              updated_at: new Date(),
            },
          })
          console.log("Mentor updated successfully:", mentor.id)
          console.log("Mentor profile_picture set to:", imageUrl)
        } else {
          console.error("Mentor record not found for user:", session.user.id)
        }
      } else if (roleName === "writer") {
        const writer = await prisma.writers.findFirst({
          where: { user_id: session.user.id },
        })

        if (writer) {
          const writerUpdate = await prisma.writers.update({
            where: { id: writer.id },
            data: {
              name: formData.name,
              profile_picture: imageUrl,
              updated_at: new Date(),
            },
          })
          console.log("Writer updated successfully:", writer.id)
          console.log("Writer profile_picture set to:", imageUrl)
        } else {
          console.error("Writer record not found for user:", session.user.id)
        }
      }
    } catch (dbError) {
      console.error("Database error:", dbError)
      throw new Error("Database update failed: " + (dbError instanceof Error ? dbError.message : "Unknown error"))
    }

    revalidatePath("/settings")
    revalidatePath("/")
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update profile" }
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
    // Validate password confirmation
    if (formData.newPassword !== formData.confirmPassword) {
      throw new Error("New password and confirmation do not match")
    }

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
    return { success: false, error: error instanceof Error ? error.message : "Failed to update password" }
  }
}

