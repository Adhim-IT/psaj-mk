import { type NextRequest, NextResponse } from "next/server"
import { getMidtransConfig } from "@/lib/midtrans"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serverKey } = await getMidtransConfig()

    // Verify signature
    const signatureKey = request.headers.get("x-signature-key")
    if (signatureKey) {
      const expectedSignature = crypto
        .createHash("sha512")
        .update(body.order_id + body.status_code + body.gross_amount + serverKey)
        .digest("hex")

      if (signatureKey !== expectedSignature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
      }
    }

    // Find transaction by order_id (transaction code)
    const transaction = await prisma.course_transactions.findFirst({
      where: { code: body.order_id },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Update transaction status based on Midtrans notification
    let status: "paid" | "unpaid" | "failed" = "unpaid"

    if (body.transaction_status === "capture" || body.transaction_status === "settlement") {
      status = "paid"
    } else if (
      body.transaction_status === "deny" ||
      body.transaction_status === "cancel" ||
      body.transaction_status === "expire"
    ) {
      status = "failed"
    }

    // Update transaction in database
    await prisma.course_transactions.update({
      where: { id: transaction.id },
      data: {
        status,
        updated_at: new Date(),
      },
    })

    // If payment is successful, add student to course
    if (status === "paid") {
      // For batch courses, add student to the appropriate batch group
      if (transaction.type === "batch" && transaction.batch_number) {
        // Find the course student group for this batch
        const courseType = await prisma.course_types.findFirst({
          where: {
            course_id: transaction.course_id,
            type: "batch",
            batch_number: transaction.batch_number,
          },
        })

        if (courseType) {
          // Find student group for this course type
          const studentGroup = await prisma.course_student_groups.findFirst({
            where: {
              course_type_id: courseType.id,
            },
          })

          if (studentGroup) {
            // Check if student is already in the group
            const existingStudent = await prisma.course_students.findFirst({
              where: {
                course_student_group_id: studentGroup.id,
                student_id: transaction.student_id,
              },
            })

            // Add student to group if not already added
            if (!existingStudent) {
              await prisma.course_students.create({
                data: {
                  id: uuidv4(),
                  course_student_group_id: studentGroup.id,
                  student_id: transaction.student_id,
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              })
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

