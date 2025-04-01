import { RoleForm } from "@/components/admin/akun/role/role-form"

export default function CreateRolePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tambah Role</h1>
      </div>
      <RoleForm />
    </div>
  )
}

