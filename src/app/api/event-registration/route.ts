import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
import { v2 as cloudinary } from "cloudinary"
import { auth } from "@/auth"
import { getCurrentUser } from "@/lib/auth"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current user with student ID
    const currentUser = await getCurrentUser()
    if (!currentUser || !currentUser.studentId) {
      return NextResponse.json({ error: "User is not a student" }, { status: 403 })
    }

    const formData = await request.formData()
    const eventId = formData.get("eventId") as string
    const phoneNumber = formData.get("phoneNumber") as string
    const paymentProofFile = formData.get("paymentProof") as File | null

    if (!eventId || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate phone number
    if (!/^08\d{8,11}$/.test(phoneNumber)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
    }

    // Check if event exists
    const event = await prisma.events.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Check if student is already registered for this event
    const existingRegistration = await prisma.event_registrants.findFirst({
      where: {
        event_id: eventId,
        student_id: currentUser.studentId,
      },
    })

    if (existingRegistration) {
      return NextResponse.json({ error: "Already registered for this event" }, { status: 409 })
    }

    // Upload payment proof to Cloudinary if provided
    let paymentProofUrl = null
    if (paymentProofFile) {
      // Convert File to base64
      const arrayBuffer = await paymentProofFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64String = `data:${paymentProofFile.type};base64,${buffer.toString("base64")}`

      // Upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          base64String,
          {
            folder: "payment-proofs",
            public_id: `payment_${Date.now()}`,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          },
        )
      })

      // @ts-ignore - TypeScript doesn't know the structure of the uploadResult
      paymentProofUrl = uploadResult.secure_url
    }

    // Update student's phone number
    await prisma.students.update({
      where: { id: currentUser.studentId },
      data: { phone: phoneNumber },
    })

    // Create event registration with timestamps
    const registration = await prisma.event_registrants.create({
      data: {
        id: uuidv4(),
        event_id: eventId,
        student_id: currentUser.studentId,
        payment_proof: paymentProofUrl,
        status: event.price ? "pending" : "paid", // If free event, mark as paid immediately
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    return NextResponse.json({ success: true, registration }, { status: 201 })
  } catch (error) {
    console.error("Error registering for event:", error)
    return NextResponse.json({ error: "Failed to register for event" }, { status: 500 })
  }
}

