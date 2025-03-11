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
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react'
import { deleteTag } from "@/lib/tag"
import Swal from "sweetalert2"

// Import the Tag interface from lib/tag
import { Tag } from "@/lib/tag"

export interface TagListProps {
  tags: Tag[];
}

export default function TagList({ tags }: TagListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<string | null>(null)

  const filteredTags = tags.filter((tag) => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const confirmDelete = (id: string) => {
    setTagToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!tagToDelete) return
    
    try {
      await deleteTag(tagToDelete)
      router.refresh()
      setIsDeleteDialogOpen(false)
      
      // Use SweetAlert2 for success notification
      Swal.fire({
        icon: "success",
        title: "Data Berhasil Dihapus",
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error("Error deleting tag:", error)
      
      // Use SweetAlert2 for error notification
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus Data",
        text: "Terjadi kesalahan saat menghapus tag.",
        confirmButtonText: "OK",
      })
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 w-full max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tag..."
              className="pl-8"
            />
          </div>
        </div>
        <Button asChild className="flex items-center gap-2">
          <Link href="/admin/dashboard/artikel/tag/create">
            <Plus className="h-4 w-4" />
            Tambah Tag
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">No</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  Tidak ada data tag
                </TableCell>
              </TableRow>
            ) : (
              filteredTags.map((tag, index) => (
                <TableRow key={tag.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{tag.name}</TableCell>
                  <TableCell>{tag.slug}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/dashboard/artikel/tag/edit/${tag.id}`} className="flex items-center">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => confirmDelete(tag.id)}
                          className="flex items-center text-destructive focus:text-destructive"
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
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Tag ini akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
