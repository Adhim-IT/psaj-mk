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
      return NextResponse.json({ registered: false, status: null })
    }

    // Access params asynchronously through the function parameter
    const eventId = params.id

    // Check if the student is registered for the event
    const registration = await prisma.event_registrants.findFirst({
      where: {
        event_id: eventId,
        student_id: currentUser.studentId,
      },
    })

    if (!registration) {
      return NextResponse.json({ registered: false, status: null })
    }

    return NextResponse.json({
      registered: true,
      status: registration.status,
      whatsappLink:
        registration.status === "paid"
          ? (await prisma.events.findUnique({ where: { id: eventId } }))?.whatsapp_group_link
          : null,
    })
  } catch (error) {
    console.error("Error checking event status:", error)
    return NextResponse.json({ error: "Failed to check event status" }, { status: 500 })
  }
}

