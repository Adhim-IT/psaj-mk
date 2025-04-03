import { notFound } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HomeIcon } from 'lucide-react';
import TagForm from '@/components/admin/artikel/tag/TagClass-form';
import { getTagById } from '@/lib/tag';

// Perbarui interface untuk Next.js 15
interface EditTagPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EditTagPage({ params }: EditTagPageProps) {
  // Await params sebelum mengakses propertinya
  const { id } = await params;

  const { tag, error } = await getTagById(id);

  if (error || !tag) {
    return notFound();
  }

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
            <BreadcrumbLink href="/admin/dashboard/artikel">Artikel</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard/artikel/tag">Tag</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Edit Tag</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Tag</h1>
        <p className="text-muted-foreground">Perbarui informasi tag yang sudah ada.</p>
      </div>

      <TagForm tag={tag} isEditing={true} />
    </div>
  );
}
