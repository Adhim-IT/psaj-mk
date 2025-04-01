import { getMentors } from "@/lib/mentor"
import { MentorList } from "@/components/admin/akun/mentor/mentor-list"

export default async function MentorPage() {
  const mentors = await getMentors()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manajemen Mentor</h1>
      </div>
      <MentorList mentors={mentors} />
    </div>
  )
}

