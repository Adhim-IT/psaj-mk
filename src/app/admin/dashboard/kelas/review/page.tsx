import { Suspense } from 'react';
import { CourseReviewList } from '@/components/admin/review/course-review-list';
import { Skeleton } from '@/components/ui/skeleton';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCourseReviews() {
  try {
    console.log('Fetching course reviews...');
    const reviews = await prisma.course_reviews.findMany({
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            slug: true,
          },
        },
        students: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    console.log(`Found ${reviews.length} course reviews`);

    // Properly serialize the data to avoid date serialization issues
   return reviews.map((review) => ({
     ...review,
     created_at: review.created_at ? review.created_at.toISOString() : null,
     updated_at: review.updated_at ? review.updated_at.toISOString() : null,
     students: {
       ...review.students,
       profile_picture: review.students.profile_picture ?? undefined, // <== ini fix-nya
     },
   }));
  } catch (error) {
    console.error('Error fetching course reviews:', error);
    return [];
  }
}

export default async function CourseReviewPage() {
  const courseReviews = await getCourseReviews();

  console.log(`Rendering page with ${courseReviews.length} course reviews`);

  async function approveReview(id: string) {
    'use server';

    try {
      console.log(`Approving review with ID: ${id}`);
      await prisma.course_reviews.update({
        where: { id },
        data: {
          is_approved: true,
          updated_at: new Date(),
        },
      });

      revalidatePath('/admin/dashboard/kelas/review' , 'page');
      return { success: true };
    } catch (error) {
      console.error('Error approving review:', error);
      return { success: false, error: 'Failed to approve review' };
    }
  }

  async function deleteReview(id: string) {
    'use server';

    try {
      console.log(`Deleting review with ID: ${id}`);
      await prisma.course_reviews.delete({
        where: { id },
      });

      revalidatePath('/admin/dashboard/kelas/review', 'page');
      return { success: true };
    } catch (error) {
      console.error('Error deleting review:', error);
      return { success: false, error: 'Failed to delete review' };
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Course Reviews Management</h1>
      <div className="mb-4 text-sm text-muted-foreground">
        {courseReviews.length === 0 ? 'No reviews found. Reviews will appear here once students submit them.' : `Showing ${courseReviews.length} course reviews. Approve reviews to make them visible on the course page.`}
      </div>
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
