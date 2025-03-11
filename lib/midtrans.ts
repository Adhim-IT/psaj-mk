"use server"

import type { MidtransConfig } from "@/types"

// Initialize Midtrans configuration
export function getMidtransConfig(): MidtransConfig {
  const clientKey = process.env.MIDTRANS_CLIENT_KEY
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  const merchantId = process.env.MIDTRANS_MERCHANT_ID
  const isProduction = process.env.NODE_ENV === "production"

  if (!clientKey || !serverKey || !merchantId) {
    throw new Error("Midtrans configuration is incomplete")
  }

  return {
    clientKey,
    serverKey,
    merchantId,
    isProduction,
  }
}

export async function createMidtransTransaction(params: {
  orderId: string
  amount: number
  customerName: string
  customerEmail: string
  description: string
}) {
  try {
    const { orderId, amount, customerName, customerEmail, description } = params
    const { serverKey, isProduction } = getMidtransConfig()

    const apiUrl = isProduction ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com"

    const auth = Buffer.from(`${serverKey}:`).toString("base64")

    const response = await fetch(`${apiUrl}/v2/charge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        payment_type: "bank_transfer",
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        customer_details: {
          first_name: customerName,
          email: customerEmail,
        },
        item_details: [
          {
            id: orderId,
            price: amount,
            quantity: 1,
            name: description,
          },
        ],
        bank_transfer: {
          bank: "bca",
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create Midtrans transaction")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error creating Midtrans transaction:", error)
    throw new Error("Failed to create payment transaction")
  }
}

