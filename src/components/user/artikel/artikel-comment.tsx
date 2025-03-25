"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createComment, getApprovedCommentsByArticleId, replyToComment } from "@/lib/article-comments-admin"
import { isAuthenticated } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendIcon, UserIcon, MessageCircleIcon, XIcon } from "lucide-react"

// Helper function to format relative time
function formatRelativeTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return ""

  const date = typeof dateString === "string" ? new Date(dateString) : dateString
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return "Baru saja"
  if (diffMin < 60) return `${diffMin} menit yang lalu`
  if (diffHour < 24) return `${diffHour} jam yang lalu`
  if (diffDay < 7) return `${diffDay} hari yang lalu`

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

interface CommentProps {
  articleId: string
  onCommentCountUpdate?: (count: number) => void
}

export function ArtikelComment({ articleId, onCommentCountUpdate }: CommentProps) {
  const router = useRouter()
  const [comments, setComments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [replyText, setReplyText] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated()
      setIsLoggedIn(authenticated)
    }

    checkAuth()
  }, [])

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true)
      try {
        const { comments, error } = await getApprovedCommentsByArticleId(articleId)
        if (comments) {
          setComments(comments)

          // Calculate total comment count including replies from other_article_comments
          let totalCount = comments.length
          comments.forEach((comment) => {
            if (comment.other_article_comments && Array.isArray(comment.other_article_comments)) {
              totalCount += comment.other_article_comments.length
            }
          })

          // Update parent component with comment count
          if (onCommentCountUpdate) {
            onCommentCountUpdate(totalCount)
          }
        }
      } catch (error) {
        console.error("Error fetching comments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [articleId, onCommentCountUpdate])

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!commentText.trim()) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      const result = await createComment({
        article_id: articleId,
        content: commentText,
      })

      if (result.success) {
        setCommentText("")
        setMessage({
          type: "success",
          text: "Komentar berhasil dikirim dan sedang menunggu persetujuan admin.",
        })
      } else {
        setMessage({
          type: "error",
          text: result.message || "Gagal mengirim komentar. Silakan coba lagi.",
        })
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      setMessage({
        type: "error",
        text: "Terjadi kesalahan. Silakan coba lagi.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle reply submission
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyText.trim() || !replyingTo) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      const result = await replyToComment({
        article_id: articleId,
        parent_id: replyingTo,
        content: replyText,
      })

      if (result.success) {
        setReplyText("")
        setReplyingTo(null)
        setMessage({
          type: "success",
          text: "Balasan berhasil dikirim dan sedang menunggu persetujuan admin.",
        })
      } else {
        setMessage({
          type: "error",
          text: result.message || "Gagal mengirim balasan. Silakan coba lagi.",
        })
      }
    } catch (error) {
      console.error("Error submitting reply:", error)
      setMessage({
        type: "error",
        text: "Terjadi kesalahan. Silakan coba lagi.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Redirect to login
  const handleLoginRedirect = () => {
    router.push("/login?redirect=" + encodeURIComponent(window.location.pathname))
  }

  // Render comment skeleton loader
  const renderSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/6 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Render comment form
  const renderCommentForm = () => {
    if (!isLoggedIn) {
      return (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="mb-4">Silakan login untuk memberikan komentar</p>
          <Button onClick={handleLoginRedirect}>Login untuk Komentar</Button>
        </div>
      )
    }

    return (
      <form onSubmit={handleSubmitComment} className="mb-8">
        <Textarea
          placeholder="Tulis komentar Anda..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="min-h-[120px] mb-3 border rounded-lg p-4 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !commentText.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-2 transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Mengirim...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <SendIcon className="w-4 h-4" />
                Kirim Komentar
              </span>
            )}
          </Button>
        </div>
      </form>
    )
  }

  // Render reply form
  const renderReplyForm = (parentId: string, parentName: string) => {
    if (!isLoggedIn) return null

    if (replyingTo !== parentId) return null

    return (
      <div className="mt-4 bg-gray-50 rounded-lg p-4 relative">
        <div className="absolute -top-3 left-4 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
          Balas ke {parentName}
        </div>
        <form onSubmit={handleSubmitReply} className="mt-2">
          <Textarea
            placeholder={`Tulis balasan Anda untuk ${parentName}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="min-h-[100px] mb-3 border rounded-lg p-4 w-full bg-white focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
            disabled={isSubmitting}
            autoFocus
          />
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setReplyingTo(null)}
              disabled={isSubmitting}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <XIcon className="w-4 h-4 mr-2" />
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !replyText.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Mengirim...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <SendIcon className="w-4 h-4" />
                  Kirim Balasan
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  // Render comments
  const renderComments = () => {
    if (comments.length === 0) {
      return (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p>Belum ada komentar. Jadilah yang pertama berkomentar!</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b pb-6 last:border-b-0">
            <div className="flex gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                {comment.user_avatar ? (
                  <Image
                    src={comment.user_avatar || "/placeholder.svg"}
                    alt={comment.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-col">
                  <h4 className="font-medium">{comment.name}</h4>
                  <span className="text-sm text-gray-500">{formatRelativeTime(comment.created_at)}</span>
                </div>
                <div className="text-gray-800 mt-2">{comment.comment}</div>

                {isLoggedIn && (
                  <button
                    className="mt-2 text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    <MessageCircleIcon className="w-4 h-4" />
                    Balas
                  </button>
                )}

                {renderReplyForm(comment.id, comment.name)}

                {/* Render replies from other_article_comments */}
                {comment.other_article_comments && comment.other_article_comments.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="h-px bg-gray-200 flex-grow"></div>
                      <span>{comment.other_article_comments.length} balasan</span>
                      <div className="h-px bg-gray-200 flex-grow"></div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      {comment.other_article_comments.map((reply: any) => (
                        <div
                          key={reply.id}
                          className="group py-3 first:pt-0 last:pb-0 border-b last:border-b-0 border-gray-200"
                        >
                          <div className="flex gap-3">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                              {reply.user_avatar ? (
                                <Image
                                  src={reply.user_avatar || "/placeholder.svg"}
                                  alt={reply.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <UserIcon className="w-4 h-4 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">{reply.name}</h4>
                                <span className="text-xs text-gray-500">{formatRelativeTime(reply.created_at)}</span>
                              </div>
                              <div className="text-gray-800 mt-1 text-sm">{reply.comment}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Komentar</h2>

      {/* Status message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Comment form */}
      {renderCommentForm()}

      {/* Comments list */}
      {isLoading ? renderSkeleton() : renderComments()}
    </div>
  )
}

