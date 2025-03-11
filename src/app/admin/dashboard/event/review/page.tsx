import { Suspense } from "react"
import { EventReviewList } from "@/components/admin/review/event-review-list"
import { Skeleton } from "@/components/ui/skeleton"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Function to fetch event reviews directly from Prisma
async function getEventReviews() {
  try {
    const reviews = await prisma.event_reviews.findMany({
      include: {
        events: true,
        students: true,
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return reviews.map((review) => ({
      ...review,
      created_at: review.created_at ? review.created_at.toISOString() : null,
      updated_at: review.updated_at ? review.updated_at.toISOString() : null,
    }))
  } catch (error) {
    console.error("Error fetching event reviews:", error)
    return []
  }
}

export default async function EventReviewPage() {
  const eventReviews = await getEventReviews()

  // Function to approve review
  async function approveReview(id: string) {
    "use server"

    try {
      await prisma.event_reviews.update({
        where: { id },
        data: {
          is_approved: true,
          updated_at: new Date(),
        },
      })

      revalidatePath("/admin/event-review")
      return { success: true }
    } catch (error) {
      console.error("Error approving review:", error)
      return { success: false, error: "Failed to approve review" }
    }
  }

  // Function to delete review
  async function deleteReview(id: string) {
    "use server"

    try {
      await prisma.event_reviews.delete({
        where: { id },
      })

      revalidatePath("/admin/event-review")
      return { success: true }
    } catch (error) {
      console.error("Error deleting review:", error)
      return { success: false, error: "Failed to delete review" }
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Event Reviews Management</h1>
      <Suspense fallback={<EventReviewSkeleton />}>
        <EventReviewList initialData={eventReviews} onApprove={approveReview} onDelete={deleteReview} />
      </Suspense>
    </div>
  )
}

// Skeleton Loading State
function EventReviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Skeleton className="h-12 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-10 w-64" />
      </div>
    </div>
  )
}

