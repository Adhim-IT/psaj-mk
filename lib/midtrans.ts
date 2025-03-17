"use server"

// Initialize Midtrans configuration
export async function getMidtransConfig() {
  return {
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    merchantId: process.env.MIDTRANS_MERCHANT_ID || "",
    isProduction: false, // Always use sandbox for now
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
    const { serverKey, isProduction } = await getMidtransConfig()

    // Always use sandbox URL
    const apiUrl = "https://api.sandbox.midtrans.com"

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

