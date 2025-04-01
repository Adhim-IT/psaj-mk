"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { z } from "zod"

// Schema for course review validation
const courseReviewSchema = z.object({
  courseId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  review: z.string().min(5, "Review must be at least 5 characters"),
})

// Schema for event review validation
const eventReviewSchema = z.object({
  eventId: z.string().uuid(),
  review: z.string().min(5, "Review must be at least 5 characters"),
})

/**
 * Submit a review for a course
 */
export async function submitCourseReview(data: z.infer<typeof courseReviewSchema>) {
  try {
    const { courseId, rating, review } = courseReviewSchema.parse(data)

    // Get current user
    const user = await getCurrentUser()

    if (!user || !user.studentId) {
      return { success: false, error: "You must be logged in as a student to submit a review" }
    }

    // Check if the user has purchased this course and the transaction is paid
    const transaction = await prisma.course_transactions.findFirst({
      where: {
        course_id: courseId,
        student_id: user.studentId,
        status: "paid",
      },
    })

    if (!transaction) {
      return { success: false, error: "You can only review courses you have purchased" }
    }

    // Check if the user has already reviewed this course
    const existingReview = await prisma.course_reviews.findFirst({
      where: {
        course_id: courseId,
        student_id: user.studentId,
      },
    })

    if (existingReview) {
      // Update existing review
      await prisma.course_reviews.update({
        where: { id: existingReview.id },
        data: {
          rating,
          review,
          updated_at: new Date(),
        },
      })

      revalidatePath("/dashboard/courses")
      return { success: true, message: "Review updated successfully" }
    }

    // Create new review
    await prisma.course_reviews.create({
      data: {
        id: crypto.randomUUID(),
        course_id: courseId,
        student_id: user.studentId,
        rating,
        review,
        is_approved: false, // Requires admin approval
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    revalidatePath("/dashboard/courses")
    return { success: true, message: "Review submitted successfully" }
  } catch (error) {
    console.error("Error submitting course review:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Failed to submit review" }
  }
}

/**
 * Submit a review for an event
 */
export async function submitEventReview(data: z.infer<typeof eventReviewSchema>) {
  try {
    const { eventId, review } = eventReviewSchema.parse(data)

    // Get current user
    const user = await getCurrentUser()

    if (!user || !user.studentId) {
      return { success: false, error: "You must be logged in as a student to submit a review" }
    }

    // Check if the user has registered for this event and the registration is confirmed
    const registration = await prisma.event_registrants.findFirst({
      where: {
        event_id: eventId,
        student_id: user.studentId,
        status: "paid",
      },
    })

    if (!registration) {
      return { success: false, error: "You can only review events you have registered for" }
    }

    // Check if the user has already reviewed this event
    const existingReview = await prisma.event_reviews.findFirst({
      where: {
        event_id: eventId,
        student_id: user.studentId,
      },
    })

    if (existingReview) {
      // Update existing review
      await prisma.event_reviews.update({
        where: { id: existingReview.id },
        data: {
          review,
          updated_at: new Date(),
        },
      })

      revalidatePath("/dashboard/event")
      return { success: true, message: "Review updated successfully" }
    }

    // Create new review
    await prisma.event_reviews.create({
      data: {
        id: crypto.randomUUID(),
        event_id: eventId,
        student_id: user.studentId,
        review,
        is_approved: false, // Requires admin approval
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    revalidatePath("/dashboard/event")
    return { success: true, message: "Review submitted successfully" }
  } catch (error) {
    console.error("Error submitting event review:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Failed to submit review" }
  }
}

/**
 * Get course reviews for a specific course
 */
export async function getCourseReviews(courseId: string) {
  try {
    const reviews = await prisma.course_reviews.findMany({
      where: {
        course_id: courseId,
        is_approved: true,
      },
      include: {
        students: {
          select: {
            name: true,
            profile_picture: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return { success: true, data: reviews }
  } catch (error) {
    console.error("Error fetching course reviews:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}

/**
 * Get event reviews for a specific event
 */
export async function getEventReviews(eventId: string) {
  try {
    const reviews = await prisma.event_reviews.findMany({
      where: {
        event_id: eventId,
        is_approved: true,
      },
      include: {
        students: {
          select: {
            name: true,
            profile_picture: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return { success: true, data: reviews }
  } catch (error) {
    console.error("Error fetching event reviews:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}

/**
 * Get user's course reviews
 */
export async function getUserCourseReviews() {
  try {
    const user = await getCurrentUser()

    if (!user || !user.studentId) {
      return { success: false, error: "You must be logged in as a student to view your reviews" }
    }

    const reviews = await prisma.course_reviews.findMany({
      where: {
        student_id: user.studentId,
      },
      include: {
        courses: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            slug: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return { success: true, data: reviews }
  } catch (error) {
    console.error("Error fetching user course reviews:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}

/**
 * Get user's event reviews
 */
export async function getUserEventReviews() {
  try {
    const user = await getCurrentUser()

    if (!user || !user.studentId) {
      return { success: false, error: "You must be logged in as a student to view your reviews" }
    }

    const reviews = await prisma.event_reviews.findMany({
      where: {
        student_id: user.studentId,
      },
      include: {
        events: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            slug: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return { success: true, data: reviews }
  } catch (error) {
    console.error("Error fetching user event reviews:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}

/**
 * Check if user can review a course
 */
export async function canReviewCourse(courseId: string) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.studentId) {
      return { canReview: false }
    }

    // Check if the user has purchased this course and the transaction is paid
    const transaction = await prisma.course_transactions.findFirst({
      where: {
        course_id: courseId,
        student_id: user.studentId,
        status: "paid",
      },
    })

    if (!transaction) {
      return { canReview: false }
    }

    // Check if the user has already reviewed this course
    const existingReview = await prisma.course_reviews.findFirst({
      where: {
        course_id: courseId,
        student_id: user.studentId,
      },
    })

    return {
      canReview: true,
      hasReviewed: !!existingReview,
      reviewId: existingReview?.id,
      reviewData: existingReview,
    }
  } catch (error) {
    console.error("Error checking if user can review course:", error)
    return { canReview: false }
  }
}

/**
 * Check if user can review an event
 */
export async function canReviewEvent(eventId: string) {
  try {
    const user = await getCurrentUser()

    if (!user || !user.studentId) {
      return { canReview: false }
    }

    // Check if the user has registered for this event and the registration is confirmed
    const registration = await prisma.event_registrants.findFirst({
      where: {
        event_id: eventId,
        student_id: user.studentId,
        status: "paid",
      },
    })

    if (!registration) {
      return { canReview: false }
    }

    // Check if the user has already reviewed this event
    const existingReview = await prisma.event_reviews.findFirst({
      where: {
        event_id: eventId,
        student_id: user.studentId,
      },
    })

    return {
      canReview: true,
      hasReviewed: !!existingReview,
      reviewId: existingReview?.id,
      reviewData: existingReview,
    }
  } catch (error) {
    console.error("Error checking if user can review event:", error)
    return { canReview: false }
  }
}

