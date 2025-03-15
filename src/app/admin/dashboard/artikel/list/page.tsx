import { getListArticles } from "@/lib/list-artikel"
import { ListArticleList } from "@/src/components/admin/artikel/list/listArtikel-list"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { HomeIcon } from "lucide-react"

export default async function ListArticlesPage() {
  const { ListArticles, error } = await getListArticles()

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
            <BreadcrumbLink>List</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">List Artikel</h1>
        <p className="text-muted-foreground">Kelola daftar artikel Anda.</p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">{error}</div>
      ) : (
        <ListArticleList listArticles={ListArticles || []} />
      )}
    </div>
  )
}

