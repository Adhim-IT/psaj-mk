import { getComments } from '@/lib/article-comments-admin';
import { CommentList } from '@/src/components/admin/artikel/komentar/comment-list';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HomeIcon } from 'lucide-react';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CommentsPage() {
  const { comments, error } = await getComments();

  return (
    <div className="space-y-6">
      <Breadcrumb>
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
            <BreadcrumbLink>Komentar</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Komentar Artikel</h1>
        <p className="text-muted-foreground">Kelola komentar artikel dari pengunjung website.</p>
      </div>

      <Suspense fallback={<CommentListSkeleton />}>{error ? <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">{error}</div> : <CommentList comments={comments || []} />}</Suspense>
    </div>
  );
}

function CommentListSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="p-4">
        <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-1/6 bg-gray-200 rounded animate-pulse ml-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
