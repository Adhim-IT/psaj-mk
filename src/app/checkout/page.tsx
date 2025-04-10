'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2, CheckCircle, AlertCircle, CreditCard, Tag, ShoppingCart } from 'lucide-react';
import Swal from 'sweetalert2';
import { initiateCheckout } from '@/lib/checkout';
import { getCourseTypeBySlug } from '@/lib/course-types';
import { validatePromoCode } from '@/lib/promo-code';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';
import Script from 'next/script';
import Navbar from '@/components/user/Navbar';
import Footer from '@/components/user/Footer';
import { cn } from '@/lib/utils';

// Deklarasi tipe untuk Midtrans Snap
declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: any) => void;
    };
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseTypeSlug = searchParams.get('course');
  const { data: session, status } = useSession();

  const [courseType, setCourseType] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoDiscountType, setPromoDiscountType] = useState<'percentage' | 'fixed' | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [midtransLoaded, setMidtransLoaded] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);

  // Cek session dari client-side
  useEffect(() => {
    if (status === 'loading') return;

    setAuthChecked(true);

    if (status === 'unauthenticated') {
      console.log('User is not authenticated');
    } else if (status === 'authenticated' && session) {
      console.log('User is authenticated:', session.user);
    }
  }, [session, status]);

  useEffect(() => {
    async function loadCourseType() {
      if (!courseTypeSlug) {
        setError('Kelas tidak ditemukan');
        setLoading(false);
        return;
      }

      try {
        const courseTypeData = await getCourseTypeBySlug(courseTypeSlug);
        if (!courseTypeData) {
          setError('Kelas tidak ditemukan');
          setLoading(false);
          return;
        }

        setCourseType(courseTypeData);
      } catch (err) {
        console.error('Error loading course type:', err);
        setError('Gagal memuat data kelas');
      } finally {
        setLoading(false);
      }
    }

    loadCourseType();
  }, [courseTypeSlug]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      Swal.fire({
        title: 'Kode promo kosong',
        text: 'Silakan masukkan kode promo',
        icon: 'error',
        confirmButtonColor: '#4A90E2',
      });
      return;
    }

    setValidatingPromo(true);

    try {
      // Validate promo code from database
      const result = await validatePromoCode(promoCode.trim());

      if (!result.success || !result.data) {
        Swal.fire({
          title: 'Kode promo tidak valid',
          text: result.error || 'Kode promo tidak ditemukan atau sudah tidak berlaku',
          icon: 'error',
          confirmButtonColor: '#4A90E2',
        });
        return;
      }

      // Set promo details from database
      const promoData = result.data;
      setPromoDiscountType(promoData.discount_type as 'percentage' | 'fixed');
      setPromoDiscount(promoData.discount);
      setPromoApplied(true);

      // Show success message
      const discountText = promoData.discount_type === 'percentage' ? `${promoData.discount}%` : `Rp ${promoData.discount.toLocaleString('id-ID')}`;

      Swal.fire({
        title: 'Kode promo berhasil diterapkan',
        text: `Diskon ${discountText} telah ditambahkan`,
        icon: 'success',
        confirmButtonColor: '#4A90E2',
      });
    } catch (err) {
      console.error('Error validating promo code:', err);
      Swal.fire({
        title: 'Gagal memvalidasi kode promo',
        text: 'Terjadi kesalahan saat memvalidasi kode promo',
        icon: 'error',
        confirmButtonColor: '#4A90E2',
      });
    } finally {
      setValidatingPromo(false);
    }
  };

  // Function to open Midtrans payment popup
  const openMidtransPopup = async (transactionId: string, transactionCode: string) => {
    if (!window.snap) {
      Swal.fire({
        title: 'Checkout gagal',
        text: 'Sistem pembayaran belum siap. Silakan coba lagi.',
        icon: 'error',
        confirmButtonColor: '#4A90E2',
      });
      return;
    }

    try {
      // Store the current transaction ID
      setCurrentTransactionId(transactionId);

      // Request Midtrans token for the existing transaction
      const response = await fetch('/api/midtrans/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          transactionCode,
          retryPayment: true,
          courseType: courseType,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Gagal mendapatkan token pembayaran');
      }

      // Open Midtrans Snap popup with modified options
      window.snap?.pay(data.token, {
        onSuccess: async (result: any) => {
          console.log('✅ Payment success:', result);
          router.push(`/checkout/success?id=${transactionId}`);
        },
        onPending: (result: any) => {
          console.log('⏳ Payment pending:', result);
          router.push(`/checkout/success?id=${transactionId}`);
        },
        onError: (result: any) => {
          console.error('❌ Payment error:', result);
          Swal.fire({
            title: 'Pembayaran gagal',
            text: 'Terjadi kesalahan saat memproses pembayaran',
            icon: 'error',
            confirmButtonColor: '#4A90E2',
          });
        },
        onClose: () => {
          console.log('⚠️ Customer closed the popup');
          // Don't redirect or show alert when user closes the popup
          // Just reset the processing state
          setProcessingPayment(false);

          // Optionally show a small toast notification
          Swal.fire({
            title: 'Pembayaran ditunda',
            text: 'Anda dapat melanjutkan pembayaran kapan saja',
            icon: 'info',
            confirmButtonColor: '#4A90E2',
          });
        },
        skipOrderSummary: true,
      });
    } catch (err) {
      console.error('❌ Error opening Midtrans popup:', err);
      Swal.fire({
        title: 'Checkout gagal',
        text: err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses pembayaran',
        icon: 'error',
        confirmButtonColor: '#4A90E2',
      });
      setProcessingPayment(false);
    }
  };

  // Update the handleCheckout function to support credit card payments
  const handleCheckout = async () => {
    if (!courseType) return;

    if (status === 'unauthenticated') {
      Swal.fire({
        title: 'Checkout gagal',
        text: 'Anda harus login terlebih dahulu',
        icon: 'error',
        confirmButtonColor: '#4A90E2',
      });
      router.push(`/login?redirect=/checkout?course=${courseTypeSlug}`);
      return;
    }

    if (!window.snap) {
      Swal.fire({
        title: 'Checkout gagal',
        text: 'Sistem pembayaran belum siap. Silakan coba lagi.',
        icon: 'error',
        confirmButtonColor: '#4A90E2',
      });
      return;
    }

    setProcessingPayment(true);
    setError(null);

    try {
      console.log('🚀 Starting checkout process');
      console.log('📦 Course type data:', courseType);

      // STEP 1: Create transaction in database first
      console.log('🔄 Creating transaction in database');
      const saveResponse = await initiateCheckout({
        courseType,
        promoCode: promoApplied ? promoCode : undefined,
        promoDiscountType,
        promoDiscount,
      });

      if (saveResponse.error) {
        // Check if the error is about already purchasing the class
        if (saveResponse.error.includes('sudah membeli kelas ini')) {
          Swal.fire({
            title: 'Informasi',
            text: 'Anda sudah membeli kelas ini. Anda akan dialihkan ke dashboard.',
            icon: 'info',
            confirmButtonColor: '#4A90E2',
            confirmButtonText: 'Lihat Dashboard',
          }).then(() => {
            router.push('/dashboard');
          });
          return;
        }
        // Check if the error is about having an existing unpaid transaction
        else if (saveResponse.error.includes('transaksi yang belum selesai') && saveResponse.existingTransactionId && saveResponse.existingTransactionCode) {
          // Ask user if they want to continue with existing transaction or create a new one
          const result = await Swal.fire({
            title: 'Transaksi Ditemukan',
            text: 'Anda memiliki transaksi yang belum selesai. Lanjutkan transaksi yang ada atau buat baru?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4A90E2',
            cancelButtonColor: '#718096',
            confirmButtonText: 'Lanjutkan yang Ada',
            cancelButtonText: 'Buat Baru',
          });

          if (result.isConfirmed) {
            // Continue with existing transaction
            await openMidtransPopup(saveResponse.existingTransactionId, saveResponse.existingTransactionCode);
          } else {
            // Show confirmation about deleting previous transaction
            const confirmDelete = await Swal.fire({
              title: 'Konfirmasi',
              text: 'Transaksi sebelumnya akan dihapus dan transaksi baru akan dibuat. Lanjutkan?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#dc2626',
              cancelButtonColor: '#718096',
              confirmButtonText: 'Ya, Hapus & Buat Baru',
              cancelButtonText: 'Batal',
            });

            if (!confirmDelete.isConfirmed) {
              setProcessingPayment(false);
              return;
            }

            // Force create a new transaction by adding forceNew=true parameter
            const newResponse = await initiateCheckout({
              courseType,
              promoCode: promoApplied ? promoCode : undefined,
              promoDiscountType,
              promoDiscount,
              forceNew: true, // Add this parameter
            });

            if (newResponse.error) {
              throw new Error(newResponse.error);
            }

            // Store the current transaction ID
            setCurrentTransactionId(newResponse.transactionId ? newResponse.transactionId : null);

            // Continue with the new transaction
            const response = await fetch('/api/midtrans/create-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                courseType,
                promoCode: promoApplied ? promoCode : undefined,
                promoDiscountType,
                promoDiscount,
                transactionId: newResponse.transactionId,
                transactionCode: newResponse.transactionCode,
              }),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
              throw new Error(data.error || 'Gagal mendapatkan token pembayaran');
            }

            window.snap?.pay(data.token, {
              onSuccess: async (result: any) => {
                console.log('✅ Payment success:', result);
                router.push(`/checkout/success?id=${newResponse.transactionId}`);
              },
              onPending: (result: any) => {
                console.log('⏳ Payment pending:', result);
                router.push(`/checkout/success?id=${newResponse.transactionId}`);
              },
              onError: (result: any) => {
                console.error('❌ Payment error:', result);
                Swal.fire({
                  title: 'Pembayaran gagal',
                  text: 'Terjadi kesalahan saat memproses pembayaran',
                  icon: 'error',
                  confirmButtonColor: '#4A90E2',
                });
                setProcessingPayment(false);
              },
              onClose: () => {
                console.log('⚠️ Customer closed the popup');
                // Don't redirect or show alert when user closes the popup
                // Just reset the processing state
                setProcessingPayment(false);

                // Optionally show a small toast notification
                Swal.fire({
                  title: 'Pembayaran ditunda',
                  text: 'Anda dapat melanjutkan pembayaran kapan saja',
                  icon: 'info',
                  confirmButtonColor: '#4A90E2',
                });
              },
              skipOrderSummary: true,
            });

            return;
          }
          return;
        } else {
          // Handle other errors
          throw new Error(saveResponse.error);
        }
      }

      console.log('✅ Transaction created:', saveResponse);

      // Store the current transaction ID
      setCurrentTransactionId(saveResponse.transactionId ? saveResponse.transactionId : null);

      // STEP 2: Request Midtrans token from server using the SAME transaction ID
      console.log('🔄 Requesting Midtrans token from server');
      const response = await fetch('/api/midtrans/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseType,
          promoCode: promoApplied ? promoCode : undefined,
          promoDiscountType,
          promoDiscount,
          transactionId: saveResponse.transactionId,
          transactionCode: saveResponse.transactionCode, // Pass the transaction code from initiateCheckout
        }),
      });

      const data = await response.json();
      console.log('✅ Server response:', data);

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Gagal mendapatkan token pembayaran');
      }

      // STEP 3: Show Midtrans Snap
      console.log('🔄 Opening Midtrans Snap payment popup with token:', data.token);
      window.snap?.pay(data.token, {
        onSuccess: async (result: any) => {
          console.log('✅ Payment success:', result);

          // Immediately mark transaction as paid for credit card payments
          if (result.payment_type === 'credit_card') {
            console.log('💳 Credit card payment successful, updating status');
          }

          // Redirect to success page
          router.push(`/checkout/success?id=${saveResponse.transactionId}`);
        },
        onPending: (result: any) => {
          console.log('⏳ Payment pending:', result);
          router.push(`/checkout/success?id=${saveResponse.transactionId}`);
        },
        onError: (result: any) => {
          console.error('❌ Payment error:', result);
          Swal.fire({
            title: 'Pembayaran gagal',
            text: 'Terjadi kesalahan saat memproses pembayaran',
            icon: 'error',
            confirmButtonColor: '#4A90E2',
          });
          setProcessingPayment(false);
        },
        onClose: () => {
          console.log('⚠️ Customer closed the popup');
          // Don't redirect or show alert when user closes the popup
          // Just reset the processing state
          setProcessingPayment(false);

          // Optionally show a small toast notification
          Swal.fire({
            title: 'Pembayaran ditunda',
            text: 'Anda dapat melanjutkan pembayaran kapan saja',
            icon: 'info',
            confirmButtonColor: '#4A90E2',
          });
        },
        skipOrderSummary: true,
      });
    } catch (err) {
      console.error('❌ Checkout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses pembayaran';
      setError(errorMessage);
      Swal.fire({
        title: 'Checkout gagal',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#4A90E2',
      });
      setProcessingPayment(false);
    }
  };

  // Function to resume payment for the current transaction
  const resumePayment = async () => {
    if (!currentTransactionId) {
      Swal.fire({
        title: 'Tidak ada transaksi aktif',
        text: 'Silakan mulai checkout baru',
        icon: 'error',
        confirmButtonColor: '#4A90E2',
      });
      return;
    }

    setProcessingPayment(true);

    try {
      // Get transaction details from the server
      const response = await fetch(`/api/transaction/${currentTransactionId}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Gagal mendapatkan data transaksi');
      }

      // Open Midtrans popup with the transaction
      await openMidtransPopup(currentTransactionId, data.transactionCode);
    } catch (err) {
      console.error('Error resuming payment:', err);
      Swal.fire({
        title: 'Gagal melanjutkan pembayaran',
        text: 'Silakan coba lagi atau mulai checkout baru',
        icon: 'error',
        confirmButtonColor: '#4A90E2',
      });
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center max-w-md mx-auto">
            <Loader2 className="h-16 w-16 animate-spin text-[#5596DF]" />
            <p className="mt-6 text-xl text-gray-700 font-medium">Memuat data checkout...</p>
            <p className="text-gray-500 mt-2">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !courseType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center max-w-md mx-auto">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <p className="mt-6 text-xl text-gray-800 font-semibold text-center">{error || 'Kelas tidak ditemukan'}</p>
            <p className="text-gray-500 mt-2 text-center mb-6">Silakan kembali ke halaman kelas untuk memilih kelas lainnya</p>
            <Button className="w-full bg-[#5596DF] hover:bg-blue-700 text-white" size="lg" onClick={() => router.push('/kelas')}>
              Kembali ke Daftar Kelas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate discount amount if applicable
  let discountAmount = 0;
  if (courseType.is_discount && courseType.discount && courseType.discount_type) {
    if (courseType.discount_type === 'percentage') {
      discountAmount = (courseType.normal_price * courseType.discount) / 100;
    } else {
      discountAmount = courseType.discount;
    }
  }

  // Calculate promo discount amount
  let promoDiscountAmount = 0;
  if (promoApplied && promoDiscount) {
    if (promoDiscountType === 'percentage') {
      promoDiscountAmount = (courseType.normal_price * promoDiscount) / 100;
    } else {
      promoDiscountAmount = promoDiscount;
    }
  }

  // Calculate final price
  const finalPrice = Math.max(courseType.normal_price - discountAmount - promoDiscountAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Load Midtrans Snap JavaScript */}
      <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} onLoad={() => setMidtransLoaded(true)} />

      <Navbar />

      <div className="max-w-5xl mx-auto py-12 px-4 md:px-6 mt-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">Checkout</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Selesaikan pembayaran untuk mulai belajar</p>
        </div>

        {/* Checkout Steps */}
        <div className="mb-10">
          <div className="flex justify-center items-center max-w-md mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#5596DF] flex items-center justify-center text-white">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <span className="text-sm mt-2 font-medium text-[#5596DF]">Keranjang</span>
            </div>
            <div className="h-0.5 w-16 md:w-24 bg-[#5596DF]"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#5596DF] flex items-center justify-center text-white">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="text-sm mt-2 font-medium text-[#5596DF]">Pembayaran</span>
            </div>
            <div className="h-0.5 w-16 md:w-24 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-sm mt-2 font-medium text-gray-500">Selesai</span>
            </div>
          </div>
        </div>

        {/* Tampilkan peringatan jika tidak ada session */}
        {status === 'unauthenticated' && authChecked && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
            <p className="text-amber-700 flex items-center text-sm md:text-base">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>
                Anda belum login. Silakan{' '}
                <Button variant="link" className="p-0 h-auto text-[#5596DF] font-semibold" onClick={() => router.push(`/login?redirect=/checkout?course=${courseTypeSlug}`)}>
                  login terlebih dahulu
                </Button>{' '}
                untuk melanjutkan checkout.
              </span>
            </p>
          </div>
        )}

        {/* Show resume payment button if there's a current transaction */}
        {currentTransactionId && !processingPayment && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-blue-700 flex items-center text-sm md:text-base mb-4 md:mb-0">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Anda memiliki transaksi yang belum selesai. Lanjutkan pembayaran atau mulai checkout baru.</span>
              </p>
              <Button className="bg-[#5596DF] hover:bg-blue-700 text-white" onClick={resumePayment}>
                <CreditCard className="mr-2 h-4 w-4" /> Lanjutkan Pembayaran
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardHeader className="bg-[#5596DF] text-white">
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Ringkasan Pesanan
                </CardTitle>
                <CardDescription className="text-blue-100">Detail kelas yang akan Anda beli</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden shadow-md">
                    <Image src={courseType.course_thumbnail || '/placeholder.svg?height=200&width=400'} alt={courseType.course_title || 'Course'} fill className="object-cover" />
                    {courseType.is_discount && courseType.discount && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 text-xs font-bold">{courseType.discount_type === 'percentage' ? `${courseType.discount}% OFF` : 'DISKON'}</div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{courseType.course_title}</h3>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                        {courseType.type === 'batch' ? 'Batch' : courseType.type === 'private' ? 'Private' : 'Group'}
                      </Badge>
                      {courseType.batch_number && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                          Batch {courseType.batch_number}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 flex items-center">
                      <span className="text-gray-500 text-sm mr-2">Harga:</span>
                      {courseType.is_discount && courseType.discount ? (
                        <div className="flex items-center">
                          <span className="text-gray-400 line-through text-sm mr-2">Rp {courseType.normal_price.toLocaleString('id-ID')}</span>
                          <span className="text-lg font-bold text-[#5596DF]">Rp {(courseType.normal_price - discountAmount).toLocaleString('id-ID')}</span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-[#5596DF]">Rp {courseType.normal_price.toLocaleString('id-ID')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promo Code - Only show if is_voucher is true */}
            {courseType.is_voucher && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-purple-600 text-white">
                  <CardTitle className="flex items-center">
                    <Tag className="mr-2 h-5 w-5" />
                    Kode Promo
                  </CardTitle>
                  <CardDescription className="text-purple-100">Masukkan kode promo jika Anda memilikinya</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Masukkan kode promo"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={promoApplied || validatingPromo}
                        className={cn('border-2 focus-visible:ring-blue-500', promoApplied ? 'border-green-500 bg-green-50' : 'border-gray-200')}
                      />
                    </div>
                    <Button
                      variant={promoApplied ? 'outline' : 'default'}
                      onClick={handleApplyPromo}
                      disabled={promoApplied || validatingPromo || !promoCode.trim()}
                      className={promoApplied ? 'border-2 border-green-500 text-green-600' : 'bg-purple-600 hover:bg-purple-700'}
                    >
                      {validatingPromo ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memvalidasi
                        </>
                      ) : promoApplied ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" /> Diterapkan
                        </>
                      ) : (
                        'Terapkan'
                      )}
                    </Button>
                  </div>
                  {promoApplied && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-start">
                      <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Kode promo berhasil diterapkan!</p>
                        <p className="mt-1">Anda mendapatkan diskon {promoDiscountType === 'percentage' ? `${promoDiscount}%` : `Rp ${promoDiscount.toLocaleString('id-ID')}`}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Summary */}
          <div>
            <Card className="border-0 shadow-lg sticky top-24">
              <CardHeader className="bg-gray-800 text-white">
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Ringkasan Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Harga Kelas</span>
                    <span className="font-medium">Rp {courseType.normal_price.toLocaleString('id-ID')}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" /> Diskon Kelas
                      </span>
                      <span className="font-medium">- Rp {discountAmount.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  {promoApplied && promoDiscountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" /> Diskon Promo {promoDiscountType === 'percentage' ? `(${promoDiscount}%)` : ''}
                      </span>
                      <span className="font-medium">- Rp {promoDiscountAmount.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  <Separator className="my-2" />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-[#5596DF]">Rp {finalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Button className="w-full bg-[#5596DF] hover:bg-blue-700 text-white" size="lg" onClick={handleCheckout} disabled={processingPayment || status === 'unauthenticated' || !midtransLoaded}>
                    {processingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" /> Bayar Sekarang
                      </>
                    )}
                  </Button>

                  {status === 'unauthenticated' && <p className="text-amber-600 text-sm mt-2 text-center">Anda perlu login terlebih dahulu</p>}

                  {!midtransLoaded && <p className="text-amber-600 text-sm mt-2 text-center">Memuat sistem pembayaran...</p>}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 px-6 py-4">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Pembayaran aman & terenkripsi</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Akses kelas setelah pembayaran berhasil</span>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <div className="mt-6 text-sm text-gray-600 bg-white p-4 rounded-lg shadow border-0">
              <p className="text-center">
                Dengan melakukan pembayaran, Anda menyetujui{' '}
                <a href="#" className="text-[#5596DF] hover:underline font-medium">
                  Syarat dan Ketentuan
                </a>{' '}
                serta{' '}
                <a href="#" className="text-[#5596DF] hover:underline font-medium">
                  Kebijakan Privasi
                </a>{' '}
                kami.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
