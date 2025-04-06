'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter, Star, MoreHorizontal, Check, Trash2, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CourseReview {
  id: string;
  course_id: string;
  student_id: string;
  rating: number;
  review: string;
  is_approved: boolean;
  created_at: string | null;
  updated_at: string | null;
  courses: {
    id: string;
    title: string;
    thumbnail?: string;
    slug?: string;
  };
  students: {
    id: string;
    name: string;
    profile_picture?: string;
  };
}

interface CourseReviewListProps {
  initialReviews: CourseReview[];
  totalReviews: number;
  onApprove: (id: string) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function CourseReviewList({ initialReviews, totalReviews, onApprove, onDelete }: CourseReviewListProps) {
  const [reviews, setReviews] = useState<CourseReview[]>(initialReviews);
  const [filteredReviews, setFilteredReviews] = useState<CourseReview[]>(initialReviews);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    console.log('Initial reviews:', initialReviews);
    setReviews(initialReviews);
  }, [initialReviews]);

  useEffect(() => {
    // Filter reviews based on search term and status
    const filtered = reviews.filter(
      (review) =>
        (review.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || review.students?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || review.review?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === 'all' || (statusFilter === 'approved' && review.is_approved) || (statusFilter === 'pending' && !review.is_approved))
    );
    setFilteredReviews(filtered);
    setCurrentPage(1); // Reset to first page when search or filter changes
  }, [searchTerm, statusFilter, reviews]);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();

    // Add a timeout to ensure the refresh icon spins for at least a second
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleApprove = async (id: string) => {
    setIsLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const result = await onApprove(id);
      if (result.success) {
        setReviews((prev) => prev.map((review) => (review.id === id ? { ...review, is_approved: true } : review)));
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Review berhasil disetujui', timer: 1500 });
        router.refresh();
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: result.error || 'Gagal menyetujui review' });
      }
    } catch (error) {
      console.error('Error approving review:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Terjadi kesalahan saat menyetujui review' });
    } finally {
      setIsLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Review yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoading((prev) => ({ ...prev, [id]: true }));
        try {
          const result = await onDelete(id);
          if (result.success) {
            setReviews((prev) => prev.filter((review) => review.id !== id));
            Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Review berhasil dihapus', timer: 1500 });
            router.refresh();
          } else {
            Swal.fire({ icon: 'error', title: 'Gagal', text: result.error || 'Gagal menghapus review' });
          }
        } catch (error) {
          console.error('Error deleting review:', error);
          Swal.fire({ icon: 'error', title: 'Error', text: 'Terjadi kesalahan saat menghapus review' });
        } finally {
          setIsLoading((prev) => ({ ...prev, [id]: false }));
        }
      }
    });
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink isActive={currentPage === 1} onClick={() => setCurrentPage(1)}>
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show pages around current page
    const startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 2);

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink isActive={currentPage === i} onClick={() => setCurrentPage(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink isActive={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Render stars for rating
  const renderRating = (rating: number) => {
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  // Render action buttons
  const renderActions = (review: CourseReview) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!review.is_approved && (
                  <DropdownMenuItem onClick={() => handleApprove(review.id)} disabled={isLoading[review.id]} className="text-green-600 focus:text-green-600">
                    {isLoading[review.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    Approve
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleDelete(review.id)} disabled={isLoading[review.id]} className="text-red-600 focus:text-red-600">
                  {isLoading[review.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>
            <p>Manage review</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Render mobile view
  const renderMobileView = () => {
    return (
      <div className="space-y-4">
        {currentItems.length === 0 ? (
          <div className="text-center py-8 border rounded-md">
            <p className="text-muted-foreground">No reviews found</p>
          </div>
        ) : (
          currentItems.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b bg-muted/20">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">{review.courses?.title || 'Unknown Course'}</h3>
                    {review.is_approved ? <Badge className="bg-green-500">Approved</Badge> : <Badge variant="outline">Pending</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">By {review.students?.name || 'Unknown Student'}</p>
                </div>
                <div className="p-4">
                  <div className="mb-2">{renderRating(review.rating)}</div>
                  <p className="text-sm mb-2">{review.review}</p>
                  <p className="text-xs text-muted-foreground">{review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Unknown date'}</p>
                </div>
                <div className="flex justify-end border-t p-2">{renderActions(review)}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  // Render desktop view
  const renderDesktopView = () => {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NO</TableHead>
              <TableHead>COURSE NAME</TableHead>
              <TableHead>STUDENT</TableHead>
              <TableHead>RATING</TableHead>
              <TableHead>REVIEW</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-muted-foreground">No reviews found</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={handleRefresh}>
                      Refresh
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((review, index) => (
                <TableRow key={review.id}>
                  <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell className="font-medium">{review.courses?.title || 'Unknown Course'}</TableCell>
                  <TableCell>{review.students?.name || 'Unknown Student'}</TableCell>
                  <TableCell>{renderRating(review.rating)}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={review.review}>
                      {review.review}
                    </div>
                  </TableCell>
                  <TableCell>{review.is_approved ? <Badge className="bg-green-500">Approved</Badge> : <Badge variant="outline">Pending</Badge>}</TableCell>
                  <TableCell className="text-right">{renderActions(review)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search courses, students, or reviews..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} className="h-10 w-10">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isMobile ? renderMobileView() : renderDesktopView()}

      {filteredReviews.length > itemsPerPage && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} aria-disabled={currentPage === 1} className={cn(currentPage === 1 && 'pointer-events-none opacity-50')} />
            </PaginationItem>
            {renderPaginationItems()}
            <PaginationItem>
              <PaginationNext onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} aria-disabled={currentPage === totalPages} className={cn(currentPage === totalPages && 'pointer-events-none opacity-50')} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <div className="text-sm text-muted-foreground">
        Showing {currentItems.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredReviews.length)} of {filteredReviews.length} reviews
      </div>
    </div>
  );
}
