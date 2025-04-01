import { getStudentById } from "@/lib/student"
import { getRoles } from "@/lib/role"
import { StudentForm } from "@/components/admin/akun/student/student-form"
import { notFound } from "next/navigation"

interface EditStudentPageProps {
  params: {
    id: string
  }
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const student = await getStudentById(params.id)
  const roles = await getRoles()

  if (!student) {
    return notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Student</h1>
      </div>
      <StudentForm student={student} roles={roles} />
    </div>
  )
}

