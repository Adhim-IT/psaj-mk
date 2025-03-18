"use server"
import { prisma } from "@/lib/prisma"

export async function getComments() {
  try {
    const comments = await prisma.article_comments.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        articles: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })
    const formattedComments = comments.map(comment => ({
        ...comment,
        created_at: comment.created_at ? comment.created_at.toISOString() : null,
        updated_at: comment.updated_at ? comment.updated_at.toISOString() : null,
      }));

      return { comments: formattedComments };
  } catch (error) {
    console.error("Error fetching comments:", error)
    return { error: "Failed to fetch comments" }
  }
}

export async function deleteComment(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.article_comments.update({
      where: { id },
      data: { deleted_at: new Date() },
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting comment:", error)
    return { success: false, error: "Failed to delete comment" }
  }
}

export async function updateCommentStatus(
  id: string,
  isApproved: boolean,
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.article_comments.update({
      where: { id },
      data: { is_approved: isApproved },
    })

    return { success: true }
  } catch (error) {
    console.error("Error updating comment status:", error)
    return { success: false, error: "Failed to update comment status" }
  }
}

