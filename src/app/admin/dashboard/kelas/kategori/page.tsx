import { getCourseCategories } from "@/lib/ketagori-kelas";
import { CourseCategoryList } from "@/src/components/admin/kelas/categoryclass/categoryclass-list";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { HomeIcon } from "lucide-react";

export default async function CategoriesPage() {
  const { categories: CourseCategory, error } = await getCourseCategories();

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
            <BreadcrumbLink>Kategori</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kategori Manajemen</h1>
        <p className="text-muted-foreground">Kelola kategori kelas yang tersedia.</p>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>
      ) : (
        <CourseCategoryList CourseCategory={CourseCategory || []} />
      )}
    </div>
  );
}
