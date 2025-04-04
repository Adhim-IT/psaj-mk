import { getStudentGroups } from '@/lib/kelompok-kelas';
import { StudentGroupList } from '@/src/components/admin/kelas/kelompok-kelas/GroupCLass-list';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HomeIcon } from 'lucide-react';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Loading component for Suspense
function StudentGroupsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-full max-w-md" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="rounded-md border">
        <div className="p-4 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="space-y-2">
            {Array(5)
              .fill(null)
              .map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Dynamic data fetching component
async function StudentGroupsData() {
  // Add cache-busting query parameter
  const timestamp = Date.now();
  const { studentGroups, error } = await getStudentGroups();

  return <>{error ? <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">{error}</div> : <StudentGroupList studentGroups={studentGroups || []} />}</>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function StudentGroupsPage() {
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
            <BreadcrumbLink href="/admin/dashboard/kelas">Kelas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Kelompok</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Kelompok Kelas</h1>
        <p className="text-muted-foreground">Kelola daftar kelompok kelas Anda.</p>
      </div>

      <Suspense fallback={<StudentGroupsLoading />}>
        <StudentGroupsData />
      </Suspense>
    </div>
  );
}
