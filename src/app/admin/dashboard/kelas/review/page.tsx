import { Suspense } from 'react';
import { CourseReviewList } from '@/components/admin/review/course-review-list';
import { Skeleton } from '@/components/ui/skeleton';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function getCourseReviews() {
  try {
    const reviews = await prisma.course_reviews.findMany({
      include: {
        courses: true,
        students: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return reviews.map((review) => ({
      ...review,
      created_at: review.created_at ? review.created_at.toISOString() : null,
      updated_at: review.updated_at ? review.updated_at.toISOString() : null,
    }));
  } catch (error) {
    console.error('Error fetching course reviews:', error);
    return [];
  }
}

export default async function CourseReviewPage() {
  const courseReviews = await getCourseReviews();

  async function approveReview(id: string) {
    'use server';

    try {
      await prisma.course_reviews.update({
        where: { id },
        data: {
          is_approved: true,
          updated_at: new Date(),
        },
      });

      revalidatePath('/admin/dashboard/kelas/review');
      return { success: true };
    } catch (error) {
      console.error('Error approving review:', error);
      return { success: false, error: 'Failed to approve review' };
    }
  }

  async function deleteReview(id: string) {
    'use server';

    try {
      await prisma.course_reviews.delete({
        where: { id },
      });

      revalidatePath('/admin/dashboard/kelas/review');
      return { success: true };
    } catch (error) {
      console.error('Error deleting review:', error);
      return { success: false, error: 'Failed to delete review' };
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Course Reviews Management</h1>
      <Suspense fallback={<CourseReviewSkeleton />}>
        <CourseReviewList initialReviews={courseReviews} totalReviews={courseReviews.length} onApprove={approveReview} onDelete={deleteReview} />
      </Suspense>
    </div>
  );
}

function CourseReviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
      </div>
      <Skeleton className="h-[400px] w-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  );
}
