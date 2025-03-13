"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"


export type ArticleCategoryFormData = {
    name: string
    slug: string
  }

  export async function getArticleCategories() {
    try {
      const categories = await prisma.article_categories.findMany({
        where: {
          deleted_at: null,
        },
        orderBy: {
          created_at: "desc",
        },
      })
      return { categories }
    } catch (error) {
      console.error("Terjadi kesalahan saat mengambil kategori Artikel:", error)
      return { error: "Gagal mengambil kategori Artikel" }
    }
  }

  export async function getArticleCategoryById(id: string) {
    try {
      const category = await prisma.article_categories.findUnique({
        where: { id },
      })
  
      if (!category) {
        return { error: "Kategori Artikel tidak ditemukan" }
      }
  
      return { category }
    } catch (error) {
      console.error("Terjadi kesalahan saat mengambil kategori Artikel:", error)
      return { error: "Gagal mengambil kategori Artikel" }
    }
  }
  
  export async function createArticleCategory(data: ArticleCategoryFormData) {
    try {
      // Validasi data
      if (!data.name || !data.slug) {
        return { error: "Harap isi semua bidang yang diperlukan" }
      }
  
      const category = await prisma.article_categories.create({
        data: {
          id: uuidv4(),
          name: data.name,
          slug: data.slug,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })
  
      revalidatePath("/admin/dashboard/artikel/kategori")
      return { success: true, category }
    } catch (error) {
      console.error("Terjadi kesalahan saat membuat kategori Artikel:", error)
      return { error: "Gagal membuat kategori Artikel" }
    }
  }

  export async function updateArticleCategory(id: string, data: ArticleCategoryFormData) {
    try {
      // Validasi data
      if (!data.name || !data.slug) {
        return { error: "Harap isi semua bidang yang diperlukan" }
      }
  
      const category = await prisma.article_categories.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          updated_at: new Date(),
        },
      })
  
      revalidatePath("/admin/dashboard/artikel/kategori")
      return { success: true, category }
    } catch (error) {
      console.error("Terjadi kesalahan saat memperbarui kategori Artikel:", error)
      return { error: "Gagal memperbarui kategori Artikel" }
    }
  }
  
  export async function deleteArticleCategory(id: string) {
    try {
      await prisma.article_categories.update({
        where: { id },
        data: {
          deleted_at: new Date(),
        },
      })
  
      revalidatePath("/admin/dashboard/artikel/kategori")
      return { success: true }
    } catch (error) {
      console.error("Terjadi kesalahan saat menghapus kategori Artikel:", error)
      return { error: "Gagal menghapus kategori Artikel" }
    }
  }