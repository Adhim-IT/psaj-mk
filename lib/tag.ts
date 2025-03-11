"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: Date | null;
  updated_at: Date | null;
  deleted_at: Date | null;
}

export type TagFormData = {
  name: string;
  slug: string;
}

export async function getTag() {
  try {
    // Add await to properly resolve the Promise
    const tags = await prisma.article_tags.findMany({
      where: {
        deleted_at: null,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    
    return { tags, error: null };
  } catch (error) {
    console.error("Error fetching tags:", error);
    return { 
      tags: [], // Return empty array to avoid null/undefined issues
      error: "Failed to fetch tags"
    };
  }
}

export async function getTagById(id: string) {
  try {
    const tag = await prisma.article_tags.findUnique({
      where: { id },
    });

    if (!tag) {
      return { tag: null, error: "Tag not found" };
    }

    return { tag, error: null };
  } catch (error) {
    console.error("Error fetching tag:", error);
    return { tag: null, error: "Failed to fetch tag" };
  }
}

export async function createTag(data: TagFormData) {
  try {
    const tag = await prisma.article_tags.create({
      data: {
        id: uuidv4(),
        name: data.name,
        slug: data.slug,
        created_at: new Date(),
      },
    });

    // Fix the revalidation path to match your actual route
    revalidatePath("/admin/dashboard/artikel/tag");
    return { tag, error: null };
  } catch (error) {
    console.error("Error creating tag:", error);
    return { tag: null, error: "Failed to create tag" };
  }
}

export async function updateTag(id: string, data: TagFormData) {
  try {
    const tag = await prisma.article_tags.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        updated_at: new Date(), // Add updated_at timestamp
      },
    });

    // Fix the revalidation path
    revalidatePath("/admin/dashboard/artikel/tag");
    return { tag, error: null };
  } catch (error) {
    console.error("Error updating tag:", error);
    return { tag: null, error: "Failed to update tag" };
  }
}

export async function deleteTag(id: string) {
  try {
    await prisma.article_tags.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });

    // Fix the revalidation path
    revalidatePath("/admin/dashboard/artikel/tag");
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting tag:", error);
    throw new Error("Failed to delete tag"); // Throw error to match client component expectations
  }
}
