import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, isAuthenticated, isStudent } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const isAuth = await isAuthenticated()
    if (!isAuth) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a student
    const isUserStudent = await isStudent()
    if (!isUserStudent) {
      return NextResponse.json({ success: false, message: "Only students can access this resource" }, { status: 403 })
    }

    // Get current user
    const user = await getCurrentUser()
    if (!user || !user.studentId) {
      return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 })
    }

    // Get event registrations for the student
    const eventRegistrations = await prisma.event_registrants.findMany({
      where: {
        student_id: user.studentId,
        deleted_at: null,
      },
      include: {
        events: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            start_date: true,
            end_date: true,
            price: true,
            mentors: {
              select: {
                name: true,
                profile_picture: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: eventRegistrations,
    })
  } catch (error) {
    console.error("Error fetching event registrations:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

