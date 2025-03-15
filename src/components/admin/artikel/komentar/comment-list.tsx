"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Check, X, Trash2 } from "lucide-react"
import { deleteComment, updateCommentStatus } from "@/lib/article-comments"
import Swal from "sweetalert2"

interface Comment {
  id: string
  article_id: string
  articles: {
    title: string
  }
  name: string
  email: string
  comment: string
  is_approved: boolean
  created_at: string | null
}

interface CommentListProps {
  comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!commentToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteComment(commentToDelete)

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Comment deleted",
          text: "Comment has been deleted successfully.",
        })
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: typeof result.error === "string" ? result.error : "Failed to delete comment.",
        })
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setCommentToDelete(null)
    }
  }

  const confirmDelete = (id: string) => {
    setCommentToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleStatusUpdate = async (id: string, isApproved: boolean) => {
    try {
      const result = await updateCommentStatus(id, isApproved)

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Status updated",
          text: `Comment has been ${isApproved ? "approved" : "disapproved"} successfully.`,
        })
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: typeof result.error === "string" ? result.error : "Failed to update comment status.",
        })
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred. Please try again.",
      })
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ARTIKEL</TableHead>
            <TableHead>NAMA</TableHead>
            <TableHead>EMAIL</TableHead>
            <TableHead>KOMENTAR</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead className="text-right">AKSI</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No comments found.
              </TableCell>
            </TableRow>
          ) : (
            comments.map((comment) => (
              <TableRow key={comment.id}>
                <TableCell className="font-medium">{comment.articles.title}</TableCell>
                <TableCell>{comment.name}</TableCell>
                <TableCell>{comment.email}</TableCell>
                <TableCell>{comment.comment}</TableCell>
                <TableCell>
                  <Badge
                    variant={comment.is_approved ? "success" : "secondary"}
                    className={comment.is_approved ? "bg-green-100 text-green-800" : ""}
                  >
                    {comment.is_approved ? "Disetujui" : "Belum Disetujui"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    onClick={() => handleStatusUpdate(comment.id, true)}
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={comment.is_approved}
                  >
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Approve</span>
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(comment.id, false)}
                    variant="default"
                    size="sm"
                    className="bg-yellow-500 hover:bg-yellow-600"
                    disabled={!comment.is_approved}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Disapprove</span>
                  </Button>
                  <Button onClick={() => confirmDelete(comment.id)} variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the comment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

