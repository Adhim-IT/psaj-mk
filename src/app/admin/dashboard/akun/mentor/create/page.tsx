import { MentorForm } from "@/components/admin/akun/mentor/mentor-form"
import { getRoles } from "@/lib/role"

export default async function CreateMentorPage() {
  const roles = await getRoles()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tambah Mentor</h1>
      </div>
      <MentorForm roles={roles} />
    </div>
  )
}

