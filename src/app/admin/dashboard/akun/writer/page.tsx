import { getWriters } from "@/lib/writer"
import { WriterList } from "@/components/admin/akun/writer/writer-list"

export default async function WriterPage() {
  const writers = await getWriters()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manajemen Writer</h1>
      </div>
      <WriterList writers={writers} />
    </div>
  )
}

