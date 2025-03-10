"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { deleteTool } from "@/lib/tools"
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"
import Image from "next/image"
import { ToolListProps } from "@/types"



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
  return "/placeholder.svg"
}

export function ToolList({ tools }: ToolListProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [toolToDelete, setToolToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleDelete = async () => {
    if (!toolToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteTool(toolToDelete)

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Tool deleted",
          text: "Tool has been deleted successfully.",
        })
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: typeof result.error === "string" ? result.error : "Failed to delete tool.",
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
      setToolToDelete(null)
    }
  }

  const confirmDelete = (id: string) => {
    setToolToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Filter tools based on search query
  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tools..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/admin/dashboard/kelas/tool/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Tool
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">URL</TableHead>
              <TableHead className="hidden md:table-cell">Created At</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No tools found matching your search." : "No tools found. Create your first tool."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      <Image
                        src={getValidImageUrl(tool.logo) || "/placeholder.svg"}
                        alt={tool.name}
                        fill
                        className="object-contain"
                        onError={(e) => {
                          // If image fails to load, replace with placeholder
                          const target = e.target as HTMLImageElement
                          target.onerror = null // Prevent infinite loop
                          target.src = "/placeholder.svg"
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{tool.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {tool.url}
                    </a>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {tool.created_at ? new Date(tool.created_at).toLocaleDateString() : "-"}
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
                        <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/kelas/tool/edit/${tool.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => confirmDelete(tool.id)}
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
              This action will delete the tool. This action cannot be undone.
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

