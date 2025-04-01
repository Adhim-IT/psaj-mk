import { getMentorById } from "@/lib/mentor"
import { getRoles } from "@/lib/role"
import { MentorForm } from "@/components/admin/akun/mentor/mentor-form"
import { notFound } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Home } from "lucide-react"

interface EditMentorPageProps {
  params: {
    id: string
  }
}

export default async function EditMentorPage({ params }: EditMentorPageProps) {
  const mentor = await getMentorById(params.id)
  const roles = await getRoles()

  if (!mentor) {
    return notFound()
  }

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">
              <Home className="h-4 w-4 mr-1" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard/akun">Akun</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard/akun/mentor">Mentor</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Edit</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Mentor</h1>
      </div>
      <MentorForm mentor={mentor} roles={roles} />
    </div>
  )
}

