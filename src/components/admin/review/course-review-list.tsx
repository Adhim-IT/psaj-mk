"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import Swal from "sweetalert2"

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
  initialData: CourseReview[]
  onApprove: (id: string) => Promise<{ success: boolean; error?: string }>
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>
}

export function CourseReviewList({ initialData, onApprove, onDelete }: CourseReviewListProps) {
  const [reviews, setReviews] = useState<CourseReview[]>(initialData)
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filter reviews based on search term
  const filteredReviews = reviews.filter(
    (review) =>
      review.courses.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.students.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Pagination
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

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Review berhasil disetujui",
          timer: 1500,
        })
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: result.error || "Gagal menyetujui review",
        })
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Terjadi kesalahan saat menyetujui review",
      })
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

            Swal.fire({
              icon: "success",
              title: "Berhasil",
              text: "Review berhasil dihapus",
              timer: 1500,
            })
          } else {
            Swal.fire({
              icon: "error",
              title: "Gagal",
              text: result.error || "Gagal menghapus review",
            })
          }
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Terjadi kesalahan saat menghapus review",
          })
        } finally {
          setIsLoading((prev) => ({ ...prev, [id]: false }))
        }
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            className="h-8 w-16 rounded-md border border-input bg-background px-2"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>entries</span>
        </div>
        <Input
          placeholder="Search"
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setCurrentPage(1)
          }}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">NO</TableHead>
              <TableHead>NAMA KELAS</TableHead>
              <TableHead>NAMA SISWA</TableHead>
              <TableHead>ULASAN</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="text-center">AKSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Tidak ada data review
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((review, index) => (
                <TableRow key={review.id}>
                  <TableCell className="text-center">{indexOfFirstItem + index + 1}</TableCell>
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
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      {!review.is_approved && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-500 text-white hover:bg-green-600"
                          onClick={() => handleApprove(review.id)}
                          disabled={isLoading[review.id]}
                        >
                          {isLoading[review.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : "Setujui"}
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(review.id)}
                        disabled={isLoading[review.id]}
                      >
                        {isLoading[review.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hapus"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredReviews.length)} of{" "}
          {filteredReviews.length} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNumber
            if (totalPages <= 5) {
              pageNumber = i + 1
            } else {
              if (currentPage <= 3) {
                pageNumber = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i
              } else {
                pageNumber = currentPage - 2 + i
              }
            }
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNumber)}
                className={currentPage === pageNumber ? "bg-blue-500" : ""}
              >
                {pageNumber}
              </Button>
            )
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

