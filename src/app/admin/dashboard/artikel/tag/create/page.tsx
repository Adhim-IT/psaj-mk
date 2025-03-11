import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
  import { HomeIcon } from "lucide-react"
  import TagForm from "@/components/admin/artikel/tag/TagClass-form"
  
  export default function CreateTagPage() {
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
              <BreadcrumbLink>Tambah Tag</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
  
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Tambah Tag Baru</h1>
          <p className="text-muted-foreground">Buat tag baru untuk artikel.</p>
        </div>
  
        <TagForm />
      </div>
    )
  }
  
  