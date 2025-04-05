'use server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { CourseTypeTransaction } from '@/types';
import type { course_transactions_type } from '@prisma/client';

interface CheckoutData {
  courseType: CourseTypeTransaction;
  promoCode?: string;
  promoDiscountType?: 'percentage' | 'fixed' | null;
  promoDiscount?: number;
}

export async function initiateCheckout(data: CheckoutData) {
  console.log('🚀 Input Checkout Data:', data);
  const user = await getCurrentUser();
  console.log('👤 Current user:', user);

  if (!user || !user.studentId) {
    console.log('❌ User not authenticated');
    return { error: 'Anda harus login terlebih dahulu', redirectUrl: '/login?redirect=/checkout' };
  }

  const existingTransaction = await prisma.course_transactions.findFirst({
    where: {
      student_id: user.studentId,
      course_id: data.courseType.course_id,
      status: { not: 'failed' },
    },
  });

  if (existingTransaction) {
    console.log('⚠️ User already has a transaction for this course:', existingTransaction);
    return { error: 'Anda sudah membeli kelas ini.' };
  }

  try {
    const { courseType, promoCode } = data;

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

    // Create transaction code
    const transactionCode = `TRX-${Date.now()}`;
    console.log('🏷️ Generated transaction code:', transactionCode);
    console.log('Creating transaction in DB...');

    // Create transaction in database
    const transaction = await prisma.course_transactions.create({
      data: {
        id: uuidv4(),
        code: transactionCode,
        course_id: courseType.course_id,
        student_id: user.studentId,
        type: courseType.type as course_transactions_type,
        batch_number: courseType.batch_number || null,
        status: 'unpaid',
        original_price: courseType.normal_price,
        discount: discount + voucherDiscount,
        final_price: finalPrice,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    console.log('✅ Transaction created:', transaction.code, transaction.id);

    // Mark promo code as used if applicable
    if (promoCode && voucherDiscount > 0) {
      console.log('📝 Marking promo code as used:', promoCode);
      await prisma.promo_codes.updateMany({
        where: { code: promoCode },
        data: { is_used: true, updated_at: new Date() },
      });
      console.log('✅ Promo code marked as used');
    }

    return {
      success: true,
      transactionId: transaction.id,
      transactionCode: transaction.code, // Return the transaction code as well
    };
  } catch (error) {
    console.error('❌ Checkout error:', error);
    return { error: 'Gagal memproses pembayaran' };
  }
}

export async function getTransactionById(transactionId: string) {
  try {
    if (!transactionId) {
      return { error: 'Transaksi ID diperlukan' };
    }

    const transaction = await prisma.course_transactions.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
          },
        },
        students: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      return { error: 'Transaksi tidak ditemukan' };
    }

    return {
      transaction: {
        ...transaction,
        original_price: Number(transaction.original_price),
        discount: Number(transaction.discount),
        final_price: Number(transaction.final_price),
      },
    };
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return { error: 'Gagal memuat data transaksi' };
  }
}
