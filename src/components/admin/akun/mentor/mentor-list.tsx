'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { deleteMentorData } from '@/lib/mentor';
import Swal from 'sweetalert2';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Mentor {
  id: string;
  name: string;
  username: string;
  profile_picture: string | null;
  gender: string;
  phone: string;
  city: string;
  specialization: string;
  users: {
    email: string;
    role?: {
      name: string;
    } | null;
  };
}

interface MentorListProps {
  mentors: Mentor[];
}

export function MentorList({ mentors }: MentorListProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mentorToDelete, setMentorToDelete] = useState<Mentor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!mentorToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteMentorData(mentorToDelete.id);

      if (result.success) {
        Swal.fire({
          title: 'Berhasil!',
          text: 'Mentor berhasil dihapus',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });
        router.refresh();
      } else {
        Swal.fire({
          title: 'Gagal!',
          text: result.error || 'Gagal menghapus mentor',
          icon: 'error',
          confirmButtonColor: '#3085d6',
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Terjadi kesalahan saat menghapus mentor',
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
      console.error(error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setMentorToDelete(null);
    }
  };

  const openDeleteDialog = (mentor: Mentor) => {
    setMentorToDelete(mentor);
    setIsDeleteDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Daftar Mentor</h2>
        <Button asChild>
          <Link href="/admin/dashboard/akun/mentor/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Mentor
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No</TableHead>
                <TableHead>Profil</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Spesialisasi</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mentors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    Tidak ada data mentor
                  </TableCell>
                </TableRow>
              ) : (
                mentors.map((mentor, index) => (
                  <TableRow key={mentor.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={mentor.profile_picture || undefined} alt={mentor.name} />
                          <AvatarFallback>{getInitials(mentor.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{mentor.name}</p>
                          <p className="text-xs text-muted-foreground">{mentor.gender === 'male' ? 'Laki-laki' : mentor.gender === 'female' ? 'Perempuan' : '-'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{mentor.username}</TableCell>
                    <TableCell>{mentor.users.email}</TableCell>
                    <TableCell>{mentor.specialization}</TableCell>
                    <TableCell>
                      <p>{mentor.phone}</p>
                      <p className="text-xs text-muted-foreground">{mentor.city}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                          <Link href={`/admin/dashboard/akun/mentor/edit/${mentor.id}`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={() => openDeleteDialog(mentor)}>
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
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>Apakah Anda yakin ingin menghapus mentor &quot;{mentorToDelete?.name}&quot;? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
