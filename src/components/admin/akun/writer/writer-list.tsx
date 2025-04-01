"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
import { Plus, Pencil, Trash2 } from "lucide-react"
import { deleteWriterData } from "@/lib/writer"
import Swal from "sweetalert2"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Writer {
  id: string
  name: string
  username: string
  profile_picture: string | null
  users: {
    email: string
    role?: {
      name: string
    } | null
  }
}

interface WriterListProps {
  writers: Writer[]
}

export function WriterList({ writers }: WriterListProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [writerToDelete, setWriterToDelete] = useState<Writer | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!writerToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteWriterData(writerToDelete.id)

      if (result.success) {
        Swal.fire({
          title: "Berhasil!",
          text: "Writer berhasil dihapus",
          icon: "success",
          confirmButtonColor: "#3085d6",
        })
        router.refresh()
      } else {
        Swal.fire({
          title: "Gagal!",
          text: result.error || "Gagal menghapus writer",
          icon: "error",
          confirmButtonColor: "#3085d6",
        })
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat menghapus writer",
        icon: "error",
        confirmButtonColor: "#3085d6",
      })
      console.error(error)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setWriterToDelete(null)
    }
  }

  const openDeleteDialog = (writer: Writer) => {
    setWriterToDelete(writer)
    setIsDeleteDialogOpen(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Daftar Writer</h2>
        <Button asChild>
          <Link href="/admin/dashboard/akun/writer/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Writer
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No</TableHead>
              <TableHead>Profil</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {writers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  Tidak ada data writer
                </TableCell>
              </TableRow>
            ) : (
              writers.map((writer, index) => (
                <TableRow key={writer.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={writer.profile_picture || undefined} alt={writer.name} />
                        <AvatarFallback>{getInitials(writer.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{writer.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{writer.username}</TableCell>
                  <TableCell>{writer.users.email}</TableCell>
                  <TableCell>{writer.users.role?.name || "-"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/dashboard/akun/writer/edit/${writer.id}`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(writer)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
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
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus writer &quot;{writerToDelete?.name}&quot;? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

