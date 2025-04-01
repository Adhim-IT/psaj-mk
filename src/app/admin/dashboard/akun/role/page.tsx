import { getRoles } from "@/lib/role"
import { RoleList } from "@/components/admin/akun/role/role-list"

export default async function RolePage() {
  const roles = await getRoles()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manajemen Role</h1>
      </div>
      <RoleList roles={roles} />
    </div>
  )
}

