import { StudentForm } from "@/components/admin/akun/student/student-form"
import { getRoles } from "@/lib/role"

export default async function CreateStudentPage() {
  const roles = await getRoles()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tambah Student</h1>
      </div>
      <StudentForm roles={roles} />
    </div>
  )
}

