import { getRoleById } from "@/lib/role"
import { RoleForm } from "@/components/admin/akun/role/role-form"
import { notFound } from "next/navigation"

interface EditRolePageProps {
  params: {
    id: string
  }
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const role = await getRoleById(params.id)

  if (!role) {
    return notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Edit Role</h1>
      </div>
      <RoleForm role={role} />
    </div>
  )
}

