import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import type { Decimal } from '@prisma/client/runtime/library';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getCourseTransactionById } from '@/lib/course-transaksi-admin';
import { CourseTransactionStatus, CourseTransactionType } from '@/types';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export const metadata: Metadata = {
  title: 'Detail Transaksi - Admin',
  description: 'Lihat detail transaksi kelas',
};

// Perbarui interface untuk Next.js 15
interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TransaksiDetailPage({ params }: PageProps) {
  // Await params sebelum mengakses propertinya
  const { id } = await params;

  let transaction;

  try {
    transaction = await getCourseTransactionById(id);
  } catch (error) {
    return notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case CourseTransactionStatus.PAID:
        return <Badge className="bg-green-500">Dibayar</Badge>;
      case CourseTransactionStatus.UNPAID:
        return <Badge className="bg-red-500">Belum Dibayar</Badge>;
      case CourseTransactionStatus.FAILED:
        return <Badge className="bg-red-700">Gagal</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case CourseTransactionType.GROUP:
        return 'Grup';
      case CourseTransactionType.PRIVATE:
        return 'Private';
      case CourseTransactionType.BATCH:
        return 'Batch';
      default:
        return type;
    }
  };

  const formatPrice = (price: Decimal | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(Number(price));
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="container py-10">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">
              <Home className="h-4 w-4 mr-1" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/transaksi">Transaksi</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/transaksi/kelas">Kelas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Detail</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/admin/transaksi/kelas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Detail Transaksi</h1>
        <p className="text-muted-foreground">Lihat detail transaksi kelas dengan kode {transaction.code}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Transaksi</CardTitle>
            <CardDescription>Detail transaksi kelas</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="font-medium">Kode Transaksi</dt>
                <dd>{transaction.code}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Status</dt>
                <dd>{getStatusBadge(transaction.status as string)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Tipe Transaksi</dt>
                <dd className="capitalize">{getTypeName(transaction.type as string)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Batch</dt>
                <dd>{transaction.batch_number || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Tanggal Dibuat</dt>
                <dd>{formatDate(transaction.created_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Terakhir Diperbarui</dt>
                <dd>{formatDate(transaction.updated_at)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Pembayaran</CardTitle>
            <CardDescription>Detail pembayaran kelas</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="font-medium">Harga Asli</dt>
                <dd>{formatPrice(transaction.original_price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Diskon</dt>
                <dd>{transaction.discount ? formatPrice(transaction.discount) : '-'}</dd>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <dt>Total Pembayaran</dt>
                <dd>{formatPrice(transaction.final_price)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Kelas</CardTitle>
            <CardDescription>Detail kelas yang dibeli</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="font-medium">ID Kelas</dt>
                <dd>{transaction.course_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Judul Kelas</dt>
                <dd>{transaction.courses.title}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Siswa</CardTitle>
            <CardDescription>Detail siswa yang membeli kelas</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="font-medium">ID Siswa</dt>
                <dd>{transaction.student_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Nama</dt>
                <dd>{transaction.students.name}</dd>
              </div>
              
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
