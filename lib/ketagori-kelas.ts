'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

// Buat file baru untuk skema
export type CourseCategoryFormData = {
  name: string;
  slug: string;
};

// Ambil semua kategori kursus
export async function getCourseCategories() {
  try {
    const categories = await prisma.course_categories.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return { categories };
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil kategori kursus:', error);
    return { error: 'Gagal mengambil kategori kursus' };
  }
}

// Ambil satu kategori kursus berdasarkan ID
export async function getCourseCategoryById(id: string) {
  try {
    const category = await prisma.course_categories.findUnique({
      where: { id },
    });

    if (!category) {
      return { error: 'Kategori kursus tidak ditemukan' };
    }

    return { category };
  } catch (error) {
    console.error('Terjadi kesalahan saat mengambil kategori kursus:', error);
    return { error: 'Gagal mengambil kategori kursus' };
  }
}

// Buat kategori kursus baru
export async function createCourseCategory(data: CourseCategoryFormData) {
  try {
    // Validasi data
    if (!data.name || !data.slug) {
      return { error: 'Harap isi semua bidang yang diperlukan' };
    }

    const category = await prisma.course_categories.create({
      data: {
        id: uuidv4(),
        name: data.name,
        slug: data.slug,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    revalidatePath('/admin/dashboard/kelas/kategori');
    return { success: true, category };
  } catch (error) {
    console.error('Terjadi kesalahan saat membuat kategori kursus:', error);
    return { error: 'Gagal membuat kategori kursus' };
  }
}

// Perbarui kategori kursus yang ada
export async function updateCourseCategory(id: string, data: CourseCategoryFormData) {
  try {
    // Validasi data
    if (!data.name || !data.slug) {
      return { error: 'Harap isi semua bidang yang diperlukan' };
    }

    const category = await prisma.course_categories.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        updated_at: new Date(),
      },
    });

    revalidatePath('/admin/dashboard/kelas/kategori');
    return { success: true, category };
  } catch (error) {
    console.error('Terjadi kesalahan saat memperbarui kategori kursus:', error);
    return { error: 'Gagal memperbarui kategori kursus' };
  }
}

// Hapus kategori kursus (soft delete)
export async function deleteCourseCategory(id: string) {
  try {
    await prisma.course_categories.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });

    revalidatePath('/admin/dashboard/kelas/kategori');
    return { success: true };
  } catch (error) {
    console.error('Terjadi kesalahan saat menghapus kategori kursus:', error);
    return { error: 'Gagal menghapus kategori kursus' };
  }
}

// Hapus kategori kursus secara permanen (hard delete, untuk admin)
export async function hardDeleteCourseCategory(id: string) {
  try {
    await prisma.course_categories.delete({
      where: { id },
    });

    revalidatePath('/admin/dashboard/kelas/kategori');
    return { success: true };
  } catch (error) {
    console.error('Terjadi kesalahan saat menghapus kategori kursus secara permanen:', error);
    return { error: 'Gagal menghapus kategori kursus secara permanen' };
  }
}
