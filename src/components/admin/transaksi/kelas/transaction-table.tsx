'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, Filter, CheckCircle, Trash2, MoreVertical, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CourseTransactionStatus } from '@/types';
import { updateCourseTransactionStatus, deleteCourseTransaction } from '@/lib/course-transaksi-admin';

interface TransactionTableProps {
  transactions: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function TransactionTable({ transactions, meta }: TransactionTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string>(searchParams.get('status') || '');
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = (value: string) => {
    setStatus(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    router.push(`/admin/dashboard/transaksi/kelas?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/admin/dashboard/transaksi/kelas?${params.toString()}`);
  };

  const getStatusBadge = (status: CourseTransactionStatus) => {
    switch (status) {
      case CourseTransactionStatus.PAID:
        return <Badge className="bg-green-500">Dibayar</Badge>;
      case CourseTransactionStatus.UNPAID:
        return <Badge variant="secondary">Belum Dibayar</Badge>;
      case CourseTransactionStatus.FAILED:
        return <Badge className="bg-red-500 text-white font-bold rounded-full px-4 py-1">Gagal</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleUpdateStatus = async (id: string, status: CourseTransactionStatus) => {
    Swal.fire({
      title: 'Konfirmasi Update Status',
      text: `Apakah Anda yakin ingin mengubah status transaksi ini menjadi "${status}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Update!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsUpdating(true);
        try {
          const updateResult = await updateCourseTransactionStatus(id, status);
          if (updateResult.success) {
            Swal.fire('Berhasil!', 'Status transaksi telah diupdate.', 'success');
            router.refresh();
          } else {
            Swal.fire('Error!', updateResult.error || 'Gagal mengupdate status transaksi.', 'error');
          }
        } catch (error) {
          console.error('Error updating transaction status:', error);
          Swal.fire('Error!', 'Gagal mengupdate status transaksi.', 'error');
        } finally {
          setIsUpdating(false);
        }
      }
    });
  };

  const handleDeleteTransaction = async (id: string) => {
    Swal.fire({
      title: 'Konfirmasi Hapus Transaksi',
      text: 'Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsUpdating(true);
        try {
          const deleteResult = await deleteCourseTransaction({ id });
          if (deleteResult.success) {
            Swal.fire('Berhasil!', 'Transaksi telah dihapus.', 'success');
            router.refresh();
          } else {
            Swal.fire('Error!', deleteResult.error || 'Gagal menghapus transaksi.', 'error');
          }
        } catch (error) {
          console.error('Error deleting transaction:', error);
          Swal.fire('Error!', 'Gagal menghapus transaksi.', 'error');
        } finally {
          setIsUpdating(false);
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
          <Input placeholder="Cari kode, kelas, atau siswa..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full" />
          <Button type="submit" size="icon" variant="secondary">
            <Filter className="h-4 w-4" />
          </Button>
        </form>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-1" />
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

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Siswa</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Tidak ada data transaksi
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.code}</TableCell>
                    <TableCell>{transaction.courses.title}</TableCell>
                    <TableCell>{transaction.students.name}</TableCell>
                    <TableCell className="capitalize">{transaction.type}</TableCell>
                    <TableCell>{formatPrice(transaction.final_price)}</TableCell>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/dashboard/transaksi/kelas/${transaction.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Detail
                          </Button>
                        </Link>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MoreVertical className="h-4 w-4 mr-2" />
                              Aksi
                              <ChevronDown className="h-4 w-4 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {transaction.status === CourseTransactionStatus.UNPAID && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(transaction.id, CourseTransactionStatus.PAID)}>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                <span>Set as Paid</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDeleteTransaction(transaction.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                              <Trash2 className="h-4 w-4 mr-2" />
                              <span>Hapus Permanen</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={`/admin/dashboard/transaksi/kelas?${new URLSearchParams({
                ...Object.fromEntries(searchParams),
                page: String(Math.max(1, meta.page - 1)),
              })}`}
            />
          </PaginationItem>
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href={`/admin/dashboard/transaksi/kelas?${new URLSearchParams({
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
              href={`/admin/dashboard/transaksi/kelas?${new URLSearchParams({
                ...Object.fromEntries(searchParams),
                page: String(Math.min(meta.totalPages, meta.page + 1)),
              })}`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
