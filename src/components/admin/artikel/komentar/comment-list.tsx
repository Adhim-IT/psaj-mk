'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Check, X, Trash2, Search, MoreHorizontal } from 'lucide-react';
import { deleteComment, updateCommentStatus, getComments } from '@/lib/article-comments-admin';
import Swal from 'sweetalert2';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Comment {
  id: string;
  article_id: string;
  articles: {
    title: string;
  };
  name: string;
  email: string;
  comment: string;
  is_approved: boolean;
  created_at: string | null;
}

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments: initialComments }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Filter comments based on search term
  const filteredComments = comments.filter(
    (comment) =>
      comment.articles.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const refreshComments = async () => {
    try {
      const { comments: freshComments } = await getComments();
      if (freshComments) {
        setComments(freshComments);
      }
    } catch (error) {
      console.error('Failed to refresh comments:', error);
    }
  };

  const handleDelete = async () => {
    if (!commentToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteComment(commentToDelete);

      if (result.success) {
        // Update local state to remove the deleted comment
        setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentToDelete));

        Swal.fire({
          icon: 'success',
          title: 'Comment deleted',
          text: 'Comment has been deleted successfully.',
        });

        // Force a revalidation of the page
        router.refresh();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: typeof result.error === 'string' ? result.error : 'Failed to delete comment.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setCommentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleStatusUpdate = async (id: string, isApproved: boolean) => {
    setIsUpdating(id);
    try {
      const result = await updateCommentStatus(id, isApproved);

      if (result.success) {
        // Update local state to reflect the status change
        setComments((prevComments) => prevComments.map((comment) => (comment.id === id ? { ...comment, is_approved: isApproved } : comment)));

        Swal.fire({
          icon: 'success',
          title: 'Status updated',
          text: `Comment has been ${isApproved ? 'approved' : 'disapproved'} successfully.`,
        });

        // Force a revalidation of the page
        router.refresh();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: typeof result.error === 'string' ? result.error : 'Failed to update comment status.',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  // Truncate long text for display
  const truncateText = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search comments..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Button variant="outline" className="ml-auto" onClick={refreshComments}>
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">ARTIKEL</TableHead>
              <TableHead className="w-[150px]">NAMA</TableHead>
              <TableHead className="w-[180px]">EMAIL</TableHead>
              <TableHead>KOMENTAR</TableHead>
              <TableHead className="w-[100px]">STATUS</TableHead>
              <TableHead className="text-right w-[80px]">AKSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No comments found matching your search.' : 'No comments found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredComments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="font-medium">{truncateText(comment.articles.title, 30)}</TableCell>
                  <TableCell>{comment.name}</TableCell>
                  <TableCell>{truncateText(comment.email, 20)}</TableCell>
                  <TableCell>{truncateText(comment.comment, 50)}</TableCell>
                  <TableCell>
                    <Badge variant={comment.is_approved ? 'success' : 'secondary'} className={comment.is_approved ? 'bg-green-100 text-green-800' : ''}>
                      {comment.is_approved ? 'Disetujui' : 'Belum Disetujui'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Actions</p>
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          {!comment.is_approved && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(comment.id, true)} disabled={isUpdating === comment.id} className="text-green-600 focus:text-green-600 focus:bg-green-50">
                              <Check className="mr-2 h-4 w-4" />
                              <span>Approve</span>
                            </DropdownMenuItem>
                          )}
                          {comment.is_approved && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(comment.id, false)} disabled={isUpdating === comment.id} className="text-yellow-600 focus:text-yellow-600 focus:bg-yellow-50">
                              <X className="mr-2 h-4 w-4" />
                              <span>Disapprove</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => confirmDelete(comment.id)} disabled={isUpdating === comment.id} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action will delete the comment. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
