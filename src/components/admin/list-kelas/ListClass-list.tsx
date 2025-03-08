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
import { toast } from "@/components/ui/use-toast"
import { deleteListClass } from "@/lib/list-kelas"
import { Edit, MoreHorizontal, Plus, Search, Trash2, Youtube } from 'lucide-react'
import Image from "next/image"
import { extractYouTubeId } from "@/lib/youtube"
import type { ListClass } from "@/types/list-kelas"

interface ListClassListProps {
  listClasses: ListClass[]
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

// Helper function to get level badge color
const getLevelBadgeColor = (level: string) => {
  switch (level) {
    case "Beginner":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "Intermediate":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    case "Advanced":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}

export function ListClassList({ listClasses }: ListClassListProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [listClassToDelete, setListClassToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleDelete = async () => {
    if (!listClassToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteListClass(listClassToDelete)

      if (result.success) {
        toast({
          title: "List class deleted",
          description: "List class has been deleted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: typeof result.error === "string" ? result.error : "Failed to delete list class.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setListClassToDelete(null)
    }
  }

  const confirmDelete = (id: string) => {
    setListClassToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Filter listClasses based on search query
  const filteredListClasses = listClasses.filter(
    (listClass) =>
      listClass.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listClass.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listClass.level.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search list classes..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/admin/dashboard/kelas/list/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New List Class
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Thumbnail</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Level</TableHead>
              <TableHead className="hidden md:table-cell">Meetings</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredListClasses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? "No list classes found matching your search."
                    : "No list classes found. Create your first list class."}
                </TableCell>
              </TableRow>
            ) : (
              filteredListClasses.map((listClass) => (
                <TableRow key={listClass.id}>
                  <TableCell>
                    <div className="relative h-12 w-20 overflow-hidden rounded-md">
                      <Image
                        src={getValidImageUrl(listClass.thumbnail) || "/placeholder.svg"}
                        alt={listClass.title}
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
                    <div>
                      {listClass.title}
                      {listClass.is_popular && (
                        <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 hidden md:block">
                      {listClass.description.length > 60
                        ? `${listClass.description.substring(0, 60)}...`
                        : listClass.description}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className={getLevelBadgeColor(listClass.level)}>
                      {listClass.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {listClass.meetings} {listClass.meetings === 1 ? "meeting" : "meetings"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {listClass.is_active ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                        Inactive
                      </Badge>
                    )}
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
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/dashboard/kelas/list/edit/${listClass.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const videoId = extractYouTubeId(listClass.trailer)
                            if (videoId) {
                              window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")
                            }
                          }}
                        >
                          <Youtube className="mr-2 h-4 w-4" />
                          Watch Trailer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => confirmDelete(listClass.id)}
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
              This action will delete the list class. This action cannot be undone.
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
