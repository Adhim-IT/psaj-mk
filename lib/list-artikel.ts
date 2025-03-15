"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { uploadImage, deleteImage } from "@/lib/cloudinary"
import type { ListArticleFormData } from "@/types"
import { prisma } from "@/lib/prisma"

// Helper function to generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .trim()
}

export async function getWriters() {
    try {
        const writer = await prisma.writers.findMany({
            select: {
                id: true,
                name: true,
            },
            where: {
                deleted_at: null,
            },
            orderBy: {
                name: "asc",
            },
        })

        return { writer }
    } catch (error) {
        console.error("Error fetching writer:", error)
        return { writer: [], error: "Failed to load writers" }
    }
}

export async function getListArticles() {
    try {
      const ListArticles = await prisma.articles.findMany({
        where: {
          deleted_at: null,
        },
        include: {
          article_category_pivot: {
            include: {
              article_categories: {
                select: { id: true, name: true },
              },
            },
          },
          article_tag_pivot: {
            include: {
              article_tags: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      })
  
      const transformedArticles = ListArticles.map((article) => ({
        ...article,
        categories: article.article_category_pivot.map((pivot) => pivot.article_categories),
        tag: article.article_tag_pivot.map((pivot) => pivot.article_tags),
      }))
  
      return { ListArticles: transformedArticles }
    } catch (error) {
      console.error("Error fetching list articles:", error)
      return { error: "Failed to fetch list articles" }
    }
  }

export async function getListArticleById(id: string) {
    try {
        const listArticle = await prisma.articles.findUnique({
            where: { id },
            include: {
                article_category_pivot: {
                    include: {
                        article_categories: {
                            select: { id: true, name: true },
                        },
                    },
                },
                article_tag_pivot: {
                    include: {
                        article_tags: {
                            select: { id: true, name: true },
                        },
                    },
                },

            },
        })

        if (!listArticle) return { error: "List acticle not found" }

        return {
            listArticle: {
                ...listArticle,
                categories: listArticle.article_category_pivot.map((pivot) => pivot.article_categories),
                tag: listArticle.article_tag_pivot.map((pivot) => pivot.article_tags),
            },
        }
    } catch (error) {
        console.error("Error fetching list article:", error)
        return { error: "Failed to load list article" }
    }
}

export async function createListArticle(data: ListArticleFormData) {
    try {
        if (!data.title || !data.content || !data.thumbnail) {
            return { error: "Missing required fields" }
        }

        let thumbnailUrl = data.thumbnail
        if (data.thumbnail.startsWith("data:image")) {
            const uploadResult = await uploadImage(data.thumbnail)
            thumbnailUrl = uploadResult.url
        }

        const acticleId = uuidv4()

        const acticle = await prisma.articles.create({
            data: {
                id: acticleId,
                writer_id: data.writer_id,
                title: data.title,
                slug: data.slug || generateSlug(data.title),
                content: data.content,
                thumbnail: thumbnailUrl,
                created_at: new Date(),
                updated_at: new Date(),
            },
        })

        if (data.categories?.length) {
            await prisma.article_category_pivot.createMany({
                data: data.categories.map((article_category_id) => ({
                    article_category_id,
                    article_id: acticleId,
                })),
            })
        }

        if (data.tag?.length) {
            await prisma.article_tag_pivot.createMany({
                data: data.tag.map((tagId) => ({
                    article_id: acticleId,
                    article_tag_id: tagId
                })),
            });

        }

        revalidatePath("/admin/dashboard/artikel/list")
        return { success: true, acticle, acticleId }
    } catch (error) {
        console.error("Error creating list class:", error)
        return { error: "Failed to create list class" }
    }
}

export async function updateListArticle(id: string, data: ListArticleFormData) {
    try {
        if (!data.title || !data.content || !data.thumbnail) {
            return { error: "Missing required fields" }
        }

        const existingListArticle = await prisma.articles.findUnique({
            where: { id },
            select: { thumbnail: true, title: true },
        })

        if (!existingListArticle) return { error: "List article not found" }

        let thumbnailUrl = data.thumbnail
        if (data.thumbnail.startsWith("data:image")) {
            if (existingListArticle.thumbnail.includes("cloudinary.com")) {
                await deleteImage(existingListArticle.thumbnail)
            }
            const uploadResult = await uploadImage(data.thumbnail)
            thumbnailUrl = uploadResult.url
        }

        return await prisma.$transaction(async (tx) => {
            await tx.articles.update({
                where: { id },
                data: {
                    writer_id: data.writer_id,
                    title: data.title,
                    slug: data.slug || (existingListArticle.title !== data.title ? generateSlug(data.title) : undefined),
                    content: data.content,
                    thumbnail: thumbnailUrl,
                    updated_at: new Date(),
                },
            })

            // Handle categories
            await tx.article_category_pivot.deleteMany({ where: { article_id: id } })
            if (data.categories?.length) {
                await tx.article_category_pivot.createMany({
                    data: data.categories.map((article_category_id) => ({
                        article_category_id,
                        article_id: id,
                    })),
                })
            }

            // Handle tags
            await tx.article_tag_pivot.deleteMany({ where: { article_id: id } })
            if (data.tag?.length) {
                await tx.article_tag_pivot.createMany({
                    data: data.tag.map((tagId) => ({
                        article_tag_id: tagId,
                        article_id: id,
                    })),
                })
            }

            revalidatePath("/admin/dashboard/artikel/list")
            return { success: true }
        })
    } catch (error) {
        console.error("Error updating article:", error)
        return { error: "Failed to update article" }
    }
}
export async function deleteListArticle(articleId: string) {
    try {
      await prisma.articles.update({
        where: { id: articleId },
        data: { deleted_at: new Date() }, 
      });
  
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error deleting class:", error);
        return { success: false, error: error.message };
      } else {
        console.error("Unknown error:", error);
        return { success: false, error: "An unknown error occurred" };
      }
    }
  }