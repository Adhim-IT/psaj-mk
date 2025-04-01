import { getWriterById } from "@/lib/writer"
import { getRoles } from "@/lib/role"
import { WriterForm } from "@/components/admin/akun/writer/writer-form"
import { notFound } from "next/navigation"

interface EditWriterPageProps {
  params: {
    id: string
  }
}

export default async function EditWriterPage({ params }: EditWriterPageProps) {
  const writer = await getWriterById(params.id)
  const roles = await getRoles()

  if (!writer) {
    return notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Writer</h1>
      </div>
      <WriterForm writer={writer} roles={roles} />
    </div>
  )
}

