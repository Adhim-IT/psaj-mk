'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentGroupSchema } from '@/lib/zod';
import type { StudentGroupFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

interface CourseType {
  id: string;
  type: string;
  title: string;
}

interface Mentor {
  id: string;
  name: string;
  specialization?: string;
}

interface StudentGroupFormProps {
  initialData?: {
    id?: string;
    course_type_id: string;
    mentor_id: string;
    name: string;
    remarks?: string | null;
    start_date: Date;
    end_date: Date;
    total_meeting: number;
  };
  courseTypes: CourseType[];
  mentors: Mentor[];
  onSubmit: (data: StudentGroupFormData) => Promise<{ success?: boolean; error?: any }>;
  isSubmitting: boolean;
}

export function StudentGroupForm({ initialData, courseTypes, mentors, onSubmit, isSubmitting }: StudentGroupFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<StudentGroupFormData>({
    resolver: zodResolver(studentGroupSchema),
    defaultValues: {
      course_type_id: initialData?.course_type_id || '',
      mentor_id: initialData?.mentor_id || '',
      name: initialData?.name || '',
      remarks: initialData?.remarks || '',
      start_date: initialData?.start_date ? new Date(initialData.start_date) : new Date(),
      end_date: initialData?.end_date ? new Date(initialData.end_date) : new Date(),
      total_meeting: initialData?.total_meeting || 1,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        course_type_id: initialData.course_type_id,
        mentor_id: initialData.mentor_id,
        name: initialData.name,
        remarks: initialData.remarks || '',
        start_date: new Date(initialData.start_date),
        end_date: new Date(initialData.end_date),
        total_meeting: initialData.total_meeting,
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: StudentGroupFormData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(data.start_date);
    startDate.setHours(0, 0, 0, 0);

    if (startDate < today) {
      Swal.fire({
        icon: 'error',
        title: 'Tanggal Tidak Valid',
        text: 'Tanggal mulai tidak boleh di masa lalu.',
        confirmButtonColor: '#d33',
      });
      return;
    }

    try {
      const result = await onSubmit(data);

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: initialData ? 'Grup Diperbarui!' : 'Grup Dibuat!',
          text: initialData ? 'Grup siswa telah berhasil diperbarui.' : 'Grup siswa baru telah berhasil dibuat.',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK',
        }).then(() => {
          router.push('/admin/dashboard/kelas/kelompok');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Terjadi Kesalahan',
          text: result.error || 'Gagal menyimpan grup siswa',
          confirmButtonColor: '#d33',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Terjadi Kesalahan',
        text: 'Terjadi kesalahan yang tidak terduga',
        confirmButtonColor: '#d33',
      });
    }
  };

  // Format date for input
  const formatDateForInput = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'yyyy-MM-dd');
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="course_type_id">Jenis Kursus</Label>
          <Select value={watch('course_type_id')} onValueChange={(value) => setValue('course_type_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis kursus" />
            </SelectTrigger>
            <SelectContent>
              {courseTypes.map((courseType) => (
                <SelectItem key={courseType.id} value={courseType.id}>
                  {courseType.title} - {courseType.type.charAt(0).toUpperCase() + courseType.type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.course_type_id && <p className="mt-1 text-sm text-red-500">{errors.course_type_id.message}</p>}
        </div>

        <div>
          <Label htmlFor="mentor_id">Mentor</Label>
          <Select value={watch('mentor_id')} onValueChange={(value) => setValue('mentor_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih mentor" />
            </SelectTrigger>
            <SelectContent>
              {mentors.map((mentor) => (
                <SelectItem key={mentor.id} value={mentor.id}>
                  {mentor.name} {mentor.specialization ? `- ${mentor.specialization}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.mentor_id && <p className="mt-1 text-sm text-red-500">{errors.mentor_id.message}</p>}
        </div>

        <div>
          <Label htmlFor="name">Nama Kelompok</Label>
          <Input id="name" {...register('name')} className="mt-1" placeholder="Masukkan nama kelompok" />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="remarks">Catatan</Label>
          <Textarea id="remarks" {...register('remarks')} className="mt-1" placeholder="Masukkan catatan tambahan" />
          {errors.remarks && <p className="mt-1 text-sm text-red-500">{errors.remarks.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="start_date">Tanggal Mulai</Label>
            <Input
              id="start_date"
              type="date"
              className="mt-1"
              min={formatDateForInput(new Date())}
              value={watch('start_date') ? formatDateForInput(watch('start_date')) : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                setValue('start_date', date as any);
              }}
            />
            {errors.start_date && <p className="mt-1 text-sm text-red-500">{errors.start_date.message}</p>}
          </div>

          <div>
            <Label htmlFor="end_date">Tanggal Selesai</Label>
            <Input
              id="end_date"
              type="date"
              className="mt-1"
              min={formatDateForInput(watch('start_date') || new Date())}
              value={watch('end_date') ? formatDateForInput(watch('end_date')) : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : null;
                setValue('end_date', date as any);
              }}
            />
            {errors.end_date && <p className="mt-1 text-sm text-red-500">{errors.end_date.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="total_meeting">Total Pertemuan</Label>
          <Input id="total_meeting" type="number" min="1" {...register('total_meeting', { valueAsNumber: true })} className="mt-1" placeholder="Masukkan jumlah pertemuan" />
          {errors.total_meeting && <p className="mt-1 text-sm text-red-500">{errors.total_meeting.message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            Swal.fire({
              title: 'Cancel changes?',
              text: 'Any unsaved changes will be lost.',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Yes, cancel',
              cancelButtonText: 'Continue editing',
            }).then((result) => {
              if (result.isConfirmed) {
                router.push('/admin/dashboard/kelas/kelompok');
              }
            });
          }}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memperbarui...
            </>
          ) : initialData ? (
            'Perbarui Kelompok'
          ) : (
            'Buat Kelompok'
          )}
        </Button>
      </div>
    </form>
  );
}
