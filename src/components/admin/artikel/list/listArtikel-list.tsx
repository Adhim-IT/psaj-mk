"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Swal from "sweetalert2"
import { deleteListArticle } from "@/lib/list-artikel"
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"
import Image from "next/image"
import type { ListArticle } from "@/types"

interface ListArticleListProps {
  listArticles: ListArticle[]
}

// Helper function to validate image URL
const getValidImageUrl = (imageUrl: string): string => {
  // Check if it's a valid URL
  try {
    new URL(imageUrl)
    return imageUrl
  } catch (e) {
    // Not a valid URL
  }

  // Check if it's a valid path
  if (imageUrl.startsWith("/")) {
    return imageUrl
  }

  // Return placeholder if none of the above
  return "/placeholder.svg?height=40&width=40"
}

export function ListArticleList({ listArticles }: ListArticleListProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleDelete = async () => {
    if (!articleToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteListArticle(articleToDelete)

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Article deleted",
          text: "Article has been deleted successfully.",
        })
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: typeof result.error === "string" ? result.error : "Failed to delete article.",
        })
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setArticleToDelete(null)
    }
  }

  const confirmDelete = (id: string) => {
    setArticleToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Filter articles based on search query
  const filteredArticles = listArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.categories?.some((cat) => cat.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      article.tag?.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/admin/dashboard/artikel/list/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Article
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Categories</TableHead>
              <TableHead className="hidden md:table-cell">Tags</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? "No articles found matching your search."
                    : "No articles found. Create your first article."}
                </TableCell>
              </TableRow>
            ) : (
              filteredArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="relative h-12 w-20 overflow-hidden rounded-md">
                      <Image
                        src={getValidImageUrl(article.thumbnail) || "/placeholder.svg"}
                        alt={article.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // If image fails to load, replace with placeholder
                          const target = e.target as HTMLImageElement
                          target.onerror = null // Prevent infinite loop
                          target.src = "/placeholder.svg?height=48&width=80"
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>{article.title}</div>
                    <div className="text-sm text-muted-foreground mt-1 hidden md:block">
                      {article.content.length > 60
                        ? `${article.content.substring(0, 60).replace(/<[^>]*>/g, "")}...`
                        : article.content.replace(/<[^>]*>/g, "")}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {article.categories && article.categories.length > 0 ? (
                        article.categories.map((category) => (
                          <Badge
                            key={category.id}
                            variant="outline"
                            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                          >
                            {category.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No categories</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {article.tag && article.tag.length > 0 ? (
                        article.tag.map((tag) => (
                          <Badge key={tag.id} variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                            {tag.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No tags</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/artikel/list/edit/${article.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => confirmDelete(article.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the article. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

