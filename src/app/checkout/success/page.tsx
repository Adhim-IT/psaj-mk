'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, AlertCircle, Clock, CreditCard, ArrowLeft, Receipt, Calendar, User } from 'lucide-react';
import { getTransactionById } from '@/lib/checkout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/user/Navbar';
import Footer from '@/components/user/Footer';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('id');

  const [transaction, setTransaction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);

  // Function to check transaction status
  const checkTransactionStatus = async () => {
    if (!transactionId) {
      console.log('❌ No transaction ID provided');
      setError('Transaksi tidak ditemukan');
      return;
    }

    try {
      console.log(`🔄 Checking transaction status for ID: ${transactionId}`);
      const result = await getTransactionById(transactionId);
      console.log('📦 Transaction data:', result);

      if (result.error) {
        console.log('❌ Error fetching transaction:', result.error);
        setError(result.error);
        return;
      }

      // Make sure transaction exists before accessing its properties
      if (result.transaction) {
        console.log(`✅ Transaction found with status: ${result.transaction.status}`);
        setTransaction(result.transaction);

        // If transaction is still unpaid and we haven't polled too many times, continue polling
        if (result.transaction.status === 'unpaid' && pollingCount < 10) {
          console.log(`⏳ Transaction still unpaid, polling again (${pollingCount + 1}/10)`);
          setPollingCount((prev) => prev + 1);
          // Poll again after 3 seconds
          setTimeout(checkTransactionStatus, 3000);
        }
      } else {
        console.log('❌ Transaction data is incomplete');
        setError('Data transaksi tidak lengkap');
      }
    } catch (err) {
      console.error('❌ Error loading transaction:', err);
      setError('Gagal memuat data transaksi');
    }
  };

  useEffect(() => {
    checkTransactionStatus();
  }, [transactionId]);

  // Function to handle manual payment confirmation
  const handleManualCheck = () => {
    setIsProcessing(true);
    setPollingCount(0); // Reset polling count

    checkTransactionStatus().finally(() => {
      setIsProcessing(false);
    });
  };

  // Function to handle payment retry
  const handleRetryPayment = async (transactionId: string, transactionCode: string) => {
    try {
      setIsProcessing(true);

      // Request a new Midtrans token for the existing transaction
      const response = await fetch('/api/midtrans/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          transactionCode,
          retryPayment: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Gagal mendapatkan token pembayaran');
      }

      // Open Midtrans payment popup
      window.snap?.pay(data.token, {
        onSuccess: (result: any) => {
          console.log('✅ Payment success:', result);
          window.location.reload();
        },
        onPending: (result: any) => {
          console.log('⏳ Payment pending:', result);
          window.location.reload();
        },
        onError: (result: any) => {
          console.error('❌ Payment error:', result);
          setError('Terjadi kesalahan saat memproses pembayaran');
        },
        onClose: () => {
          console.log('⚠️ Customer closed the popup');
          setError('Pembayaran dibatalkan');
        },
      });
    } catch (err) {
      console.error('Error retrying payment:', err);
      setError('Gagal memuat ulang pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderContent = () => {
    if (error && !transaction) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg text-gray-800 font-medium">{error || 'Transaksi tidak ditemukan'}</p>
          <Button className="mt-6" onClick={() => router.push('/kelas')}>
            Kembali ke Daftar Kelas
          </Button>
        </div>
      );
    }

    // Show transaction details immediately, even if data is still loading
    const isPaid = transaction?.status === 'paid';
    const isUnpaid = transaction?.status === 'unpaid';

    return (
      <Card className={`border-2 ${isPaid ? 'border-green-100' : 'border-amber-100'} w-full max-w-3xl mx-auto shadow-lg`}>
        <CardHeader className={`${isPaid ? 'bg-green-50' : 'bg-amber-50'} text-center`}>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">{isPaid ? <CheckCircle className="h-10 w-10 text-green-500" /> : <Clock className="h-10 w-10 text-amber-500" />}</div>
            <CardTitle className="text-2xl font-bold">{isPaid ? 'Pembayaran Berhasil' : 'Menunggu Pembayaran'}</CardTitle>
            {transaction ? (
              <CardDescription className="text-base mt-1">
                Kode Transaksi: <span className="font-medium">{transaction.code}</span>
              </CardDescription>
            ) : (
              <CardDescription className="text-base mt-1">Memuat detail transaksi...</CardDescription>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {transaction ? (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Receipt className="mr-2 h-5 w-5 text-gray-500" />
                  Detail Pesanan
                </h3>
                <div className="bg-gray-50 p-5 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Kelas</span>
                    <span className="font-medium">{transaction.courses?.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Nama</span>
                    <span className="font-medium">{transaction.students?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{transaction.students?.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tanggal Transaksi</span>
                    <span className="font-medium">{formatDate(transaction.created_at)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Metode Pembayaran</span>
                    <span className="font-medium">{transaction.payment_method || transaction.payment_type || 'QRIS'}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={`${isPaid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{isPaid ? 'Pembayaran Berhasil' : 'Menunggu Pembayaran'}</Badge>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-muted-foreground font-medium">Total Pembayaran</span>
                    <span className="font-bold text-lg">Rp {Number(transaction.final_price).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-gray-500" />
                  Informasi Kelas
                </h3>
                <div className="bg-gray-50 p-5 rounded-lg">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                      <Image src={transaction.courses?.thumbnail || '/placeholder.svg?height=100&width=100'} alt={transaction.courses?.title || 'Course'} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-lg">{transaction.courses?.title}</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="bg-gray-100">
                          Tipe: {transaction.type === 'batch' ? 'Batch' : transaction.type === 'private' ? 'Private' : 'Group'}
                        </Badge>
                        {transaction.batch_number && (
                          <Badge variant="outline" className="bg-gray-100">
                            Batch {transaction.batch_number}
                          </Badge>
                        )}
                        {transaction.courses?.level && (
                          <Badge variant="outline" className="bg-gray-100">
                            Level: {transaction.courses.level}
                          </Badge>
                        )}
                      </div>
                      {isPaid && (
                        <div className="mt-3">
                          <Badge className="bg-green-100 text-green-800 px-3 py-1">Akses Kelas Aktif</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {transaction.courses?.description && (
                    <div className="mt-4 text-sm text-gray-600">
                      <Separator className="mb-3" />
                      <p>{transaction.courses.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {transaction.instructor && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <User className="mr-2 h-5 w-5 text-gray-500" />
                    Informasi Instruktur
                  </h3>
                  <div className="bg-gray-50 p-5 rounded-lg flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                      <Image src={transaction.instructor.avatar || '/placeholder.svg?height=64&width=64'} alt={transaction.instructor.name || 'Instructor'} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-medium">{transaction.instructor.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{transaction.instructor.specialization || 'Instructor'}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Placeholder content while transaction is loading
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Receipt className="mr-2 h-5 w-5 text-gray-500" />
                  Detail Pesanan
                </h3>
                <div className="bg-gray-50 p-5 rounded-lg space-y-3 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-gray-500" />
                  Informasi Kelas
                </h3>
                <div className="bg-gray-50 p-5 rounded-lg animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-2 pb-6">
          <div className="text-sm text-muted-foreground text-center px-4">
            {isPaid ? 'Terima kasih atas pembayaran Anda. Anda sekarang dapat mengakses kelas ini di dashboard.' : 'Harap selesaikan pembayaran Anda untuk mendapatkan akses ke kelas ini.'}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button className="flex-1 gap-2" onClick={() => router.push('/dashboard/courses')}>
              <CheckCircle className="h-4 w-4" />
              Lihat Kelas Saya
            </Button>
            <Button className="flex-1 gap-2" variant="outline" onClick={() => router.push('/kelas')}>
              <ArrowLeft className="h-4 w-4" />
              Jelajahi Kelas Lainnya
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center py-12 px-4">{renderContent()}</main>
      <Footer />
    </>
  );
}
