"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, Filter, MoreHorizontal, Trash2 } from "lucide-react"
import Swal from "sweetalert2"
import type { Decimal } from "@prisma/client/runtime/library"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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
import { deleteCourseTransaction } from "@/lib/course-transaksi-admin"
import { type CourseTransaction, CourseTransactionStatus } from "@/types"

interface TransactionTableProps {
  transactions: CourseTransaction[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function TransactionTable({ transactions, meta }: TransactionTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<string>(searchParams.get("status") || "")
  const [search, setSearch] = useState<string>(searchParams.get("search") || "")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<CourseTransaction | null>(null)

  const handleStatusChange = (value: string) => {
    setStatus(value)
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set("status", value)
    } else {
      params.delete("status")
    }
    params.set("page", "1")
    router.push(`/admin/transaksi/kelas?${params.toString()}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (search) {
      params.set("search", search)
    } else {
      params.delete("search")
    }
    params.set("page", "1")
    router.push(`/admin/transaksi/kelas?${params.toString()}`)
  }

  const openDeleteDialog = (transaction: CourseTransaction) => {
    setSelectedTransaction(transaction)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedTransaction) return

    try {
      setIsDeleting(true)
      const result = await deleteCourseTransaction({ id: selectedTransaction.id })

      if (result.success) {
        setIsDeleteDialogOpen(false)
        setSelectedTransaction(null)
        router.refresh()
        Swal.fire({
          icon: "success",
          title: "Transaksi berhasil dihapus",
          text: "Transaksi telah berhasil dihapus dari sistem.",
        })
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Gagal menghapus transaksi. Silakan coba lagi.",
        })
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal menghapus transaksi. Silakan coba lagi.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: CourseTransactionStatus) => {
    switch (status) {
      case CourseTransactionStatus.PAID:
        return <Badge className="bg-green-500">Dibayar</Badge>
      case CourseTransactionStatus.UNPAID:
        return <Badge className="bg-red-500">Belum Dibayar</Badge>
      case CourseTransactionStatus.FAILED:
        return <Badge className="bg-red-700">Gagal</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatPrice = (price: Decimal) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(Number(price))
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "-"
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <div className="space-y-4">
     <div className="flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full max-w-lg">
          <Input
            placeholder="Cari kode, kelas, atau siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
          <Button type="submit" size="icon" variant="secondary">
            <Filter className="h-4 w-4" />
          </Button>
        </form>
        <div>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value={CourseTransactionStatus.UNPAID}>Belum Dibayar</SelectItem>
              <SelectItem value={CourseTransactionStatus.PAID}>Dibayar</SelectItem>
              <SelectItem value={CourseTransactionStatus.FAILED}>Gagal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Siswa</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Tidak ada data transaksi
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.code}</TableCell>
                  <TableCell>{transaction.courses.title}</TableCell>
                  <TableCell>
                    <div>
                      <div>{transaction.students.name}</div>
                      <div className="text-sm text-muted-foreground">{transaction.students.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(transaction.final_price)}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>{formatDate(transaction.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/transaksi/kelas/${transaction.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(transaction)}
                          disabled={isDeleting}
                          className="text-destructive focus:text-destructive"
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

      {meta.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`/admin/transaksi/kelas?${new URLSearchParams({
                  ...Object.fromEntries(searchParams),
                  page: String(Math.max(1, meta.page - 1)),
                })}`}
              />
            </PaginationItem>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href={`/admin/transaksi/kelas?${new URLSearchParams({
                    ...Object.fromEntries(searchParams),
                    page: String(page),
                  })}`}
                  isActive={page === meta.page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href={`/admin/transaksi/kelas?${new URLSearchParams({
                  ...Object.fromEntries(searchParams),
                  page: String(Math.min(meta.totalPages, meta.page + 1)),
                })}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Transaksi dengan kode {selectedTransaction?.code} akan dihapus secara
              permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

