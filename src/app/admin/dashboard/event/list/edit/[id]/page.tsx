import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getEventById, getMentorsForDropdown } from '@/lib/list-event';
import { EventForm } from '@/components/admin/event/list-event/event-form';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HomeIcon } from 'lucide-react';
import type { EventFormData } from '@/types';

// Perbarui interface untuk Next.js 15
interface EditEventPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// Ubah menjadi async function untuk bisa menggunakan await params
export default async function EditEventPage({ params }: EditEventPageProps) {
  // Await params sebelum mengakses propertinya
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">
              <HomeIcon className="h-4 w-4 mr-1" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard/event">Event</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard/event/list">List</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Edit</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Event</h1>
        <p className="text-muted-foreground">Ubah detail event yang ada.</p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <EditEventForm id={id} />
      </Suspense>
    </div>
  );
}

async function EditEventForm({ id }: { id: string }) {
  const [eventResult, mentorsResult] = await Promise.all([getEventById(id), getMentorsForDropdown()]);

  if (!eventResult.success || !mentorsResult.success) {
    return <div className="text-red-500">Error loading data</div>;
  }

  if (!eventResult.data) {
    return notFound();
  }

  const initialData: EventFormData = {
    id: eventResult.data.id,
    mentor_id: eventResult.data.mentor_id,
    title: eventResult.data.title,
    slug: eventResult.data.slug,
    thumbnail: eventResult.data.thumbnail,
    description: eventResult.data.description,
    start_date: eventResult.data.start_date,
    end_date: eventResult.data.end_date,
    price: eventResult.data.price ? eventResult.data.price.toString() : '',
    whatsapp_group_link: eventResult.data.whatsapp_group_link,
    is_active: eventResult.data.is_active,
  };

  return <EventForm initialData={initialData} mentors={mentorsResult.data || []} isEditing={true} />;
}
