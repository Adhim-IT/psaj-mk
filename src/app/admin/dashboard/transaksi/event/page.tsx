import type { Metadata } from 'next';
import { Home } from 'lucide-react';
import { getEventRegistrants } from '@/lib/event-register-admin';
import { EventRegistrantTable } from '@/components/admin/transaksi/event/page';
import { eventRegistrantFilterSchema } from '@/lib/zod';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export const metadata: Metadata = {
  title: 'Transaksi Event - Admin',
  description: 'Kelola transaksi event di platform Anda',
};

// Updated interface for Next.js 15
interface PageProps {
  params: Promise<{}>;
  searchParams: Promise<{
    status?: string;
    event_id?: string;
    student_id?: string;
    search?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function TransaksiEventPage({ searchParams }: PageProps) {
  // Parse and validate search params
  const resolvedSearchParams = await searchParams;
  const filters = eventRegistrantFilterSchema.parse({
    status: resolvedSearchParams.status || undefined,
    event_id: resolvedSearchParams.event_id || undefined,
    student_id: resolvedSearchParams.student_id || undefined,
    search: resolvedSearchParams.search || undefined,
    page: resolvedSearchParams.page ? Number.parseInt(resolvedSearchParams.page) : 1,
    limit: resolvedSearchParams.limit ? Number.parseInt(resolvedSearchParams.limit) : 10,
  });

  const { data: registrants, meta } = await getEventRegistrants(filters);

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
            <BreadcrumbLink>Event</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Transaksi Event</h1>
        <p className="text-muted-foreground">Kelola semua transaksi event di platform Anda</p>
      </div>

      <EventRegistrantTable registrants={registrants} meta={meta} />
    </div>
  );
}
