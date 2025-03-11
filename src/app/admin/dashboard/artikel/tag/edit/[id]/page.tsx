import { notFound } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { HomeIcon } from "lucide-react"
import TagForm from "@/components/admin/artikel/tag/TagClass-form"
import { getTagById } from "@/lib/tag"

interface EditTagPageProps {
  params: {
    id: string
  }
}

export default async function EditTagPage({ params }: EditTagPageProps) {
  const { id } = params
  const { tag, error } = await getTagById(id)

  if (error || !tag) {
    notFound()
  }

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
            <BreadcrumbLink href="/admin/dashboard/artikel/tag">Tag</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Edit Tag</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Tag</h1>
        <p className="text-muted-foreground">Perbarui informasi tag yang sudah ada.</p>
      </div>

      <TagForm tag={tag} isEditing={true} />
    </div>
  )
}

