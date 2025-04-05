import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getMidtransConfig } from '@/lib/midtrans';

async function getMidtransToken(params: any) {
  const { serverKey } = await getMidtransConfig();
  const auth = Buffer.from(`${serverKey}:`).toString('base64');
  const snapResponse = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(params),
  });

  if (!snapResponse.ok) {
    const errorData = await snapResponse.json();
    console.error('❌ Midtrans error:', errorData);
    throw new Error('Gagal membuat token pembayaran');
  }

  const snapData = await snapResponse.json();
  console.log('✅ Midtrans Snap token created:', snapData);
  return snapData;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📦 Request body:', body);

    if (body.retryPayment && body.transactionId && body.transactionCode) {
      console.log('🔄 Retrying payment for existing transaction:', body.transactionCode);

      const transaction = await prisma.course_transactions.findUnique({
        where: { id: body.transactionId },
        include: {
          courses: {
            select: {
              title: true,
            },
          },
          students: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!transaction || transaction.status !== 'unpaid') {
        return NextResponse.json({ error: 'Transaksi tidak ditemukan atau sudah dibayar' }, { status: 404 });
      }

      const midtransParams = {
        transaction_details: {
          order_id: transaction.code,
          gross_amount: Number(transaction.final_price),
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          first_name: transaction.student_id,
        },
        item_details: [
          {
            id: transaction.course_id,
            price: Number(transaction.final_price),
            quantity: 1,
            name: transaction.course_id,
          },
        ],
        enabled_payments: ['credit_card', 'bca_va', 'bni_va', 'bri_va', 'permata_va', 'mandiri_va', 'other_va', 'gopay', 'shopeepay', 'qris'],
        callbacks: {
          finish: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?id=${transaction.id}`,
        },
      };

      const snapData = await getMidtransToken(midtransParams);
      return NextResponse.json({
        token: snapData.token,
        transactionCode: transaction.code,
        redirectUrl: snapData.redirect_url,
      });
    }

    const user = await getCurrentUser();
    console.log('👤 Current user:', user);

    if (!user || !user.studentId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Anda harus login terlebih dahulu' }, { status: 401 });
    }

    const { courseType, promoCode, transactionCode } = body;

    if (!courseType || !courseType.id) {
      console.log('❌ Invalid course type data');
      return NextResponse.json({ error: 'Data kelas tidak valid' }, { status: 400 });
    }

    // Ensure we have a transaction code from the request
    if (!transactionCode) {
      console.log('❌ Missing transaction code');
      return NextResponse.json({ error: 'Kode transaksi tidak ditemukan' }, { status: 400 });
    }

    // Calculate prices
    let discount = 0;
    let voucherDiscount = 0;

    // Apply course discount if available
    if (courseType.is_discount && courseType.discount && courseType.discount_type) {
      if (courseType.discount_type === 'percentage') {
        discount = (courseType.normal_price * courseType.discount) / 100;
      } else {
        discount = courseType.discount;
      }
    }

    // Apply promo code if provided
    if (promoCode) {
      console.log('🔍 Checking promo code:', promoCode);
      const promoCodeData = await prisma.promo_codes.findFirst({
        where: {
          code: promoCode,
          is_used: false,
          valid_until: {
            gte: new Date(),
          },
          deleted_at: null,
        },
      });

      if (promoCodeData) {
        console.log('✅ Valid promo code found:', promoCodeData);
        if (promoCodeData.discount_type === 'percentage') {
          voucherDiscount = (courseType.normal_price * promoCodeData.discount) / 100;
        } else {
          voucherDiscount = promoCodeData.discount;
        }
      } else {
        console.log('⚠️ No valid promo code found');
      }
    }

    // Calculate final price
    const finalPrice = Math.max(courseType.normal_price - discount - voucherDiscount, 0);
    console.log('💰 Price calculation:', {
      normalPrice: courseType.normal_price,
      discount,
      voucherDiscount,
      finalPrice,
    });

    // Use the transaction code from the request instead of generating a new one
    console.log('🏷️ Using transaction code from request:', transactionCode);

    // Get Midtrans configuration
    const { serverKey } = await getMidtransConfig();

    // Create Midtrans Snap token
    console.log('🔑 Creating Midtrans Snap token');
    const auth = Buffer.from(`${serverKey}:`).toString('base64');
    const snapResponse = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: transactionCode, // Use the transaction code from the request
          gross_amount: finalPrice,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          first_name: user.name || 'Student',
          email: user.email,
        },
        item_details: [
          {
            id: courseType.id,
            price: finalPrice,
            quantity: 1,
            name: courseType.course_title || 'Course',
          },
        ],
        enabled_payments: ['credit_card', 'bca_va', 'bni_va', 'bri_va', 'permata_va', 'mandiri_va', 'other_va', 'gopay', 'shopeepay', 'qris'],
        callbacks: {
          finish: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?id=${body.transactionId}`,
        },
      }),
    });

    if (!snapResponse.ok) {
      const errorData = await snapResponse.json();
      console.error('❌ Midtrans error:', errorData);
      return NextResponse.json({ error: 'Gagal membuat token pembayaran' }, { status: 500 });
    }

    const snapData = await snapResponse.json();
    console.log('✅ Midtrans Snap token created:', snapData);

    return NextResponse.json({
      token: snapData.token,
      transactionCode, // Return the same transaction code
      redirectUrl: snapData.redirect_url,
    });
  } catch (error) {
    console.error('❌ Create token error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat memproses pembayaran' }, { status: 500 });
  }
}
