import { getTools } from "@/lib/tools"
import { ToolList } from "@/components/admin/tools/tool-list"

export default async function ToolsPage() {
  const { tools, error } = await getTools()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tools Manajemen </h1>
      </div>

      {error ? <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div> : <ToolList tools={tools || []} />}
    </div>
  )
}

