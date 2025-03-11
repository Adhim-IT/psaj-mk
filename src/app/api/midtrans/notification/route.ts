import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto" // Untuk verifikasi signature
import prisma from "@/lib/prisma"
import { CourseTransactionStatus } from "@/types"
import { getMidtransConfig } from "@/lib/midtrans"

export async function POST(request: NextRequest) {
  try {
    const { serverKey } = getMidtransConfig()
    const body = await request.json()

    // Ambil signature dari header Midtrans
    const notificationSignature = request.headers.get("x-signature") || ""

    // Verifikasi signature Midtrans
    const isValidSignature = verifyMidtransSignature(notificationSignature, body, serverKey)
    if (!isValidSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    const orderId = body.order_id
    const transactionStatus = body.transaction_status
    const fraudStatus = body.fraud_status

    if (!orderId || !transactionStatus) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 })
    }

    // Cari transaksi berdasarkan order_id
    const transaction = await prisma.course_transactions.findFirst({
      where: { code: orderId },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    let status: CourseTransactionStatus

    // Map status Midtrans ke sistem kita
    switch (transactionStatus) {
      case "capture":
      case "settlement":
        status = CourseTransactionStatus.PAID
        break

      case "deny":
      case "cancel":
      case "expire":
        status = CourseTransactionStatus.FAILED
        break

      case "pending":
      default:
        status = CourseTransactionStatus.UNPAID
        break
    }

    // Update status transaksi di database
    await prisma.course_transactions.update({
      where: { id: transaction.id },
      data: {
        status,
        updated_at: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing Midtrans notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * Fungsi untuk memverifikasi signature dari Midtrans
 */
function verifyMidtransSignature(signature: string, body: any, serverKey: string): boolean {
  const orderId = body.order_id
  const statusCode = body.status_code
  const grossAmount = body.gross_amount
  const inputSignature = body.signature_key

  const hash = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex")

  return hash === inputSignature
}
