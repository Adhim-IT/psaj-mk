import { WriterForm } from "@/components/admin/akun/writer/writer-form"
import { getRoles } from "@/lib/role"

export default async function CreateWriterPage() {
  const roles = await getRoles()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tambah Writer</h1>
      </div>
      <WriterForm roles={roles} />
    </div>
  )
}

