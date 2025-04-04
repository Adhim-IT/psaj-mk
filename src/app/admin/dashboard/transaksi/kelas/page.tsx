import type { Metadata } from 'next';
import { Home } from 'lucide-react';
import { getCourseTransactions } from '@/lib/course-transaksi-admin';
import { TransactionTable } from '@/components/admin/transaksi/kelas/transaction-table';
import { courseTransactionFilterSchema } from '@/lib/zod';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export const metadata: Metadata = {
  title: 'Transaksi Kelas - Admin',
  description: 'Kelola transaksi kelas di platform Anda',
};

// Updated interface for Next.js 15
interface PageProps {
  params: Promise<{}>;
  searchParams: Promise<{
    status?: string;
    course_id?: string;
    student_id?: string;
    search?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function TransaksiKelasPage({ searchParams }: PageProps) {
  // Parse and validate search params
  const resolvedSearchParams = await searchParams;
  const filters = courseTransactionFilterSchema.parse({
    status: resolvedSearchParams.status || undefined,
    course_id: resolvedSearchParams.course_id || undefined,
    student_id: resolvedSearchParams.student_id || undefined,
    search: resolvedSearchParams.search || undefined,
    page: resolvedSearchParams.page ? Number.parseInt(resolvedSearchParams.page) : 1,
    limit: resolvedSearchParams.limit ? Number.parseInt(resolvedSearchParams.limit) : 10,
  });

  const { data: transactions, meta } = await getCourseTransactions(filters);

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
            <BreadcrumbLink>Kelas</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Transaksi Kelas</h1>
        <p className="text-muted-foreground">Kelola semua transaksi kelas di platform Anda</p>
      </div>

      <TransactionTable transactions={transactions} meta={meta} />
    </div>
  );
}
