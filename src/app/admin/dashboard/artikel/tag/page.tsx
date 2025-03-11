import { getTag } from "@/lib/tag"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { HomeIcon } from "lucide-react"
import TagList from "@/components/admin/artikel/tag/tagClass-list"

export default async function TagPage() {
  const { tags, error } = await getTag()

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
            <BreadcrumbLink href="/admin/dashboard/artikel">Artikel</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Tag</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Tag Manajemen</h1>
        <p className="text-muted-foreground">Kelola tag artikel yang tersedia.</p>
      </div>

      {error ? (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">{error}</div>
      ) : (
        <TagList tags={tags || []} />
      )}
    </div>
  )
}

