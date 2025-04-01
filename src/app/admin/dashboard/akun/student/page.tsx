import { getStudents } from "@/lib/student"
import { StudentList } from "@/components/admin/akun/student/student-list"

export default async function StudentPage() {
  const students = await getStudents()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manajemen Student</h1>
      </div>
      <StudentList students={students} />
    </div>
  )
}

