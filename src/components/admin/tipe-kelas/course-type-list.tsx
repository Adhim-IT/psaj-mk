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
import { deleteCourseType } from "@/lib/course-types"
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"
import { format } from "date-fns"
import type { CourseType } from "@/types"

interface CourseTypeListProps {
  courseTypes: CourseType[]
}

export function CourseTypeList({ courseTypes }: CourseTypeListProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [courseTypeToDelete, setCourseTypeToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleDelete = async () => {
    if (!courseTypeToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteCourseType(courseTypeToDelete)

      if (result.success) {
        toast({
          title: "Tipe kelas dihapus",
          description: "Tipe kelas telah berhasil dihapus.",
        })
      } else {
        toast({
          title: "Error",
          description: typeof result.error === "string" ? result.error : "Gagal menghapus tipe kelas.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan yang tidak terduga",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setCourseTypeToDelete(null)
    }
  }

  const confirmDelete = (id: string) => {
    setCourseTypeToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Calculate final price
  const calculateFinalPrice = (courseType: CourseType) => {
    if (!courseType.is_discount || !courseType.discount) return Number(courseType.normal_price)

    const normalPrice = Number(courseType.normal_price)
    const discount = Number(courseType.discount)

    if (courseType.discount_type === "percentage") {
      return normalPrice - normalPrice * (discount / 100)
    } else if (courseType.discount_type === "fixed") {
      return Math.max(0, normalPrice - discount)
    }

    return Number(courseType.normal_price)
  }

  // Filter course types based on search query
  const filteredCourseTypes = courseTypes.filter(
    (courseType) =>
      courseType.courses.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courseType.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courseType.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari tipe kelas..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/admin/dashboard/kelas/tipe/create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Tipe Kelas
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kelas</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="hidden md:table-cell">Harga</TableHead>
              <TableHead className="hidden md:table-cell">Periode</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="w-[100px] text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourseTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? "Tidak ada tipe kelas yang sesuai dengan pencarian."
                    : "Belum ada tipe kelas. Silakan buat tipe kelas pertama."}
                </TableCell>
              </TableRow>
            ) : (
              filteredCourseTypes.map((courseType) => (
                <TableRow key={courseType.id}>
                  <TableCell className="font-medium">{courseType.courses.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span>
                        {courseType.type === "group"
                          ? "Group"
                          : courseType.type === "private"
                            ? "Private"
                            : "Batch"}
                        {courseType.batch_number && ` (Batch ${courseType.batch_number})`}
                      </span>
                      <span className="text-xs text-muted-foreground">{courseType.slug}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      <span>Rp {Number(courseType.normal_price).toLocaleString("id-ID")}</span>
                      {courseType.is_discount && (
                        <span className="text-sm text-green-600">
                          Diskon:{" "}
                          {courseType.discount_type === "percentage"
                            ? `${Number(courseType.discount)}%`
                            : `Rp ${Number(courseType.discount)?.toLocaleString("id-ID")}`}
                          <br />
                          Final: Rp {calculateFinalPrice(courseType).toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {courseType.start_date && courseType.end_date ? (
                      <span className="text-sm">
                        {format(new Date(courseType.start_date), "dd/MM/yyyy")} -
                        <br />
                        {format(new Date(courseType.end_date), "dd/MM/yyyy")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Tidak ada periode</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      <Badge variant={courseType.is_active ? "default" : "secondary"}>
                        {courseType.is_active ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                      {courseType.is_voucher && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          Kode Promo
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Buka menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/dashboard/kelas/tipe/edit/${courseType.id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => confirmDelete(courseType.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
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
              Tindakan ini akan menghapus tipe kelas. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

