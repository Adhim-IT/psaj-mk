import { getCourseTypes } from "@/lib/course-types"
import { CourseTypeList } from "@/components/admin/tipe-kelas/course-type-list"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { HomeIcon } from "lucide-react"
import { CourseType } from "@/types"

export default async function CourseTypesPage() {
  const { courseTypes, error } = await getCourseTypes()

  // Manually convert Decimal objects to numbers
  const formattedCourseTypes = courseTypes
    ? courseTypes.map((ct: CourseType) => ({
        ...ct,
        normal_price: Number(ct.normal_price),
        discount: ct.discount ? Number(ct.discount) : null,
      }))
    : []

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
            <BreadcrumbLink>Tipe</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Tipe Kelas</h1>
        <p className="text-muted-foreground">Kelola tipe-tipe kelas yang tersedia.</p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">{error}</div>
      ) : (
        <CourseTypeList courseTypes={formattedCourseTypes} />
      )}
    </div>
  )
}

