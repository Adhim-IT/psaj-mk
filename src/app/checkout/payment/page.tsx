'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { getTransactionById } from '@/lib/checkout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function PaymentInstructionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('id');
  const { toast } = useToast();

  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadTransaction() {
      if (!transactionId) {
        setError('Transaksi tidak ditemukan');
        setLoading(false);
        return;
      }

      try {
        const result = await getTransactionById(transactionId);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        setTransaction(result.transaction);
      } catch (err) {
        console.error('Error loading transaction:', err);
        setError('Gagal memuat data transaksi');
      } finally {
        setLoading(false);
      }
    }

    loadTransaction();
  }, [transactionId]);

  const handleCopyVA = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);

    toast({
      title: 'Berhasil disalin',
      description: 'Nomor virtual account telah disalin ke clipboard',
      duration: 2000,
    });

    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[#4A90E2]" />
        <p className="mt-4 text-lg text-gray-600">Memuat instruksi pembayaran...</p>
      </div>
    );
  }

  if (error || !transaction) {
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

  // This is a mock since we don't have the actual VA number from Midtrans in this example
  // In a real implementation, you would get this from the Midtrans response
  const vaNumber = '12345678901';
  const bankName = 'BCA';

  return (
    <div className="container max-w-3xl py-12 px-4 md:px-6 mt-16">
      <Card className="border-2 border-blue-100">
        <CardHeader className="bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Instruksi Pembayaran</CardTitle>
              <CardDescription>Kode Transaksi: {transaction.code}</CardDescription>
            </div>
            <div className="p-2 bg-white rounded-full">
              <Image src="/placeholder.svg?height=40&width=40" alt="Bank Logo" width={40} height={40} className="object-contain" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Detail Pesanan</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Kelas</span>
                  <span className="font-medium">{transaction.courses.title}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Nama</span>
                  <span className="font-medium">{transaction.students.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Pembayaran</span>
                  <span className="font-bold text-lg">Rp {Number(transaction.final_price).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Virtual Account {bankName}</h3>
              <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                <div className="font-mono text-lg font-bold">{vaNumber}</div>
                <Button variant="outline" size="sm" onClick={() => handleCopyVA(vaNumber)} className="flex items-center gap-1">
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Disalin' : 'Salin'}
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Cara Pembayaran</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Mobile Banking</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Buka aplikasi {bankName} Mobile Banking</li>
                    <li>Pilih menu "Transfer"</li>
                    <li>Pilih "Virtual Account"</li>
                    <li>Masukkan nomor Virtual Account: {vaNumber}</li>
                    <li>Periksa informasi pembayaran dan konfirmasi</li>
                    <li>Masukkan PIN Mobile Banking Anda</li>
                    <li>Pembayaran selesai</li>
                  </ol>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Internet Banking</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Login ke Internet Banking {bankName}</li>
                    <li>Pilih menu "Transfer"</li>
                    <li>Pilih "Transfer ke {bankName} Virtual Account"</li>
                    <li>Masukkan nomor Virtual Account: {vaNumber}</li>
                    <li>Periksa informasi pembayaran dan konfirmasi</li>
                    <li>Masukkan token/OTP</li>
                    <li>Pembayaran selesai</li>
                  </ol>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">ATM {bankName}</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Masukkan kartu ATM dan PIN Anda</li>
                    <li>Pilih menu "Transaksi Lainnya"</li>
                    <li>Pilih menu "Transfer"</li>
                    <li>Pilih "Ke Rek {bankName} Virtual Account"</li>
                    <li>Masukkan nomor Virtual Account: {vaNumber}</li>
                    <li>Masukkan jumlah pembayaran</li>
                    <li>Konfirmasi pembayaran</li>
                    <li>Pembayaran selesai</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground text-center">Pembayaran akan diverifikasi secara otomatis. Harap selesaikan pembayaran sebelum 24 jam.</div>
          <Button className="w-full" variant="outline" onClick={() => router.push('/dashboard/courses')}>
            Cek Status Pembayaran
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
