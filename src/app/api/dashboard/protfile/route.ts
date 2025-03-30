import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, isAuthenticated } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Get user data from database to get additional fields
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        created_at: true,
        updated_at: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    })

    // Get student data if exists
    let studentData = null
    if (user.studentId) {
      studentData = await prisma.students.findUnique({
        where: { id: user.studentId },
        select: {
          id: true,
          name: true,
          username: true,
          profile_picture: true,
          gender: true,
          occupation: true,
          phone: true,
          city: true,
          created_at: true,
        },
      })
    }

    // Return user data
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        student: studentData,
        created_at: userData?.created_at,
        updated_at: userData?.updated_at,
        role: userData?.role?.name,
      },
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

