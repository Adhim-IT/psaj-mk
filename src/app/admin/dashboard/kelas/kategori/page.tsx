import { getCourseCategories } from "@/lib/ketagori-kelas"
import { CourseCategoryList } from "@/src/components/admin/categoryclass/categoryclass-list"

export default async function ToolsPage() {
  const { categories: CourseCategory, error } = await getCourseCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Kategori Manajemen </h1>
      </div>

      {error ? <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div> : <CourseCategoryList CourseCategory={CourseCategory || []} />}
    </div>
  )
}

