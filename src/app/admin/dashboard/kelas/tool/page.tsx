import { getTools } from "@/lib/tools"
import { ToolList } from "@/components/admin/tools/tool-list"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/src/components/ui/breadcrumb"
import { HomeIcon } from "lucide-react"

export default async function ToolsPage() {
  const { tools, error } = await getTools()

  return (
    <div className="space-y-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">
              <HomeIcon className="h-4 w-4 mr-1" />
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard/kelas">Kelas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Tools</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Tools Manajemen </h1>
        <p className="text-muted-foreground">Kelola tools kelas yang tersedia.</p>
      </div>

      {error ? <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div> : <ToolList tools={tools || []} />}
    </div>
  )
}

