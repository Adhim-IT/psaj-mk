'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';
import Swal from 'sweetalert2';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { DialogImage } from '@/components/ui/dialog-image';
import { updateRegistrantStatus, deleteRegistrant } from '@/lib/event-register-admin';
import { type EventRegistrant, EventRegistrantStatus } from '@/types';

interface RegistrantTableProps {
  registrants: EventRegistrant[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function EventRegistrantTable({ registrants, meta }: RegistrantTableProps) {
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
    router.push(`/admin/dashboard/transaksi/event?${params.toString()}`);
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
    router.push(`/admin/dashboard/transaksi/event?${params.toString()}`);
  };

  const handleConfirmPayment = async (registrant: EventRegistrant) => {
    const result = await Swal.fire({
      title: 'Konfirmasi Pembayaran',
      text: `Apakah Anda yakin ingin mengkonfirmasi pembayaran untuk ${registrant.students.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Konfirmasi',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        setIsUpdating(true);
        const result = await updateRegistrantStatus({
          id: registrant.id,
          status: EventRegistrantStatus.PAID,
        });

        if (result.success) {
          Swal.fire('Berhasil!', 'Status pembayaran telah dikonfirmasi.', 'success');
          router.refresh();
        } else {
          Swal.fire('Error!', 'Gagal mengkonfirmasi pembayaran.', 'error');
        }
      } catch (error) {
        console.error('Error confirming payment:', error);
        Swal.fire('Error!', 'Gagal mengkonfirmasi pembayaran.', 'error');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleDelete = async (registrant: EventRegistrant) => {
    const result = await Swal.fire({
      title: 'Hapus Pendaftar',
      text: `Apakah Anda yakin ingin menghapus pendaftaran untuk ${registrant.students.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        setIsUpdating(true);
        const result = await deleteRegistrant(registrant.id);

        if (result.success) {
          Swal.fire('Berhasil!', 'Pendaftar telah dihapus.', 'success');
          router.refresh();
        } else {
          Swal.fire('Error!', 'Gagal menghapus pendaftar.', 'error');
        }
      } catch (error) {
        console.error('Error deleting registrant:', error);
        Swal.fire('Error!', 'Gagal menghapus pendaftar.', 'error');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const getStatusBadge = (status: EventRegistrantStatus) => {
    switch (status) {
      case EventRegistrantStatus.PAID:
        return <Badge className="bg-green-500">Dibayar</Badge>;
      case EventRegistrantStatus.PENDING:
        return <Badge variant="secondary">Pending</Badge>;
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
          <Input placeholder="Cari event, nama, atau nomor telepon..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full" />
          <Button type="submit" size="icon" variant="secondary">
            <Filter className="h-4 w-4" />
          </Button>
        </form>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value={EventRegistrantStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={EventRegistrantStatus.PAID}>Dibayar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Nomor Telepon</TableHead>
                <TableHead>Bukti Follow Instagram</TableHead>
                <TableHead>Bukti Pembayaran</TableHead>
                <TableHead>Tanggal Transaksi</TableHead>
                <TableHead>Status Pembayaran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Tidak ada data pendaftar
                  </TableCell>
                </TableRow>
              ) : (
                registrants.map((registrant) => (
                  <TableRow key={registrant.id}>
                    <TableCell>{registrant.events.title}</TableCell>
                    <TableCell>{registrant.students.name}</TableCell>
                    <TableCell>{registrant.students.phone}</TableCell>
                    <TableCell>{registrant.instagram_follow ? <DialogImage src={registrant.instagram_follow} alt="Bukti Follow Instagram" /> : 'Tidak ada'}</TableCell>
                    <TableCell>{registrant.payment_proof ? <DialogImage src={registrant.payment_proof} alt="Bukti Pembayaran" /> : 'Tidak ada'}</TableCell>
                    <TableCell>{formatDate(registrant.created_at)}</TableCell>
                    <TableCell>{getStatusBadge(registrant.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        {registrant.status === EventRegistrantStatus.PENDING && (
                          <Button onClick={() => handleConfirmPayment(registrant)} disabled={isUpdating} variant="outline" size="sm" className="whitespace-nowrap">
                            Konfirmasi Pembayaran
                          </Button>
                        )}
                        <Button onClick={() => handleDelete(registrant)} disabled={isUpdating} variant="destructive" size="sm">
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {meta.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`/admin/dashboard/transaksi/event?${new URLSearchParams({
                  ...Object.fromEntries(searchParams),
                  page: String(Math.max(1, meta.page - 1)),
                })}`}
              />
            </PaginationItem>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href={`/admin/dashboard/transaksi/event?${new URLSearchParams({
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
                href={`/admin/dashboard/transaksi/event?${new URLSearchParams({
                  ...Object.fromEntries(searchParams),
                  page: String(Math.min(meta.totalPages, meta.page + 1)),
                })}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
