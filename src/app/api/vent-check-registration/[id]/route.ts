import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"
import { getCurrentUser } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current user with student ID
    const currentUser = await getCurrentUser()
    if (!currentUser || !currentUser.studentId) {
      return NextResponse.json({ isRegistered: false })
    }

    // Access params asynchronously through the function parameter
    const eventId = params.id

    // Check if the student is already registered for the event
    const registration = await prisma.event_registrants.findFirst({
      where: {
        event_id: eventId,
        student_id: currentUser.studentId,
      },
    })

    return NextResponse.json({
      isRegistered: !!registration,
      status: registration?.status || null,
    })
  } catch (error) {
    console.error("Error checking registration:", error)
    return NextResponse.json({ error: "Failed to check registration" }, { status: 500 })
  }
}

