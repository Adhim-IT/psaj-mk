import { type NextRequest, NextResponse } from "next/server"
import { getMidtransConfig } from "@/lib/midtrans"

export async function POST(request: NextRequest) {
  try {
    const { transactionId, transactionCode, amount, customerName, customerEmail } = await request.json()

    if (!transactionId || !transactionCode || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { serverKey, isProduction } = await getMidtransConfig()

    // Always use sandbox URL for now
    const apiUrl = "https://app.sandbox.midtrans.com/snap/v1/transactions"

    const payload = {
      transaction_details: {
        order_id: transactionCode,
        gross_amount: amount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: customerName || "Customer",
        email: customerEmail || "customer@example.com",
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?id=${transactionId}`,
      },
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(serverKey + ":").toString("base64")}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Midtrans error:", data)
      return NextResponse.json(
        { error: data.error_messages?.[0] || "Failed to create payment token" },
        { status: response.status },
      )
    }

    return NextResponse.json({ token: data.token })
  } catch (error) {
    console.error("Create token error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

