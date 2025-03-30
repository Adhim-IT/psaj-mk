import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    // Verify the current user has access to this student's data
    const currentUser = await getCurrentUser()
    if (!currentUser || !currentUser.studentId || currentUser.studentId !== studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const registrations = await prisma.event_registrants.findMany({
      where: {
        student_id: studentId,
      },
      include: {
        events: {
          select: {
            title: true,
            thumbnail: true,
            start_date: true,
            end_date: true,
            whatsapp_group_link: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return NextResponse.json({
      registrations: JSON.parse(JSON.stringify(registrations)),
    })
  } catch (error) {
    console.error("Error fetching event registrations:", error)
    return NextResponse.json({ error: "Failed to fetch event registrations" }, { status: 500 })
  }
}

