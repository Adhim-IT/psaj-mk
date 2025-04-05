'use server';

// Initialize Midtrans configuration
export async function getMidtransConfig() {
  return {
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    merchantId: process.env.MIDTRANS_MERCHANT_ID || '',
    isProduction: false, // Always use sandbox for now
  };
}

// Update the createMidtransTransaction function to support credit card payments
export async function createMidtransTransaction(params: { orderId: string; amount: number; customerName: string; customerEmail: string; description: string }) {
  try {
    const { orderId, amount, customerName, customerEmail, description } = params;
    const { serverKey, isProduction } = await getMidtransConfig();

    // Always use sandbox URL
    const apiUrl = 'https://api.sandbox.midtrans.com';

    const auth = Buffer.from(`${serverKey}:`).toString('base64');

    console.log('🚀 Creating Midtrans transaction:', {
      orderId,
      amount,
      customerName,
      customerEmail,
      description,
    });

    // Create a Snap token instead of a direct charge
    const response = await fetch(`${apiUrl}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        credit_card: {
          secure: true,
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
        enabled_payments: ['credit_card', 'bca_va', 'bni_va', 'bri_va', 'permata_va', 'mandiri_va', 'other_va', 'gopay', 'shopeepay', 'qris'],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Midtrans API error:', errorData);
      throw new Error('Failed to create Midtrans transaction');
    }

    const data = await response.json();
    console.log('✅ Midtrans transaction created successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating Midtrans transaction:', error);
    throw new Error('Failed to create payment transaction');
  }
}
