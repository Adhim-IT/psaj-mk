"use server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"

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
    const formattedComments = comments.map((comment: any) => ({
      ...comment,
      created_at: comment.created_at ? comment.created_at.toISOString() : null,
      updated_at: comment.updated_at ? comment.updated_at.toISOString() : null,
    }))

    return { comments: formattedComments }
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

/**
 * Get all comments for a specific article, including replies
 */
export async function getCommentsByArticleId(articleId: string) {
  try {
    // First get all parent comments (comments without a parent_id)
    const parentComments = await prisma.article_comments.findMany({
      where: {
        article_id: articleId,
        parent_id: null,
        deleted_at: null,
      },
      include: {
        articles: {
          select: {
            title: true,
          },
        },
        // Include replies (child comments)
        other_article_comments: {
          where: {
            deleted_at: null,
          },
          orderBy: {
            created_at: "asc", // Replies sorted by oldest first
          },
        },
      },
      orderBy: {
        created_at: "desc", // Parent comments sorted by newest first
      },
    })

    // Format dates for parent comments and their replies
    const formattedComments = parentComments.map((comment: any) => ({
      ...comment,
      created_at: comment.created_at ? comment.created_at.toISOString() : null,
      updated_at: comment.updated_at ? comment.updated_at.toISOString() : null,
      other_article_comments: comment.other_article_comments.map((reply: any) => ({
        ...reply,
        created_at: reply.created_at ? reply.created_at.toISOString() : null,
        updated_at: reply.updated_at ? reply.updated_at.toISOString() : null,
      })),
    }))

    return { comments: formattedComments }
  } catch (error) {
    console.error("Error fetching comments for article:", error)
    return { error: "Failed to fetch comments for this article" }
  }
}

/**
 * Get only approved comments for a specific article, including approved replies
 */
export async function getApprovedCommentsByArticleId(articleId: string) {
  try {
    // First get all approved parent comments
    const parentComments = await prisma.article_comments.findMany({
      where: {
        article_id: articleId,
        parent_id: null,
        is_approved: true,
        deleted_at: null,
      },
      include: {
        articles: {
          select: {
            title: true,
          },
        },
        // Include only approved replies
        other_article_comments: {
          where: {
            is_approved: true,
            deleted_at: null,
          },
          orderBy: {
            created_at: "asc", // Replies sorted by oldest first
          },
        },
      },
      orderBy: {
        created_at: "desc", // Parent comments sorted by newest first
      },
    })

    // Format dates for parent comments and their replies
    const formattedComments = parentComments.map((comment: any) => ({
      ...comment,
      created_at: comment.created_at ? comment.created_at.toISOString() : null,
      updated_at: comment.updated_at ? comment.updated_at.toISOString() : null,
      other_article_comments: comment.other_article_comments.map((reply: any) => ({
        ...reply,
        created_at: reply.created_at ? reply.created_at.toISOString() : null,
        updated_at: reply.updated_at ? reply.updated_at.toISOString() : null,
      })),
    }))

    return { comments: formattedComments }
  } catch (error) {
    console.error("Error fetching approved comments for article:", error)
    return { error: "Failed to fetch comments for this article" }
  }
}

/**
 * Create a new comment for an article
 */
export async function createComment(data: {
  article_id: string
  content: string
}) {
  try {
    // Get the current authenticated user
    const user = await getCurrentUser()

    if (!user) {
      return {
        success: false,
        message: "You must be logged in to comment",
      }
    }

    const comment = await prisma.article_comments.create({
      data: {
        id: uuidv4(),
        article_id: data.article_id,
        name: user.name || "Anonymous",
        email: user.email,
        comment: data.content,
        is_approved: false, // Comments need approval by default
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    return {
      success: true,
      comment: {
        ...comment,
        created_at: comment.created_at ? comment.created_at.toISOString() : null,
        updated_at: comment.updated_at ? comment.updated_at.toISOString() : null,
      },
    }
  } catch (error) {
    console.error("Error creating comment:", error)
    return {
      success: false,
      message: "Failed to create comment",
    }
  }
}

/**
 * Reply to an existing comment
 */
export async function replyToComment(data: {
  article_id: string
  parent_id: string
  content: string
}) {
  try {
    // Get the current authenticated user
    const user = await getCurrentUser()

    if (!user) {
      return {
        success: false,
        message: "You must be logged in to reply to a comment",
      }
    }

    // Check if parent comment exists
    const parentComment = await prisma.article_comments.findUnique({
      where: { id: data.parent_id },
    })

    if (!parentComment) {
      return {
        success: false,
        message: "Parent comment not found",
      }
    }

    const reply = await prisma.article_comments.create({
      data: {
        id: uuidv4(),
        article_id: data.article_id,
        parent_id: data.parent_id,
        name: user.name || "Anonymous",
        email: user.email,
        comment: data.content,
        is_approved: false, // Replies also need approval
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    return {
      success: true,
      comment: {
        ...reply,
        created_at: reply.created_at ? reply.created_at.toISOString() : null,
        updated_at: reply.updated_at ? reply.updated_at.toISOString() : null,
      },
    }
  } catch (error) {
    console.error("Error replying to comment:", error)
    return {
      success: false,
      message: "Failed to reply to comment",
    }
  }
}

