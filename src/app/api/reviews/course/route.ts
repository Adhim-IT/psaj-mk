import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { submitCourseReview, getCourseReviews, canReviewCourse } from "@/lib/reviews"
import { z } from "zod"

// Schema for course review validation
const courseReviewSchema = z.object({
  courseId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  review: z.string().min(5, "Review must be at least 5 characters"),
})

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Validate request body
    try {
      courseReviewSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
      }
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Submit review
    const result = await submitCourseReview(body)

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message })
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Error submitting course review:", error)
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    // Get the course ID from the URL
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")
    const checkEligibility = searchParams.get("checkEligibility") === "true"

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    if (checkEligibility) {
      // Check if the user can review this course
      const result = await canReviewCourse(courseId)
      return NextResponse.json(result)
    } else {
      // Get reviews for this course
      const result = await getCourseReviews(courseId)

      if (result.success) {
        return NextResponse.json({ success: true, data: result.data })
      } else {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
    }
  } catch (error) {
    console.error("Error fetching course reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

