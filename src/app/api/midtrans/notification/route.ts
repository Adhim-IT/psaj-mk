import { type NextRequest, NextResponse } from 'next/server';
import { getMidtransConfig } from '@/lib/midtrans';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Maximum number of retries for transaction lookup
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second

// Helper function to wait
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Add more detailed logging to the notification handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📩 Received Midtrans Webhook:', JSON.stringify(body, null, 2));

    const { serverKey } = await getMidtransConfig();

    // Verify signature
    const signatureKey = body.signature_key;

    if (!signatureKey) {
      console.error('❌ Missing signature_key in body');
      return NextResponse.json({ error: 'Missing signature' }, { status: 403 });
    }

    const expectedSignature = crypto
      .createHash('sha512')
      .update(body.order_id + body.status_code + body.gross_amount + serverKey)
      .digest('hex');

    console.log('🔐 Signature from webhook:', signatureKey);
    console.log('🧮 Expected signature:', expectedSignature);

    if (signatureKey !== expectedSignature) {
      console.error('❌ Invalid signature', {
        expected: expectedSignature,
        received: signatureKey,
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Find transaction with retry mechanism
    let transaction = null;
    let retryCount = 0;

    while (!transaction && retryCount < MAX_RETRIES) {
      transaction = await prisma.course_transactions.findFirst({
        where: { code: body.order_id },
      });

      if (!transaction) {
        retryCount++;
        console.log(`🔄 Transaction not found, retry ${retryCount}/${MAX_RETRIES}`);
        if (retryCount < MAX_RETRIES) {
          await wait(RETRY_DELAY_MS);
        }
      }
    }

    if (!transaction) {
      console.error('❌ Transaction not found after retries:', body.order_id);

      // For transactions not found, we'll still return a 200 OK to Midtrans
      // This prevents Midtrans from retrying the webhook unnecessarily
      console.log('⚠️ Returning 200 OK despite transaction not found to prevent retries');
      return NextResponse.json(
        {
          success: false,
          message: 'Transaction not found, but acknowledged',
        },
        { status: 200 }
      );
    }

    console.log('✅ Transaction found:', transaction.code, transaction.id);

    // Update transaction status based on Midtrans notification
    let status: 'paid' | 'unpaid' | 'failed' = 'unpaid';

    // Log the transaction_status for debugging
    console.log(`🔍 Midtrans transaction_status: "${body.transaction_status}"`);
    console.log(`🔍 Midtrans fraud_status: "${body.fraud_status}"`);
    console.log(`🔍 Midtrans payment_type: "${body.payment_type}"`);
    console.log(`🔍 Midtrans status_code: "${body.status_code}"`);

    // For credit card payments
    if (
      // Credit card success conditions
      (body.transaction_status === 'capture' && body.fraud_status === 'accept') ||
      body.transaction_status === 'settlement' ||
      // Direct success condition
      body.status_code === '200'
    ) {
      status = 'paid';
      console.log('💰 Payment successful, updating status to PAID');
    }
    // For bank transfers that are pending
    else if (body.transaction_status === 'pending') {
      status = 'unpaid';
      console.log('⏳ Payment pending, status remains UNPAID');
    }
    // For failed payments
    else if (body.transaction_status === 'deny' || body.transaction_status === 'cancel' || body.transaction_status === 'expire') {
      status = 'failed';
      console.log('❌ Payment failed, updating status to FAILED');
    }
    // For any other status
    else {
      console.log(`⚠️ Unhandled transaction_status: "${body.transaction_status}", keeping as UNPAID`);
    }

    // Update transaction in database
    console.log(`📝 Updating transaction ${transaction.id} status to: ${status}`);
    await prisma.course_transactions.update({
      where: { id: transaction.id },
      data: {
        status,
        updated_at: new Date(),
      },
    });
    console.log('✅ Transaction status updated in database');

    // If payment is successful, add student to course
    if (status === 'paid') {
      console.log('🎓 Processing course enrollment for paid transaction');

      // For batch courses, add student to the appropriate batch group
      if (transaction.type === 'batch' && transaction.batch_number) {
        console.log('🔍 Looking for batch course type:', {
          courseId: transaction.course_id,
          batchNumber: transaction.batch_number,
        });

        // Find the course student group for this batch
        const courseType = await prisma.course_types.findFirst({
          where: {
            course_id: transaction.course_id,
            type: 'batch',
            batch_number: transaction.batch_number,
          },
        });

        if (courseType) {
          console.log('✅ Found course type:', courseType.id);

          // Find student group for this course type
          const studentGroup = await prisma.course_student_groups.findFirst({
            where: {
              course_type_id: courseType.id,
            },
          });

          if (studentGroup) {
            console.log('✅ Found student group:', studentGroup.id);

            // Check if student is already in the group
            const existingStudent = await prisma.course_students.findFirst({
              where: {
                course_student_group_id: studentGroup.id,
                student_id: transaction.student_id,
              },
            });

            // Add student to group if not already added
            if (!existingStudent) {
              console.log('➕ Adding student to course group');
              await prisma.course_students.create({
                data: {
                  id: uuidv4(),
                  course_student_group_id: studentGroup.id,
                  student_id: transaction.student_id,
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              });
              console.log('✅ Student added to course group successfully');
            } else {
              console.log('ℹ️ Student already in course group');
            }
          } else {
            console.log('⚠️ No student group found for course type');
          }
        } else {
          console.log('⚠️ No course type found for this batch');
        }
      } else {
        console.log('ℹ️ Not a batch course, skipping group enrollment');
      }
    }

    // After processing, fetch the updated transaction to verify the status change
    const updatedTransaction = await prisma.course_transactions.findUnique({
      where: { id: transaction.id },
      select: { status: true },
    });

    console.log(`🔍 Verified transaction status after update: ${updatedTransaction?.status}`);
    console.log('✅ Webhook processing completed successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Notification error:', error);
    // Always return 200 OK to Midtrans even on errors to prevent retries
    return NextResponse.json(
      {
        success: false,
        message: 'Error processing webhook, but acknowledged',
      },
      { status: 200 }
    );
  }
}

/*
Important: Make sure the Midtrans notification handler properly sets transaction status to "failed"
when receiving a transaction_status of "deny", "cancel", or "expire" from Midtrans.

Example implementation:
if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
  await prisma.course_transactions.update({
    where: { id: transactionId },
    data: {
      status: 'failed',
      updated_at: new Date(),
    },
  });
}
*/
