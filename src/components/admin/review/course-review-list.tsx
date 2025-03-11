"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Filter } from "lucide-react"
import Swal from "sweetalert2"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface CourseReview {
  id: string
  course_id: string
  student_id: string
  rating: number
  review: string
  is_approved: boolean
  created_at: string | null
  updated_at: string | null
  courses: {
    id: string
    title: string
  }
  students: {
    id: string
    name: string
  }
}

interface CourseReviewListProps {
  initialReviews: CourseReview[]
  totalReviews: number
  onApprove: (id: string) => Promise<{ success: boolean; error?: string }>
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>
}

export function CourseReviewList({ initialReviews, totalReviews, onApprove, onDelete }: CourseReviewListProps) {
  const [reviews, setReviews] = useState<CourseReview[]>(initialReviews)
  const [filteredReviews, setFilteredReviews] = useState<CourseReview[]>(initialReviews)
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    // Filter reviews based on search term and status
    const filtered = reviews.filter(
      (review) =>
        (review.courses.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.students.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.review.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "all" ||
          (statusFilter === "approved" && review.is_approved) ||
          (statusFilter === "pending" && !review.is_approved)),
    )
    setFilteredReviews(filtered)
    setCurrentPage(1) // Reset to first page when search or filter changes
  }, [searchTerm, statusFilter, reviews])

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage)

  const handleApprove = async (id: string) => {
    setIsLoading((prev) => ({ ...prev, [id]: true }))
    try {
      const result = await onApprove(id)
      if (result.success) {
        setReviews((prev) => prev.map((review) => (review.id === id ? { ...review, is_approved: true } : review)))
        Swal.fire({ icon: "success", title: "Berhasil", text: "Review berhasil disetujui", timer: 1500 })
      } else {
        Swal.fire({ icon: "error", title: "Gagal", text: result.error || "Gagal menyetujui review" })
      }
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Terjadi kesalahan saat menyetujui review" })
    } finally {
      setIsLoading((prev) => ({ ...prev, [id]: false }))
    }
  }

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Review yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading((prev) => ({ ...prev, [id]: true }))
        try {
          const result = await onDelete(id)
          if (result.success) {
            setReviews((prev) => prev.filter((review) => review.id !== id))
            Swal.fire({ icon: "success", title: "Berhasil", text: "Review berhasil dihapus", timer: 1500 })
          } else {
            Swal.fire({ icon: "error", title: "Gagal", text: result.error || "Gagal menghapus review" })
          }
        } catch {
          Swal.fire({ icon: "error", title: "Error", text: "Terjadi kesalahan saat menghapus review" })
        } finally {
          setIsLoading((prev) => ({ ...prev, [id]: false }))
        }
      }
    })
  }

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink isActive={currentPage === 1} onClick={() => setCurrentPage(1)}>
          1
        </PaginationLink>
      </PaginationItem>,
    )

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Show pages around current page
    const startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 2)

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink isActive={currentPage === i} onClick={() => setCurrentPage(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Show ellipsis if needed
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink isActive={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return items
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kelas, siswa, atau ulasan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Review</SelectItem>
              <SelectItem value="approved">Disetujui</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
            </SelectContent>
          </Select>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per halaman</SelectItem>
              <SelectItem value="10">10 per halaman</SelectItem>
              <SelectItem value="25">25 per halaman</SelectItem>
              <SelectItem value="50">50 per halaman</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NO</TableHead>
            <TableHead>NAMA KELAS</TableHead>
            <TableHead>NAMA SISWA</TableHead>
            <TableHead>ULASAN</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead>AKSI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Tidak ada data review
              </TableCell>
            </TableRow>
          ) : (
            currentItems.map((review, index) => (
              <TableRow key={review.id}>
                <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                <TableCell>{review.courses.title}</TableCell>
                <TableCell>{review.students.name}</TableCell>
                <TableCell>{review.review}</TableCell>
                <TableCell>
                  {review.is_approved ? (
                    <Badge className="bg-green-500">Disetujui</Badge>
                  ) : (
                    <Badge variant="outline">Menunggu</Badge>
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  {!review.is_approved && (
                    <Button
                      onClick={() => handleApprove(review.id)}
                      disabled={isLoading[review.id]}
                      size="sm"
                      className="mr-2"
                    >
                      {isLoading[review.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : "Setujui"}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(review.id)}
                    disabled={isLoading[review.id]}
                    variant="destructive"
                    size="sm"
                  >
                    {isLoading[review.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hapus"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {filteredReviews.length > itemsPerPage && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                aria-disabled={currentPage === 1}
                className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
            {renderPaginationItems()}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                aria-disabled={currentPage === totalPages}
                className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <div className="text-sm text-muted-foreground">
        Menampilkan {currentItems.length > 0 ? indexOfFirstItem + 1 : 0} sampai{" "}
        {Math.min(indexOfLastItem, filteredReviews.length)} dari {filteredReviews.length} ulasan
      </div>
    </div>
  )
}

