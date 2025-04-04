'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { deleteStudentGroup } from '@/lib/kelompok-kelas';
import { Edit, MoreHorizontal, Plus, Search, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

interface StudentGroup {
  id: string;
  course_type_id: string;
  mentor_id: string;
  name: string;
  remarks?: string | null;
  start_date: Date;
  end_date: Date;
  total_meeting: number;
  deleted_at?: Date | null;
  created_at?: Date | null;
  updated_at?: Date | null;
  course_types: {
    id: string;
    type: string;
    title: string;
  };
  mentors: {
    id: string;
    name: string;
  };
  course_students?: {
    id: string;
    student_id: string;
  }[];
}

interface StudentGroupListProps {
  studentGroups: StudentGroup[];
}

export function StudentGroupList({ studentGroups }: StudentGroupListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async (groupId: string) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Tindakan ini akan menghapus grup siswa. Tindakan ini tidak dapat dibatalkan.',

      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',

      showLoaderOnConfirm: true,
      preConfirm: async () => {
        setIsDeleting(true);
        try {
          const result = await deleteStudentGroup(groupId);
          setIsDeleting(false);

          if (!result.success) {
            // If there are students in the group, show a more specific message
            if (result.studentCount) {
              Swal.showValidationMessage(`Tidak dapat menghapus grup yang memiliki ${result.studentCount} siswa aktif. Harap hapus semua siswa terlebih dahulu.`);
            } else {
              Swal.showValidationMessage(typeof result.error === 'string' ? result.error : 'Gagal menghapus grup siswa.');
            }
            return false;
          }
          return true;
        } catch (error) {
          setIsDeleting(false);
          Swal.showValidationMessage(`Terjadi kesalahan yang tidak terduga. Silakan coba lagi.`);

          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Dihapus!',
          text: 'Grup siswa telah berhasil dihapus.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });
        router.refresh();
      }
    });
  };

  // Filter student groups based on search query
  const filteredGroups = studentGroups.filter(
    (group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()) || group.course_types.title.toLowerCase().includes(searchQuery.toLowerCase()) || group.mentors.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort groups by start date (newest first)
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search groups..." className="pl-8 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/dashboard/kelas/kelompok/create" className="flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Group
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Grup</TableHead>
                <TableHead>Kursus</TableHead>
                <TableHead className="hidden md:table-cell">Mentor</TableHead>
                <TableHead className="hidden md:table-cell">Periode</TableHead>
                <TableHead className="hidden md:table-cell">Siswa</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'Tidak ada grup siswa yang cocok dengan pencarian Anda.' : 'Belum ada grup siswa. Buat grup pertama Anda.'}
                  </TableCell>
                </TableRow>
              ) : (
                sortedGroups.map((group) => {
                  // Calculate if the group is active, upcoming, or completed
                  const now = new Date();
                  const startDate = new Date(group.start_date);
                  const endDate = new Date(group.end_date);

                  let status = 'active';
                  if (now < startDate) {
                    status = 'upcoming';
                  } else if (now > endDate) {
                    status = 'completed';
                  }

                  return (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{group.name}</span>
                          {group.remarks && <span className="text-xs text-muted-foreground mt-1 line-clamp-1">{group.remarks}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{group.course_types.title}</span>
                          <Badge variant="outline" className="mt-1 w-fit">
                            {group.course_types.type.charAt(0).toUpperCase() + group.course_types.type.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{group.mentors.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">
                          {format(new Date(group.start_date), 'dd MMM yyyy')} - {format(new Date(group.end_date), 'dd MMM yyyy')}
                          <div className="text-xs text-muted-foreground mt-1">{group.total_meeting} meetings</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80" onClick={() => router.push(`/admin/dashboard/kelas/akun/student/${group.id}`)}>
                          <Users className="h-3 w-3 mr-1" />
                          {group.course_students?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {status === 'active' && <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aktif</Badge>}
                        {status === 'upcoming' && <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Akan Datang</Badge>}
                        {status === 'completed' && <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Selesai</Badge>}
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
                            <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/kelas/kelompok/edit/${group.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/kelas/kelompok/students/${group.id}`)}>
                              <Users className="mr-2 h-4 w-4" />
                              Kelola Siswa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(group.id)} className="text-red-600 focus:text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
